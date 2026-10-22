import { useEffect, useState } from "react"

export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0])

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (sections.length === 0) return undefined

    const ratios = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })

        let bestId = null
        let bestRatio = 0
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        })

        if (bestId) setActiveId(bestId)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-45% 0px -45% 0px" },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [sectionIds])

  return activeId
}
