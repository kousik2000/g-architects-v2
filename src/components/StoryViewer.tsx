import { useState, useEffect, useRef } from "react"
import { useAppStore } from "../store/appStore"
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"

interface StoryViewerProps {
  onClose: () => void
}

export default function StoryViewer({ onClose }: StoryViewerProps) {
  const { stories } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<any>(null)

  const activeStory = stories[currentIndex]

  useEffect(() => {
    setProgress(0)
  }, [currentIndex])

  useEffect(() => {
    if (isPaused || !activeStory) return

    const interval = 50 // ms per step
    const duration = 5000 // total time per story (5s)
    const step = (interval / duration) * 100

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current)
          handleNext()
          return 0
        }
        return prev + step
      })
    }, interval)

    return () => clearInterval(timerRef.current)
  }, [currentIndex, isPaused, stories])

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    } else {
      setCurrentIndex(0)
      setProgress(0)
    }
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onClose() // Close story viewer when finished all
    }
  }

  if (stories.length === 0 || !activeStory) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none font-body">
      {/* Main container — clicking outside the card calls onClose */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Story card itself */}
      <div
        className="relative w-full max-w-lg h-full sm:h-[85vh] sm:rounded-architectural overflow-hidden bg-primary shadow-2xl flex flex-col justify-between z-10"
        onClick={(e) => e.stopPropagation()} // prevent bubbling to overlay
      >

        {/* LEFT tap zone — previous story */}
        <div
          className="absolute top-20 bottom-16 left-0 w-1/3 z-20 cursor-w-resize"
          onClick={handlePrev}
        />
        {/* RIGHT tap zone — next story */}
        <div
          className="absolute top-20 bottom-16 right-0 w-1/3 z-20 cursor-e-resize"
          onClick={handleNext}
        />

        {/* Top bar (Progress indicators and info) */}
        <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-30">
          
          {/* Progress Bars */}
          <div className="flex gap-1.5 mb-4">
            {stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-75"
                  style={{
                    width:
                      idx < currentIndex
                        ? "100%"
                        : idx === currentIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Profile and time metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold font-headings shadow-sm">
                GA
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold tracking-wider">
                  G Architects Live
                </h4>
                <p className="text-white/60 text-[10px]">
                  Site Update #{currentIndex + 1} of {stories.length}
                </p>
              </div>
            </div>

            {/* Top controls */}
            <div className="flex items-center gap-3 text-white z-40 relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused) }}
                className="p-1.5 hover:text-accent transition-colors"
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose() }}
                className="p-1.5 hover:text-accent transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Media display with blurred background for contained vertical media */}
        <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110 pointer-events-none select-none"
            style={{ 
              backgroundImage: activeStory.mediaType === "image" 
                ? `url(${activeStory.mediaUrl})` 
                : activeStory.thumbnailUrl 
                  ? `url(${activeStory.thumbnailUrl})` 
                  : "none" 
            }}
          />
          
          {activeStory.mediaType === "video" ? (
            <video
              src={activeStory.mediaUrl}
              autoPlay
              muted
              playsInline
              loop
              className="w-full h-full object-contain pointer-events-none select-none z-10"
              onPlay={() => setIsPaused(false)}
            />
          ) : (
            <img
              src={activeStory.mediaUrl}
              alt={activeStory.title}
              className="w-full h-full object-contain pointer-events-none select-none z-10"
            />
          )}
        </div>

        {/* Bottom bar with narrative explanation — padded for safe areas and mobile address bars */}
        <div className="absolute bottom-0 left-0 w-full p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-30 pt-20">
          <h3 className="font-headings text-md sm:text-lg font-bold text-white mb-1.5 drop-shadow-lg leading-snug">
            {activeStory.title}
          </h3>
          <p className="text-xs text-white/80 font-light drop-shadow-md tracking-wide">
            Live from construction update.
          </p>
        </div>

        {/* Desktop Prev/Next Buttons — always visible on larger screens */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="absolute -left-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors hidden sm:flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none z-40"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNext}
          className="absolute -right-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors hidden sm:flex items-center justify-center z-40"
        >
          <ChevronRight size={24} />
        </button>

        {/* Mobile swipe hint */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30 sm:hidden pointer-events-none">
          <span className="text-white/30 text-[10px] uppercase tracking-widest">← Tap sides to navigate →</span>
        </div>
      </div>
    </div>
  )
}
