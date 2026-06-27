import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import './EquipMenu.css'

export type EquipItem = {
  id: string
  glyph: string
  label: string
  hint: string
}

type Props = {
  items: EquipItem[]
  open: boolean
  selectedIndex: number
}

// Box size + gap, in px. Must match the .equip-box dimensions in the CSS.
const CELL = 70

export function EquipMenu({ items, open, selectedIndex }: Props) {
  const n = items.length

  // Short bottom arm, the rest stacked up the vertical arm.
  // For 4 items this is 3 up (incl. the elbow) + 1 right
  const horizontalCount = Math.max(1, Math.floor((n - 1) / 3))
  const verticalCount = n - horizontalCount
  const cornerRow = verticalCount - 1
  const cornerTrack = verticalCount - 1 // the loop position that sits at the elbow

  // A "track position" runs 0..n-1: down the column from the top to the elbow,
  // then right along the bottom arm. Map one to its grid cell.
  const cellFor = (track: number) =>
    track < verticalCount
      ? { col: 0, row: track }
      : { col: track - verticalCount + 1, row: cornerRow }

  // Remember each item's previous track slot. When an item loops past the end
  // (far-right <-> top) it would otherwise fly diagonally across the screen, so
  // we drop the animation for just that one item on the frame it teleports.
  const prevTrack = useRef<Record<string, number>>({})
  const tracks: Record<string, number> = {}

  const boxes = items.map((item, i) => {
    // Offset from the selection places the selected item (offset 0) at the elbow.
    const track = (((cornerTrack + (i - selectedIndex)) % n) + n) % n
    tracks[item.id] = track
    const { col, row } = cellFor(track)

    const prev = prevTrack.current[item.id]
    const wraps =
      prev !== undefined &&
      ((prev === 0 && track === n - 1) || (prev === n - 1 && track === 0))

    return (
      <div
        key={item.id}
        className={`equip-box${i === selectedIndex ? ' selected' : ''}${
          wraps ? ' no-anim' : ''
        }`}
        style={{ transform: `translate(${col * CELL}px, ${row * CELL}px)` }}
      >
        {item.glyph}
      </div>
    )
  })

  useLayoutEffect(() => {
    prevTrack.current = tracks
  })

  const selected = items[selectedIndex]
  // Position with `top` (not transform) so the labelIn animation owns transform.
  const labelStyle: CSSProperties = { top: verticalCount * CELL }

  return (
    <nav className="equip" data-open={open} aria-hidden={!open}>
      <div
        className="equip-track"
        style={{
          width: (horizontalCount + 1) * CELL,
          height: verticalCount * CELL,
        }}
      >
        {boxes}
        {selected && (
          <div className="equip-label" key={selected.id} style={labelStyle}>
            <span className="name">{selected.label}</span>
            <span className="hint">{selected.hint}</span>
          </div>
        )}
      </div>
    </nav>
  )
}
