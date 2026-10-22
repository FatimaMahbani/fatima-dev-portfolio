import { useRef, useState } from "react"
import Navbar from "./components/Navbar.jsx"
import ThemeSwitch from "./components/ThemeSwitch.jsx"
import Hero from "./components/Hero.jsx"
import About from "./components/About.jsx"
import Fahm from "./components/Fahm.jsx"
import Fael from "./components/Fael.jsx"
import Fudul from "./components/Fudul.jsx"
import Forsa from "./components/Forsa.jsx"
import Footer from "./components/Footer.jsx"
import SharedPortrait from "./components/SharedPortrait.jsx"
// To put real photos in the portrait card (see SharedPortrait.jsx), add
// two files under src/assets/ and uncomment:
// import portraitScene1 from "./assets/portrait-scene-1.jpg"
// import portraitScene2 from "./assets/portrait-scene-2.jpg"
import { content } from "./data/content.js"
import { DEFAULT_LOCALE, applyLocale, getStoredLocale, storeLocale } from "./i18n/locale.js"
import { applyTheme, DEFAULT_THEME } from "./theme/theme.js"
import { useHeroAboutScroll } from "./hooks/useHeroAboutScroll.js"
import { useActiveSection } from "./hooks/useActiveSection.js"

const SECTION_IDS = ["home", "about", "fahm", "projects", "skills", "contact"]

function App() {
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [locale, setLocale] = useState(() => getStoredLocale())
  const copy = content[locale] ?? content[DEFAULT_LOCALE]
  const heroSlotRef = useRef(null)
  const aboutSlotRef = useRef(null)
  const { portraitStyle, crossfade, badgeStyle, navCompact } = useHeroAboutScroll(
    heroSlotRef,
    aboutSlotRef,
  )
  const activeId = useActiveSection(SECTION_IDS)

  function handleThemeToggle() {
    const next = theme === "light" ? "dark" : "light"
    applyTheme(next)
    setTheme(next)
  }

  function handleLanguageChange(next) {
    if (next === locale) return
    applyLocale(next)
    storeLocale(next)
    setLocale(next)
  }

  return (
    <>
      <Navbar
        copy={copy.nav}
        compact={navCompact}
        activeHref={`#${activeId}`}
        locale={locale}
        onLanguageChange={handleLanguageChange}
      />
      <ThemeSwitch theme={theme} onToggle={handleThemeToggle} />
      <SharedPortrait
        style={portraitStyle}
        alt={copy.hero.name}
        crossfade={crossfade}
        // sceneOneSrc={portraitScene1}
        // sceneTwoSrc={portraitScene2}
      />
      <Hero
        copy={copy.hero}
        portraitSlotRef={heroSlotRef}
        badgeStyle={badgeStyle}
      />
      <About copy={copy.about} slotRef={aboutSlotRef} />
      <Fahm copy={copy.fahm} />
      <Fael copy={copy.fael} />
      <Fudul copy={copy.fudul} />
      <Forsa copy={copy.forsa} />
      <Footer copy={copy.footer} />
    </>
  )
}

export default App
