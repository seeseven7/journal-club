import { useCallback, useEffect, useRef, useState } from 'react'
import { EquipMenu, type EquipItem } from './components/EquipMenu'
import { EntryList } from './components/EntryList'
import { useEquipMenu } from './hooks/useEquipMenu'
import { useSound } from './hooks/useSound'
import {
  createId,
  loadEntries,
  saveEntries,
  type Entry,
} from './storage'
import './App.css'

const ITEMS: EquipItem[] = [
  { id: 'new', glyph: '✎', label: 'New Page', hint: 'Start a fresh entry' },
  { id: 'past', glyph: '❏', label: 'Past Entries', hint: 'Browse what you wrote' },
  { id: 'save', glyph: '✓', label: 'Save', hint: 'Store the current page' },
  { id: 'settings', glyph: '⚙', label: 'Settings', hint: 'Tune the terminal' },
]

function App() {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries())
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [listOpen, setListOpen] = useState(false)

  const { move, select } = useSound()

  // Refs mirror the latest values so the stable callbacks below don't need to
  // be rebuilt on every keystroke (which would re-bind the global listeners).
  const entriesRef = useRef(entries)
  const currentIdRef = useRef(currentId)
  const textRef = useRef(text)
  useEffect(() => void (entriesRef.current = entries), [entries])
  useEffect(() => void (currentIdRef.current = currentId), [currentId])
  useEffect(() => void (textRef.current = text), [text])

  /** Upsert the current page into storage. No-op for an empty page. */
  const commitCurrent = useCallback(() => {
    const body = textRef.current
    if (body.trim() === '') return
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
        e.id === savedId ? { ...e, body, updatedAt: now } : e,
      )
    } else {
      savedId = createId()
      next = [
        ...entriesRef.current,
        { id: savedId, body, createdAt: now, updatedAt: now },
      ]
    }

    entriesRef.current = next
    currentIdRef.current = savedId
    setEntries(next)
    setCurrentId(savedId)
    saveEntries(next)
  }, [])

  const handleActivate = useCallback(
    (index: number) => {
      const item = ITEMS[index]
      setStatus(item.label.toUpperCase())
      select()

      switch (item.id) {
        case 'new':
          commitCurrent() // don't lose the page you were on
          setText('')
          setCurrentId(null)
          currentIdRef.current = null
          break
        case 'save':
          commitCurrent()
          break
        case 'past':
          setListOpen(true)
          break
        default:
          break // settings: stubbed
      }
    },
    [commitCurrent, select],
  )

  const openEntry = useCallback(
    (entry: Entry) => {
      commitCurrent()
      setText(entry.body)
      setCurrentId(entry.id)
      currentIdRef.current = entry.id
      setListOpen(false)
    },
    [commitCurrent],
  )

  const { open, selectedIndex } = useEquipMenu(ITEMS.length, handleActivate, move)

  // Reset the status readout and chirp when the menu reopens.
  useEffect(() => {
    if (open) {
      setStatus(null)
      move()
    }
  }, [open, move])

  return (
    <div className={`screen${open ? ' screen--dimmed' : ''}`}>
      <textarea
        className="page"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="..."
        spellCheck={false}
        autoFocus
      />

      <EquipMenu items={ITEMS} open={open} selectedIndex={selectedIndex} />

      {listOpen && (
        <EntryList
          entries={entries}
          onSelect={openEntry}
          onClose={() => setListOpen(false)}
        />
      )}

      <div className="hud">
        <span>
          HOLD <kbd>TAB</kbd>
        </span>
        {status && <span className="hud__status">▌ {status}</span>}
      </div>
    </div>
  )
}

export default App
