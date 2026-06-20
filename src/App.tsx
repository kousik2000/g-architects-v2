import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useAuthStore, useAppStore } from "./store/appStore"
import Navbar from "./components/Navbar"
import StoryViewer from "./components/StoryViewer"
import NewsPopup from "./components/NewsPopup"
import Home from "./pages/Home"
import ServicesPage from "./pages/ServicesPage"
import ProjectDetail from "./pages/ProjectDetail"
import Login from "./pages/admin/Login"
import AdminDashboard from "./pages/admin/AdminDashboard"
import { Sparkles, X, Send } from "lucide-react"

// Layout helper to conditionally render consumer Navbar & Footer
function MainLayout({
  onOpenStories,
  onOpenQuoteModal,
  children,
}: {
  onOpenStories: () => void
  onOpenQuoteModal: () => void
  children: React.ReactNode
}) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith("/admin")

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && (
        <Navbar
          onOpenStories={onOpenStories}
          onOpenQuoteModal={onOpenQuoteModal}
        />
      )}
      <main className="flex-grow">{children}</main>
      {!isAdmin && (
        <footer className="bg-primary text-white py-12 px-6 border-t border-white/5 font-body">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h3 className="font-headings text-lg font-bold tracking-tight text-white mb-4">
                G<span className="text-accent">.</span>ARCHITECTS
              </h3>
              <p className="text-white/60 text-xs leading-relaxed max-w-xs font-light">
                Award-winning spatial design laboratory building organic modern residential and commercial environments worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-headings text-xs font-bold uppercase tracking-wider text-accent mb-4">
                Services
              </h4>
              <ul className="space-y-2.5 text-xs text-white/70 font-light">
                <li>Architectural Planning</li>
                <li>Residential Design</li>
                <li>Commercial Design</li>
                <li>Interior Design</li>
                <li>Landscape Design</li>
                <li>3D Rendering</li>
              </ul>
            </div>
            <div>
              <h4 className="font-headings text-xs font-bold uppercase tracking-wider text-accent mb-4">
                Contact Office
              </h4>
              <ul className="space-y-2.5 text-xs text-white/70 font-light">
                <li>+91 98765 43210</li>
                <li>info@garchitects.com</li>
                <li>Salt Lake Sector 5, Kolkata</li>
              </ul>
            </div>
            <div>
              <h4 className="font-headings text-xs font-bold uppercase tracking-wider text-accent mb-4">
                Follow Us
              </h4>
              <div className="flex gap-4 text-xs text-white/60">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Instagram</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Twitter</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 font-light">
            <span>© 2026 G Architects & Developers. All rights reserved.</span>
            <span className="mt-2 sm:mt-0">Premium Architecture Studio & Developer</span>
          </div>
        </footer>
      )}
    </div>
  )
}

export default function App() {
  const [storiesOpen, setStoriesOpen] = useState(false)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const checkAuth = useAuthStore((state) => state.checkAuth)

  // Lead request form states
  const { createLead } = useAppStore()
  const [leadName, setLeadName] = useState("")
  const [leadEmail, setLeadEmail] = useState("")
  const [leadPhone, setLeadPhone] = useState("")
  const [leadProjectType, setLeadProjectType] = useState("Residential")
  const [leadServiceType, setLeadServiceType] = useState("Architectural Planning")
  const [leadBudget, setLeadBudget] = useState("₹1.5 - 2.5 Cr")
  const [leadMessage, setLeadMessage] = useState("")
  const [leadAttachment, setLeadAttachment] = useState<File | null>(null)
  const [submittingLead, setSubmittingLead] = useState(false)
  const [leadSuccess, setLeadSuccess] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingLead(true)
    
    const formData = new FormData()
    formData.append("name", leadName)
    formData.append("email", leadEmail)
    formData.append("phone", leadPhone)
    formData.append("projectType", leadProjectType)
    formData.append("serviceType", leadServiceType)
    formData.append("budget", leadBudget)
    formData.append("message", leadMessage)
    if (leadAttachment) {
      formData.append("attachment", leadAttachment)
    }

    const success = await createLead(formData)
    setSubmittingLead(false)
    if (success) {
      setLeadSuccess(true)
      // Reset form
      setLeadName("")
      setLeadEmail("")
      setLeadPhone("")
      setLeadMessage("")
      setLeadAttachment(null)
      setTimeout(() => {
        setLeadSuccess(false)
        setQuoteModalOpen(false)
      }, 2000)
    } else {
      alert("Error submitting quote request. Please try again.")
    }
  }

  return (
    <Router>
      <MainLayout
        onOpenStories={() => setStoriesOpen(true)}
        onOpenQuoteModal={() => setQuoteModalOpen(true)}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </MainLayout>

      {/* Daily Stories Modal */}
      {storiesOpen && <StoryViewer onClose={() => setStoriesOpen(false)} />}

      {/* Floating Announcement Popup */}
      <NewsPopup />

      {/* Quote Inquiry Modal */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-body animate-fadeIn">
          {/* Overlay dismissal */}
          <div className="absolute inset-0" onClick={() => setQuoteModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-background rounded-architectural shadow-2xl p-6 md:p-8 overflow-hidden z-10 border border-borderLine">
            <button
              onClick={() => setQuoteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-mutedText hover:text-accent transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] text-accent uppercase font-bold tracking-widest flex items-center gap-1.5 font-headings mb-1">
                <Sparkles size={14} />
                Get Private Consultation
              </span>
              <h3 className="font-headings text-lg font-bold">
                Let's Build Something Extraordinary
              </h3>
              <p className="text-xs text-mutedText mt-1 font-light">
                Submit your project specifications and our senior structural and spatial architects will schedule a detailed brief.
              </p>
            </div>

            {leadSuccess ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Send size={24} />
                </div>
                <h4 className="font-headings text-md font-bold text-primary mb-1">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-mutedText font-light">We will contact you within 24 working hours.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-surface border border-borderLine text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                      placeholder="Gautam Sen"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full bg-surface border border-borderLine text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-surface border border-borderLine text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    placeholder="client@garchitects.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">Project Type</label>
                    <select
                      value={leadProjectType}
                      onChange={(e) => setLeadProjectType(e.target.value)}
                      className="w-full bg-surface border border-borderLine text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    >
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Industrial</option>
                      <option>Other Space</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">Service Required</label>
                    <select
                      value={leadServiceType}
                      onChange={(e) => setLeadServiceType(e.target.value)}
                      className="w-full bg-surface border border-borderLine text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    >
                      <option>Architectural Planning</option>
                      <option>Interior Design</option>
                      <option>Landscape Design</option>
                      <option>Elevation Design</option>
                      <option>Working Drawings</option>
                      <option>3D Visualization</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">Approx Budget</label>
                    <select
                      value={leadBudget}
                      onChange={(e) => setLeadBudget(e.target.value)}
                      className="w-full bg-surface border border-borderLine text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    >
                      <option>₹50 Lakhs - 1.5 Cr</option>
                      <option>₹1.5 - 2.5 Cr</option>
                      <option>₹2.5 - 5.0 Cr</option>
                      <option>₹5.0 Cr +</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">Attachments (Blueprints/Photos)</label>
                    <input
                      type="file"
                      onChange={(e) => setLeadAttachment(e.target.files ? e.target.files[0] : null)}
                      className="w-full bg-surface border border-borderLine text-xs rounded-lg px-2 py-1.5 focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-background file:font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">Project Summary Brief</label>
                  <textarea
                    rows={3}
                    value={leadMessage}
                    onChange={(e) => setLeadMessage(e.target.value)}
                    className="w-full bg-surface border border-borderLine text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent resize-none"
                    placeholder="We want a duplex villa with cliff frontage, passive cooling, and open living spaces..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLead}
                  className="w-full py-3 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded-architectural hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {submittingLead ? "Submitting Request..." : "Request Call Back"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Router>
  )
}
