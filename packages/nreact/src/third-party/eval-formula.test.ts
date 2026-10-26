import { describe, expect, it } from 'vitest'
import { evalFormula } from './eval-formula'
import type { Formula, FormulaFunctionType } from '@texonom/ntypes'

const evaluate = (name: FormulaFunctionType, ...values: string[]) =>
  evalFormula(
    {
      type: 'function',
      name,
      result_type: 'text',
      args: values.map(value => ({ type: 'constant', result_type: 'text', value_type: 'string', value }))
    } as Formula,
    { properties: {}, schema: {} }
  )

describe('bounded formula regex evaluation', () => {
  it.each(['test', 'replace', 'replaceAll'] as const)('handles catastrophic backtracking input in %s', name => {
    const value = 'a'.repeat(12_000) + '!'
    expect(evaluate(name, value, '(a+)+$', 'x')).toBe(name === 'test' ? false : value)
  })
  it('preserves matching, captures and first/global replacement', () => {
    expect(evaluate('test', 'before 123 after', '\\d+')).toBe(true)
    expect(evaluate('replace', 'ab ab', '(a)(b)', '$2$1')).toBe('ba ab')
    expect(evaluate('replaceAll', 'ab ab', '(a)(b)', '$2$1')).toBe('ba ba')
    expect(evaluate('replaceAll', 'ab', '', '-')).toBe('-a-b-')
    expect(evaluate('replace', 'ab', '(a)', '$$:$&:$1:$10:$01:$0:$3')).toBe('$:a:a:a0:a:$0:$3b')
    expect(evaluate('replace', 'abc', '(?<letter>b)', "$<letter>:$`:$'")).toBe('ab:a:cc')
  })
  it.each(['(', '(a)\\1', '(?=a)a'])('rejects unsupported or invalid patterns without native fallback: %s', pattern => {
    expect(() => evaluate('test', 'aaa', pattern)).toThrow()
  })
  it('bounds pattern size, input size and replacement output', () => {
    expect(() => evaluate('test', 'a', 'a'.repeat(1_025))).toThrow(/limit/)
    expect(() => evaluate('test', 'a'.repeat(16_385), 'a')).toThrow(/limit/)
    expect(() => evaluate('replaceAll', 'a', 'a', 'x'.repeat(1_025))).toThrow(/limit/)
    expect(() => evaluate('replaceAll', 'a'.repeat(12_000), '.', "$'")).toThrow(/limit/)
  })
})
