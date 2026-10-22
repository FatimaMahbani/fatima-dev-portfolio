import { useRef } from "react"
import { useEntranceProgress, clamp } from "../hooks/useScrollMotion.js"
import LottiePlayer from "./LottiePlayer.jsx"

function loadDeveloperIllustration() {
  return import("../assets/lottie/web-developer-illustration.json").then((mod) => mod.default)
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m4 7.5 8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 7a1.96 1.96 0 1 0 0-3.92A1.96 1.96 0 0 0 5.25 7ZM20.44 20h-3.37v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.16 1.46-2.16 2.96V20H9.68V8.5h3.24v1.57h.05c.45-.86 1.56-1.77 3.21-1.77 3.43 0 4.26 2.26 4.26 5.19V20Z"
      />
    </svg>
  )
}

function windowProgress(progress, start, end) {
  return clamp((progress - start) / (end - start), 0, 1)
}

function Word({ text, p }) {
  return (
    <span className="forsa__word">
      <span
        className="forsa__word-inner"
        style={{
          transform: `translateY(${(1 - p) * 100}%)`,
          opacity: p,
        }}
      >
        {text}
      </span>
    </span>
  )
}

function Forsa({ copy }) {
  const sectionRef = useRef(null)
  const { progress, reduceMotion } = useEntranceProgress(sectionRef, {
    startVH: 0.95,
    endVH: 0.3,
  })

  const words = copy.heading.split(" ")
  const p = reduceMotion ? () => 1 : (start, end) => windowProgress(progress, start, end)

  const kickerP = p(0, 0.22)
  const bodyP = p(0.55, 0.82)
  const actionsP = p(0.68, 0.95)
  const footerP = p(0.88, 1)
  const illustrationP = p(0.25, 0.65)

  return (
    <section className="forsa" id="contact" ref={sectionRef}>
      <div className="forsa__inner">
        <div className="forsa__content">
          <p
            className="forsa__kicker"
            style={{ opacity: kickerP, transform: `translateY(${(1 - kickerP) * 14}px)` }}
          >
            {copy.kicker}
          </p>

          <h2 className="forsa__heading">
            {words.map((word, index) => {
              const span = 0.55 / words.length
              const start = 0.14 + index * span
              const wp = reduceMotion ? 1 : windowProgress(progress, start, start + span * 1.6)
              return <Word key={`${word}-${index}`} text={word} p={wp} />
            })}
          </h2>

          <p
            className="forsa__body"
            style={{ opacity: bodyP, transform: `translateY(${(1 - bodyP) * 16}px)` }}
          >
            {copy.body}
          </p>

          <div
            className="forsa__actions"
            style={{ opacity: actionsP, transform: `translateY(${(1 - actionsP) * 16}px)` }}
          >
            <a className="forsa__email" href={`mailto:${copy.email}`}>
              <span className="forsa__email-icon" aria-hidden="true">
                <MailIcon />
              </span>
              <span className="forsa__email-text">{copy.email}</span>
            </a>

            <a
              className="forsa__linkedin"
              href={copy.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              <LinkedInIcon />
              <span>{copy.linkedinLabel}</span>
            </a>
          </div>

          <p className="forsa__footer" style={{ opacity: footerP }}>
            {copy.footerNote}
          </p>
        </div>

        <div
          className="forsa__illustration"
          style={{
            opacity: illustrationP,
            transform: `translateY(${(1 - illustrationP) * 22}px)`,
          }}
        >
          <LottiePlayer
            className="forsa__illustration-lottie"
            loadAnimationData={loadDeveloperIllustration}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
    </section>
  )
}

export default Forsa
