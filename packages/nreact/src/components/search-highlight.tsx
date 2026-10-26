import React from 'react'

// Only Notion's highlight delimiters have meaning. Everything else remains text,
// including HTML supplied by a page author or a search provider.
export const SearchHighlight: React.FC<{ text: string }> = ({ text }) => {
  let highlighted = false
  return (
    <>
      {text.split(/(<\/?gzkNfoUU>)/gi).map((part, index) => {
        if (/^<gzkNfoUU>$/i.test(part)) {
          highlighted = true
          return null
        }
        if (/^<\/gzkNfoUU>$/i.test(part)) {
          highlighted = false
          return null
        }
        return highlighted ? <b key={index}>{part}</b> : <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </>
  )
}
