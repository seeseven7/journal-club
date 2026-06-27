import { useEffect } from 'react'
import { formatDay, type Entry } from '../storage'
import './EntryList.css'

type Props = {
  entries: Entry[]
  onSelect: (entry: Entry) => void
  onClose: () => void
}

// The entry's title, falling back to its first line, then to "Untitled".
function heading(entry: Entry): string {
  const title = entry.title?.trim()
  if (title) return title
  const firstLine = entry.body.trim().split('\n')[0]
  return firstLine ? firstLine.slice(0, 64) : 'Untitled'
}

export function EntryList({ entries, onSelect, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sorted = [...entries].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="entry-list" onClick={onClose}>
      <div className="entry-list__panel" onClick={(e) => e.stopPropagation()}>
        <header className="entry-list__header">
          <span>Past Entries</span>
          <span className="entry-list__esc">ESC</span>
        </header>
        {sorted.length === 0 ? (
          <p className="entry-list__empty">No entries yet.</p>
        ) : (
          <ul>
            {sorted.map((entry) => (
              <li key={entry.id}>
                <button type="button" onClick={() => onSelect(entry)}>
                  <span className="entry-list__title">{heading(entry)}</span>
                  <span className="entry-list__date">
                    {formatDay(entry.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
