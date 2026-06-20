import { useState, useEffect } from "react"
import { useAppStore } from "../store/appStore"
import { X, Megaphone, Calendar } from "lucide-react"

export default function NewsPopup() {
  const { announcements, fetchAnnouncements } = useAppStore()
  const [activePopup, setActivePopup] = useState<any | null>(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements.length > 0) {
      // Find the most recent active announcement
      const current = announcements[0]
      const dismissed = localStorage.getItem(`g_news_dismissed_${current.id}`)

      if (!dismissed) {
        setActivePopup(current)
      }
    }
  }, [announcements])

  const handleDismiss = () => {
    if (activePopup) {
      localStorage.setItem(`g_news_dismissed_${activePopup.id}`, "true")
      setActivePopup(null)
    }
  }

  if (!activePopup) return null

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-md w-full animate-fadeIn font-body">
      <div className="bg-primary text-white border border-white/10 shadow-2xl p-6 rounded-architectural relative overflow-hidden">
        {/* Architectural grid styling in background */}
        <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-white/5 pointer-events-none" />
        
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/60 hover:text-accent transition-colors"
          aria-label="Dismiss Announcement"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-accent rounded-architectural text-white flex items-center justify-center shrink-0">
            <Megaphone size={18} />
          </div>
          <div>
            <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-1 block">
              Announcements & News
            </span>
            <h3 className="font-headings text-md font-bold tracking-wide leading-snug mb-2 text-white">
              {activePopup.title}
            </h3>
            <p className="text-white/80 text-xs leading-relaxed font-light mb-4">
              {activePopup.content}
            </p>
            
            <div className="flex items-center gap-2 text-white/50 text-[10px]">
              <Calendar size={12} />
              <span>Valid this month at Gautam Sen Studio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
