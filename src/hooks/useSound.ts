import { useCallback, useRef } from 'react'

/**
 * Tiny synthesized blips via the Web Audio API — no asset files.
 * The AudioContext is created lazily on first use (a key press counts as the
 * user gesture browsers require) and resumed if the tab suspended it.
 */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const context = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const blip = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'square') => {
      const ac = context()
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, ac.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.06, ac.currentTime + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
      osc.connect(gain).connect(ac.destination)
      osc.start()
      osc.stop(ac.currentTime + duration)
    },
    [context],
  )

  const move = useCallback(() => blip(420, 0.06), [blip])
  const select = useCallback(() => blip(660, 0.12), [blip])

  return { move, select }
}
