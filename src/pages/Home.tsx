import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAppStore } from "../store/appStore"
import BeforeAfterSlider from "../components/BeforeAfterSlider"
import {
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  ChevronDown,
  Building,
  CheckCircle,
  HelpCircle,
  Star,
  Users,
} from "lucide-react"

export default function Home() {
  const {
    projects,
    fetchProjects,
    categories,
    fetchCategories,
    tags,
    fetchTags,
    team,
    fetchTeam,
    reviews,
    fetchReviews,
    settings,
    fetchSettings,
    partners,
    fetchPartners,
  } = useAppStore()

  const navigate = useNavigate()

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects()
    fetchCategories()
    fetchTags()
    fetchTeam()
    fetchReviews()
    fetchSettings()
    fetchPartners()
  }, [])

  // Filter projects on filter changes
  useEffect(() => {
    fetchProjects({
      category: selectedCategory,
      tag: selectedTag,
      status: selectedStatus,
    })
  }, [selectedCategory, selectedTag, selectedStatus])

  // Simple visual cursor tracking for hero parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Status visual indicators mapping
  const getStatusBadge = (status: string) => {
    const maps: Record<string, { bg: string, text: string }> = {
      CONCEPT: { bg: "bg-blue-500/10", text: "text-blue-600" },
      DESIGN: { bg: "bg-purple-500/10", text: "text-purple-600" },
      APPROVAL: { bg: "bg-yellow-500/10", text: "text-yellow-600" },
      CONSTRUCTION: { bg: "bg-orange-500/10", text: "text-orange-600" },
      COMPLETED: { bg: "bg-green-500/10", text: "text-green-600" },
    }
    const val = maps[status] || { bg: "bg-gray-500/10", text: "text-gray-600" }
    return (
      <span className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded ${val.bg} ${val.text}`}>
        {status}
      </span>
    )
  }

  // Predefined FAQ list
  const faqs = [
    {
      q: "What is your spatial architectural design philosophy?",
      a: "Our work is inspired by natural contour lines and double-height structural spans. We replace standard box configurations with organic curves, double cantilevered sections, and climate responsive passive cooling setups.",
    },
    {
      q: "Do you offer construction documentation alongside 3D renderings?",
      a: "Yes. We supply fully detailed architectural working drawings, electrical/plumbing schedules, site permissions, and material quantity take-offs alongside state-of-the-art 3D visualizations.",
    },
    {
      q: "How does the admin dashboard manage site updates?",
      a: "The dashboard offers full CRUD setups to publish active projects, drawings, client reviews, Instagram-style daily construction stories, and global site text details.",
    },
    {
      q: "Can SQLite database scale to PostgreSQL?",
      a: "Yes. The system utilizes Prisma ORM configured with cross-compatible schemas, meaning transitioning the database layer to PostgreSQL involves a single line switch in schema.prisma.",
    },
  ]

  // Filter lists — safe fallbacks to prevent crash if store hasn't hydrated yet
  const activeProjects = (projects ?? []).filter((p) => !p.deletedAt)
  const featuredProjects = activeProjects.filter((p) => p.featured)

  return (
    <div className="overflow-x-hidden bg-background font-body min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Background Overlay mesh drawings */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none border-dashed border-r border-primary/20" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center z-10">
          {/* Left Side Info */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest flex items-center gap-1.5 font-headings mb-3">
              <Sparkles size={12} />
              Award Winning Architectural Studio
            </span>
            <h1 className="font-headings text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-primary tracking-tight mb-6">
              {settings?.heroTitle || "CRAFTING SPATIAL TRANSFORMATIONS"}
            </h1>
            <p className="text-sm md:text-base text-mutedText font-light max-w-lg mb-8 leading-relaxed">
              {settings?.heroSubtitle || "Modern architectural studio shaping sustainable & luxurious environments."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => {
                  const el = document.getElementById("portfolio")
                  if (el) el.scrollIntoView({ behavior: "smooth" })
                }}
                className="px-8 py-3.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-architectural hover:bg-accent transition-colors duration-300 flex items-center justify-center gap-2"
              >
                View Portfolio
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("contact")
                  if (el) el.scrollIntoView({ behavior: "smooth" })
                }}
                className="px-8 py-3.5 bg-transparent border border-primary text-primary text-xs font-bold tracking-widest uppercase rounded-architectural hover:bg-primary/5 transition-colors duration-300"
              >
                Let's Collab
              </button>
            </div>

            {/* Micro stats widgets */}
            <div className="grid grid-cols-3 gap-6 mt-12 border-t border-borderLine pt-8 w-full">
              <div>
                <span className="text-xl sm:text-2xl font-headings font-black text-primary block">15+</span>
                <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Years Exp</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-headings font-black text-primary block">85+</span>
                <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Projects</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-headings font-black text-primary block">12+</span>
                <span className="text-[10px] text-mutedText uppercase font-bold tracking-wider">Design Awards</span>
              </div>
            </div>
          </div>

          {/* Right Side Visuals - Drifting project cards */}
          <div
            className="lg:col-span-6 relative w-full h-[350px] sm:h-[450px] flex items-center justify-center"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
              transition: "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {/* Card 1 */}
            <div className="absolute w-[200px] sm:w-[280px] aspect-[4/5] bg-surface rounded-architectural shadow-architectural border border-borderLine p-3 top-0 left-4 rotate-[-4deg] hover:rotate-0 hover:z-20 hover:scale-105 transition-all duration-300">
              <div className="w-full h-[75%] rounded-lg overflow-hidden bg-borderLine mb-2">
                <img
                  src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80"
                  alt="Villa Horizon"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[9px] uppercase font-bold text-accent font-headings">Featured Project</span>
              <h4 className="font-headings text-xs font-bold text-primary truncate mt-0.5">VILLA HORIZON</h4>
              <p className="text-[9px] text-mutedText">Alibaug, India</p>
            </div>

            {/* Card 2 */}
            <div className="absolute w-[180px] sm:w-[240px] aspect-[4/5] bg-surface rounded-architectural shadow-architectural border border-borderLine p-3 bottom-0 right-4 rotate-[6deg] hover:rotate-0 hover:z-20 hover:scale-105 transition-all duration-300">
              <div className="w-full h-[75%] rounded-lg overflow-hidden bg-borderLine mb-2">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
                  alt="Zenith Commercial Tower"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[9px] uppercase font-bold text-accent font-headings">Under Construction</span>
              <h4 className="font-headings text-xs font-bold text-primary truncate mt-0.5">ZENITH OFFICE TOWER</h4>
              <p className="text-[9px] text-mutedText">Kolkata, India</p>
            </div>

            {/* Background architectural grid circle wireframe */}
            <div className="absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] border border-accent/15 rounded-full pointer-events-none z-[-1] animate-spin" style={{ animationDuration: "120s" }} />
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section id="services" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-borderLine">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
            Capabilities
          </span>
          <h2 className="font-headings text-3xl md:text-4xl font-extrabold text-primary mb-4">
            Studio Capabilities
          </h2>
          <p className="text-xs md:text-sm text-mutedText font-light">
            We provide full-service development, from regulatory layouts to high-fidelity 3D renderings and structural blueprints.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Architectural Planning",
              desc: "Complete layouts, site elevations, and regulatory blueprints matching structural specifications.",
            },
            {
              title: "Residential Design",
              desc: "High-end duplexes, villas, and apartments combining glass cantilever spans and passive ventilation.",
            },
            {
              title: "Commercial Design",
              desc: "Multi-tenant business hubs, storefront elevations, and workspaces optimization.",
            },
            {
              title: "Interior Architecture",
              desc: "Sleek, minimalist residential lobbies, custom storage wood millwork, and lighting grids.",
            },
            {
              title: "Landscape Design",
              desc: "Eco-friendly resort trails, pool pavilions, and active rainwater drainage contouring.",
            },
            {
              title: "3D Rendering & Visualization",
              desc: "Immersive high-fidelity visual fly-throughs showing textures and light conditions.",
            },
          ].map((srv, idx) => (
            <div
              key={idx}
              className="bg-white rounded-architectural border border-borderLine p-6 shadow-architectural hover:shadow-architecturalHover hover:border-accent transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-architectural bg-background flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors duration-300 mb-6 shadow-inner">
                  <Building size={18} />
                </div>
                <h3 className="font-headings text-md font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                  {srv.title}
                </h3>
                <p className="text-xs text-mutedText leading-relaxed font-light">
                  {srv.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-borderLine flex items-center justify-between text-[10px] font-bold tracking-widest text-primary uppercase">
                <span>Explore Spec</span>
                <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent hover:text-primary transition-colors"
          >
            View Service Detail
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 3. ABOUT & TIMELINE SECTION */}
      <section id="about" className="py-24 bg-surface border-y border-borderLine">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Story info */}
            <div className="lg:col-span-5">
              <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
                Company Legacy
              </span>
              <h2 className="font-headings text-3xl md:text-4xl font-extrabold text-primary mb-6">
                {settings?.aboutTitle || "OUR JOURNEY"}
              </h2>
              <p className="text-xs md:text-sm text-mutedText font-light leading-relaxed mb-6">
                {settings?.aboutContent ||
                  "Founded with a vision of bridging organic curves and functional geometries, G Architects has evolved from a boutique atelier to an award-winning spatial design laboratory. We reject typical box structures in favor of fluid forms, sculptural lines, and passive climate-responsive architectural engineering."}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-background rounded-architectural p-4 border border-borderLine">
                  <span className="text-2xl font-black font-headings text-primary block">85+</span>
                  <span className="text-[9px] text-mutedText uppercase font-bold tracking-wider">Completed Projects</span>
                </div>
                <div className="bg-background rounded-architectural p-4 border border-borderLine">
                  <span className="text-2xl font-black font-headings text-primary block">30+</span>
                  <span className="text-[9px] text-mutedText uppercase font-bold tracking-wider">Cities Served</span>
                </div>
              </div>
            </div>

            {/* Right Horizontal Timeline */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Studio Milestones
              </h3>

              <div className="relative border-l border-borderLine pl-6 space-y-8">
                {[
                  {
                    year: "2012",
                    title: "Foundation of G Architects",
                    desc: "Atelier founded in Kolkata with two architects designing private flats.",
                  },
                  {
                    year: "2016",
                    title: "First Cantilever Villa",
                    desc: "Completed Villa Vista in Alibaug, gaining national architectural press features.",
                  },
                  {
                    year: "2020",
                    title: "Green Commercial Expansion",
                    desc: "Opened Noida office to design carbon-neutral commercial buildings.",
                  },
                  {
                    year: "2026",
                    title: "Spatial Labs Setup",
                    desc: "Deploying immersive client VR visual rooms and local active tracking.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Ring indicator */}
                    <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-accent bg-white group-hover:bg-accent transition-colors" />
                    
                    <div className="bg-background border border-borderLine rounded-architectural p-5 hover:border-accent transition-all duration-300 shadow-sm">
                      <span className="font-headings text-xs font-extrabold text-accent block mb-1">
                        {item.year}
                      </span>
                      <h4 className="font-headings text-sm font-bold text-primary mb-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-mutedText leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BEFORE/AFTER SLIDER SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="max-w-xl mx-auto mb-16">
          <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
            Transformation Gallery
          </span>
          <h2 className="font-headings text-3xl md:text-4xl font-extrabold text-primary mb-4">
            Spatial Evolutions
          </h2>
          <p className="text-xs md:text-sm text-mutedText font-light">
            Slide the handle horizontally to view the transition from raw site grading coordinates to completed spatial designs.
          </p>
        </div>

        <BeforeAfterSlider
          beforeImage="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80"
          afterImage="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
          title="Villa Horizon Site Evolution — Coastal Ridge"
        />
      </section>

      {/* 5. PORTFOLIO SHOWCASE */}
      <section id="portfolio" className="py-24 bg-surface border-t border-borderLine">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
                Selected Work
              </span>
              <h2 className="font-headings text-3xl md:text-4xl font-extrabold text-primary">
                Featured Portfolio
              </h2>
            </div>

            {/* Filter buttons dropdown controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-background border border-borderLine text-xs font-semibold rounded-architectural px-3.5 py-2 focus:outline-none focus:border-accent"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Tag selector */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-background border border-borderLine text-xs font-semibold rounded-architectural px-3.5 py-2 focus:outline-none focus:border-accent"
              >
                <option value="">All Tags</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Status selector */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-background border border-borderLine text-xs font-semibold rounded-architectural px-3.5 py-2 focus:outline-none focus:border-accent"
              >
                <option value="">All Statuses</option>
                <option value="CONCEPT">Concept</option>
                <option value="DESIGN">Design</option>
                <option value="APPROVAL">Approval</option>
                <option value="CONSTRUCTION">Construction</option>
                <option value="COMPLETED">Completed</option>
              </select>

              {/* Clear filters */}
              {(selectedCategory || selectedTag || selectedStatus) && (
                <button
                  onClick={() => {
                    setSelectedCategory("")
                    setSelectedTag("")
                    setSelectedStatus("")
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-accent px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Project Showcase Masonry/Grid */}
          {activeProjects.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-borderLine rounded-architectural bg-background">
              <Layers className="mx-auto text-mutedText opacity-40 mb-3" size={32} />
              <h3 className="font-headings text-sm font-bold text-primary">No Projects Match Filters</h3>
              <p className="text-xs text-mutedText font-light mt-1">Try resetting the tags and category choices.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.slug}`)}
                  className="bg-background rounded-architectural border border-borderLine overflow-hidden shadow-architectural hover:shadow-architecturalHover group cursor-pointer transition-all duration-300"
                >
                  {/* Photo area */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-borderLine">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    />
                    
                    {/* Status badge */}
                    <div className="absolute top-4 left-4 z-10">
                      {getStatusBadge(proj.status)}
                    </div>

                    {/* Featured label */}
                    {proj.featured && (
                      <div className="absolute top-4 right-4 bg-accent text-white text-[9px] uppercase font-black px-2.5 py-1 rounded tracking-wider shadow">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Metadatas block */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] text-accent uppercase font-bold tracking-widest font-headings">
                        {proj.category?.name}
                      </span>
                      <span className="text-mutedText/30">•</span>
                      <span className="text-[10px] text-mutedText font-medium">
                        {proj.location}
                      </span>
                    </div>

                    <h3 className="font-headings text-lg font-bold text-primary group-hover:text-accent transition-colors duration-300 mb-3">
                      {proj.title}
                    </h3>
                    
                    <p className="text-xs text-mutedText font-light leading-relaxed mb-6 line-clamp-2">
                      {proj.description}
                    </p>

                    {/* Technical details grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-borderLine pt-4 text-[10px] font-bold text-primary uppercase">
                      <div>
                        <span className="text-mutedText font-light text-[8px] tracking-wider block">Scope type</span>
                        {proj.projectType}
                      </div>
                      <div>
                        <span className="text-mutedText font-light text-[8px] tracking-wider block">Built Area</span>
                        {proj.area}
                      </div>
                      <div>
                        <span className="text-mutedText font-light text-[8px] tracking-wider block">Est budget</span>
                        {proj.budgetRange || "NDA"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. MEET THE TEAM */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-borderLine">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
            The Planners
          </span>
          <h2 className="font-headings text-3xl md:text-4xl font-extrabold text-primary mb-4">
            Meet Our Leadership Team
          </h2>
          <p className="text-xs md:text-sm text-mutedText font-light">
            Our directors hold advanced engineering credentials from major world laboratories, supervising every structural brief.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-architectural border border-borderLine p-5 shadow-architectural hover:border-accent transition-colors duration-300"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-borderLine mb-5">
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              <h3 className="font-headings text-md font-bold text-primary mb-1">
                {member.name}
              </h3>
              <span className="text-[9px] uppercase font-bold text-accent tracking-widest block mb-4">
                {member.designation}
              </span>
              <p className="text-xs text-mutedText leading-relaxed font-light">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CLIENT TESTIMONIALS */}
      <section id="reviews" className="py-24 bg-surface border-t border-borderLine">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
              Testimonials
            </span>
            <h2 className="font-headings text-3xl md:text-4xl font-extrabold text-primary mb-4">
              Developer Reviews
            </h2>
            <p className="text-xs md:text-sm text-mutedText font-light">
              Read how developers and private luxury landowners describe our spatial planning and project executions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.filter((r) => !r.deletedAt).map((rev) => (
              <div
                key={rev.id}
                className="bg-background rounded-architectural border border-borderLine p-6 shadow-architectural relative overflow-hidden flex flex-col justify-between"
              >
                {/* Visual quote indicator */}
                <div className="absolute top-4 right-4 text-accent/15 font-black text-6xl font-headings select-none pointer-events-none">
                  “
                </div>

                <div>
                  {/* Stars list */}
                  <div className="flex gap-1 mb-4 text-accent">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-primary font-medium italic leading-relaxed mb-6">
                    "{rev.review}"
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-borderLine pt-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-headings font-bold text-accent text-sm shadow-sm shrink-0">
                    {rev.clientName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary leading-tight">
                      {rev.clientName}
                    </h4>
                    {rev.project && (
                      <span className="text-[9px] text-mutedText font-medium">
                        Linked: {rev.project.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INFINITE LOGO WALL */}
      <section className="py-16 bg-primary overflow-hidden relative select-none">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

        <div className="flex items-center w-[200%] animate-marquee gap-16 text-white/40 uppercase font-headings font-bold text-xs tracking-widest">
          {/* First run */}
          {partners.filter((p) => !p.deletedAt).map((part) => (
            <div key={part.id} className="flex items-center gap-3 shrink-0">
              <div className="w-4 h-4 bg-accent rounded-full shrink-0" />
              <span>{part.name}</span>
            </div>
          ))}
          {/* Second run to double elements for infinite loops */}
          {partners.filter((p) => !p.deletedAt).map((part) => (
            <div key={`dup-${part.id}`} className="flex items-center gap-3 shrink-0">
              <div className="w-4 h-4 bg-accent rounded-full shrink-0" />
              <span>{part.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
            Faq
          </span>
          <h2 className="font-headings text-3xl md:text-4xl font-extrabold text-primary mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx
            return (
              <div
                key={idx}
                className="bg-white rounded-architectural border border-borderLine shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-headings font-bold text-sm text-primary hover:text-accent transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-mutedText transition-transform duration-300 ${
                      isOpen ? "rotate-185 text-accent" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[200px]" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-6 text-xs text-mutedText leading-relaxed font-light border-t border-borderLine pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 10. CONTACT FORM SECTION */}
      <section id="contact" className="py-24 bg-surface border-t border-borderLine">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left side details */}
            <div className="lg:col-span-5">
              <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
                Let's Collab
              </span>
              <h2 className="font-headings text-3xl sm:text-4xl font-black text-primary mb-6 leading-tight">
                Let's Build Something Extraordinary.
              </h2>
              <p className="text-xs md:text-sm text-mutedText font-light leading-relaxed mb-8">
                Reach out to schedule a private walkthrough design call at our offices or arrange a remote coordination session.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-architectural border border-borderLine flex items-center justify-center text-accent shrink-0">
                    <Building size={16} />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-mutedText font-bold">Office Address</span>
                    <p className="text-xs text-primary leading-snug mt-0.5">
                      {settings?.officeAddress || "102, Design District, Sector 5, Kolkata, India"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-architectural border border-borderLine flex items-center justify-center text-accent shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-mutedText font-bold">Call Center</span>
                    <p className="text-xs text-primary leading-snug mt-0.5">
                      {settings?.contactPhone || "+91 98765 43210"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-architectural border border-borderLine flex items-center justify-center text-accent shrink-0">
                    <Layers size={16} />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-mutedText font-bold">Project Mailbox</span>
                    <p className="text-xs text-primary leading-snug mt-0.5">
                      {settings?.contactEmail || "info@garchitects.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 rounded-architectural overflow-hidden border border-borderLine h-[200px] bg-background relative shadow-inner">
                {/* Fake design map grids representation */}
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-mutedText uppercase font-bold tracking-widest">
                  Salt Lake Sector V Map Grid Visualizer
                </div>
              </div>
            </div>

            {/* Right side contact form launcher */}
            <div className="lg:col-span-7 bg-background rounded-architectural border border-borderLine p-8 shadow-architectural">
              <h3 className="font-headings text-md font-bold mb-6 text-primary">
                Quick Project Brief Inquiry
              </h3>
              
              <div className="py-6 text-center bg-white/50 border border-dashed border-borderLine rounded-architectural">
                <p className="text-xs text-mutedText font-light mb-4 px-6">
                  Ready to deploy coordinates? Click the get quote button in the header or below to configure files and parameters.
                </p>
                <button
                  onClick={() => {
                    const quoteBtn = document.querySelector('[title="View Daily Updates"]')?.nextElementSibling as HTMLElement
                    if (quoteBtn) quoteBtn.click()
                  }}
                  className="px-6 py-2.5 bg-accent text-white uppercase text-[10px] font-extrabold tracking-widest rounded-architectural shadow hover:bg-primary transition-all duration-300"
                >
                  Configure Quote Request Form
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
