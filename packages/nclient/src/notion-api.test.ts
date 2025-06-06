import { test, expect } from 'vitest'
import { config } from 'dotenv'
import { NotionAPI } from './notion-api'

config()

const pageIdFixturesSuccess = [
  'e0ae7b40-dd23-463e-a7bc-92195d6ec7fd',
  'https://www.notion.so/seongland/LLaMA-f2b6721202d44d469add84d8a366809c?pvs=',
  'LLM-b9157a9d105d450ba86f2570619551b4',
  '577d47779c5f4da98e3fb0df753b9e81'
]

const pageIdFixturesFailure = [
  'a4252f427d2b4a64b2e668af0ec3aa53', // private page
  'foo' // invalid page id
]

for (const pageId of pageIdFixturesSuccess)
  test(`NotionAPI.getPage success ${pageId}`, { timeout: 10000, concurrent: true }, async () => {
    const api = new NotionAPI()
    const page = await api.getPage(pageId)

    expect(page).toBeTruthy()
    expect(page.block).toBeTruthy()
  })

for (const pageId of pageIdFixturesFailure)
  test.concurrent(`NotionAPI.getPage failure ${pageId}`, async () => {
    const api = new NotionAPI()
    await expect(() => api.getPage(pageId, { fetchOption: { timeout: 3000 } })).rejects.toThrow()
  })

test(`Search`, { timeout: 10000, concurrent: true }, async () => {
  const api = new NotionAPI()
  const results = await api.search({
    query: 'Texonom',
    ancestorId: '04089c8ae3534bf79512fc495944b321',
    filters: {
      isDeletedOnly: false,
      excludeTemplates: true,
      navigableBlockContentOnly: true,
      requireEditPermissions: false
    }
  })
  console.info(results)
  if (!(results.total > 0)) throw new Error('Search error')
  expect(results.recordMap.block).toBeTypeOf('object')
})

test(`Backlink`, { timeout: 10000, concurrent: true }, async () => {
  const api = new NotionAPI({ authToken: process.env.NOTION_TOKEN })
  const backlinks = await api.getBacklinks({
    block: {
      id: '441d5ce2-b781-46d0-9354-54042b4f06d9',
      spaceId: '0bf522c6-2468-4c71-99e3-68f5a25d4225'
    }
  })
  expect(backlinks.backlinks.length > 0)
})

test(`Page Backlink`, { timeout: 10000, concurrent: true }, async () => {
  const api = new NotionAPI({ authToken: process.env.NOTION_TOKEN })
  const backlinks = await api.getPageBacklinks('441d5ce2-b781-46d0-9354-54042b4f06d9')
  expect(backlinks.backlinks.length > 0)
})

test(`Page Backlink`, { timeout: 10000, concurrent: true }, async () => {
  const api = new NotionAPI({ authToken: process.env.NOTION_TOKEN })
  const backlinks = await api.getPageBacklinks('441d5ce2-b781-46d0-9354-54042b4f06d9')
  expect(backlinks.backlinks.length > 0)
})

test(`Get block`, { timeout: 10000, concurrent: true }, async () => {
  const id = '3f9e0d86-c643-4672-aa0c-78d63fa80598'
  const api = new NotionAPI()
  const res = await api.getBlocks([id])
  expect(res.recordMap.block[id].role).toBe('none')
})
