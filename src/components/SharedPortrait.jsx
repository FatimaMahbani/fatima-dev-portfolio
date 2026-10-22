function PortraitMedia({ src, alt }) {
  if (src) {
    return <img className="shared-portrait__image" src={src} alt={alt} />
  }

  return <div className="shared-portrait__placeholder" aria-hidden="true" />
}

/**
 * The portrait card shown in Hero and فاءُ فكرة. With no scene sources it
 * renders the brand gradient placeholder (today's default). Once real
 * photos are added (see App.jsx), it crossfades between two scenes as
 * `crossfade` moves 0 → 1 — the same value that drives the hero→about
 * position morph, so both read as one continuous shot.
 */
function SharedPortrait({ style, alt, sceneOneSrc, sceneTwoSrc, crossfade = 0 }) {
  if (!style) return null

  const hasScenes = Boolean(sceneOneSrc || sceneTwoSrc)

  return (
    <div className="shared-portrait" style={style} aria-hidden="true">
      <div className="shared-portrait__media">
        {hasScenes ? (
          <>
            <img
              className="shared-portrait__scene"
              src={sceneOneSrc}
              alt={alt}
              style={{
                opacity: 1 - crossfade,
                transform: `scale(${1 + crossfade * 0.035})`,
              }}
            />
            <img
              className="shared-portrait__scene"
              src={sceneTwoSrc}
              alt={alt}
              style={{
                opacity: crossfade,
                transform: `scale(${1.035 - crossfade * 0.035})`,
              }}
            />
          </>
        ) : (
          <PortraitMedia alt={alt} />
        )}
      </div>
    </div>
  )
}

export default SharedPortrait
export { PortraitMedia }
