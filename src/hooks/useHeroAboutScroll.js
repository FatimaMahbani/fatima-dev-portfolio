import { useEffect, useLayoutEffect, useState } from "react"

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const FINAL_ROTATE_Z = -7
const FINAL_ROTATE_Y = -3
const FINAL_SHADOW = "0 20px 50px rgba(24, 24, 31, 0.1)"

export function useHeroAboutScroll(heroSlotRef, aboutSlotRef) {
  const [progress, setProgress] = useState(0)
  const [portraitStyle, setPortraitStyle] = useState(null)
  const [crossfade, setCrossfade] = useState(0)
  const [badgeStyle, setBadgeStyle] = useState({
    opacity: 1,
    transform: "scale(1)",
  })
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")

    function syncMotion() {
      setReduceMotion(media.matches)
    }

    syncMotion()
    media.addEventListener("change", syncMotion)
    return () => media.removeEventListener("change", syncMotion)
  }, [])

  useLayoutEffect(() => {
    let frame = 0

    function measureProgress() {
      const about = aboutSlotRef.current
      if (!about) return 0

      const aboutTop = about.getBoundingClientRect().top + window.scrollY
      const start = 0
      const end = Math.max(aboutTop - window.innerHeight * 0.35, window.innerHeight * 0.45)
      return clamp((window.scrollY - start) / (end - start), 0, 1)
    }

    function update() {
      const heroSlot = heroSlotRef.current
      const aboutSlot = aboutSlotRef.current
      if (!heroSlot || !aboutSlot) return

      const raw = measureProgress()
      const t = reduceMotion ? (raw >= 0.55 ? 1 : 0) : easeInOutCubic(raw)

      const from = heroSlot.getBoundingClientRect()
      const to = aboutSlot.getBoundingClientRect()

      const left = lerp(from.left, to.left, t)
      const top = lerp(from.top, to.top, t)
      const width = lerp(from.width, to.width, t)
      const height = lerp(from.height, to.height, t)

      const mid = Math.sin(t * Math.PI)
      const settled = t >= 0.999

      const rotateY = settled
        ? FINAL_ROTATE_Y
        : reduceMotion
          ? lerp(0, FINAL_ROTATE_Y, t)
          : lerp(0, FINAL_ROTATE_Y, t) + mid * 18

      const rotateZ = settled
        ? FINAL_ROTATE_Z
        : reduceMotion
          ? lerp(0, FINAL_ROTATE_Z, t)
          : lerp(0, FINAL_ROTATE_Z, t) + mid * -10

      const scale = settled || reduceMotion ? 1 : lerp(1, 0.955, mid)
      const perspective = reduceMotion ? 1100 : lerp(1100, 760, mid)
      const lift = reduceMotion ? 0 : mid * 26

      setProgress(raw)
      setCrossfade(t)
      setPortraitStyle({
        left: "0px",
        top: "0px",
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${left}px, ${top - lift}px, 0) perspective(${perspective}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        opacity: 1,
        boxShadow: settled
          ? FINAL_SHADOW
          : `0 ${20 + mid * 36}px ${40 + mid * 70}px rgba(24, 24, 31, ${0.08 + mid * 0.1})`,
        filter: reduceMotion ? "none" : `saturate(${1 + mid * 0.12}) brightness(${1 + mid * 0.03})`,
      })

      const badgeFade = reduceMotion
        ? raw < 0.2
          ? 1
          : 0
        : clamp(1 - raw / 0.22, 0, 1)
      const badgeScale = lerp(0.86, 1, badgeFade)

      setBadgeStyle({
        opacity: badgeFade,
        transform: `scale(${badgeScale})`,
        pointerEvents: badgeFade < 0.05 ? "none" : "none",
        visibility: badgeFade < 0.01 ? "hidden" : "visible",
      })
    }

    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [heroSlotRef, aboutSlotRef, reduceMotion])

  return {
    progress,
    portraitStyle,
    crossfade,
    badgeStyle,
    reduceMotion,
    navCompact: progress > 0.42,
  }
}
