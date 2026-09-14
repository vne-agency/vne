type ArrowDirection = 'up-right' | 'down-right' | 'down-left' | 'up-left' | 'right'

const rotations: Record<ArrowDirection, number> = {
  'up-right': 0,
  'down-right': 90,
  'down-left': 180,
  'up-left': 270,
  right: 45,
}

/** Vector paths keep navigation icons monochrome on every platform. */
export function ArrowIcon({ direction = 'up-right' }: { direction?: ArrowDirection }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'inline-block', verticalAlign: '-0.12em', flexShrink: 0 }}
    >
      <path
        d="M5 19 19 5M5 5h14v14"
        stroke="currentColor"
        strokeWidth="1.5"
        transform={`rotate(${rotations[direction]} 12 12)`}
      />
    </svg>
  )
}

export function PlaybackIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'inline-block', verticalAlign: '-0.12em', flexShrink: 0 }}
    >
      <path d={playing ? 'M6 4h4v16H6zM14 4h4v16h-4z' : 'M6 3v18l15-9z'} />
    </svg>
  )
}
