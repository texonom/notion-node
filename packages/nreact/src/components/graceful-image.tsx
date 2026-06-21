import React from 'react'

import { ImgProps } from 'react-image'

// Render a plain <img> on both the server and the client.
//
// Previously this branched on isBrowser: <img> during SSR, react-image's <Img> on the
// client. Under React 18/19 hydration that is a guaranteed mismatch — the server emits
// an <img>, the client's <Img> renders a loading placeholder first, so React throws
// "Hydration failed … server rendered HTML didn't match" and regenerates the whole page
// tree on the client. <Img>'s async onload also fires setState after the node may have
// unmounted ("state update on a component that hasn't mounted yet"). These avatars and
// property thumbnails are single-source images that don't need react-image's fallback
// machinery, so a deterministic <img loading="lazy"> is both correct and hydration-stable.
export const GracefulImage = (props: ImgProps) => {
  // @ts-expect-error react-image's ImgProps is a superset of intrinsic <img> attributes
  return <img loading='lazy' {...props} />
}
