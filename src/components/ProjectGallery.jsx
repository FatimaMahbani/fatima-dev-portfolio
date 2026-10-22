function ChevronIcon({ flipped }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
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

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M7 3H4a1 1 0 0 0-1 1v3M13 3h3a1 1 0 0 1 1 1v3M7 17H4a1 1 0 0 1-1-1v-3M13 17h3a1 1 0 0 0 1-1v-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Interactive screenshot carousel shown inside the project modal's monitor
// mockup. Every image stays mounted and only toggles opacity, so switching
// slides never causes a layout shift or a load-flicker on repeat views.
// Fully controlled (index + navigation live in ProjectModal) so the same
// selection can be handed off to the Lightbox and handed back unchanged.
function ProjectGallery({ images, projectName, copy, activeIndex, onNavigate, onOpenLightbox }) {
  const total = images.length

  return (
    <div className="project-gallery">
      <div className="project-gallery__frame">
        {images.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt || projectName}
            className={`project-gallery__image${index === activeIndex ? " is-active" : ""}`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            onClick={index === activeIndex ? onOpenLightbox : undefined}
          />
        ))}

        <span className="project-gallery__expand-hint" aria-hidden="true">
          <ExpandIcon />
        </span>

        {total > 1 ? (
          <>
            <button
              type="button"
              className="project-gallery__arrow project-gallery__arrow--prev"
              onClick={() => onNavigate(activeIndex - 1)}
              aria-label={copy.galleryPrevAria}
            >
              <ChevronIcon flipped />
            </button>
            <button
              type="button"
              className="project-gallery__arrow project-gallery__arrow--next"
              onClick={() => onNavigate(activeIndex + 1)}
              aria-label={copy.galleryNextAria}
            >
              <ChevronIcon />
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="project-gallery__dots" role="tablist" aria-label={projectName}>
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`${copy.galleryIndicatorAria} ${index + 1}`}
              className={`project-gallery__dot${index === activeIndex ? " is-active" : ""}`}
              onClick={() => onNavigate(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ProjectGallery
