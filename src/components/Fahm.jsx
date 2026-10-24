import { useRef } from "react"
import { useTrackProgress, useEntranceProgress, clamp, lerp } from "../hooks/useScrollMotion.js"
import SectionHeading from "./SectionHeading.jsx"

// Each block keeps the SAME four DOM nodes throughout — only its position,
// size, rotation and opacity interpolate per scroll progress, and its inner
// content crossfades at the transition midpoint. Nothing unmounts/remounts
// between scenes, which is what makes this read as one persistent
// composition rather than four swapped screens. Coordinates are percent of
// the stage box (0–100), shared 1:1 with the connecting-lines SVG viewBox.
const BLOCKS = [
  {
    id: "tagIdea",
    kind: "tag",
    tagIndex: 0,
    kf: [
      { x: 9, y: 20, w: 21, h: 11, rot: -8, opacity: 1 },
      { x: 12, y: 40, w: 21, h: 11, rot: 0, opacity: 1 },
      { x: 7, y: 3, w: 13, h: 7, rot: 0, opacity: 0.4 },
      { x: 7, y: 3, w: 13, h: 7, rot: 0, opacity: 0 },
    ],
  },
  {
    id: "tagData",
    kind: "tag",
    tagIndex: 1,
    kf: [
      { x: 58, y: 8, w: 21, h: 11, rot: 6, opacity: 1 },
      { x: 40, y: 40, w: 21, h: 11, rot: 0, opacity: 1 },
      { x: 22, y: 3, w: 13, h: 7, rot: 0, opacity: 0.4 },
      { x: 22, y: 3, w: 13, h: 7, rot: 0, opacity: 0 },
    ],
  },
  {
    id: "tagUI",
    kind: "tag",
    tagIndex: 2,
    kf: [
      { x: 35, y: 1, w: 19, h: 10, rot: -4, opacity: 1 },
      { x: 68, y: 40, w: 21, h: 11, rot: 0, opacity: 1 },
      { x: 37, y: 3, w: 13, h: 7, rot: 0, opacity: 0.4 },
      { x: 37, y: 3, w: 13, h: 7, rot: 0, opacity: 0 },
    ],
  },
  {
    id: "hub",
    kind: "shape",
    kf: [
      { x: 75, y: 44, w: 14, h: 14, rot: 20, opacity: 0.9 },
      { x: 42, y: 7, w: 16, h: 16, rot: 0, opacity: 1 },
      { x: 2, y: 2, w: 7, h: 7, rot: 0, opacity: 0.35 },
      { x: 2, y: 2, w: 7, h: 7, rot: 0, opacity: 0 },
    ],
  },
  {
    id: "panelA",
    kind: "panel",
    kf: [
      { x: 8, y: 50, w: 29, h: 22, rot: -6, opacity: 1 },
      { x: 12, y: 64, w: 28, h: 19, rot: 0, opacity: 1 },
      { x: 5, y: 14, w: 42, h: 65, rot: -2, opacity: 1 },
      { x: 5, y: 7, w: 90, h: 75, rot: 0, opacity: 1 },
    ],
  },
  {
    id: "panelB",
    kind: "panel",
    kf: [
      { x: 59, y: 58, w: 29, h: 22, rot: 5, opacity: 1 },
      { x: 60, y: 64, w: 28, h: 19, rot: 0, opacity: 1 },
      { x: 53, y: 20, w: 40, h: 57, rot: 2, opacity: 1 },
      { x: 56, y: 49, w: 35, h: 29, rot: 0, opacity: 1 },
    ],
  },
]

const LINE_PAIRS = [
  ["hub", "tagIdea"],
  ["hub", "tagData"],
  ["hub", "tagUI"],
  ["tagIdea", "panelA"],
  ["tagUI", "panelB"],
]

const IDLE_AMP_BY_SCENE = [1, 0.4, 0.15, 0.05]

function wordReveal(progress, start, span) {
  return clamp((progress - start) / span, 0, 1)
}

function interpBlock(block, sceneIndex, t) {
  const a = block.kf[sceneIndex]
  const b = block.kf[Math.min(sceneIndex + 1, block.kf.length - 1)]
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
    rot: lerp(a.rot, b.rot, t),
    opacity: lerp(a.opacity, b.opacity, t),
  }
}

function NoteLines() {
  return (
    <div className="fahm__note" aria-hidden="true">
      <span className="fahm__note-line" style={{ width: "72%" }} />
      <span className="fahm__note-line" style={{ width: "46%" }} />
    </div>
  )
}

function NodeLabel({ text }) {
  return (
    <span className="fahm__node-label" aria-hidden="true">
      {text}
    </span>
  )
}

function CodeDots() {
  return (
    <div className="fahm__panel-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  )
}

function CodeBlock({ lines }) {
  return (
    <div className="fahm__code" aria-hidden="true">
      <CodeDots />
      <div className="fahm__code-body">
        {lines.map((line, index) => (
          <p key={index} className="fahm__code-line">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

function DashboardFrame() {
  return (
    <div className="fahm__dash" aria-hidden="true">
      <CodeDots />
      <div className="fahm__dash-bars">
        <span style={{ height: "38%" }} />
        <span style={{ height: "72%" }} />
        <span style={{ height: "54%" }} />
        <span style={{ height: "92%" }} />
        <span style={{ height: "34%" }} />
        <span style={{ height: "64%" }} />
      </div>
    </div>
  )
}

function StatTile() {
  return (
    <div className="fahm__stat" aria-hidden="true">
      <span className="fahm__stat-dot" />
      <span className="fahm__stat-bar" style={{ width: "72%" }} />
      <span className="fahm__stat-bar" style={{ width: "46%" }} />
    </div>
  )
}

function BlockContent({ block, sceneIndex, copy }) {
  if (block.kind === "tag") {
    if (sceneIndex >= 2) return null
    return <NodeLabel text={copy.tags[block.tagIndex]} />
  }
  if (block.id === "panelA") {
    if (sceneIndex === 0) return <NoteLines />
    if (sceneIndex === 1) return <NodeLabel text="API" />
    if (sceneIndex === 2) return <CodeBlock lines={copy.code.a} />
    return <DashboardFrame />
  }
  if (block.id === "panelB") {
    if (sceneIndex === 0) return <NoteLines />
    if (sceneIndex === 1) return <NodeLabel text="DB" />
    if (sceneIndex === 2) return <CodeBlock lines={copy.code.b} />
    return <StatTile />
  }
  return null
}

function Fahm({ copy, locale }) {
  // In English the stage title already IS the gloss ("Discover", "Build"…),
  // so showing both would just repeat the same word — the small label is
  // only meaningful in Arabic, where it glosses the Arabic word in English.
  const showGloss = locale !== "en"

  const sectionRef = useRef(null)
  const mobileRef = useRef(null)
  const { progress, reduceMotion } = useTrackProgress(sectionRef)
  const { progress: mobileProgress } = useEntranceProgress(mobileRef, {
    startVH: 0.92,
    endVH: 0.6,
  })
  const mobileVisible = mobileProgress > 0.05

  const scenes = copy.scenes
  const sceneCount = scenes.length

  // Timeline
  const introReveal = clamp(progress / 0.08, 0, 1)
  const labStart = 0.08
  const labEnd = 0.72
  const labProgress = clamp((progress - labStart) / (labEnd - labStart), 0, 1)

  const rawScene = labProgress * sceneCount
  const sceneIndex = Math.min(sceneCount - 1, Math.floor(rawScene))
  const sceneFraction = clamp(rawScene - sceneIndex, 0, 1)
  const hasNext = sceneIndex < sceneCount - 1

  const dwellPortion = 0.55
  const transitionT = reduceMotion
    ? 0
    : hasNext
      ? clamp((sceneFraction - dwellPortion) / (1 - dwellPortion), 0, 1)
      : 0
  const breathe = clamp(sceneFraction / dwellPortion, 0, 1)

  const finaleStart = 0.75
  const finaleSpan = 0.23
  const finaleProgress = clamp((progress - finaleStart) / finaleSpan, 0, 1)
  const showFinale = progress >= finaleStart

  const labVisible = progress >= 0.07 && !showFinale
  const contentOpacity = showFinale
    ? clamp(1 - finaleProgress / 0.3, 0, 1)
    : clamp((progress - 0.06) / 0.08, 0, 1)

  // Content (text/code/dashboard) swaps at the transition midpoint, not at
  // its start, so the dissolve is symmetric scrolling in either direction.
  const contentSceneIndex = transitionT < 0.5 ? sceneIndex : Math.min(sceneIndex + 1, sceneCount - 1)
  const contentDissolve = reduceMotion ? 1 : 1 - Math.sin(transitionT * Math.PI) * 0.82

  const captionScene = scenes[contentSceneIndex]

  // Connecting lines: mostly latent in Discover, fully drawn through
  // Connect, fading back out as Build takes over.
  const lineRise = clamp((labProgress - 0.15) / 0.15, 0, 1)
  const lineFall = clamp((labProgress - 0.55) / 0.15, 0, 1)
  const lineOpacity = clamp(lineRise - lineFall, 0, 1) * 0.85

  const idleAmp = reduceMotion
    ? 0
    : (lerp(IDLE_AMP_BY_SCENE[sceneIndex], IDLE_AMP_BY_SCENE[Math.min(sceneIndex + 1, 3)], transitionT)) *
      (1 - transitionT)

  const blockState = {}
  BLOCKS.forEach((block, order) => {
    const base = interpBlock(block, sceneIndex, transitionT)
    const idleY = Math.sin(breathe * Math.PI * 2 + order * 1.4) * 1.1 * idleAmp
    const idleX = Math.cos(breathe * Math.PI * 2 + order * 1.1) * 0.8 * idleAmp
    blockState[block.id] = { ...base, x: base.x + idleX, y: base.y + idleY }
  })

  return (
    <section className="fahm" id="fahm" ref={sectionRef}>
      <div className="fahm__track">
        <div className="fahm__sticky">
          <div
            className="fahm__header"
            style={{
              opacity: introReveal,
              transform: `translateY(${(1 - introReveal) * 18}px)`,
            }}
          >
            <p className="fahm__kicker">{copy.kicker}</p>
            <SectionHeading
              className="fahm__title"
              title={copy.title}
              progress={introReveal}
              reduceMotion={reduceMotion}
            />
            <p className="fahm__subtitle">{copy.subtitle}</p>
          </div>

          <div className="fahm__stage">
            <div className="fahm__lab" style={{ opacity: contentOpacity }} aria-hidden="true">
              <svg className="fahm__lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                {LINE_PAIRS.map(([fromId, toId]) => {
                  const from = blockState[fromId]
                  const to = blockState[toId]
                  return (
                    <line
                      key={`${fromId}-${toId}`}
                      x1={from.x + from.w / 2}
                      y1={from.y + from.h / 2}
                      x2={to.x + to.w / 2}
                      y2={to.y + to.h / 2}
                      className="fahm__line"
                      style={{ opacity: lineOpacity }}
                    />
                  )
                })}
              </svg>

              {BLOCKS.map((block) => {
                const state = blockState[block.id]
                return (
                  <div
                    key={block.id}
                    className={`fahm__block fahm__block--${block.kind}`}
                    style={{
                      left: `${state.x}%`,
                      top: `${state.y}%`,
                      width: `${state.w}%`,
                      height: `${state.h}%`,
                      opacity: state.opacity,
                      transform: `rotate(${state.rot}deg)`,
                    }}
                  >
                    <div className="fahm__block-inner" style={{ opacity: contentDissolve }}>
                      <BlockContent block={block} sceneIndex={contentSceneIndex} copy={copy} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              className="fahm__caption"
              style={{ opacity: contentOpacity }}
              aria-hidden={showFinale}
            >
              <span className="fahm__caption-num">{captionScene.number}</span>
              <h3 className="fahm__caption-title">
                {captionScene.title}
                {showGloss ? (
                  <span className="fahm__caption-gloss">{captionScene.gloss}</span>
                ) : null}
              </h3>
              <p className="fahm__caption-micro">{captionScene.micro}</p>
            </div>

            <ol
              className="fahm__indicators"
              style={{ opacity: labVisible ? 1 : 0 }}
              aria-hidden={!labVisible}
            >
              {scenes.map((scene, index) => (
                <li
                  key={scene.id}
                  className={[
                    "fahm__indicator",
                    index === contentSceneIndex ? "is-active" : "",
                    index < contentSceneIndex ? "is-passed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {scene.number}
                </li>
              ))}
            </ol>

            <div
              className={`fahm__finale${showFinale ? " is-visible" : ""}`}
              aria-hidden={!showFinale}
            >
              <p className="fahm__finale-text">
                {copy.finalLine.split(" ").map((word, index, all) => {
                  const span = 0.6 / all.length
                  const start = 0.1 + index * span
                  const wp = wordReveal(finaleProgress, start, span * 1.7)
                  return (
                    <span className="fahm__finale-word" key={`${word}-${index}`}>
                      <span
                        className="fahm__finale-word-inner"
                        style={{
                          opacity: wp,
                          transform: `translateY(${(1 - wp) * 70}%)`,
                        }}
                      >
                        {word}
                      </span>
                    </span>
                  )
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fahm__mobile${mobileVisible ? " is-visible" : ""}`}
        ref={mobileRef}
      >
        <div className="fahm__mobile-header">
          <p className="fahm__kicker">{copy.kicker}</p>
          <SectionHeading
            className="fahm__title"
            title={copy.title}
            progress={mobileProgress}
            reduceMotion={reduceMotion}
          />
          <p className="fahm__subtitle">{copy.subtitle}</p>
        </div>

        <ol className="fahm__mobile-list">
          {scenes.map((scene, index) => (
            <li
              key={scene.id}
              className="fahm__mobile-item"
              style={{ transitionDelay: `${index * 0.07}s` }}
            >
              <span className={`fahm__mobile-icon fahm__mobile-icon--${scene.id}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <div className="fahm__mobile-copy">
                <span className="fahm__moment-num">{scene.number}</span>
                <p className="fahm__moment-phrase">
                  {scene.title}
                  {showGloss ? (
                    <span className="fahm__caption-gloss">{scene.gloss}</span>
                  ) : null}
                </p>
                <p className="fahm__moment-micro">{scene.micro}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="fahm__finale is-visible fahm__finale--mobile">
          <p className="fahm__finale-text">{copy.finalLine}</p>
        </div>
      </div>
    </section>
  )
}

export default Fahm
