import React from 'react'

import { AudioBlock } from '@texonom/ntypes'

import { useNotionContext } from '../context'

export const Audio: React.FC<{
  block: AudioBlock
  className?: string
}> = ({ block, className }) => {
  const { recordMap } = useNotionContext()
  const source = recordMap.signed_urls[block.id] || block.properties?.source?.[0]?.[0]

  return (
    <div className={`notion-audio ${className || ''}`}>
      <audio controls preload='none' src={source} />
    </div>
  )
}
