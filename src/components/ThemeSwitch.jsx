function ThemeSwitch({ theme, onToggle }) {
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      className="theme-switch"
      aria-label="تبديل الثيم"
      aria-pressed={isDark}
      onClick={onToggle}
    >
      <span className="theme-switch__knob" />
    </button>
  )
}

export default ThemeSwitch
