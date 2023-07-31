import type { FormattedDate } from '@texonom/ntypes'

/**
 * Attempts to find a valid date from a given property.
 */
export const getDateValue = (prop: any[]): FormattedDate | null => {
  if (prop && Array.isArray(prop))
    if (prop[0] === 'd') return prop[1]
    else
      for (const v of prop) {
        const value = getDateValue(v)
        if (value) return value
      }

  return null
}
