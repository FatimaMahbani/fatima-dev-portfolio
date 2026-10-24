function ThemeSwitch({ theme, onToggle, toDarkLabel, toLightLabel }) {
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      className="theme-switch"
      aria-label={isDark ? toLightLabel : toDarkLabel}
      aria-pressed={isDark}
      onClick={onToggle}
    >
      <span className="theme-switch__knob" />
    </button>
  )
}

export default ThemeSwitch
