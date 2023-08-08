import { ID } from './core'

export interface Space {
  id: ID
  version: number
  name: string
  permissions: [[unknown]]
  icon: string
  beta_enabled: boolean
  pages: ID[]
  disable_public_access: boolean
  disable_guests: boolean
  disable_move_to_space: boolean
  disable_export: boolean
  created_time: number
  last_edited_time: number
  created_by_table: string
  created_by_id: ID
  last_edited_by_table: string
  last_edited_by_id: ID
  plan_type: string
  invite_link_enabled: boolean
  disable_space_page_edits: boolean
  disable_public_access_requests: boolean
  public_home_page: ID
  disable_team_creation: boolean
  settings: {
    grant_awards: unknown[]
    in_ai_program: boolean
    enable_ai_feature: boolean
    disable_team_guests: boolean
    disable_membership_requests: boolean
    seen_guest_membership_requests: boolean
    disable_guest_membership_requests: boolean
  }
  subscription_tier: string
}

export function isSpace(obj: unknown): obj is Space {
  return Boolean((obj as Space)?.pages)
}
