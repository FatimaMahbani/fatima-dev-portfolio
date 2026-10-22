// Reusable desktop-computer frame. It never changes per project — only
// whatever is passed as children (the "screen" layer) does. Kept purely
// presentational so it can host a single static screen (mobile list,
// modal) or two stacked crossfading screens (the desktop showcase).
function ComputerMockup({ children, className = "" }) {
  return (
    <div className={`computer ${className}`.trim()}>
      <div className="computer__body">
        <span className="computer__cam" aria-hidden="true" />
        <div className="computer__screen">{children}</div>
      </div>
      <div className="computer__neck" aria-hidden="true" />
      <div className="computer__base" aria-hidden="true" />
    </div>
  )
}

export default ComputerMockup
