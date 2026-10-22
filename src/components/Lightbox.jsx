import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

function ChevronIcon({ flipped }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <path
        d={flipped ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Full-screen screenshot viewer layered above the project modal (see
// ProjectModal.jsx, which owns `activeIndex` and routes Escape/←/→ to this
// component — keeping a single keyboard listener avoids two document-level
// handlers racing over the same Escape key). Swiping is handled locally
// since it only concerns this component's own stage.
function Lightbox({ images, activeIndex, onNavigate, onClose, projectName, copy }) {
  const total = images.length
  const image = images[activeIndex]
  const touchStartX = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - event.changedTouches[0].clientX
    if (delta > 40) onNavigate(activeIndex + 1)
    else if (delta < -40) onNavigate(activeIndex - 1)
    touchStartX.current = null
  }

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={projectName}>
      <div className="lightbox__backdrop" onClick={onClose} aria-hidden="true" />

      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        aria-label={copy.closeLabel}
      >
        <CloseIcon />
      </button>

      <div
        className="lightbox__stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img key={image.src} src={image.src} alt={image.alt || projectName} className="lightbox__image" />

        {total > 1 ? (
          <>
            <button
              type="button"
              className="lightbox__arrow lightbox__arrow--prev"
              onClick={() => onNavigate(activeIndex - 1)}
              aria-label={copy.galleryPrevAria}
            >
              <ChevronIcon flipped />
            </button>
            <button
              type="button"
              className="lightbox__arrow lightbox__arrow--next"
              onClick={() => onNavigate(activeIndex + 1)}
              aria-label={copy.galleryNextAria}
            >
              <ChevronIcon />
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <p className="lightbox__counter" aria-live="polite">
          {activeIndex + 1} / {total}
        </p>
      ) : null}
    </div>,
    document.body,
  )
}

export default Lightbox
