import { useCallback, useRef, useState } from "react"
import { useTrackProgress, useEntranceProgress, clamp } from "../hooks/useScrollMotion.js"
import ComputerMockup from "./ComputerMockup.jsx"
import ProjectScreen from "./ProjectScreen.jsx"
import ProjectModal from "./ProjectModal.jsx"
import SectionHeading from "./SectionHeading.jsx"

function pad(n) {
  return String(n).padStart(2, "0")
}

// Splits the outro headline on its `highlight` substring so that phrase
// alone can be styled in the lavender accent — the rest of the sentence
// stays plain text. Mirrors ProjectModal's renderWithLink technique.
function renderOutroHeadline(headline, highlight) {
  if (!highlight) return headline
  const index = headline.indexOf(highlight)
  if (index === -1) return headline

  const before = headline.slice(0, index)
  const after = headline.slice(index + highlight.length)

  return (
    <>
      {before}
      <span className="fael__outro-highlight">{highlight}</span>
      {after}
    </>
  )
}

function OutroFlow() {
  return (
    <span className="fael__outro-flow" aria-hidden="true">
      <span className="fael__outro-flow-line" />
      <span className="fael__outro-flow-dot" />
      <span className="fael__outro-flow-dot" />
      <span className="fael__outro-flow-dot" />
    </span>
  )
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
      <path
        d="M8 5H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3M12 4h4v4M15.5 4.5 9 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProjectCopy({ project, total, wipe, role, ctaLabel, visitLabel, onExplore }) {
  // The computer's screen is allowed to cross-dissolve/slide, but text
  // legibility can't survive two overlapping blocks — so the outgoing
  // copy fades out completely (wipe 0→0.5) before the incoming copy
  // starts fading in (0.5→1). At no point are both partially visible.
  const shown =
    role === "enter" ? clamp((wipe - 0.5) / 0.5, 0, 1) : clamp(1 - wipe / 0.5, 0, 1)

  return (
    <div
      className={`fael__copy-layer fael__copy-layer--${role}`}
      style={{
        opacity: shown,
        transform: `translateY(${role === "enter" ? (1 - shown) * 26 : -(1 - shown) * 20}px)`,
      }}
    >
      <p className="fael__index" aria-hidden="true">
        <span className="fael__index-current">{project.number}</span>
        <span className="fael__index-sep"> / </span>
        <span className="fael__index-total">{pad(total)}</span>
      </p>
      <h3 className="fael__name">{project.name}</h3>
      <p className="fael__category">{project.category}</p>
      {project.role ? <p className="fael__role">{project.role}</p> : null}
      <ul className="fael__tech">
        {project.tech.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
      <div className="fael__actions">
        <button
          type="button"
          className="fael__cta"
          onClick={() => onExplore(project)}
          tabIndex={shown > 0.5 ? 0 : -1}
        >
          {ctaLabel}
        </button>
        {project.url ? (
          <a
            className="fael__visit"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={shown > 0.5 ? 0 : -1}
          >
            <ExternalLinkIcon />
            {visitLabel}
          </a>
        ) : null}
      </div>
    </div>
  )
}

function ScreenLayer({ project, wipe, role }) {
  const entering = role === "enter"
  // Masked push-slide: the two screens never occupy the same pixels at
  // once (unlike a plain crossfade), so there's no double-exposure on
  // the computer's screen either — outgoing slides fully off one side
  // as incoming slides in from the other, clipped by the screen bezel.
  const x = entering ? (1 - wipe) * 100 : -wipe * 100

  return (
    <ProjectScreen
      project={project}
      className="project-screen--layer"
      style={{ transform: `translateX(${x}%)`, zIndex: entering ? 2 : 1 }}
    />
  )
}

function Fael({ copy }) {
  const sectionRef = useRef(null)
  const mobileHeaderRef = useRef(null)
  const { progress, reduceMotion } = useTrackProgress(sectionRef)
  const { progress: mobileHeaderProgress } = useEntranceProgress(mobileHeaderRef, {
    startVH: 0.92,
    endVH: 0.6,
  })
  const [modalProjectId, setModalProjectId] = useState(null)
  // Stable reference: Fael re-renders every scroll frame, so an inline
  // arrow here would tear down ProjectModal's effect (body-scroll lock,
  // keydown listener) on every tick instead of only on open/close.
  const closeModal = useCallback(() => setModalProjectId(null), [])

  const projects = copy.projects
  const total = projects.length
  // Looked up by id (not stored as an object reference) so the modal keeps
  // showing the current locale's copy if the language changes while it's open.
  const modalProject = modalProjectId
    ? projects.find((item) => item.id === modalProjectId) ?? null
    : null
  const openModal = useCallback((item) => setModalProjectId(item.id), [])

  // Showcase timeline: a generous ~127vh slot per project (see fael.css's
  // track height), each slot holding its project fully still for the
  // first 92%, then crossfading to the next over the final 8%. That
  // transition window does double duty — reading from THIS project's own
  // slot it's an "exit"; read from the next slot's opening instant it's
  // that project's "entrance" — so the perceived lifecycle per project
  // works out to roughly 7.5% entrance / 85% hold / 7.5% exit, with zero
  // discontinuity at slot boundaries (it's one continuous value).
  const DWELL = 0.92

  const reveal = clamp(progress / 0.04, 0, 1)
  const showcaseProgress = clamp((progress - 0.04) / 0.85, 0, 1)
  const showOutro = progress >= 0.89

  const rawIndex = showcaseProgress * total
  const activeIndex = showOutro ? total - 1 : Math.min(total - 1, Math.floor(rawIndex))
  const slotFraction = clamp(rawIndex - activeIndex, 0, 1)
  const hasNext = !showOutro && activeIndex < total - 1
  const wipe =
    reduceMotion || !hasNext ? 0 : clamp((slotFraction - DWELL) / (1 - DWELL), 0, 1)

  const project = projects[activeIndex]
  const nextProject = hasNext && wipe > 0.001 ? projects[activeIndex + 1] : null
  const lineFill = showOutro ? 1 : clamp((activeIndex + slotFraction) / total, 0, 1)

  return (
    <section className="fael" id="projects" ref={sectionRef}>
      <div className="fael__track">
        <div className="fael__sticky">
          <div
            className="fael__header"
            style={{
              opacity: reveal,
              transform: `translateY(${(1 - reveal) * 18}px)`,
            }}
          >
            <SectionHeading
              className="fael__title"
              title={copy.title}
              progress={reveal}
              reduceMotion={reduceMotion}
            />
            <p className="fael__subtitle">{copy.subtitle}</p>
          </div>

          <div
            className={`fael__stage${showOutro ? " is-outro" : ""}`}
            style={{ opacity: clamp((progress - 0.02) / 0.03, 0, 1) }}
          >
            <nav className="fael__nav" aria-label={copy.navAria}>
              <div className="fael__nav-line" aria-hidden="true">
                <span
                  className="fael__nav-fill"
                  style={{ height: `${lineFill * 100}%` }}
                />
              </div>
              <ol className="fael__nav-list">
                {projects.map((item, index) => (
                  <li
                    key={item.id}
                    className={[
                      "fael__nav-item",
                      index === activeIndex && !showOutro ? "is-active" : "",
                      index < activeIndex || showOutro ? "is-passed" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {item.number}
                  </li>
                ))}
              </ol>
            </nav>

            <div className={`fael__showcase${showOutro ? " is-hidden" : ""}`}>
              <div className="fael__copy">
                <ProjectCopy
                  project={project}
                  total={total}
                  wipe={wipe}
                  role="exit"
                  ctaLabel={copy.ctaLabel}
                  visitLabel={copy.modal.visitLabel}
                  onExplore={openModal}
                />
                {nextProject ? (
                  <ProjectCopy
                    project={nextProject}
                    total={total}
                    wipe={wipe}
                    role="enter"
                    ctaLabel={copy.ctaLabel}
                    visitLabel={copy.modal.visitLabel}
                    onExplore={openModal}
                  />
                ) : null}
              </div>

              <div className="fael__visual">
                <ComputerMockup>
                  <ScreenLayer project={project} wipe={wipe} role="exit" />
                  {nextProject ? (
                    <ScreenLayer project={nextProject} wipe={wipe} role="enter" />
                  ) : null}
                </ComputerMockup>
              </div>
            </div>

            <div
              className={`fael__outro${showOutro ? " is-visible" : ""}`}
              aria-hidden={!showOutro}
            >
              <p className="fael__outro-headline">
                {renderOutroHeadline(copy.outro.headline, copy.outro.highlight)}
              </p>
              <OutroFlow />
              <p className="fael__outro-caption">{copy.outro.caption}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fael__mobile">
        <div className="fael__mobile-header" ref={mobileHeaderRef}>
          <SectionHeading
            className="fael__title"
            title={copy.title}
            progress={mobileHeaderProgress}
            reduceMotion={reduceMotion}
            withEntrance
          />
          <p className="fael__subtitle">{copy.subtitle}</p>
        </div>
        <ol className="fael__mobile-list">
          {projects.map((item) => (
            <li key={item.id} className="fael__mobile-item">
              <ComputerMockup className="computer--mobile">
                <ProjectScreen project={item} />
              </ComputerMockup>
              <div className="fael__mobile-copy">
                <p className="fael__index">
                  <span className="fael__index-current">{item.number}</span>
                  <span className="fael__index-sep"> / </span>
                  <span className="fael__index-total">{pad(total)}</span>
                </p>
                <h3 className="fael__name">{item.name}</h3>
                <p className="fael__category">{item.category}</p>
                {item.role ? <p className="fael__role">{item.role}</p> : null}
                <ul className="fael__tech">
                  {item.tech.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
                <div className="fael__actions">
                  <button
                    type="button"
                    className="fael__cta"
                    onClick={() => openModal(item)}
                  >
                    {copy.ctaLabel}
                  </button>
                  {item.url ? (
                    <a
                      className="fael__visit"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkIcon />
                      {copy.modal.visitLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="fael__outro is-visible fael__outro--mobile">
          <p className="fael__outro-headline">
            {renderOutroHeadline(copy.outro.headline, copy.outro.highlight)}
          </p>
          <OutroFlow />
          <p className="fael__outro-caption">{copy.outro.caption}</p>
        </div>
      </div>

      <ProjectModal
        project={modalProject}
        total={total}
        copy={copy.modal}
        onClose={closeModal}
      />
    </section>
  )
}

export default Fael
