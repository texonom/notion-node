'use server'
import React from 'react'

import format from 'date-fns/format/index.js'
import formatNumber from 'format-number'

import { Checkbox } from '../components/checkbox'
import { GracefulImage } from '../components/graceful-image'
import { PageTitle } from '../components/page-title'
import { Text } from '../components/text'
import { useNotionContext } from '../context'
import { formatDate } from '../utils'
import { evalFormula } from './eval-formula'

import type { CollectionPropertySchema, Decoration, Block, Collection, FormulaResult } from '@texonom/ntypes'
export interface IPropertyProps {
  propertyId?: string
  schema?: CollectionPropertySchema
  data?: Decoration[]
  block?: Block
  collection?: Collection
  inline?: boolean
  linkToTitlePage?: boolean
  pageHeader?: boolean
}

/**
 * Renders a single value of structured Notion data according to its schema.
 *
 * This corresponds to rendering the content of a single cell in a table.
 * Property rendering is re-used across all the different types of collection views.
 */
export const Property: React.FC<IPropertyProps> = props => {
  const { components } = useNotionContext()

  if (components.Property) return <components.Property {...props} />
  else return <PropertyImplMemo {...props} />
}

export const PropertyImpl: React.FC<IPropertyProps> = props => {
  const { components, mapImageUrl, mapPageUrl } = useNotionContext()
  const { schema, data, block, collection, inline = false, linkToTitlePage = true } = props

  const renderDateValue = React.useMemo(
    () =>
      function DateProperty() {
        return <Text value={data} block={block} />
      },
    [block, data]
  )

  const renderRelationValue = React.useMemo(
    () =>
      function RelationProperty() {
        return <Text value={data} block={block} />
      },
    [block, data]
  )

  const renderFormulaValue = React.useMemo(
    () =>
      function FormulaProperty() {
        let content: FormulaResult | null

        try {
          content = evalFormula(schema.formula, {
            schema: collection?.schema,
            properties: block?.properties
          })

          if (isNaN(content as number)) console.debug('NaN', schema.formula)

          if (content instanceof Date) content = format(content, 'MMM d, YYY hh:mm aa')
        } catch (err) {
          console.error('error evaluating formula', schema.formula, err)
          content = null
        }

        return content as Exclude<FormulaResult, Date>
      },
    [block?.properties, collection?.schema, schema]
  )

  const renderTextValue = React.useMemo(
    () =>
      function TextProperty() {
        return <Text value={data} block={block} />
      },
    [block, data]
  )

  const renderTitleValue = React.useMemo(
    () =>
      function FormulaTitle() {
        if (block && linkToTitlePage)
          return (
            <components.PageLink className={'notion-page-link'} href={mapPageUrl(block.id)}>
              <PageTitle block={block} />
            </components.PageLink>
          )
        else return <Text value={data} block={block} />
      },
    [block, components, data, linkToTitlePage, mapPageUrl]
  )

  const renderPersonValue = React.useMemo(
    () =>
      function PersonProperty() {
        return (
          <span>
            <Text block={block} value={[['‣', [['u', block.created_by_id]]]]} />
          </span>
        )
      },
    [block]
  )

  const renderFileValue = React.useMemo(
    () =>
      function FileProperty() {
        // TODO: assets should be previewable via image-zoom
        const files = data.filter(v => v.length === 2).map(f => f.flat().flat())

        return files.map((file, i) => (
          <components.Link
            key={i}
            className='notion-property-file'
            href={mapImageUrl(file[2] as string, block)}
            target='_blank'
            rel='noreferrer noopener'>
            <GracefulImage alt={file[0] as string} src={mapImageUrl(file[2] as string, block)} loading='lazy' />
          </components.Link>
        ))
      },
    [block, components, data, mapImageUrl]
  )

  const renderCheckboxValue = React.useMemo(
    () =>
      function CheckboxProperty() {
        const isChecked = data && data[0][0] === 'Yes'

        return (
          <div className='notion-property-checkbox-container'>
            <Checkbox isChecked={isChecked} blockId={undefined} />
            <span className='notion-property-checkbox-text'>{schema.name}</span>
          </div>
        )
      },
    [data, schema]
  )

  const renderUrlValue = React.useMemo(
    () =>
      function UrlProperty() {
        // TODO: refactor to less hacky solution
        const d = JSON.parse(JSON.stringify(data))

        if (inline)
          try {
            const url = new URL(d[0][0])
            d[0][0] = url.hostname.replace(/^www\./, '')
          } catch (err) {
            // ignore invalid urls
          }

        return (
          <Text
            value={d}
            block={block}
            inline={inline}
            linkProps={{
              target: '_blank',
              rel: 'noreferrer noopener'
            }}
          />
        )
      },
    [block, data, inline]
  )

  const renderEmailValue = React.useMemo(
    () =>
      function EmailProperty() {
        return <Text value={data} linkProtocol='mailto' block={block} />
      },
    [block, data]
  )

  const renderPhoneNumberValue = React.useMemo(
    () =>
      function PhoneNumberProperty() {
        return <Text value={data} linkProtocol='tel' block={block} />
      },
    [block, data]
  )

  const renderNumberValue = React.useMemo(
    () =>
      function NumberProperty() {
        const value = parseFloat(data[0][0] || '0')
        let output = ''

        if (isNaN(value)) {
          return <Text value={data} block={block} />
        } else {
          switch (schema.number_format) {
            case 'number_with_commas':
              output = formatNumber()(value)
              break
            case 'percent':
              output = formatNumber({ suffix: '%' })(value * 100)
              break
            case 'dollar':
              output = formatNumber({ prefix: '$', round: 2, padRight: 2 })(value)
              break
            case 'euro':
              output = formatNumber({ prefix: '€', round: 2, padRight: 2 })(value)
              break
            case 'pound':
              output = formatNumber({ prefix: '£', round: 2, padRight: 2 })(value)
              break
            case 'yen':
              output = formatNumber({ prefix: '¥', round: 0 })(value)
              break
            case 'rupee':
              output = formatNumber({ prefix: '₹', round: 2, padRight: 2 })(value)
              break
            case 'won':
              output = formatNumber({ prefix: '₩', round: 0 })(value)
              break
            case 'yuan':
              output = formatNumber({ prefix: 'CN¥', round: 2, padRight: 2 })(value)
              break
            default:
              return <Text value={data} block={block} />
          }

          return <Text value={[[output]]} block={block} />
        }
      },
    [block, data, schema]
  )

  const renderCreatedTimeValue = React.useMemo(
    () =>
      function CreatedTimeProperty() {
        return <Text block={block} value={[[formatDate(block?.created_time, { month: 'short' })]]} />
      },
    [block]
  )

  const renderLastEditedTimeValue = React.useMemo(
    () =>
      function EditedTimeProperty() {
        return <Text block={block} value={[[formatDate(block?.last_edited_time, { month: 'short' })]]} />
      },
    [block]
  )

  if (!schema) return null

  let content = null

  if (
    data ||
    schema.type === 'checkbox' ||
    schema.type === 'title' ||
    schema.type === 'formula' ||
    schema.type === 'created_by' ||
    schema.type === 'last_edited_by' ||
    schema.type === 'created_time' ||
    schema.type === 'last_edited_time'
  )
    switch (schema.type) {
      case 'relation':
        content = components.propertyRelationValue(props, renderRelationValue)
        break

      case 'formula':
        // TODO
        // console.info('formula', schema.formula, {
        //   schema: collection?.schema,
        //   properties: block?.properties
        // })

        content = components.propertyFormulaValue(props, renderFormulaValue)
        break

      case 'title':
        content = components.propertyTitleValue(props, renderTitleValue)
        break

      case 'select':
      // intentional fallthrough
      case 'multi_select': {
        const values = (data[0][0] || '').split(',')

        content = values.map((value, index) => {
          const option = schema.options?.find(option => value === option.value)
          const color = option?.color

          return components.propertySelectValue(
            {
              ...props,
              key: index,
              value,
              option,
              color
            },
            () => (
              <div key={index} className={`notion-property-${schema.type}-item ${color && `notion-item-${color}`}`}>
                {value}
              </div>
            )
          )
        })
        break
      }

      case 'person':
        content = components.propertyPersonValue(props, renderPersonValue)
        break

      case 'file':
        content = components.propertyFileValue(props, renderFileValue)
        break

      case 'checkbox':
        content = components.propertyCheckboxValue(props, renderCheckboxValue)
        break

      case 'url':
        content = components.propertyUrlValue(props, renderUrlValue)
        break

      case 'email':
        content = components.propertyEmailValue(props, renderEmailValue)
        break

      case 'phone_number':
        content = components.propertyPhoneNumberValue(props, renderPhoneNumberValue)
        break

      case 'number':
        content = components.propertyNumberValue(props, renderNumberValue)
        break

      case 'created_time':
        content = components.propertyCreatedTimeValue(props, renderCreatedTimeValue)
        break

      case 'last_edited_time':
        content = components.propertyLastEditedTimeValue(props, renderLastEditedTimeValue)
        break

      case 'created_by':
        content = components.propertyPersonValue(props, renderPersonValue)
        break

      case 'last_edited_by':
        content = components.propertyPersonValue(props, renderPersonValue)
        break

      case 'text':
        content = components.propertyTextValue(props, renderTextValue)
        break

      case 'date':
        content = components.propertyDateValue(props, renderDateValue)
        break

      default:
        content = <Text value={data} block={block} />
        break
    }

  const isTitle = schema.type === 'title'
  return (
    <span className={`notion-property notion-property-${schema.type}`}>
      {isTitle ? null : (
        <div style={{ marginRight: '1em', display: 'inline' }}>
          <Text block={block} value={[[schema.name, [['h', 'gray']]]]} />{' '}
        </div>
      )}
      {content}
    </span>
  )
}

export const PropertyImplMemo = React.memo(PropertyImpl)
