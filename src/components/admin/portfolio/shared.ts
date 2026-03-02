/** Shared constants and types used across PortfolioEditor sub-components */

export const inputCls =
  'w-full bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2'

// 3×3 matrix of size presets: [rowSpan 1-3] × [colSpan 1-3]
export const SIZE_PRESETS = [1, 2, 3].flatMap((rowSpan) =>
  [1, 2, 3].map((colSpan) => ({ colSpan, rowSpan })),
)

export const POSITION_DOTS = [
  'top left', 'top center', 'top right',
  'center left', 'center', 'center right',
  'bottom left', 'bottom center', 'bottom right',
]

export type GalleryImageState = {
  hidden: boolean
  colSpan: number
  rowSpan: number
  objectFit: string
  objectPosition: string
}
