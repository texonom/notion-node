import { describe, test, expect } from 'vitest'
import React from '../packages/nreact/node_modules/react'
import { renderToString } from '../packages/nreact/node_modules/react-dom/server'
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

function renderElement(element: React.ReactNode, expectContent = true) {
  const html = renderToString(
    <NotionContextProvider recordMap={emptyRecordMap}>{element}</NotionContextProvider>
  )
  // Components that render nothing (return null) will produce empty string
  // This is valid behavior, we just want to ensure no errors during rendering
  if (expectContent) expect(html.length).toBeGreaterThan(0)
}

describe('individual component rendering', () => {
  test('Block', () => {
    renderElement(<Block block={baseBlock} level={0} />)
  })

  test('AssetWrapper', () => {
    renderElement(<AssetWrapper blockId='file' block={fileBlock} />)
  })

  test('Asset', () => {
    renderElement(<Asset block={imageBlock}>{null}</Asset>)
  })

  test('Audio', () => {
    renderElement(<Audio block={audioBlock} />)
  })

  test('Checkbox', () => {
    renderElement(<Checkbox isChecked={true} blockId='page' />)
  })

  test('EOI', () => {
    renderElement(<EOI block={eoiBlock} />)
  })

  test('File', () => {
    renderElement(<File block={fileBlock} />)
  })

  test('GoogleDrive', () => {
    renderElement(<GoogleDrive block={googleDriveBlock} />)
  })

  test('GracefulImage', () => {
    renderElement(<GracefulImage src='image.png' />)
  })

  test('LazyImage', () => {
    renderElement(<LazyImage src='image.png' />)
  })

  test('LiteYouTubeEmbed', () => {
    renderElement(<LiteYouTubeEmbed id='dQw4w9WgXcQ' />)
  })

  test('PageIcon', () => {
    renderElement(<PageIcon block={baseBlock} />)
  })

  test('PageTitle', () => {
    renderElement(<PageTitle block={baseBlock} />)
  })

  test('SyncPointerBlock', () => {
    // SyncPointerBlock returns null when there's no transclusion_reference_pointer
    renderElement(<SyncPointerBlock block={baseBlock} level={0} />, false)
  })

  test('Text', () => {
    renderElement(<Text value={[['Hello']]} block={baseBlock} />)
  })
})
