import React from 'react'

import type {
  ExtendedRecordMap,
  Block,
  SearchParams,
  SearchResults,
  CollectionView,
  CollectionQueryResult,
  PageBlock,
  CollectionCardCover,
  CollectionCardCoverSize,
  CollectionCardCoverAspect,
  PropertyID,
  Collection,
  CodeBlock
} from '@texonom/ntypes'

export type MapPageUrlFn = (pageId: string, recordMap?: ExtendedRecordMap | undefined) => string
export type MapImageUrlFn = (url: string, block: Block) => string
export type SearchNotionFn = (params: SearchParams) => Promise<SearchResults>

export type ComponentOverrideFn = (props: any, defaultValueFn: () => React.ReactNode) => any

export interface NotionComponents {
  // TODO: better typing for arbitrary react components
  Image: React.ComponentType<{ [prop: string]: unknown }>
  Link: React.ComponentType<{ [prop: string]: unknown }>
  PageLink: React.ComponentType<{ [prop: string]: unknown }>
  Checkbox: React.FC<{ isChecked: boolean; blockId: string }>

  // blocks
  Code: React.ComponentType<{ block: CodeBlock }>
  Equation: React.ComponentType<{ [prop: string]: unknown }>
  Callout?: React.ComponentType<{ [prop: string]: unknown }>

  // collection
  Collection: React.ComponentType<{ [prop: string]: unknown }>
  Property?: React.ComponentType<{ [prop: string]: unknown }>

  propertyTextValue: ComponentOverrideFn
  propertySelectValue: ComponentOverrideFn
  propertyRelationValue: ComponentOverrideFn
  propertyFormulaValue: ComponentOverrideFn
  propertyTitleValue: ComponentOverrideFn
  propertyPersonValue: ComponentOverrideFn
  propertyFileValue: ComponentOverrideFn
  propertyCheckboxValue: ComponentOverrideFn
  propertyUrlValue: ComponentOverrideFn
  propertyEmailValue: ComponentOverrideFn
  propertyPhoneNumberValue: ComponentOverrideFn
  propertyNumberValue: ComponentOverrideFn
  propertyLastEditedTimeValue: ComponentOverrideFn
  propertyCreatedTimeValue: ComponentOverrideFn
  propertyDateValue: ComponentOverrideFn

  // assets
  Pdf: React.ComponentType<{ [prop: string]: unknown }>
  Tweet: React.ComponentType<{ [prop: string]: unknown }>
  Modal: React.ComponentType<{ [prop: string]: unknown }>
  Embed: React.ComponentType<{ [prop: string]: unknown }>

  // page navigation
  Header: React.ComponentType<{ [prop: string]: unknown }>

  // optional next.js-specific overrides
  nextImage?: React.ComponentType<{ [prop: string]: unknown }>
  nextLink?: React.ComponentType<{ [prop: string]: unknown }>
}

export interface CollectionViewProps {
  collection: Collection
  collectionView: CollectionView
  collectionData: CollectionQueryResult
  padding?: number
  width?: number
}

export interface CollectionCardProps {
  collection: Collection
  block: PageBlock
  cover: CollectionCardCover
  coverSize: CollectionCardCoverSize
  coverAspect: CollectionCardCoverAspect
  properties?: Array<{
    property: PropertyID
    visible: boolean
  }>
  className?: string
}
export interface CollectionGroupProps {
  collection: Collection
  collectionViewComponent: React.ElementType
  collectionGroup: any
  hidden: boolean
  schema: any
  value: any
  summaryProps: any
  detailsProps: any
}
