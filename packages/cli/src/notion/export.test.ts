import { test, expect } from 'vitest'

import { NotionExporter } from '.'
import { parsePageId } from '@texonom/nutils'

const pageIdFixturesSuccess = [
  'e0ae7b40-dd23-463e-a7bc-92195d6ec7fd',
  'https://www.notion.so/seongland/LLaMA-f2b6721202d44d469add84d8a366809c?pvs=',
  'LLM-b9157a9d105d450ba86f2570619551b4',
  '577d47779c5f4da98e3fb0df753b9e81'
]

for (const pageId of pageIdFixturesSuccess)
  test(`NotionAPI.getPage success ${pageId}`, { timeout: 10000, concurrent: true }, async () => {
    const exporter = new NotionExporter({ page: pageId })
    const page = await exporter.notion.getPage(pageId)
    const text = await exporter.pageToMarkdown(parsePageId(pageId), page)
    expect(text.length > 0)
  })
