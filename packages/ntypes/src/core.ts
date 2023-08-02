// Base Types
// ----------------------------------------------------------------------------

/** UUID */
export type ID = string

/**
 * Unique identifier for collection properties representing the columns in a
 * traditional relational database.
 *
 * Either a 4-character hash like `o;Os` or `title` as a special, reserved
 * property ID for collection title properties.
 *
 * You can think of `title` properties as primary indexes that are guaranteed
 * to exist as in a traditional database.
 */
export type PropertyID = string

/** Block colors supported by Notion */
export type Color =
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'teal_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background'

/** Types of structured data supported by Notion collections */
export type PropertyType =
  | 'title'
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'person'
  | 'file'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone_number'
  | 'formula'
  | 'relation'
  | 'created_time'
  | 'created_by'
  | 'last_edited_time'
  | 'last_edited_by'

/** Types of number formatting supported by Notion */
export type NumberFormat = 'number_with_commas' | 'percent' | 'dollar' | 'euro' | 'pound' | 'yen' | 'rupee' | 'won' | 'yuan'

export type Role = 'editor' | 'reader' | 'none' | 'read_and_write'

export type BoldFormat = ['b']
export type ItalicFormat = ['i']
export type StrikeFormat = ['s']
export type CodeFormat = ['c']
export type UnderlineFormat = ['_']
export type LinkFormat = ['a', string]
export type ExternalObjectInstanceFormat = ['eoi', string]
export type ColorFormat = ['h', Color]
export type UserFormat = ['u', string]
export type PageFormat = ['p', string] | ['p', string, string]
export type InlineEquationFormat = ['e', string]
export type DiscussionFormat = ['m', string]
export type ExternalLinkFormat = ['‣', [string, string]]
export type DateFormat = ['d', FormattedDate]

export interface FormattedDate {
  type: 'date' | 'daterange' | 'datetime' | 'datetimerange'
  start_date: string
  start_time?: string
  end_date?: string
  end_time?: string
  date_format?: string
  time_zone?: string
}

export type SubDecoration =
  | BoldFormat
  | ItalicFormat
  | StrikeFormat
  | CodeFormat
  | UnderlineFormat
  | LinkFormat
  | ColorFormat
  | DateFormat
  | UserFormat
  | InlineEquationFormat
  | PageFormat
  | ExternalLinkFormat
  | DiscussionFormat
  | ExternalObjectInstanceFormat

export type BaseDecoration = [string]
export type MentionDecoration = ['‣', SubDecoration[]]
export type AdditionalDecoration = [string, SubDecoration[]]

export type Decoration = BaseDecoration | AdditionalDecoration | MentionDecoration

export const isLinkFormat = (format: SubDecoration): format is LinkFormat => format[0] === 'a'
export const isExternalLinkFormat = (format: SubDecoration): format is ExternalLinkFormat => format[0] === '‣'
export const isDateFormat = (format: SubDecoration): format is DateFormat => format[0] === 'd'
export const isColorFormat = (format: SubDecoration): format is ColorFormat => format[0] === 'h'
export const isPageFormat = (format: SubDecoration): format is PageFormat => format[0] === 'p'
export const isUserFormat = (format: SubDecoration): format is UserFormat => format[0] === 'u'

export const isBaseDecoration = (deco: Decoration): deco is BaseDecoration => deco.length === 1
export const isMentionDecoration = (deco: Decoration): deco is MentionDecoration => deco[0] === '‣'
export const isAdditionalDecoration = (deco: Decoration): deco is AdditionalDecoration =>
  !isMentionDecoration(deco) && deco.length === 2
