import { Command, Option } from 'clipanion'

import { getCanonicalPageId } from '@texonom/nutils'
import type { ExtendedRecordMap } from '@texonom/ntypes'

export abstract class NotionCommand extends Command {
  // for private page or eoi like github inline block
  token = Option.String('-t,--token', {
    description: 'Notion Access Token'
  })
  async execute() {}
}

export const getBlockLink = (blockId: string, recordMap: ExtendedRecordMap, domain = 'https://texonom.com') =>
  `${domain}/${getCanonicalPageId(blockId, recordMap)}`
