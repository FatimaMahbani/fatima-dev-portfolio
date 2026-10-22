import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "./useReducedMotion.js"

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

function useRafListener(callback) {
  const frame = useRef(0)
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  })

  useEffect(() => {
    function tick() {
      saved.current()
    }

    function onScroll() {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(tick)
    }

    tick()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])
}

/**
 * Progress through a tall, sticky-pinned "track" section: 0 when its top
 * reaches the viewport top, 1 when its bottom does. Drives pinned
 * storytelling sequences (فهم, فعل).
 *
 * `reduceMotion` is still returned so a section can drop its decorative
 * flourishes (overshoot, tilt, blur), but progress itself stays tied to
 * scroll position either way — content should stay scroll-browsable, not
 * jump straight to its end state, when motion is reduced.
 */
export function useTrackProgress(sectionRef) {
  const [progress, setProgress] = useState(0)
  const reduceMotion = useReducedMotion()

  useRafListener(() => {
    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    const total = Math.max(section.offsetHeight - window.innerHeight, 1)
    const scrolled = clamp(-rect.top, 0, total)
    setProgress(clamp(scrolled / total, 0, 1))
  })

  return { progress, reduceMotion }
}

/**
 * Continuous, reversible "entrance" progress for a normal-flow section:
 * 0 while its top sits at `startVH` of the viewport height (just
 * appearing), 1 once it reaches `endVH` (settled). Unlike a one-shot
 * IntersectionObserver reveal, this tracks scroll position every frame in
 * both directions, so motion scrubs naturally on the way up too.
 */
export function useEntranceProgress(sectionRef, { startVH = 0.88, endVH = 0.42 } = {}) {
  const [progress, setProgress] = useState(0)
  const reduceMotion = useReducedMotion()

  useRafListener(() => {
    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    const start = window.innerHeight * startVH
    const end = window.innerHeight * endVH
    const next = clamp((start - rect.top) / (start - end), 0, 1)
    setProgress(next)
  })

  return { progress, reduceMotion }
}
