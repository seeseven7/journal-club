import type { CSSProperties } from 'react'
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

export function EquipMenu({ items, open, selectedIndex }: Props) {
  return (
    <nav className="equip" data-open={open} aria-hidden={!open}>
      <ul className="equip-column">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="equip-row"
            style={{ '--i': i } as CSSProperties}
          >
            <div className={`equip-box${i === selectedIndex ? ' selected' : ''}`}>
              {item.glyph}
            </div>
            {i === selectedIndex && (
              <div className="equip-label">
                <span className="name">{item.label}</span>
                <span className="hint">{item.hint}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
