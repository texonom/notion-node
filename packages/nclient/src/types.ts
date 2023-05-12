import * as notion from '@texonom/ntypes'

export interface SignedUrlRequest {
  permissionRecord: PermissionRecord
  url: string
}

export interface PermissionRecord {
  table: string
  id: notion.ID
}

export interface SignedUrlResponse {
  signedUrls: string[]
}

export type FetchOption = RequestInit & { timeout?: number }
