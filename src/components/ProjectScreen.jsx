// What renders inside a ComputerMockup's screen for one project. Projects
// without a `previewImage` yet fall back to an honest, labeled placeholder
// (brand gradient + initials + name) rather than an invented screenshot.
function ProjectScreen({ project, mark, style, className = "" }) {
  if (project.previewImage) {
    return (
      <div
        className={`project-screen project-screen--image ${className}`.trim()}
        style={style}
      >
        <img
          className="project-screen__image"
          src={project.previewImage}
          alt={project.name}
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }

  return (
    <div
      className={`project-screen project-screen--${project.accent} ${className}`.trim()}
      style={style}
    >
      <div className="project-screen__bar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="project-screen__body">
        <span className="project-screen__mark" aria-hidden="true">
          {mark}
        </span>
        <span className="project-screen__initials">{project.initials}</span>
        <span className="project-screen__name">{project.name}</span>
        {project.highlight ? (
          <div className="project-screen__highlight">
            <span className="project-screen__highlight-value">
              {project.highlight.value}
            </span>
            <span className="project-screen__highlight-label">
              {project.highlight.label}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ProjectScreen
