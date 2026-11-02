import React from 'react'

import mediumZoom from '@fisch0920/medium-zoom'
import type { ExtendedRecordMap } from '@texonom/ntypes'

import { Block } from './block'
import { NotionContextProvider, useNotionContext } from './context'
import { MapImageUrlFn, MapPageUrlFn, NotionComponents, SearchNotionFn } from './types'

export const NotionRenderer: React.FC<{
  recordMap: ExtendedRecordMap
  components?: Partial<NotionComponents>

  mapPageUrl?: MapPageUrlFn
  mapImageUrl?: MapImageUrlFn
  searchNotion?: SearchNotionFn
  isShowingSearch?: boolean
  onHideSearch?: () => void

  rootPageId?: string
  rootDomain?: string
  rootSpaceId?: string

  // set fullPage to false to render page content only
  // this will remove the header, cover image, and footer
  fullPage?: boolean

  darkMode?: boolean
  previewImages?: boolean
  forceCustomImages?: boolean
  showCollectionViewDropdown?: boolean
  linkTableTitleProperties?: boolean
  isLinkCollectionToUrlProperty?: boolean
  isImageZoomable?: boolean

  // Owner edit mode: titles drawn for typing into where they stand. Off by default.
  editable?: boolean

  showTableOfContents?: boolean
  minTableOfContentsItems?: number

  defaultPageIcon?: string
  defaultPageCover?: string
  defaultPageCoverPosition?: number

  className?: string
  bodyClassName?: string

  header?: React.ReactNode
  footer?: React.ReactNode
  pageHeader?: React.ReactNode
  pageFooter?: React.ReactNode
  pageTitle?: React.ReactNode
  pageAside?: React.ReactNode
  pageCover?: React.ReactNode

  blockId?: string
  hideBlockId?: boolean
  disableHeader?: boolean
}> = ({
  components,
  recordMap,
  mapPageUrl,
  mapImageUrl,
  searchNotion,
  isShowingSearch,
  onHideSearch,
  fullPage,
  rootPageId,
  rootDomain,
  rootSpaceId,
  darkMode,
  previewImages,
  forceCustomImages,
  showCollectionViewDropdown,
  linkTableTitleProperties,
  isLinkCollectionToUrlProperty,
  isImageZoomable = true,
  showTableOfContents,
  minTableOfContentsItems,
  defaultPageIcon,
  defaultPageCover,
  defaultPageCoverPosition,
  editable,
  ...rest
}) => {
  const zoom = React.useMemo(
    () =>
      typeof window !== 'undefined' &&
      mediumZoom({
        background: 'rgba(0, 0, 0, 0.8)',
        minZoomScale: 2.0,
        margin: getMediumZoomMargin()
      }),
    []
  )

  return (
    <NotionContextProvider
      components={components}
      recordMap={recordMap}
      mapPageUrl={mapPageUrl}
      mapImageUrl={mapImageUrl}
      searchNotion={searchNotion}
      isShowingSearch={isShowingSearch}
      onHideSearch={onHideSearch}
      fullPage={fullPage}
      rootPageId={rootPageId}
      rootDomain={rootDomain}
      rootSpaceId={rootSpaceId}
      darkMode={darkMode}
      previewImages={previewImages}
      forceCustomImages={forceCustomImages}
      showCollectionViewDropdown={showCollectionViewDropdown}
      linkTableTitleProperties={linkTableTitleProperties}
      isLinkCollectionToUrlProperty={isLinkCollectionToUrlProperty}
      showTableOfContents={showTableOfContents}
      minTableOfContentsItems={minTableOfContentsItems}
      defaultPageIcon={defaultPageIcon}
      defaultPageCover={defaultPageCover}
      defaultPageCoverPosition={defaultPageCoverPosition}
      editable={editable}
      zoom={isImageZoomable ? zoom : null}>
      <RenderPathContext.Provider value={null}>
        <NotionBlockRenderer {...rest} />
      </RenderPathContext.Provider>
    </NotionContextProvider>
  )
}

/** The blocks being rendered from the root down to here. */
type RenderPath = { id: string; parent: RenderPath | null; depth: number }

const RenderPathContext = React.createContext<RenderPath | null>(null)

const MAX_RENDER_DEPTH = 128

const isOnPath = (path: RenderPath | null, id: string) => {
  for (let node = path; node; node = node.parent) if (node.id === id) return true
  return false
}

export const NotionBlockRenderer: React.FC<{
  className?: string
  bodyClassName?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  disableHeader?: boolean

  blockId?: string
  hideBlockId?: boolean
  level?: number
}> = ({ level = 0, blockId, ...props }) => {
  const { recordMap } = useNotionContext()
  const parentPath = React.useContext(RenderPathContext)
  const id = blockId || Object.keys(recordMap.block)[0]
  const path = React.useMemo(() => ({ id, parent: parentPath, depth: (parentPath?.depth ?? -1) + 1 }), [id, parentPath])
  const block = recordMap.block[id]?.value

  if (!block) {
    if (process.env.NODE_ENV !== 'production') console.warn('missing block', blockId)

    return null
  }

  // A record map can list a block inside its own descendants, directly or through a synced block.
  if (isOnPath(parentPath, id) || path.depth > MAX_RENDER_DEPTH) return null

  return (
    <RenderPathContext.Provider value={path}>
      <Block key={id} level={level} block={block} {...props}>
        {block?.content?.map(contentBlockId => (
          <NotionBlockRenderer key={contentBlockId} blockId={contentBlockId} level={level + 1} {...props} />
        ))}
      </Block>
    </RenderPathContext.Provider>
  )
}

function getMediumZoomMargin() {
  const width = window.innerWidth

  if (width < 500) return 8
  else if (width < 800) return 20
  else if (width < 1280) return 30
  else if (width < 1600) return 40
  else if (width < 1920) return 48
  else return 72
}
