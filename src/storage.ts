export type Entry = {
  id: string
  body: string
  createdAt: number
  updatedAt: number
}

const KEY = 'journal-club.entries.v1'

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Entry[]) : []
  } catch {
    return []
  }
}

export function saveEntries(entries: Entry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    // storage full or unavailable — nothing useful to do here yet
  }
}

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
