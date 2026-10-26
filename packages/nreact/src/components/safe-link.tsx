import React from 'react'
import { getSafeUrl } from '@texonom/nutils'

type LinkComponent = React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>
const safeLinks = new WeakMap<LinkComponent, LinkComponent>()

// Check before handing props to host-supplied components (including Next links).
export function withSafeLink(Component: LinkComponent): LinkComponent {
  const existing = safeLinks.get(Component)
  if (existing) return existing
  function SafeLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    const safeHref = getSafeUrl(href)
    if (!safeHref)
      return (
        <span className={props.className} style={props.style} title={props.title}>
          {children}
        </span>
      )
    return (
      <Component {...props} href={safeHref}>
        {children}
      </Component>
    )
  }
  // Keep component identities stable across provider updates and nested contexts.
  safeLinks.set(Component, SafeLink)
  safeLinks.set(SafeLink, SafeLink)
  return SafeLink
}
