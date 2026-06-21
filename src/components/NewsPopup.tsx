import { useState, useEffect } from "react"
import { useAppStore } from "../store/appStore"
import { X, Megaphone, Calendar } from "lucide-react"

export default function NewsPopup() {
  const { announcements, fetchAnnouncements } = useAppStore()
  const [activePopup, setActivePopup] = useState<any | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      // Find the first non-dismissed active announcement
      const undismissed = announcements.find(
        (a: any) => !localStorage.getItem(`g_news_dismissed_${a.id}`)
      )
      if (undismissed) {
        // Small delay before showing popup for better UX
        const t = setTimeout(() => {
          setActivePopup(undismissed)
          setVisible(true)
        }, 1500)
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

  if (!activePopup) return null

  // Format end date nicely
  const endDateStr = activePopup.endDate
    ? new Date(activePopup.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 max-w-sm w-full font-body transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-primary text-white border border-white/10 shadow-2xl p-5 rounded-architectural relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 border-b border-l border-white/5 pointer-events-none rounded-bl-3xl" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-t border-r border-accent/10 pointer-events-none rounded-tr-3xl" />

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-white/50 hover:text-accent transition-colors rounded"
          aria-label="Dismiss Announcement"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="flex gap-3 items-start">
          <div className="p-2.5 bg-accent/20 rounded-lg text-accent flex items-center justify-center shrink-0 mt-0.5">
            <Megaphone size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-accent font-bold uppercase tracking-widest font-headings mb-1 block">
              Announcement
            </span>
            <h3 className="font-headings text-sm font-bold tracking-wide leading-snug mb-1.5 text-white pr-4">
              {activePopup.title}
            </h3>
            <p className="text-white/70 text-[11px] leading-relaxed font-light mb-3">
              {activePopup.content}
            </p>

            {endDateStr && (
              <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
                <Calendar size={10} />
                <span>Valid until {endDateStr}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
