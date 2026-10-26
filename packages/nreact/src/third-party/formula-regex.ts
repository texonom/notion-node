import { RE2JS } from 're2js'

// Bound compilation and matching work as well as avoiding native backtracking.
// Unsupported RE2 syntax is an error; never fall back to the native engine.
export function formulaMatcher(value: string, pattern: string) {
  if (typeof value !== 'string' || typeof pattern !== 'string') throw new Error('Expected text in formula regex')
  if (value.length > 16_384 || pattern.length > 1_024) throw new Error('Formula regex input exceeds its limit')
  const regex = RE2JS.compile(RE2JS.translateRegExp(pattern))
  if (regex.programSize() > 4_096) throw new Error('Formula regex pattern exceeds its limit')
  return regex.matcher(value)
}

export function replaceFormulaRegex(value: string, pattern: string, replacement: string, all = false): string {
  if (typeof replacement !== 'string' || replacement.length > 1_024)
    throw new Error('Formula regex replacement exceeds its limit')
  const matcher = formulaMatcher(value, pattern)
  const limit = 1_048_576
  let result = ''
  let cursor = 0
  while (matcher.find()) {
    const prefix = value.slice(cursor, matcher.start())
    const named = matcher.getNamedGroups()
    let size = result.length + prefix.length + replacement.length
    // Expand JS replacement tokens ourselves so output is bounded before it is
    // allocated, including $` and $' (which can otherwise grow quadratically).
    const text = replacement.replace(/\$(\$|&|`|'|\d{1,2}|<[^>]*>)/g, (token, key: string) => {
      let part = token
      if (key === '$') part = '$'
      else if (key === '&') part = matcher.group() ?? ''
      else if (key === '`') part = value.slice(0, matcher.start())
      else if (key === "'") part = value.slice(matcher.end())
      else if (key.startsWith('<')) {
        if (Object.keys(named).length) part = named[key.slice(1, -1)] ?? ''
      } else {
        const group = Number(key)
        if (group > 0 && group <= matcher.groupCount()) part = matcher.group(group) ?? ''
        else if (key.length === 2 && Number(key[0]) > 0 && Number(key[0]) <= matcher.groupCount())
          part = (matcher.group(Number(key[0])) ?? '') + key[1]
      }
      size += part.length - token.length
      if (size > limit) throw new Error('Formula regex output exceeds its limit')
      return part
    })
    if (result.length + prefix.length + text.length > limit) throw new Error('Formula regex output exceeds its limit')
    result += prefix + text
    cursor = matcher.end()
    if (!all) break
  }
  if (result.length + value.length - cursor > limit) throw new Error('Formula regex output exceeds its limit')
  return result + value.slice(cursor)
}
