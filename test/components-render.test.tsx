import { describe, test, expect } from 'vitest'
import React from '../packages/nreact/node_modules/react'
import { renderToReadableStream } from '../packages/nreact/node_modules/react-dom/server.edge'
import { NotionContextProvider } from '../packages/nreact/src/context'
import {
  Block,
  AssetWrapper,
  Asset,
  Audio,
  Checkbox,
  EOI,
  File,
  GoogleDrive,
  GracefulImage,
  LazyImage,
  LiteYouTubeEmbed,
  PageIcon,
  PageTitle,
  SyncPointerBlock,
  Text
} from '../packages/nreact/src'
import type { Block as BlockType } from '../packages/ntypes/src/block'

const emptyRecordMap = {
  block: {},
  collection: {},
  collection_view: {},
  notion_user: {},
  collection_query: {},
  signed_urls: {}
}

const baseBlock: BlockType = {
  id: 'page',
  type: 'page',
  properties: { title: [['Test']] },
  parent_id: '',
  parent_table: 'space',
  version: 1,
  created_time: 0,
  last_edited_time: 0,
  alive: true,
  created_by_table: 'user',
  created_by_id: '',
  last_edited_by_table: 'user',
  last_edited_by_id: ''
} as any

const audioBlock: BlockType = {
  ...baseBlock,
  id: 'audio',
  type: 'audio',
  properties: { source: [['https://example.com/audio.mp3']] }
} as any

const fileBlock: BlockType = {
  ...baseBlock,
  id: 'file',
  type: 'file',
  properties: {
    title: [['File']],
    size: [['1']],
    source: [['https://example.com/file.pdf']]
  }
} as any

const imageBlock: BlockType = {
  ...baseBlock,
  id: 'image',
  type: 'image',
  properties: {
    source: [['https://example.com/image.png']]
  }
} as any

const googleDriveBlock: BlockType = {
  ...baseBlock,
  id: 'gd',
  type: 'google_drive',
  format: { drive_properties: { url: 'https://drive.google.com/file/d/abc' } }
} as any

const eoiBlock: BlockType = {
  ...baseBlock,
  id: 'eoi',
  type: 'embed',
  format: {
    original_url: 'https://github.com',
    domain: 'github.com',
    attributes: [{ id: 'title', values: ['Repo'] }]
  }
} as any

async function renderElement(element: React.ReactNode, expectContent = true) {
  const stream = await renderToReadableStream(
    <NotionContextProvider recordMap={emptyRecordMap}>{element}</NotionContextProvider>
  )
  const reader = stream.getReader()
  const chunk = await reader.read()
  // Components that render nothing (return null) will have chunk.done = true
  // This is valid behavior, we just want to ensure no errors during rendering
  if (expectContent) expect(chunk.done).toBe(false)
}

describe('individual component rendering', () => {
  test('Block', async () => {
    await renderElement(<Block block={baseBlock} level={0} />)
  })

  test('AssetWrapper', async () => {
    await renderElement(<AssetWrapper blockId='file' block={fileBlock} />)
  })

  test('Asset', async () => {
    await renderElement(<Asset block={imageBlock}>{null}</Asset>)
  })

  test('Audio', async () => {
    await renderElement(<Audio block={audioBlock} />)
  })

  test('Checkbox', async () => {
    await renderElement(<Checkbox isChecked={true} blockId='page' />)
  })

  test('EOI', async () => {
    await renderElement(<EOI block={eoiBlock} />)
  })

  test('File', async () => {
    await renderElement(<File block={fileBlock} />)
  })

  test('GoogleDrive', async () => {
    await renderElement(<GoogleDrive block={googleDriveBlock} />)
  })

  test('GracefulImage', async () => {
    await renderElement(<GracefulImage src='image.png' />)
  })

  test('LazyImage', async () => {
    await renderElement(<LazyImage src='image.png' />)
  })

  test('LiteYouTubeEmbed', async () => {
    await renderElement(<LiteYouTubeEmbed id='dQw4w9WgXcQ' />)
  })

  test('PageIcon', async () => {
    await renderElement(<PageIcon block={baseBlock} />)
  })

  test('PageTitle', async () => {
    await renderElement(<PageTitle block={baseBlock} />)
  })

  test('SyncPointerBlock', async () => {
    // SyncPointerBlock returns null when there's no transclusion_reference_pointer
    await renderElement(<SyncPointerBlock block={baseBlock} level={0} />, false)
  })

  test('Text', async () => {
    await renderElement(<Text value={[['Hello']]} block={baseBlock} />)
  })
})
