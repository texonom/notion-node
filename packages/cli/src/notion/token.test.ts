import { expect, it } from 'vitest'
import { exportToken } from './token'

it('reads the token from NOTION_TOKEN, so it never has to be an argument', () => {
  expect(exportToken(undefined, { NOTION_TOKEN: 'from-env' })).toEqual({ token: 'from-env' })
  expect(exportToken(undefined, { NOTION_TOKEN: '' })).toEqual({ token: undefined })
})

it('still takes --token, with a warning that other processes can read it', () => {
  const { token, warning } = exportToken('from-flag', { NOTION_TOKEN: 'from-env' })
  expect(token).toBe('from-flag')
  expect(warning).toMatch(/NOTION_TOKEN/)
})
