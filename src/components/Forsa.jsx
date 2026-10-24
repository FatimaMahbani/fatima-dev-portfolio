import { useRef, useState } from "react"
import { useEntranceProgress, clamp } from "../hooks/useScrollMotion.js"
import LottiePlayer from "./LottiePlayer.jsx"

function loadDeveloperIllustration() {
  return import("../assets/lottie/web-developer-illustration.json").then((mod) => mod.default)
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M17.5 2.5 9 11M17.5 2.5 12 17.5l-3-6.5-6.5-3 15-5.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="forsa__spinner" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28 18"
      />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m6.2 10.2 2.5 2.5 5-5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function windowProgress(progress, start, end) {
  return clamp((progress - start) / (end - start), 0, 1)
}

function Word({ text, p }) {
  return (
    <span className="forsa__word">
      <span
        className="forsa__word-inner"
        style={{
          transform: `translateY(${(1 - p) * 100}%)`,
          opacity: p,
        }}
      >
        {text}
      </span>
    </span>
  )
}

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function encodeFormData(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&")
}

function ContactForm({ copy }) {
  const [values, setValues] = useState(EMPTY_FORM)
  const [honeypot, setHoneypot] = useState("")
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState("idle") // idle | submitting | success | error

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  function validate() {
    const nextErrors = {}
    for (const field of ["name", "email", "subject", "message"]) {
      if (!values[field].trim()) {
        nextErrors[field] = copy.requiredError
      }
    }
    if (!nextErrors.email && !EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = copy.emailInvalidError
    }
    return nextErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (status === "submitting") return // prevent duplicate submissions

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus("submitting")
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeFormData({ "form-name": "contact", ...values, "bot-field": honeypot }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Submission failed")
        setStatus("success")
      })
      .catch(() => setStatus("error"))
  }

  function handleReset() {
    setValues(EMPTY_FORM)
    setHoneypot("")
    setErrors({})
    setStatus("idle")
  }

  if (status === "success") {
    return (
      <div className="forsa__result" role="status">
        <span className="forsa__result-icon" aria-hidden="true">
          <CheckCircleIcon />
        </span>
        <p className="forsa__result-title">{copy.successTitle}</p>
        <p className="forsa__result-message">{copy.successMessage}</p>
        <button type="button" className="forsa__reset" onClick={handleReset}>
          {copy.sendAnotherLabel}
        </button>
      </div>
    )
  }

  return (
    <form
      className="forsa__form"
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      noValidate
    >
      <input type="hidden" name="form-name" value="contact" />

      {/* Honeypot — invisible to people, a giveaway for bots. */}
      <p className="forsa__honeypot" aria-hidden="true">
        <label>
          Leave this field empty
          <input
            type="text"
            name="bot-field"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </label>
      </p>

      <div className="forsa__field-row">
        <div className="forsa__field">
          <label className="forsa__label" htmlFor="forsa-name">
            {copy.nameLabel}
          </label>
          <input
            id="forsa-name"
            name="name"
            type="text"
            className={`forsa__input${errors.name ? " has-error" : ""}`}
            placeholder={copy.namePlaceholder}
            value={values.name}
            onChange={handleChange}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "forsa-name-error" : undefined}
          />
          {errors.name ? (
            <span className="forsa__error" id="forsa-name-error">
              {errors.name}
            </span>
          ) : null}
        </div>

        <div className="forsa__field">
          <label className="forsa__label" htmlFor="forsa-email">
            {copy.emailLabel}
          </label>
          <input
            id="forsa-email"
            name="email"
            type="email"
            className={`forsa__input${errors.email ? " has-error" : ""}`}
            placeholder={copy.emailPlaceholder}
            value={values.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "forsa-email-error" : undefined}
          />
          {errors.email ? (
            <span className="forsa__error" id="forsa-email-error">
              {errors.email}
            </span>
          ) : null}
        </div>
      </div>

      <div className="forsa__field">
        <label className="forsa__label" htmlFor="forsa-subject">
          {copy.subjectLabel}
        </label>
        <select
          id="forsa-subject"
          name="subject"
          className={`forsa__input forsa__select${values.subject ? "" : " is-placeholder"}${errors.subject ? " has-error" : ""}`}
          value={values.subject}
          onChange={handleChange}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "forsa-subject-error" : undefined}
        >
          <option value="" disabled>
            {copy.subjectPlaceholder}
          </option>
          {copy.subjectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.subject ? (
          <span className="forsa__error" id="forsa-subject-error">
            {errors.subject}
          </span>
        ) : null}
      </div>

      <div className="forsa__field">
        <label className="forsa__label" htmlFor="forsa-message">
          {copy.messageLabel}
        </label>
        <textarea
          id="forsa-message"
          name="message"
          rows={4}
          className={`forsa__input forsa__input--textarea${errors.message ? " has-error" : ""}`}
          placeholder={copy.messagePlaceholder}
          value={values.message}
          onChange={handleChange}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "forsa-message-error" : undefined}
        />
        {errors.message ? (
          <span className="forsa__error" id="forsa-message-error">
            {errors.message}
          </span>
        ) : null}
      </div>

      {status === "error" ? <p className="forsa__submit-error">{copy.errorMessage}</p> : null}

      <button
        type="submit"
        className="forsa__submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <SpinnerIcon />
            {copy.submittingLabel}
          </>
        ) : (
          <>
            <SendIcon />
            {copy.submitLabel}
          </>
        )}
      </button>
    </form>
  )
}

function Forsa({ copy }) {
  const sectionRef = useRef(null)
  const { progress, reduceMotion } = useEntranceProgress(sectionRef, {
    startVH: 0.95,
    endVH: 0.3,
  })

  const words = copy.heading.split(" ")
  const p = reduceMotion ? () => 1 : (start, end) => windowProgress(progress, start, end)

  const kickerP = p(0, 0.22)
  const bodyP = p(0.55, 0.82)
  const actionsP = p(0.68, 0.95)
  const footerP = p(0.88, 1)
  const illustrationP = p(0.25, 0.65)

  return (
    <section className="forsa" id="contact" ref={sectionRef}>
      <div className="forsa__inner">
        <div className="forsa__content">
          <p
            className="forsa__kicker"
            style={{ opacity: kickerP, transform: `translateY(${(1 - kickerP) * 14}px)` }}
          >
            {copy.kicker}
          </p>

          <h2 className="forsa__heading">
            {words.map((word, index) => {
              const span = 0.55 / words.length
              const start = 0.14 + index * span
              const wp = reduceMotion ? 1 : windowProgress(progress, start, start + span * 1.6)
              return <Word key={`${word}-${index}`} text={word} p={wp} />
            })}
          </h2>

          <p
            className="forsa__body"
            style={{ opacity: bodyP, transform: `translateY(${(1 - bodyP) * 16}px)` }}
          >
            {copy.body}
          </p>

          <div
            className="forsa__actions"
            style={{ opacity: actionsP, transform: `translateY(${(1 - actionsP) * 16}px)` }}
          >
            <ContactForm copy={copy.form} />
          </div>

          <p className="forsa__footer" style={{ opacity: footerP }}>
            {copy.footerNote}
          </p>
        </div>

        <div
          className="forsa__illustration"
          style={{
            opacity: illustrationP,
            transform: `translateY(${(1 - illustrationP) * 22}px)`,
          }}
        >
          <LottiePlayer
            className="forsa__illustration-lottie"
            loadAnimationData={loadDeveloperIllustration}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
    </section>
  )
}

export default Forsa
