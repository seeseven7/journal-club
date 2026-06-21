import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * MGS1 equip-menu interaction model:
 *   - Hold the trigger key  -> menu opens.
 *   - Press a direction key  -> selection steps one slot (wraps around).
 *   - Release the trigger    -> the highlighted item is activated.
 *   - Window loses focus     -> menu closes without activating.
 *
 * Selection is remembered between openings, like the real game.
 */
const TRIGGER_KEY = 'Tab'
const PREV_KEYS = ['ArrowUp', 'ArrowLeft']
const NEXT_KEYS = ['ArrowDown', 'ArrowRight']

export function useEquipMenu(
  itemCount: number,
  onActivate: (index: number) => void,
  onMove?: () => void,
) {
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Refs mirror state so the keyup handler always reads the latest values.
  const openRef = useRef(false)
  const indexRef = useRef(0)

  const setIndex = useCallback((next: number) => {
    indexRef.current = next
    setSelectedIndex(next)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === TRIGGER_KEY) {
        e.preventDefault() // stop Tab from moving browser focus
        if (e.repeat) return
        openRef.current = true
        setOpen(true)
        return
      }

      if (!openRef.current) return

      if (PREV_KEYS.includes(e.key)) {
        e.preventDefault()
        if (e.repeat) return
        setIndex((indexRef.current - 1 + itemCount) % itemCount)
        onMove?.()
      } else if (NEXT_KEYS.includes(e.key)) {
        e.preventDefault()
        if (e.repeat) return
        setIndex((indexRef.current + 1) % itemCount)
        onMove?.()
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key !== TRIGGER_KEY || !openRef.current) return
      openRef.current = false
      setOpen(false)
      onActivate(indexRef.current)
    }

    function handleBlur() {
      openRef.current = false
      setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [itemCount, onActivate, onMove, setIndex])

  return { open, selectedIndex }
}
