import React from 'react'

import { Block, Decoration } from '@texonom/ntypes'
import { getBlockTitle } from '@texonom/nutils'

import { useNotionContext } from '../context'
import { PageIcon } from './page-icon'
import { Text } from './text'

export const PageTitleImpl: React.FC<{
  block: Block
  className?: string
  defaultIcon?: string
}> = ({ block, className, defaultIcon, ...rest }) => {
  const { recordMap } = useNotionContext()

  if (!block) return null

  if (block.type === 'collection_view_page' || block.type === 'collection_view') {
    const title = getBlockTitle(block, recordMap)
    if (!title) return null

    const titleDecoration: Decoration[] = [[title]]

    return (
      <span className={`notion-page-title ${className || ''}`} {...rest}>
        <PageIcon block={block} defaultIcon={defaultIcon} className='notion-page-title-icon' />

        <span className='notion-page-title-text'>
          <Text value={titleDecoration} block={block} />
        </span>
      </span>
    )
  }

  if (!block.properties?.title) return null

  return (
    <span className={`notion-page-title ${className || ''}`} {...rest}>
      <PageIcon block={block} defaultIcon={defaultIcon} className='notion-page-title-icon' />

      <span className='notion-page-title-text'>
        <Text value={block.properties?.title} block={block} />
      </span>
    </span>
  )
}

export const PageTitle = React.memo(PageTitleImpl)
