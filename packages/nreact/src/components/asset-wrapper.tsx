import React from 'react'

import { BaseContentBlock, Block } from '@texonom/ntypes'
import { parsePageId } from '@texonom/nutils'

import { useNotionContext } from '../context'
import { Asset } from './asset'
import { Text } from './text'

const urlStyle = { width: '100%' }

export const AssetWrapper: React.FC<{
  blockId: string
  block: Block
}> = ({ blockId, block }) => {
  const value = block as BaseContentBlock
  const { components, mapPageUrl, rootDomain, zoom } = useNotionContext()

  let isURL = false
  if (block.type === 'image') {
    const caption: string = value?.properties?.caption?.[0]?.[0]
    if (caption) {
      const id = parsePageId(caption, { uuid: true })

      const isPage = caption.charAt(0) === '/' && id
      if (isPage || isValidURL(caption)) isURL = true
    }
  }

  const figure = (
    <figure
      className={`notion-asset-wrapper
        notion-asset-wrapper-${block.type}
        ${value.format?.block_full_width ? 'notion-asset-wrapper-full' : ''}
        ${blockId}`}>
      <Asset block={value} zoomable={zoom && !isURL}>
        {value?.properties?.caption && !isURL && (
          <figcaption className='notion-asset-caption'>
            <Text value={value.properties.caption} block={block} />
          </figcaption>
        )}
      </Asset>
    </figure>
  )

  // allows for an image to be a link
  if (isURL) {
    const caption: string = value?.properties?.caption[0][0]
    const id = parsePageId(caption, { uuid: true })
    const isPage = caption.charAt(0) === '/' && id
    const captionHostname = extractHostname(caption)
    const external = captionHostname && captionHostname !== rootDomain && !caption.startsWith('/')

    return (
      <components.PageLink
        style={urlStyle}
        href={isPage ? mapPageUrl(id) : caption}
        target={external ? '_blank' : null}
        rel={external ? 'noopener noreferrer' : undefined}>
        {figure}
      </components.PageLink>
    )
  }

  return figure
}

const CAPTION_URL_MAX_LENGTH = 2048
const HOST_LABEL = /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i
const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/
const AFTER_HOST = /^(?::\d+)?(?:\/[-a-z\d%_.~+]*)*(?:\?[;&a-z\d%_.~+=-]*)?(?:#[-a-z\d_]*)?$/i

// Same captions as the old single pattern, whose nested quantifiers backtracked exponentially on long ones.
function isValidURL(str: string) {
  if (str.length > CAPTION_URL_MAX_LENGTH) return false
  const rest = str.replace(/^https?:\/\//i, '')
  const hostEnd = rest.search(/[:/?#]/)
  const host = hostEnd === -1 ? rest : rest.slice(0, hostEnd)
  if (!AFTER_HOST.test(hostEnd === -1 ? '' : rest.slice(hostEnd))) return false
  if (IPV4.test(host)) return true
  const labels = host.split('.')
  const tld = labels.pop()
  return labels.length > 0 && /^[a-z]{2,}$/i.test(tld) && labels.every(label => HOST_LABEL.test(label))
}

function extractHostname(url: string) {
  try {
    const hostname = new URL(url).hostname
    return hostname
  } catch (err) {
    return ''
  }
}
