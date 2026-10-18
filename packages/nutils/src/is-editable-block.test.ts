import { test, expect } from 'vitest'

import { isEditableBlock, isEditableInPlace, isPlainTitle, isRoundTrippableTitle } from './is-editable-block'

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

test('isRoundTrippableTitle takes styles, colours, links and one mention or equation per segment', () => {
  expect(isRoundTrippableTitle(undefined)).toBe(true)
  expect(isRoundTrippableTitle([['bold', [['b'], ['i'], ['_']]], [' plain']])).toBe(true)
  expect(
    isRoundTrippableTitle([
      ['red', [['h', 'red']]],
      ['link', [['a', 'https://texonom.com']]]
    ])
  ).toBe(true)
  expect(
    isRoundTrippableTitle([
      ['‣', [['p', 'page-id']]],
      ['⁍', [['e', 'x^2']]]
    ])
  ).toBe(true)
})

test('isRoundTrippableTitle refuses what a write would drop', () => {
  expect(isRoundTrippableTitle([['note', [['m', 'discussion-id']]]])).toBe(false)
  expect(isRoundTrippableTitle([['‣', [['d', { type: 'date', start_date: '2026-10-19' }]]]])).toBe(false)
  expect(
    isRoundTrippableTitle([
      [
        '‣',
        [
          ['p', 'a'],
          ['u', 'b']
        ]
      ]
    ])
  ).toBe(false)
  expect(isRoundTrippableTitle('words')).toBe(false)
})

test('isEditableInPlace adds to-dos, toggles and quotes, formatted titles included', () => {
  for (const type of ['text', 'header', 'bulleted_list', 'to_do', 'toggle', 'quote'])
    expect(isEditableInPlace({ type, properties: { title: [['words', [['b']]]] } })).toBe(true)
  expect(isEditableInPlace({ type: 'text' })).toBe(true)
  expect(isEditableInPlace({ type: 'callout', properties: { title: [['words']] } })).toBe(false)
  expect(isEditableInPlace({ type: 'text', properties: { title: [['note', [['m', 'x']]]] } })).toBe(false)
})
