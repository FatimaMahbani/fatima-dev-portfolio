function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M10 15.5V4.5M4.5 9.5 10 4l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Footer({ copy }) {
  function handleBackToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__info">
          <span className="site-footer__copyright">{copy.copyright}</span>
          <span className="site-footer__sep" aria-hidden="true" />
          <span className="site-footer__role">{copy.jobTitle}</span>
          {copy.subtitle ? (
            <>
              <span className="site-footer__sep" aria-hidden="true" />
              <span className="site-footer__subtitle">{copy.subtitle}</span>
            </>
          ) : null}
        </div>

        <button
          type="button"
          className="site-footer__top"
          onClick={handleBackToTop}
          aria-label={copy.backToTopAria}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </footer>
  )
}

export default Footer
