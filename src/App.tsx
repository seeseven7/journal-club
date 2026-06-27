import { useCallback, useEffect, useRef, useState } from 'react'
import { EquipMenu, type EquipItem } from './components/EquipMenu'
import { EntryList } from './components/EntryList'
import { useEquipMenu } from './hooks/useEquipMenu'
import { useSound } from './hooks/useSound'
import {
  createId,
  formatDay,
  loadEntries,
  saveEntries,
  type Entry,
} from './storage'
import './App.css'

/* Turn a line that starts with "- " into a "• " bullet as you type. Same length
   so the caret doesn't shift. also a mid-word hyphen ("well-being") is left alone */
function applyBullets(s: string): string {
  return s.replace(/^(\s*)-\s/gm, '$1• ')
}

const ITEMS: EquipItem[] = [
  { id: 'new', glyph: '✎', label: 'New Page', hint: 'Start a fresh entry' },
  { id: 'past', glyph: '❏', label: 'Past Entries', hint: 'Browse what you wrote' },
  { id: 'save', glyph: '✓', label: 'Save', hint: 'Store the current page' },
  { id: 'settings', glyph: '⚙', label: 'Settings', hint: 'Tune the terminal' },
]

function App() {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries())
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [listOpen, setListOpen] = useState(false)
  const [saved, setSaved] = useState(true) // false while edits are pending a write

  const { move, select } = useSound()

  // Refs mirror the latest values so the stable callbacks below don't need to
  // be rebuilt on every keystroke (which would re-bind the global listeners)
  const entriesRef = useRef(entries)
  const currentIdRef = useRef(currentId)
  const titleRef = useRef(title)
  const textRef = useRef(text)
  useEffect(() => void (entriesRef.current = entries), [entries])
  useEffect(() => void (currentIdRef.current = currentId), [currentId])
  useEffect(() => void (titleRef.current = title), [title])
  useEffect(() => void (textRef.current = text), [text])

  /* Write the current page (title + body) into storage, creating the entry on
     first save. No op for a blank page. Returns the saved id, or null */
  const commitCurrent = useCallback(() => {
    const body = textRef.current
    const ttl = titleRef.current
    if (body.trim() === '' && ttl.trim() === '') return null
    const now = Date.now()
    const id = currentIdRef.current
    const existing = id
      ? entriesRef.current.find((e) => e.id === id)
      : undefined

    let next: Entry[]
    let savedId: string
    if (existing) {
      savedId = existing.id
      next = entriesRef.current.map((e) =>
        e.id === savedId ? { ...e, title: ttl, body, updatedAt: now } : e,
      )
    } else {
      savedId = createId()
      next = [
        ...entriesRef.current,
        { id: savedId, title: ttl, body, createdAt: now, updatedAt: now },
      ]
    }

    entriesRef.current = next
    currentIdRef.current = savedId
    setEntries(next)
    setCurrentId(savedId)
    saveEntries(next)
    return savedId
  }, [])

  // Autosave: a short debounce after the title or body changes, so every
  // keystroke is eventually persisted without thrashing localStorage. We read
  // the id from the ref so committing (which sets currentId) doesn't re-trigger
  useEffect(() => {
    if (text.trim() === '' && title.trim() === '' && currentIdRef.current == null)
      return
    setSaved(false)
    const t = setTimeout(() => {
      commitCurrent()
      setSaved(true)
    }, 400)
    return () => clearTimeout(t)
  }, [title, text, commitCurrent])

  const handleActivate = useCallback(
    (index: number) => {
      const item = ITEMS[index]
      setStatus(item.label.toUpperCase())
      select()

      switch (item.id) {
        case 'new':
          commitCurrent() // don't lose the page you were on
          setTitle('')
          setText('')
          setCurrentId(null)
          currentIdRef.current = null
          setSaved(true)
          break
        case 'save':
          commitCurrent() // explicit checkpoint; autosave already covers safety
          setSaved(true)
          break
        case 'past':
          setListOpen(true)
          break
        default:
          break // settings prob color but still thinking about it
      }
    },
    [commitCurrent, select],
  )

  const openEntry = useCallback(
    (entry: Entry) => {
      commitCurrent()
      setTitle(entry.title ?? '')
      setText(entry.body)
      setCurrentId(entry.id)
      currentIdRef.current = entry.id
      setListOpen(false)
      setSaved(true)
    },
    [commitCurrent],
  )

  const { open, selectedIndex } = useEquipMenu(ITEMS.length, handleActivate, move)

  // Reset the status readout and bleep when the menu reopens
  useEffect(() => {
    if (open) {
      setStatus(null)
      move()
    }
  }, [open, move])

  const currentEntry = entries.find((e) => e.id === currentId)
  const dateLabel = formatDay(currentEntry?.createdAt ?? Date.now())

  return (
    <div className={`screen${open ? ' screen--dimmed' : ''}`}>
      <div className="page">
        <header className="page__head">
          <input
            className="page__title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            spellCheck={false}
          />
          <div className="page__date">{dateLabel}</div>
        </header>

        <textarea
          className="page__body"
          value={text}
          onChange={(e) => {
            const el = e.target
            const caret = el.selectionStart
            const next = applyBullets(el.value)
            setText(next)
            if (next !== el.value) {
              // same length, so restoring the old caret index keeps it in place
              requestAnimationFrame(() => el.setSelectionRange(caret, caret))
            }
          }}
          placeholder="..."
          spellCheck={false}
          autoFocus
        />
      </div>

      <EquipMenu items={ITEMS} open={open} selectedIndex={selectedIndex} />

      {listOpen && (
        <EntryList
          entries={entries}
          onSelect={openEntry}
          onClose={() => setListOpen(false)}
        />
      )}

      <div className="hud">
        <span className="hud__save">{saved ? '✓ SAVED' : '● SAVING'}</span>
        <span>
          HOLD <kbd>⌥</kbd>
        </span>
        {status && <span className="hud__status">▌ {status}</span>}
      </div>
    </div>
  )
}

export default App
