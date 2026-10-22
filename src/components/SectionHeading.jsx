import { clamp } from "../hooks/useScrollMotion.js"

// Matches --color-text-primary-light / --color-lavender-deep in variables.css.
// Duplicated as plain RGB so the entrance can lerp the color per scroll frame
// without a getComputedStyle read on every tick.
const TEXT_RGB = [24, 24, 31]
const ACCENT_RGB = [108, 99, 217]

function windowed(progress, start, span) {
  return clamp((progress - start) / span, 0, 1)
}

function blendToLavender(t) {
  const r = Math.round(TEXT_RGB[0] + (ACCENT_RGB[0] - TEXT_RGB[0]) * t)
  const g = Math.round(TEXT_RGB[1] + (ACCENT_RGB[1] - TEXT_RGB[1]) * t)
  const b = Math.round(TEXT_RGB[2] + (ACCENT_RGB[2] - TEXT_RGB[2]) * t)
  return `rgb(${r}, ${g}, ${b})`
}

function splitFa(text) {
  const spaceIndex = text.indexOf(" ")
  if (spaceIndex === -1) return [text, ""]
  return [text.slice(0, spaceIndex), text.slice(spaceIndex + 1)]
}

// The "فاءُ" signature mark: an underline svg traces in beneath the word
// right-to-left (its path runs right-to-left so a rising dash-offset
// reveals it in reading order), echoing the swash under the wordmark logo.
function FaUnderline({ progress }) {
  return (
    <svg
      className="heading-fa__underline"
      viewBox="0 0 120 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M116 7C98 15 70 17 45 12 29 9 16 14 5 8"
        pathLength="1"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
      />
    </svg>
  )
}

/**
 * Shared "فاءُ X" heading treatment for the five main section titles:
 * the fa word tints into lavender, its hand-drawn underline traces in,
 * and the second word follows with a slight stagger — all driven by a
 * single scroll-tied `progress` value (0–1) so it stays reversible and
 * never adds its own scroll distance.
 *
 * `withEntrance` makes the component own the heading's upward-fade arrival
 * too; pass false when the caller already fades/slides the whole header
 * block (so the two don't double up).
 */
function SectionHeading({
  title,
  progress,
  reduceMotion = false,
  withEntrance = false,
  as: Tag = "h2",
  className = "",
}) {
  const p = reduceMotion ? 1 : progress

  const [fa, rest] = splitFa(title)
  const faP = windowed(p, 0.1, 0.5)
  const underlineP = windowed(p, 0.3, 0.55)
  const restP = windowed(p, 0.2, 0.45)

  const tagStyle = withEntrance
    ? {
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }
    : undefined

  return (
    <Tag className={className ? `heading-fa ${className}` : "heading-fa"} style={tagStyle}>
      <span className="heading-fa__fa" style={{ color: blendToLavender(faP) }}>
        {fa}
        <FaUnderline progress={underlineP} />
      </span>
      {rest ? (
        <>
          {" "}
          <span
            className="heading-fa__rest"
            style={{
              opacity: restP,
              transform: `translateY(${(1 - restP) * 6}px)`,
            }}
          >
            {rest}
          </span>
        </>
      ) : null}
    </Tag>
  )
}

export default SectionHeading
