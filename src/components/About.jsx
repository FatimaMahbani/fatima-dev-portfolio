import { useRef } from "react"
import { useEntranceProgress, clamp } from "../hooks/useScrollMotion.js"
import SectionHeading from "./SectionHeading.jsx"

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
      <path
        d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 14v1.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function About({ copy, slotRef }) {
  const sectionRef = useRef(null)
  const { progress, reduceMotion } = useEntranceProgress(sectionRef)
  const headerP = reduceMotion ? 1 : clamp(progress / 0.5, 0, 1)

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about__layout">
        <div className="about__copy">
          <p className="about__label">{copy.label}</p>
          <SectionHeading
            className="about__title"
            title={copy.title}
            progress={headerP}
            reduceMotion={reduceMotion}
            withEntrance
          />
          <p className="about__heading">{copy.heading}</p>
          <p className="about__body">{copy.body}</p>

          <div className="about__actions">
            <a href="#projects" className="about__cta about__cta--primary">
              {copy.ctaProjects}
            </a>
            <a href="#contact" className="about__cta about__cta--secondary">
              {copy.ctaContact}
            </a>
            <a
              href="/cv/Fatima-Abdullah-CV.pdf"
              download="Fatima-Abdullah-CV.pdf"
              className="about__cta about__cta--secondary"
            >
              <DownloadIcon />
              {copy.ctaDownload}
            </a>
          </div>
        </div>
        <div className="about__portrait">
          <div className="about__portrait-slot" ref={slotRef} />
        </div>
      </div>
    </section>
  )
}

export default About
