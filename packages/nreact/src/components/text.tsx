import React from 'react'

import { parsePageId } from '@texonom/nutils'

import { useNotionContext } from '../context'
import { formatDate, getHashFragmentValue } from '../utils'
import { EOI } from './eoi'
import { GracefulImage } from './graceful-image'
import { PageTitle } from './page-title'

import type { Block, Decoration, ExternalObjectInstance } from '@texonom/ntypes'

/**
 * Renders a single piece of Notion text, including basic rich text formatting.
 *
 * These represent the innermost leaf nodes of a Notion subtree.
 *
 * TODO: I think this implementation would be more correct if the reduce just added
 * attributes to the final element's style.
 */
export const Text: React.FC<{
  value: Decoration[]
  block: Block
  linkProps?: { [key: string]: unknown }
  linkProtocol?: string
  inline?: boolean // TODO: currently unused
}> = ({ value, block, linkProps, linkProtocol }) => {
  const { components, recordMap, mapPageUrl, mapImageUrl, rootDomain } = useNotionContext()

  return (
    <React.Fragment>
      {value?.map((deco, index) => {
        const [text, decorations] = deco
        if (!decorations)
          if (text === ',') return <span key={index} style={{ padding: '0.5em' }} />
          else return <React.Fragment key={index}>{text}</React.Fragment>

        const formatted = decorations.reduce(
          (element: React.ReactNode, decorator) => {
            switch (decorator[0]) {
              case 'p': {
                // link to an internal block (within the current workspace)
                const blockId = decorator[1]
                const linkedBlock = recordMap.block[blockId]?.value
                if (!linkedBlock) {
                  console.debug('"p" missing block', blockId)
                  return null
                }
                return (
                  <components.PageLink className='notion-link' href={mapPageUrl(blockId)}>
                    <PageTitle block={linkedBlock} />
                  </components.PageLink>
                )
              }

              case '‣': {
                // link to an external block (outside of the current workspace)
                const linkType = decorator[1][0]
                const id = decorator[1][1]

                switch (linkType) {
                  case 'u': {
                    const user = recordMap.notion_user[id]?.value
                    if (!user) {
                      console.debug('"‣" missing user', id)
                      return null
                    }
                    const name = [user.given_name, user.family_name].filter(Boolean).join(' ')
                    const email = user.email

                    return (
                      <components.Link className='notion-link' href={`mailto:${email}`} {...linkProps}>
                        <GracefulImage
                          className='notion-user'
                          src={mapImageUrl(user.profile_photo, block)}
                          alt={name}
                          style={{ display: 'inline', marginRight: '0.3em', marginBottom: '0.3em' }}
                          loading='lazy'
                          fetchPriority='low'
                        />
                        {name}
                      </components.Link>
                    )
                  }

                  default: {
                    const linkedBlock = recordMap.block[id]?.value

                    if (!linkedBlock) {
                      console.debug('"‣" missing block', linkType, id)
                      return null
                    }

                    return (
                      <components.PageLink
                        className='notion-link'
                        href={mapPageUrl(id)}
                        {...linkProps}
                        target='_blank'
                        rel='noopener noreferrer'>
                        <PageTitle block={linkedBlock} />
                      </components.PageLink>
                    )
                  }
                }
              }

              case 'h':
                return <span className={`notion-${decorator[1]}`}>{element}</span>

              case 'c':
                return <code className='notion-inline-code'>{element}</code>

              case 'b':
                return <b>{element}</b>

              case 'i':
                return <em>{element}</em>

              case 's':
                return <s>{element}</s>

              case '_':
                return <span className='notion-inline-underscore'>{element}</span>

              case 'e':
                return <components.Equation math={decorator[1]} inline />

              case 'm':
                // comment / discussion
                return element //still need to return the base element

              case 'a': {
                const v = decorator[1]
                const pathname = v.substring(1)
                const id = parsePageId(pathname, { uuid: true })

                if ((v[0] === '/' || v.includes(rootDomain)) && id) {
                  const href = v.includes(rootDomain) ? v : `${mapPageUrl(id)}${getHashFragmentValue(v)}`

                  return (
                    <components.PageLink className='notion-link' href={href} {...linkProps}>
                      {element}
                    </components.PageLink>
                  )
                } else {
                  return (
                    <components.Link
                      className='notion-link'
                      href={linkProtocol ? `${linkProtocol}:${decorator[1]}` : decorator[1]}
                      {...linkProps}>
                      {element}
                    </components.Link>
                  )
                }
              }

              // Date
              case 'd': {
                const v = decorator[1]
                const type = v?.type
                if (type === 'date') {
                  const startDate = v.start_date
                  return formatDate(startDate)
                } else if (type === 'daterange') {
                  const startDate = v.start_date
                  const endDate = v.end_date

                  return `${formatDate(startDate)} → ${formatDate(endDate)}`
                } else {
                  return element
                }
              }

              // User
              case 'u': {
                const userId = decorator[1]
                const user = recordMap.notion_user[userId]?.value
                if (!user) {
                  console.debug('missing user', userId)
                  return null
                }
                const name = user.name
                const email = user.email
                return (
                  <components.Link className='notion-link' href={`mailto:${email}`} {...linkProps}>
                    <GracefulImage
                      className='notion-user'
                      src={mapImageUrl(user.profile_photo, block)}
                      alt={name}
                      style={{ display: 'inline', marginRight: '0.3em', marginBottom: '0.3em' }}
                      loading='lazy'
                      fetchPriority='low'
                    />
                    {name}
                  </components.Link>
                )
              }

              case 'eoi': {
                const blockId = decorator[1]
                const externalObjectInstance = recordMap.block[blockId]?.value as ExternalObjectInstance
                return <EOI block={externalObjectInstance} inline={true} />
              }

              default:
                if (process.env.NODE_ENV !== 'production') console.debug('unsupported text format', decorator)

                return element
            }
          },
          <>{text}</>
        )

        return <React.Fragment key={index}>{formatted}</React.Fragment>
      })}
    </React.Fragment>
  )
}
