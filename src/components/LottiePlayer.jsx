import { useEffect, useRef, useState } from "react"

// Plays a Lottie JSON animation exactly as authored: real vector playback via
// lottie-web (not a CSS/SVG re-creation), on its own internal clock — never
// driven by scroll progress. Both the player library and the animation data
// load lazily via dynamic import so the ~270KB JSON and the lottie-web
// runtime stay out of the site's main bundle until this section is reached.
function LottiePlayer({ loadAnimationData, reduceMotion, className = "" }) {
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.15,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function mount() {
      const [{ default: lottie }, animationData] = await Promise.all([
        import("lottie-web/build/player/lottie_light"),
        loadAnimationData(),
      ])
      if (cancelled || !containerRef.current) return

      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData,
      })
      setReady(true)
    }

    mount()
    return () => {
      cancelled = true
      animRef.current?.destroy()
      animRef.current = null
    }
    // loadAnimationData is a stable loader passed once by the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-runs once loading finishes (ready flips true) so a section that was
  // already in view before the lazy-loaded player arrived still starts.
  useEffect(() => {
    const instance = animRef.current
    if (!instance) return
    if (reduceMotion) {
      instance.goToAndStop(0, true)
    } else if (inView) {
      instance.play()
    } else {
      instance.pause()
    }
  }, [inView, reduceMotion, ready])

  return <div ref={containerRef} className={className} aria-hidden="true" />
}

export default LottiePlayer
