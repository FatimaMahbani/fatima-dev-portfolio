import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import ComputerMockup from "./ComputerMockup.jsx"
import ProjectScreen from "./ProjectScreen.jsx"
import ProjectGallery from "./ProjectGallery.jsx"
import Lightbox from "./Lightbox.jsx"

function pad(n) {
  return String(n).padStart(2, "0")
}

// Splits `text` on the first occurrence of `link.text` and turns that one
// phrase into a link — the rest of the paragraph stays plain text. Used for
// crediting a collaborator inline without making the whole paragraph
// clickable or inventing a separate "team" section.
function renderWithLink(text, link) {
  if (!link) return text
  const index = text.indexOf(link.text)
  if (index === -1) return text

  const before = text.slice(0, index)
  const after = text.slice(index + link.text.length)

  return (
    <>
      {before}
      <a
        className="project-modal__inline-link"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.text}
      </a>
      {after}
    </>
  )
}

function MigrationArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MigrationBadge({ migration }) {
  return (
    <div className="project-modal__migration">
      <span className="project-modal__migration-tag project-modal__migration-tag--from">
        {migration.from}
      </span>
      <span className="project-modal__migration-arrow" aria-hidden="true">
        <MigrationArrowIcon />
      </span>
      <span className="project-modal__migration-tag project-modal__migration-tag--to">
        {migration.to}
      </span>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true">
      <path
        d="M4.5 10.5 8 14l7.5-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true">
      <path d="M10 3 16 10 10 17 4 10Z" fill="currentColor" />
    </svg>
  )
}

// Compact "what my involvement covers" pillars — a per-project opt-in
// (`focusAreas` in content.js) for projects whose scope went beyond app
// development (ops, automation, deployment). Not shown unless set.
function FocusAreas({ items }) {
  return (
    <div className="project-modal__focus-areas">
      {items.map((item) => (
        <div className="project-modal__focus-area" key={item.title}>
          <span className="project-modal__focus-area-icon" aria-hidden="true">
            <DiamondIcon />
          </span>
          <p className="project-modal__focus-area-title">{item.title}</p>
          <p className="project-modal__focus-area-description">{item.description}</p>
        </div>
      ))}
    </div>
  )
}

// Compact "why the migration is worth it" grid — a per-project opt-in
// (`migrationBenefits` in content.js), paired with `migration`/MigrationBadge.
// Two columns regardless of item count (3 or 4 both read fine), unlike
// FocusAreas' fixed three, since benefit lists vary in length.
function MigrationBenefits({ items }) {
  return (
    <div className="project-modal__benefits">
      {items.map((item) => (
        <div className="project-modal__benefit" key={item.title}>
          <span className="project-modal__benefit-icon" aria-hidden="true">
            <DiamondIcon />
          </span>
          <p className="project-modal__benefit-title">{item.title}</p>
          <p className="project-modal__benefit-description">{item.description}</p>
        </div>
      ))}
    </div>
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

function ProjectModal({ project, total, copy, placeholderMark, onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [trackedProjectId, setTrackedProjectId] = useState(null)

  // Reset the selected screenshot (and close any open lightbox) the moment
  // a *different* project's modal opens — done during render, per React's
  // own guidance for "adjusting state when a prop changes", so it never
  // needs an extra effect-driven re-render.
  if (project && project.id !== trackedProjectId) {
    setTrackedProjectId(project.id)
    setActiveIndex(0)
    setLightboxOpen(false)
  }

  const screenshots = project?.screenshots ?? []
  const screenshotCount = screenshots.length

  const navigate = useCallback(
    (index) => {
      if (screenshotCount === 0) return
      setActiveIndex(((index % screenshotCount) + screenshotCount) % screenshotCount)
    },
    [screenshotCount],
  )

  useEffect(() => {
    // Guard inside the effect, not just the JSX return below: this
    // component stays mounted for Fael's whole lifetime (only `project`
    // toggles), so without this check the lock/listeners would engage on
    // every render even while closed.
    if (!project) return undefined

    const previouslyFocused = document.activeElement
    closeRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation()
        if (lightboxOpen) {
          setLightboxOpen(false)
        } else {
          onClose()
        }
        return
      }

      if (lightboxOpen && event.key === "ArrowLeft") {
        navigate(activeIndex - 1)
        return
      }
      if (lightboxOpen && event.key === "ArrowRight") {
        navigate(activeIndex + 1)
        return
      }

      if (event.key !== "Tab") return

      const focusables = dialogRef.current?.querySelectorAll(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [project, onClose, lightboxOpen, activeIndex, screenshotCount, navigate])

  if (!project) return null

  return (
    <>
      {createPortal(
        <div className="project-modal">
          <div className="project-modal__backdrop" onClick={onClose} aria-hidden="true" />
          <div
            className="project-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            ref={dialogRef}
          >
            <button
              type="button"
              className="project-modal__close"
              onClick={onClose}
              ref={closeRef}
              aria-label={copy.closeLabel}
            >
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="project-modal__visual">
              <ComputerMockup className="computer--modal">
                {screenshotCount > 0 ? (
                  <ProjectGallery
                    images={screenshots}
                    projectName={project.name}
                    copy={copy}
                    activeIndex={activeIndex}
                    onNavigate={navigate}
                    onOpenLightbox={() => setLightboxOpen(true)}
                  />
                ) : (
                  <ProjectScreen project={project} mark={placeholderMark} />
                )}
              </ComputerMockup>
            </div>

            <div className="project-modal__body">
              <p className="project-modal__index" aria-hidden="true">
                {project.number} / {pad(total)}
              </p>
              <h3 id="project-modal-title" className="project-modal__title">
                {project.name}
              </h3>

              {project.tagline || project.overview ? (
                <div className="project-modal__story">
                  {project.tagline ? (
                    <p className="project-modal__tagline">{project.tagline}</p>
                  ) : null}
                  {project.overview ? (
                    <p className="project-modal__story-text">{project.overview}</p>
                  ) : null}

                  {project.badge ? <p className="project-modal__badge">{project.badge}</p> : null}

                  {project.migration ? <MigrationBadge migration={project.migration} /> : null}

                  {project.migrationBenefits?.length ? (
                    <MigrationBenefits items={project.migrationBenefits} />
                  ) : null}

                  {project.contribution ? (
                    <p className="project-modal__story-text">
                      {renderWithLink(project.contribution, project.contributionLink)}
                    </p>
                  ) : null}

                  {project.recentWork ? (
                    <p className="project-modal__story-text">{project.recentWork}</p>
                  ) : null}

                  {project.focusAreas?.length ? (
                    <FocusAreas items={project.focusAreas} />
                  ) : null}

                  {project.achievements?.length ? (
                    <div className="project-modal__achievements">
                      {project.achievements.map((item) => (
                        <div className="project-modal__achievement" key={item.label}>
                          <span className="project-modal__achievement-value">{item.value}</span>
                          <span className="project-modal__achievement-label">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {project.capabilities?.length ? (
                    <ul className="project-modal__capabilities">
                      {project.capabilities.map((item) => (
                        <li key={item}>
                          <CheckIcon />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <>
                  <p className="project-modal__label">{copy.overviewLabel}</p>
                  <p className="project-modal__overview">{project.category}</p>
                  {project.role ? <p className="project-modal__role">{project.role}</p> : null}
                </>
              )}

              <p className="project-modal__label">{copy.techLabel}</p>
              <ul className="project-modal__tech">
                {project.tech.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>

              {project.url ? (
                <a
                  className="project-modal__visit"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon />
                  {copy.visitLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {lightboxOpen && screenshotCount > 0 ? (
        <Lightbox
          images={screenshots}
          activeIndex={activeIndex}
          onNavigate={navigate}
          onClose={() => setLightboxOpen(false)}
          projectName={project.name}
          copy={copy}
        />
      ) : null}
    </>
  )
}

export default ProjectModal
