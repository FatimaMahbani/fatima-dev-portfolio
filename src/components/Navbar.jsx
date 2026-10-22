import { useState } from "react"
import logo from "../assets/logo-en-ar.png"

function MenuIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <path
          d="M5 5l10 10M15 5L5 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M4 6h12M4 10h12M4 14h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LanguageSwitch({ locale, ariaLabel, onChange }) {
  return (
    <div className="navbar__lang" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        lang="ar"
        className={`navbar__lang-option${locale === "ar" ? " is-active" : ""}`}
        aria-label="العربية"
        aria-pressed={locale === "ar"}
        onClick={() => onChange("ar")}
      >
        AR
      </button>
      <button
        type="button"
        lang="en"
        className={`navbar__lang-option${locale === "en" ? " is-active" : ""}`}
        aria-label="English"
        aria-pressed={locale === "en"}
        onClick={() => onChange("en")}
      >
        EN
      </button>
    </div>
  )
}

function Navbar({ copy, compact, activeHref, locale, onLanguageChange }) {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className={`navbar${compact ? " is-compact" : ""}`}>
      <nav className="navbar__inner" aria-label={copy.ariaLabel}>
        <a href="#home" className="navbar__brand" onClick={closeMenu}>
          <img className="navbar__logo" src={logo} alt={copy.brandAria} />
        </a>

        <ul
          id="primary-navigation"
          className={`navbar__links${menuOpen ? " is-open" : ""}`}
        >
          {copy.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`navbar__link${link.href === activeHref ? " is-active" : ""}`}
                aria-current={link.href === activeHref ? "true" : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <LanguageSwitch
          locale={locale}
          ariaLabel={copy.languageGroupAria}
          onChange={onLanguageChange}
        />

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? copy.menuClose : copy.menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </nav>
    </header>
  )
}

export default Navbar
