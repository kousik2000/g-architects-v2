import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "../store/appStore"
import { X, Megaphone, ArrowRight, ExternalLink, Calendar } from "lucide-react"

export default function NewsPopup() {
  const { announcements, fetchAnnouncements } = useAppStore()
  const navigate = useNavigate()
  const [activePopup, setActivePopup] = useState<any | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      // Pick the first non-dismissed active announcement
      const undismissed = announcements.find(
        (a: any) => !localStorage.getItem(`g_news_dismissed_${a.id}`)
      )
      if (undismissed) {
        const t = setTimeout(() => {
          setActivePopup(undismissed)
          setVisible(true)
        }, 800)
        return () => clearTimeout(t)
      }
    }
  }, [announcements])

  const handleDismiss = () => {
    if (activePopup) {
      localStorage.setItem(`g_news_dismissed_${activePopup.id}`, "true")
      setVisible(false)
      setTimeout(() => setActivePopup(null), 300)
    }
  }

  const handleCTA = () => {
    if (activePopup?.project?.slug) {
      handleDismiss()
      navigate(`/projects/${activePopup.project.slug}`)
    } else if (activePopup?.externalLink) {
      window.open(activePopup.externalLink, "_blank", "noopener,noreferrer")
    }
  }

  if (!activePopup) return null

  const hasCTA = activePopup?.project?.slug || activePopup?.externalLink
  const isProjectLink = !!activePopup?.project?.slug
  const endDateStr = activePopup.endDate
    ? new Date(activePopup.endDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleDismiss}
      />

      {/* Centered Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
      >
        <div
          className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto transition-all duration-300 font-body ${
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>

          {/* Optional banner image */}
          {activePopup.imageUrl && (
            <div className="w-full h-48 overflow-hidden bg-gray-100">
              <img
                src={activePopup.imageUrl}
                alt={activePopup.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* If no image but there's a project cover, show it as a subtle background */}
          {!activePopup.imageUrl && activePopup.project?.coverImage && (
            <div className="relative w-full h-36 overflow-hidden bg-gray-900">
              <img
                src={activePopup.project.coverImage}
                alt={activePopup.project.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-[9px] uppercase tracking-widest font-bold text-accent block mb-0.5">Project</span>
                <span className="text-xs font-bold">{activePopup.project.title}</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            {/* Header tag */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-accent/10 rounded-lg text-accent">
                <Megaphone size={14} />
              </div>
              <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest font-headings">
                Announcement
              </span>
            </div>

            {/* Title */}
            <h3 className="font-headings text-lg font-black text-[#111111] leading-snug mb-2 tracking-tight">
              {activePopup.title}
            </h3>

            {/* Body text */}
            <p className="text-[#444444] text-xs leading-relaxed font-light mb-4">
              {activePopup.content}
            </p>

            {/* Valid until */}
            {endDateStr && (
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-4">
                <Calendar size={11} />
                <span>Valid until {endDateStr}</span>
              </div>
            )}

            {/* CTA Button */}
            {hasCTA && (
              <button
                onClick={handleCTA}
                className="w-full py-3 bg-[#111111] text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-accent transition-colors duration-200"
              >
                {isProjectLink ? (
                  <>
                    View Project
                    <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    Open Link
                    <ExternalLink size={14} />
                  </>
                )}
              </button>
            )}

            {/* Close text link */}
            <button
              onClick={handleDismiss}
              className="w-full mt-2 py-2 text-[10px] text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
