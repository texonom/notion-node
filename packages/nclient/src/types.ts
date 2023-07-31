import type { ID } from '@texonom/ntypes'

export interface SignedUrlRequest {
  permissionRecord: PermissionRecord
  url: string
}

export interface PermissionRecord {
  table: string
  id: ID
}

export interface SignedUrlResponse {
  signedUrls: string[]
}

export type FetchOption = RequestInit & { timeout?: number }
