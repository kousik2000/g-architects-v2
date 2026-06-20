import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAppStore } from "../store/appStore"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Award,
} from "lucide-react"

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { fetchProjectBySlug, projects, fetchProjects } = useAppStore()

  const [project, setProject] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (slug) {
      setLoading(true)
      fetchProjectBySlug(slug).then((data) => {
        setProject(data)
        setLoading(false)
      })
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-body">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-headings text-sm font-bold text-primary">Loading Spatial Data...</h3>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-body px-6">
        <div className="text-center max-w-sm">
          <Layers className="mx-auto text-accent mb-4 opacity-80" size={36} />
          <h3 className="font-headings text-md font-bold text-primary mb-2">Project Not Found</h3>
          <p className="text-xs text-mutedText leading-relaxed mb-6 font-light">
            The project details could not be found. It may have been archived by the administrators.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-primary text-white uppercase text-[10px] font-bold tracking-widest rounded-architectural hover:bg-accent transition-colors"
          >
            Back to Studio
          </Link>
        </div>
      </div>
    )
  }

  const allPhotos = [project.coverImage, ...project.gallery.map((g: any) => g.imageUrl)]
  const allDrawings = project.drawings.map((d: any) => d.fileUrl)

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0))
  }

  // Suggest other projects
  const related = projects
    .filter((p) => p.id !== project.id && !p.deletedAt)
    .slice(0, 3)

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 font-body">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Portfolio
        </Link>

        {/* Hero section banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          <div className="lg:col-span-8 rounded-architectural overflow-hidden shadow-architectural border border-borderLine aspect-[16/10] sm:aspect-[16/9] bg-borderLine relative group">
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-full object-cover pointer-events-none"
            />
            <button
              onClick={() => openLightbox(allPhotos, 0)}
              className="absolute bottom-4 right-4 bg-primary/70 backdrop-blur-md hover:bg-accent text-white p-2.5 rounded-full shadow transition-all duration-300 hover:scale-105"
              title="View Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          <div className="lg:col-span-4 bg-white rounded-architectural border border-borderLine p-6 self-stretch flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] text-accent uppercase font-extrabold tracking-widest font-headings mb-1 block">
                {project.category?.name}
              </span>
              <h1 className="font-headings text-2xl sm:text-3xl font-black text-primary mb-6">
                {project.title}
              </h1>

              {/* Specs table list */}
              <div className="space-y-4 border-t border-borderLine pt-6 text-xs">
                <div className="flex items-center justify-between border-b border-borderLine/50 pb-2">
                  <span className="text-mutedText font-light">Location</span>
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <MapPin size={12} className="text-accent" />
                    {project.location}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-borderLine/50 pb-2">
                  <span className="text-mutedText font-light">Built Area</span>
                  <span className="font-semibold text-primary">{project.area}</span>
                </div>
                <div className="flex items-center justify-between border-b border-borderLine/50 pb-2">
                  <span className="text-mutedText font-light">Status Workflow</span>
                  <span className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-accent/10 text-accent">
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-borderLine/50 pb-2">
                  <span className="text-mutedText font-light">Start Date</span>
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <Calendar size={12} className="text-mutedText" />
                    {new Date(project.projectStartDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-borderLine/50 pb-2">
                  <span className="text-mutedText font-light">Completed Date</span>
                  <span className="font-semibold text-primary">
                    {new Date(project.completionDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-mutedText font-light">Budget Scope</span>
                  <span className="font-semibold text-primary">{project.budgetRange || "Confidential (NDA)"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const quoteBtn = document.querySelector('[title="View Daily Updates"]')?.nextElementSibling as HTMLElement
                if (quoteBtn) quoteBtn.click()
              }}
              className="mt-8 w-full py-3.5 bg-primary text-white uppercase text-[10px] font-bold tracking-widest rounded-architectural hover:bg-accent transition-colors"
            >
              Inquire For Similar Specs
            </button>
          </div>
        </div>

        {/* Story details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="lg:col-span-8 bg-white border border-borderLine rounded-architectural p-8 shadow-sm">
            <h2 className="font-headings text-xl font-bold mb-4 text-primary">
              Project Design Narrative
            </h2>
            <p className="text-xs md:text-sm text-mutedText leading-relaxed font-light mb-8">
              {project.description}
            </p>

            {project.storyTitle && (
              <div className="space-y-6 border-t border-borderLine pt-8">
                <h3 className="font-headings text-md font-bold text-accent">
                  {project.storyTitle}
                </h3>
                <div>
                  <h4 className="font-headings text-xs font-bold text-primary mb-2">Design Process</h4>
                  <p className="text-xs text-mutedText leading-relaxed font-light">{project.storyProcess}</p>
                </div>
                <div>
                  <h4 className="font-headings text-xs font-bold text-primary mb-2">Technical Challenges</h4>
                  <p className="text-xs text-mutedText leading-relaxed font-light">{project.storyChallenge}</p>
                </div>
                <div>
                  <h4 className="font-headings text-xs font-bold text-primary mb-2">Custom Spatial Solutions</h4>
                  <p className="text-xs text-mutedText leading-relaxed font-light">{project.storySolution}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Structural details card */}
            <div className="bg-white border border-borderLine rounded-architectural p-6 shadow-sm">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-primary mb-4 border-b border-borderLine pb-3">
                Spatial Statistics
              </h3>
              <div className="space-y-3.5 text-xs text-mutedText">
                <div className="flex justify-between">
                  <span>Site Coverage Area</span>
                  <strong className="text-primary">{project.siteArea || "NDA"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Built Area</span>
                  <strong className="text-primary">{project.builtArea || "NDA"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Floors / Tiers</span>
                  <strong className="text-primary">{project.floors || 1}</strong>
                </div>
              </div>
            </div>

            {/* Project tags filter */}
            {project.tags?.length > 0 && (
              <div className="bg-white border border-borderLine rounded-architectural p-6 shadow-sm">
                <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-primary mb-4 border-b border-borderLine pb-3">
                  Design Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((t: any) => (
                    <span key={t.tag.id} className="text-[10px] font-semibold text-primary px-3 py-1 bg-background border border-borderLine rounded-full">
                      #{t.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        {project.gallery.length > 0 && (
          <div className="mb-20">
            <h2 className="font-headings text-xl font-bold mb-6 text-primary">
              Completed Space Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {project.gallery.map((item: any, index: number) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(allPhotos, index + 1)}
                  className="bg-white border border-borderLine rounded-architectural overflow-hidden shadow-sm aspect-[4/3] group cursor-pointer relative"
                >
                  <img
                    src={item.imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical drawings & blueprints */}
        {project.drawings.length > 0 && (
          <div className="mb-20 border-t border-borderLine pt-16">
            <h2 className="font-headings text-xl font-bold mb-2 text-primary">
              Technical Blueprints & Elevations
            </h2>
            <p className="text-xs text-mutedText font-light mb-6">
              Explore site layouts, floor plan schemes, and facade structural calculations. Click drawing to expand.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {project.drawings.map((draw: any, index: number) => (
                <div
                  key={draw.id}
                  onClick={() => openLightbox(allDrawings, index)}
                  className="bg-white border border-borderLine rounded-architectural p-4 shadow-sm cursor-pointer hover:border-accent transition-colors duration-300"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-background mb-4 border border-borderLine relative group flex items-center justify-center">
                    <img
                      src={draw.fileUrl}
                      alt={draw.title}
                      className="max-h-full object-contain pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 size={18} />
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-headings text-xs font-bold text-primary">{draw.title}</h4>
                      <span className="text-[10px] text-mutedText uppercase font-semibold">{draw.drawingType}</span>
                    </div>
                    <span className="text-[8px] bg-primary text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Drawing Order #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Projects slider */}
        {related.length > 0 && (
          <div className="border-t border-borderLine pt-16">
            <h2 className="font-headings text-xl font-bold mb-6 text-primary">
              Related Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/projects/${item.slug}`)}
                  className="bg-white rounded-architectural border border-borderLine overflow-hidden shadow-sm hover:border-accent group cursor-pointer transition-colors duration-300"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-borderLine">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[9px] uppercase font-bold text-accent tracking-widest block mb-1">
                      {item.category?.name}
                    </span>
                    <h4 className="font-headings text-sm font-bold text-primary group-hover:text-accent transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-mutedText">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center select-none">
          {/* Background overlay click close */}
          <div className="absolute inset-0" onClick={() => setLightboxOpen(false)} />

          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-55"
          >
            <X size={24} />
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-55"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Core Image container */}
          <div className="relative max-w-5xl max-h-[85vh] p-4 flex items-center justify-center z-51">
            <img
              src={lightboxImages[lightboxIndex]}
              alt="Expanded high res"
              className="max-h-full max-w-full object-contain shadow-2xl rounded"
            />
            
            {/* Slide counter */}
            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-xs font-semibold text-white/60 font-body">
              Slide {lightboxIndex + 1} of {lightboxImages.length}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-55"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  )
}
