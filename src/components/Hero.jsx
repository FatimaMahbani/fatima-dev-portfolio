import { visualWords } from "../data/content.js"
import GreetingBadge from "./GreetingBadge.jsx"

function Hero({ copy, portraitSlotRef, badgeStyle }) {
  return (
    <section className="hero" id="home">
      <div className="hero__glows" aria-hidden="true">
        <span className="hero__glow hero__glow--lavender" />
        <span className="hero__glow hero__glow--sky" />
      </div>

      <div className="hero__stage">
        <div className="hero__col hero__col--left">
          <div className="hero__word-block">
            <p className="hero__word hero__word--left" aria-hidden="true">
              {visualWords.left}
            </p>
            <div className="hero__intro">
              <h1 className="hero__lead">{copy.lead}</h1>
              <p className="hero__secondary">{copy.secondary}</p>
            </div>
          </div>
        </div>

        <div className="hero__portrait">
          <div className="hero__portrait-frame">
            <div className="hero__portrait-slot" ref={portraitSlotRef} />
            <div className="hero__greeting" style={badgeStyle}>
              <GreetingBadge />
            </div>
          </div>
        </div>

        <div className="hero__col hero__col--right">
          <div className="hero__word-block">
            <p className="hero__word hero__word--right" aria-hidden="true">
              {visualWords.right}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
