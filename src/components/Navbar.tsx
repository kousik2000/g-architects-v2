import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAppStore } from "../store/appStore"

interface NavbarProps {
  onOpenStories: () => void
  onOpenQuoteModal: () => void
}

export default function Navbar({ onOpenStories, onOpenQuoteModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const { stories, fetchStories, settings, fetchSettings } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStories()
    fetchSettings()

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/" + sectionId)
    } else {
      const el = document.getElementById(sectionId.replace("#", ""))
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const isHome = location.pathname === "/"

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled
        ? "py-3 px-3 sm:px-6 md:px-12"
        : "py-4 px-3 sm:px-6 md:px-12"
        }`}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between rounded-architectural transition-all duration-300 ${scrolled
          ? "glass-nav shadow-glass px-4 sm:px-6 py-2.5"
          : "bg-transparent px-2 py-2 border-b border-transparent"
          }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-end font-headings text-sm sm:text-lg md:text-xl font-extrabold tracking-tight text-primary">
            <img src="/logov1-g.png" className="h-[35px] mr-[3px]" />
            <span className="text-accent mb-[-4px] sm:mb-[-7px]">.</span>
            <div className="flex flex-col">
              <div className="flex gap-2">
                <span className="mb-[-4px] sm:mb-[-7px] mb-[-5px]">ARCHITECTS</span>
                <span className="text-accent mb-[-4px] sm:mb-[-7px] mb-[-5px]">&</span>
              </div>
              <span className="mb-[-4px] sm:mb-[-7px]">DEVELOPERS</span>
            </div>
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium hover:text-accent transition-colors ${isHome ? "text-accent" : "text-mutedText"
              }`}
          >
            Home
          </Link>
          <button
            onClick={() => handleNavClick("#services")}
            className="text-sm font-medium text-mutedText hover:text-accent transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => handleNavClick("#about")}
            className="text-sm font-medium text-mutedText hover:text-accent transition-colors"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick("#portfolio")}
            className="text-sm font-medium text-mutedText hover:text-accent transition-colors"
          >
            Portfolio
          </button>
          <button
            onClick={() => handleNavClick("#reviews")}
            className="text-sm font-medium text-mutedText hover:text-accent transition-colors"
          >
            Reviews
          </button>
          {settings?.showFaq !== false && (
            <button
              onClick={() => handleNavClick("#faq")}
              className="text-sm font-medium text-mutedText hover:text-accent transition-colors"
            >
              FAQ
            </button>
          )}
          <button
            onClick={() => handleNavClick("#contact")}
            className="text-sm font-medium text-mutedText hover:text-accent transition-colors"
          >
            Contact
          </button>
        </nav>

        {/* Widgets / CTA */}
        <div className="flex items-center gap-4">
          {/* Instagram Story Widget */}
          {stories.length > 0 && (
            <button
              onClick={onOpenStories}
              className="relative flex items-center justify-center p-1 rounded-full border-2 border-accent hover:scale-105 transition-transform"
              title="View Daily Updates"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold font-headings">LIVE</span>
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {stories.length}
              </span>
            </button>
          )}

          {/* Quick Inquiry CTA */}
          <button
            onClick={onOpenQuoteModal}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white text-xs font-bold tracking-wider uppercase rounded-architectural hover:bg-accent transition-colors duration-300 border border-transparent hover:border-accent"
          >
            Get Quote
          </button>

        </div>
      </div>
    </header>
  )
}
