import { useEffect } from 'react'
import type { Entry } from '../storage'
import './EntryList.css'

type Props = {
  entries: Entry[]
  onSelect: (entry: Entry) => void
  onClose: () => void
}

function preview(body: string): string {
  const line = body.trim().split('\n')[0]
  return line ? line.slice(0, 64) : '(empty)'
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
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
                  <span className="entry-list__date">
                    {formatDate(entry.updatedAt)}
                  </span>
                  <span className="entry-list__preview">
                    {preview(entry.body)}
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
