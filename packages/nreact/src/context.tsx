import React from 'react'

import { defaultMapImageUrl, defaultMapPageUrl } from '@texonom/nutils'

import { AssetWrapper } from './components/asset-wrapper'
import { Checkbox as DefaultCheckbox } from './components/checkbox'
import { Header } from './components/header'
import { wrapNextImage, wrapNextLink } from './next'
import { MapImageUrlFn, MapPageUrlFn, NotionComponents, SearchNotionFn } from './types'

import type { ExtendedRecordMap } from '@texonom/ntypes'
export interface NotionContext {
  recordMap: ExtendedRecordMap
  components: NotionComponents

  mapPageUrl: MapPageUrlFn
  mapImageUrl: MapImageUrlFn
  searchNotion?: SearchNotionFn
  isShowingSearch?: boolean
  onHideSearch?: () => void

  rootPageId?: string
  rootDomain?: string

  fullPage: boolean
  darkMode: boolean
  previewImages: boolean
  forceCustomImages: boolean
  showCollectionViewDropdown: boolean
  showTableOfContents: boolean
  minTableOfContentsItems: number
  linkTableTitleProperties: boolean
  isLinkCollectionToUrlProperty: boolean

  defaultPageIcon?: string
  defaultPageCover?: string
  defaultPageCoverPosition?: number

  zoom: any
}

export interface PartialNotionContext {
  children?: React.ReactNode
  recordMap?: ExtendedRecordMap
  components?: Partial<NotionComponents>

  mapPageUrl?: MapPageUrlFn
  mapImageUrl?: MapImageUrlFn
  searchNotion?: SearchNotionFn
  isShowingSearch?: boolean
  onHideSearch?: () => void

  rootPageId?: string
  rootDomain?: string

  fullPage?: boolean
  darkMode?: boolean
  previewImages?: boolean
  forceCustomImages?: boolean
  showCollectionViewDropdown?: boolean
  linkTableTitleProperties?: boolean
  isLinkCollectionToUrlProperty?: boolean

  showTableOfContents?: boolean
  minTableOfContentsItems?: number

  defaultPageIcon?: string
  defaultPageCover?: string
  defaultPageCoverPosition?: number

  zoom?: any
}

const DefaultLink: React.FC = props => <a target='_blank' rel='noopener noreferrer' {...props} />
const DefaultLinkMemo = React.memo(DefaultLink)
const DefaultPageLink: React.FC = props => <a {...props} />
const DefaultPageLinkMemo = React.memo(DefaultPageLink)

const DefaultEmbed = props => <AssetWrapper {...props} />
const DefaultHeader = Header

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export const dummyLink = ({ href, rel, target, title, ...rest }) => <span {...rest} />

const dummyComponent = (name: string) => () => {
  console.warn(`Warning: using empty component "${name}" (you should override this in NotionRenderer.components)`)

  return null
}

// TODO: should we use React.memo here?
// https://reactjs.org/docs/react-api.html#reactmemo
const dummyOverrideFn = (_: unknown, defaultValueFn: () => React.ReactNode) => defaultValueFn()

const defaultComponents: NotionComponents = {
  Image: null, // disable custom images by default
  Link: DefaultLinkMemo,
  PageLink: DefaultPageLinkMemo,
  Checkbox: DefaultCheckbox,
  Callout: undefined, // use the built-in callout rendering by default

  Code: dummyComponent('Code'),
  Equation: dummyComponent('Equation'),

  Collection: dummyComponent('Collection'),
  Property: undefined, // use the built-in property rendering by default

  propertyTextValue: dummyOverrideFn,
  propertySelectValue: dummyOverrideFn,
  propertyRelationValue: dummyOverrideFn,
  propertyFormulaValue: dummyOverrideFn,
  propertyTitleValue: dummyOverrideFn,
  propertyPersonValue: dummyOverrideFn,
  propertyFileValue: dummyOverrideFn,
  propertyCheckboxValue: dummyOverrideFn,
  propertyUrlValue: dummyOverrideFn,
  propertyEmailValue: dummyOverrideFn,
  propertyPhoneNumberValue: dummyOverrideFn,
  propertyNumberValue: dummyOverrideFn,
  propertyLastEditedTimeValue: dummyOverrideFn,
  propertyCreatedTimeValue: dummyOverrideFn,
  propertyDateValue: dummyOverrideFn,

  Pdf: dummyComponent('Pdf'),
  Tweet: dummyComponent('Tweet'),
  Modal: dummyComponent('Modal'),

  Header: DefaultHeader,
  Embed: DefaultEmbed
}

const defaultNotionContext: NotionContext = {
  recordMap: {
    block: {},
    collection: {},
    collection_view: {},
    collection_query: {},
    notion_user: {},
    signed_urls: {}
  },

  components: defaultComponents,

  mapPageUrl: defaultMapPageUrl(),
  mapImageUrl: defaultMapImageUrl,
  searchNotion: null,
  isShowingSearch: false,
  onHideSearch: null,

  fullPage: false,
  darkMode: false,
  previewImages: false,
  forceCustomImages: false,
  showCollectionViewDropdown: true,
  linkTableTitleProperties: true,
  isLinkCollectionToUrlProperty: false,

  showTableOfContents: false,
  minTableOfContentsItems: 3,

  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  zoom: null
}

const ctx = React.createContext<NotionContext>(defaultNotionContext)

export const NotionContextProvider: React.FC<PartialNotionContext> = ({
  components: themeComponents = {},
  children,
  mapPageUrl,
  mapImageUrl,
  rootPageId,
  ...rest
}) => {
  for (const key of Object.keys(rest)) if (rest[key] === undefined) delete rest[key]

  const wrappedThemeComponents = React.useMemo(() => {
    const components = { ...themeComponents }

    if (components.nextImage) components.Image = wrapNextImage(components.nextImage)

    if (components.nextLink) {
      const nextLink = wrapNextLink(components.nextLink)
      components.nextLink = nextLink
      if (!components.PageLink) components.PageLink = nextLink
      if (!components.Link) components.Link = nextLink
    }
    // ensure the user can't override default components with falsy values
    // since it would result in very difficult-to-debug react errors
    for (const key of Object.keys(components)) if (!components[key]) delete components[key]

    return components
  }, [themeComponents])

    // ensure the user can't override default components with falsy values
    // since it would result in very difficult-to-debug react errors
    for (const key of Object.keys(components)) if (!components[key]) delete components[key]

    return components
  }, [themeComponents])

  const value = React.useMemo(
    () => ({
      ...defaultNotionContext,
      ...rest,
      rootPageId,
      mapPageUrl: mapPageUrl ?? defaultMapPageUrl(rootPageId),
      mapImageUrl: mapImageUrl ?? defaultMapImageUrl,
      components: { ...defaultComponents, ...wrappedThemeComponents }
    }),
    [mapImageUrl, mapPageUrl, wrappedThemeComponents, rootPageId, rest]
  )

  return <ctx.Provider value={value}>{children}</ctx.Provider>
}

export const NotionContextConsumer = ctx.Consumer

export const useNotionContext = (): NotionContext => {
  return React.useContext(ctx)
}
