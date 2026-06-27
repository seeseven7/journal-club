import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * MGS equip-menu interaction:
 *   - Hold the trigger key   -> menu opens
 *   - Press a direction key  -> selection steps one slot (wraps)
 *   - Release the trigger    -> the highlighted item is activated
 *   - Release without moving -> menu closes, no action (a stray tap is harmless)
 *   - Window loses focus     -> menu closes without activating
 *
 * Selection is remembered between openings.
 *
 * The trigger is the RIGHT Option key, identified by e.code ('AltRight') so the
 * left Option stays free for normal shortcuts. We don't preventDefault it:
 * Option alone does nothing in the browser, and leaving it through means
 * Option+key accents still type normally (and the "must move to activate" guard
 * keeps that from firing a menu action).
 */
const TRIGGER_CODE = 'AltRight'
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
  const movedRef = useRef(false) // did the selection step while the menu was open?

  const setIndex = useCallback((next: number) => {
    indexRef.current = next
    setSelectedIndex(next)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === TRIGGER_CODE) {
        if (e.repeat) return
        openRef.current = true
        movedRef.current = false
        setOpen(true)
        return
      }

      if (!openRef.current) return

      if (PREV_KEYS.includes(e.key)) {
        e.preventDefault()
        if (e.repeat) return
        setIndex((indexRef.current - 1 + itemCount) % itemCount)
        movedRef.current = true
        onMove?.()
      } else if (NEXT_KEYS.includes(e.key)) {
        e.preventDefault()
        if (e.repeat) return
        setIndex((indexRef.current + 1) % itemCount)
        movedRef.current = true
        onMove?.()
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code !== TRIGGER_CODE || !openRef.current) return
      openRef.current = false
      setOpen(false)
      if (movedRef.current) onActivate(indexRef.current) // commit only on a real choice
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
