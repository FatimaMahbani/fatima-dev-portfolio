export const THEMES = {
  light: "light",
  dark: "dark",
}

export const DEFAULT_THEME = "light"

export function applyTheme(theme) {
  const next = THEMES[theme] ?? DEFAULT_THEME
  document.documentElement.dataset.theme = next
}
