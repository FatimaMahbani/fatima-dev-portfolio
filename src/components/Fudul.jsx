import { useRef } from "react"
import { useEntranceProgress, clamp } from "../hooks/useScrollMotion.js"
import { techLogos } from "../data/techLogos.js"
import SectionHeading from "./SectionHeading.jsx"

function staggerIn(progress, index, count, spread = 0.7) {
  const start = (index / count) * spread
  return clamp((progress - start) / (1 - spread), 0, 1)
}

function TechCard({ item, reveal, canHover }) {
  const cardRef = useRef(null)

  function handleMove(event) {
    if (!canHover) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    const rotateY = (px - 0.5) * 16
    const rotateX = (0.5 - py) * 16
    el.style.setProperty("--glow-x", `${px * 100}%`)
    el.style.setProperty("--glow-y", `${py * 100}%`)
    el.style.setProperty("--glow-opacity", "1")
    el.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.04)`
  }

  function handleLeave() {
    const el = cardRef.current
    if (!el) return
    el.style.transform = ""
    el.style.setProperty("--glow-opacity", "0")
  }

  return (
    <div
      className="fudul__card-wrap"
      style={{
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 20}px)`,
      }}
    >
      <div
        ref={cardRef}
        className="fudul__card"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <span
          className="fudul__card-logo"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: techLogos[item.slug] ?? "" }}
        />
        <span className="fudul__card-name">{item.name}</span>
      </div>
    </div>
  )
}

function Fudul({ copy }) {
  const sectionRef = useRef(null)
  const { progress, reduceMotion } = useEntranceProgress(sectionRef)
  // Categories in content.js stay organized for maintainability, but the
  // gallery itself shows every technology together in one continuous grid.
  const items = copy.categories.flatMap((category) => category.items)

  const canHover =
    !reduceMotion &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches

  const headerP = reduceMotion ? 1 : clamp(progress / 0.5, 0, 1)
  const faP = reduceMotion ? 1 : progress
  const totalCards = items.length

  return (
    <section className="fudul" id="skills" ref={sectionRef}>
      <span
        className="fudul__fa"
        aria-hidden="true"
        style={{
          opacity: 0.05 * faP,
          transform: `translateY(${(1 - faP) * 40}px) rotate(${-6 + faP * -3}deg) scale(${0.92 + faP * 0.08})`,
        }}
      >
        ف
      </span>

      <div className="fudul__inner">
        <header
          className="fudul__header"
          style={{
            opacity: headerP,
            transform: `translateY(${(1 - headerP) * 22}px)`,
          }}
        >
          <p className="fudul__kicker">{copy.kicker}</p>
          <SectionHeading
            className="fudul__title"
            title={copy.title}
            progress={headerP}
            reduceMotion={reduceMotion}
          />
          <p className="fudul__subtitle">{copy.subtitle}</p>
        </header>

        <div className="fudul__cards">
          {items.map((item, index) => {
            const reveal = reduceMotion ? 1 : staggerIn(progress, index, totalCards)
            return (
              <TechCard
                key={item.slug}
                item={item}
                reveal={reveal}
                canHover={canHover}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Fudul
