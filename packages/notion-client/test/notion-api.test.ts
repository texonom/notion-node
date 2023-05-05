import { test, expect } from 'vitest'

import { NotionAPI } from '../src/notion-api'

const pageIdFixturesSuccess = [
  'e0ae7b40-dd23-463e-a7bc-92195d6ec7fd',
  'https://www.notion.so/seongland/LLaMA-f2b6721202d44d469add84d8a366809c?pvs=',
  'LLM-b9157a9d105d450ba86f2570619551b4',
  '577d47779c5f4da98e3fb0df753b9e81'
]

const pageIdFixturesFailure = [
  'bdecdf150d0e40cb9f3412be132335d4', // private page
  'foo' // invalid page id
]

for (const pageId of pageIdFixturesSuccess)
  test(
    `NotionAPI.getPage success ${pageId}`,
    async () => {
      const api = new NotionAPI()
      const page = await api.getPage(pageId)

      expect(page).toBeTruthy()
      expect(page.block).toBeTruthy()
    },
    { timeout: 10000 }
  )

for (const pageId of pageIdFixturesFailure)
  test(`NotionAPI.getPage failure ${pageId}`, async () => {
    const api = new NotionAPI()
    await expect(() => api.getPage(pageId, { fetchOption: { timeout: 1000 } })).rejects.toThrow()
  })
