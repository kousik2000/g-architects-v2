import { useState, useRef, useEffect } from "react"
import { Sparkles } from "lucide-react"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  title?: string
}

export default function BeforeAfterSlider({ beforeImage, afterImage, title }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50) // percentage
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(position)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX)
    }
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchend", handleMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchend", handleMouseUp)
    }
  }, [])

  return (
    <div className="flex flex-col items-center w-full font-body">
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] rounded-architectural overflow-hidden shadow-architectural select-none bg-borderLine group"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Before Image (Background) */}
        <img
          src={beforeImage}
          alt="Before construction"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-architectural z-20 shadow-sm border border-white/10">
          Before Construction
        </div>

        {/* After Image (Clipped overlay) */}
        <div
          className="absolute inset-y-0 left-0 right-0 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img
            src={afterImage}
            alt="After completed design"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ width: containerRef.current?.getBoundingClientRect().width }}
          />
          <div className="absolute top-4 right-4 bg-accent text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-architectural z-20 shadow-sm">
            After Design
          </div>
        </div>

        {/* Handle slider line */}
        <div
          className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-30 group-hover:bg-accent transition-colors shadow-2xl"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onTouchStart={() => setIsDragging(true)}
        >
          {/* Draggable Circle Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center border border-borderLine shadow-xl group-hover:scale-105 transition-all select-none pointer-events-none">
            <svg
              className="w-4 h-4 text-primary fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </div>
        </div>
      </div>
      
      {title && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-primary font-headings">
          <Sparkles size={16} className="text-accent" />
          <span>{title}</span>
        </div>
      )}
    </div>
  )
}
