import { useEffect, useState } from "react"

export function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")

    function sync() {
      setReduceMotion(media.matches)
    }

    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return reduceMotion
}
