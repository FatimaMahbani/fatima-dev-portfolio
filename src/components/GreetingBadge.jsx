import { useEffect, useState } from "react"

const HI_HOLD_MS = 1800
const HAND_HOLD_MS = 2200
const TRANSITION_MS = 300

function WaveHandIcon() {
  return (
    <svg
      className="greeting-badge__hand"
      viewBox="0 0 24 24"
      width="40"
      height="40"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M7.5 11.2V5.6a1.2 1.2 0 0 1 2.4 0v4.4h.3V3.7a1.2 1.2 0 1 1 2.4 0v6.3h.3V4.5a1.2 1.2 0 1 1 2.4 0v5.5h.3V6.2a1.2 1.2 0 1 1 2.4 0v7.7c0 3.2-2.2 5.7-5.3 5.7H12c-2.9 0-5.3-2.1-5.9-4.9l-.9-4.1a1.6 1.6 0 0 1 2.3-1.7l.05.03Z"
      />
    </svg>
  )
}

function GreetingBadge() {
  const [mode, setMode] = useState("hi")
  const [phase, setPhase] = useState("enter")
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

  useEffect(() => {
    if (reduceMotion) {
      setMode("hi")
      setPhase("enter")
      return undefined
    }

    const timers = []

    function clearTimers() {
      timers.forEach((id) => window.clearTimeout(id))
      timers.length = 0
    }

    function schedule(fn, delay) {
      timers.push(window.setTimeout(fn, delay))
    }

    function runCycle() {
      setMode("hi")
      setPhase("enter")

      schedule(() => {
        setPhase("exit")

        schedule(() => {
          setMode("wave")
          setPhase("enter")

          schedule(() => {
            setPhase("exit")

            schedule(() => {
              runCycle()
            }, TRANSITION_MS)
          }, HAND_HOLD_MS)
        }, TRANSITION_MS)
      }, HI_HOLD_MS)
    }

    runCycle()

    return clearTimers
  }, [reduceMotion])

  const contentClass = [
    "greeting-badge__content",
    phase === "enter" ? "is-enter" : "is-exit",
    mode === "wave" ? "is-wave" : "is-hi",
  ].join(" ")

  return (
    <div className="greeting-badge" aria-hidden="true">
      <span className={contentClass}>
        {mode === "hi" ? "أهلًا" : <WaveHandIcon />}
      </span>
    </div>
  )
}

export default GreetingBadge
