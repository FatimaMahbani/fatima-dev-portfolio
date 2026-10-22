import { useRef } from "react"
import { useEntranceProgress, clamp } from "../hooks/useScrollMotion.js"
import SectionHeading from "./SectionHeading.jsx"

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
        </div>
        <div className="about__portrait">
          <div className="about__portrait-slot" ref={slotRef} />
        </div>
      </div>
    </section>
  )
}

export default About
