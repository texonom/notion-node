import { expect, it, vi } from 'vitest'
import { NotionAPI } from './notion-api'
import type { ExtendedRecordMap } from '@texonom/ntypes'

it('caps the collection views a page fetches when the caller names only its concurrency', async () => {
  const views = Array.from({ length: 400 }, (_, i) => `view-${i}`)
  const recordMap = {
    block: {
      db: { value: { id: 'db', type: 'collection_view', collection_id: 'collection', view_ids: views }, role: 'reader' }
    },
    collection: {},
    collection_view: Object.fromEntries(views.map(id => [id, { value: { id, type: 'table' }, role: 'reader' }])),
    collection_query: {},
    notion_user: {},
    signed_urls: {}
  } as unknown as ExtendedRecordMap
  const notion = new NotionAPI()
  const getCollectionData = vi
    .spyOn(notion, 'getCollectionData')
    .mockResolvedValue({ recordMap: { block: {} }, result: { reducerResults: {} } } as never)

  // getPage passes these two and nothing else.
  await notion.fetchCollections(['db'], recordMap, undefined, { concurrency: 3, fetchOption: undefined })

  expect(getCollectionData).toHaveBeenCalledTimes(300)
  expect(getCollectionData.mock.calls[0][3]).toMatchObject({ fetchOption: { timeout: 20000 } })
})
