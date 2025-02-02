import { RecordMap } from './maps'

// API types
// ----------------------------------------------------------------------------

export interface RecordValues<T> {
  results: T[]
  recordMapWithRoles?: RecordMap
}

export interface SearchParams {
  ancestorId: string
  query: string
  excludedBlockIds?: string[]
  searchExperimentOverrides?: object
  filters?: {
    isDeletedOnly: boolean
    excludeTemplates: boolean
    navigableBlockContentOnly: boolean
    requireEditPermissions: boolean
    includePublicPagesWithoutExplicitAccess?: boolean
    ancestors?: string[]
    createdBy?: string[]
    editedBy?: string[]
    inTeams?: string[]
    createdTime?: SearchTimeFilter
    lastEditedTime?: SearchTimeFilter
  }
  limit?: number
  searchSessionId?: string
  recentPagesForBoosting?: {
    visitedAt: number
    pageId: string
  }[]
  sort?: {
    field: 'relevance' | 'created' | 'lastEdited'
    direction?: 'desc' | 'acs'
  }
  source?: 'quick_find_filters' | 'quick_find_public'
  type?: 'BlocksInAncestor'
}

export interface BacklinkParams {
  block: {
    id: string
    spaceId: string
  }
}

export interface SearchTimeFilter {
  starting?: {
    type: 'date'
    start_date: string
  }
  ending?: {
    type: 'date'
    start_date: string
  }
}

export interface SearchResults {
  recordMap: RecordMap
  results: SearchResult[]
  total: number
}

export interface BacklinkResults {
  backlinks: {
    block_id: string
    mentioned_from: {
      block_id: string
      pointer: {
        id: string
        table: 'block'
        spaceId: string
      }
      property_id: 'title'
      type: 'property_mention'
    }
  }[]
  fanoutData: []
  inaccessibleBacklinkCount: number
  recordMap: RecordMap
}

export interface SearchResult {
  id: string
  isNavigable: boolean
  score: number
  highlight: {
    // <gzkNfoUU>query</gzkNfoUU> else for bold
    title: string
    pathText: string
    text: string
  }
}

export interface APIError {
  errorId: string
  name: string
  message: string
}
