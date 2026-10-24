import GreetingBadge from "./GreetingBadge.jsx"

// The word paired with the supporting copy ("تُبنى"/"Built") and the lone
// word ("فِكرة"/"Idea") swap physical sides between RTL and LTR so the
// composition always reads start-to-end as "[lone] … [paired + copy]".
// Which DOM column (`--left`/`--right`) each one lands in is decided here,
// once, rather than via CSS trying to reposition fixed-side content —
// the column classes below only ever describe PHYSICAL position and never
// change meaning per locale.
function Hero({ copy, locale, portraitSlotRef, badgeStyle }) {
  const pairedOnLeft = locale !== "en"

  const pairedBlock = (
    <div className="hero__word-block hero__word-block--paired">
      <p className="hero__word" aria-hidden="true">
        {copy.words.left}
      </p>
      <div className="hero__intro">
        <h1 className="hero__lead">{copy.lead}</h1>
        <p className="hero__secondary">{copy.secondary}</p>
      </div>
    </div>
  )

  const loneBlock = (
    <div className="hero__word-block hero__word-block--lone">
      <p className="hero__word" aria-hidden="true">
        {copy.words.right}
      </p>
    </div>
  )

  return (
    <section className="hero" id="home">
      <div className="hero__glows" aria-hidden="true">
        <span className="hero__glow hero__glow--lavender" />
        <span className="hero__glow hero__glow--sky" />
      </div>

      <div className="hero__stage">
        <div className="hero__col hero__col--left">
          {pairedOnLeft ? pairedBlock : loneBlock}
        </div>

        <div className="hero__portrait">
          <div className="hero__portrait-frame">
            <div className="hero__portrait-slot" ref={portraitSlotRef} />
            <div className="hero__greeting" style={badgeStyle}>
              <GreetingBadge text={copy.greeting} />
            </div>
          </div>
        </div>

        <div className="hero__col hero__col--right">
          {pairedOnLeft ? loneBlock : pairedBlock}
        </div>
      </div>
    </section>
  )
}

export default Hero
