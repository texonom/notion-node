import { test, expect } from 'vitest'

import { isEditableBlock, isPlainTitle } from './is-editable-block'

test('isPlainTitle accepts unformatted text', () => {
  expect(isPlainTitle([['plain words']])).toBe(true)
  expect(isPlainTitle([['one'], ['two']])).toBe(true)
  expect(isPlainTitle([['no formats', []]])).toBe(true)
})

test('isPlainTitle refuses anything carrying formatting', () => {
  expect(isPlainTitle([['bold', [['b']]]])).toBe(false)
  expect(isPlainTitle([['a link', [['a', 'https://texonom.com']]]])).toBe(false)
  expect(isPlainTitle([['‣', [['p', 'page-id']]]])).toBe(false)
})

test('isPlainTitle refuses a missing or malformed title', () => {
  expect(isPlainTitle(undefined)).toBe(false)
  expect(isPlainTitle('plain words')).toBe(false)
  expect(isPlainTitle([[42]])).toBe(false)
})

test('isEditableBlock takes text, headings and list items with a plain title', () => {
  for (const type of ['text', 'header', 'sub_header', 'sub_sub_header', 'bulleted_list', 'numbered_list'])
    expect(isEditableBlock({ type, properties: { title: [['words']] } })).toBe(true)
})

test('isEditableBlock refuses other blocks and formatted titles', () => {
  expect(isEditableBlock({ type: 'page', properties: { title: [['A page']] } })).toBe(false)
  expect(isEditableBlock({ type: 'code', properties: { title: [['const a = 1']] } })).toBe(false)
  expect(isEditableBlock({ type: 'text', properties: { title: [['bold', [['b']]]] } })).toBe(false)
  expect(isEditableBlock({ type: 'text' })).toBe(false)
})
