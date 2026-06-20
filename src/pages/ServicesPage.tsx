import { Link } from "react-router-dom"
import {
  Sparkles,
  Building,
  Layers,
  Award,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  BookmarkCheck,
} from "lucide-react"

export default function ServicesPage() {
  const serviceList = [
    {
      id: "architectural-planning",
      title: "Architectural Planning",
      subtitle: "Regulatory layouts, floor plans, and site maps",
      desc: "Our senior structural designers create comprehensive site coordinates maps, floor spacing schedules, and structural calculations to clear government approvals. We optimize floor space ratios and ensure structural integrity.",
      deliverables: ["Floor Plans", "Elevation Maps", "Permit Documentation"],
    },
    {
      id: "residential-design",
      title: "Residential Design",
      subtitle: "Bespoke modern villas, duplexes, and estates",
      desc: "We design signature luxury residences defined by expansive glass walls, structural concrete overhangs, and dual-aspect spaces. We balance organic materials with state-of-the-art climate responsive structures.",
      deliverables: ["Villa Concept Drafts", "Facade Elevations", "Bespoke Millwork Ideas"],
    },
    {
      id: "commercial-design",
      title: "Commercial Design",
      subtitle: "Twisted tower skins, atriums, and tech hubs",
      desc: "We craft iconic skyscrapers, offices, and retail plazas focusing on high flow logistics and passive solar control. By shaping twist envelopes and natural atriums, we reduce cooling overheads by up to 35%.",
      deliverables: ["Vertical Access Layouts", "Vertical Gardens Setup", "Curtain Wall Specs"],
    },
    {
      id: "interior-design",
      title: "Interior Design",
      subtitle: "Concealed duct systems, shadowline rails, and luxury joinery",
      desc: "Inside our residential penthouses and commercial complexes, we prioritize structural quietness. We eliminate baseboards and trims to achieve seamless connections where walls, ceilings, and floors meet.",
      deliverables: ["Shadowline Joinery Maps", "Reflected Ceiling Grids", "Material Sample Boards"],
    },
    {
      id: "landscape-design",
      title: "Landscape Design",
      subtitle: "Bioswales, mineral pools, and natural contours",
      desc: "We plan site topographies to support natural water drainage, building bioswales, structural retaining walls, and timber trails around old growth trees. Nature is integrated directly into the layout.",
      deliverables: ["Hydrological Contour Drafts", "Native Vegetation Guides", "Deck & Pavilion Plans"],
    },
    {
      id: "working-drawings",
      title: "Working Drawings",
      subtitle: "Electrical paths, mechanical ducts, and reinforcement schedules",
      desc: "Our design drafting department supplies builder-ready documentation, detailing reinforcing rebar grids, HVAC pathways, electrical circuit points, and concrete specifications. Zero guess-work on site.",
      deliverables: ["Rebar Layout Sheets", "HVAC Duct Layouts", "Concealed Electrical Runways"],
    },
    {
      id: "rendering-visualization",
      title: "3D Visualization & Rendering",
      subtitle: "Immersive VR, drone overlays, and shadow simulation",
      desc: "We render high-resolution panoramic fly-throughs simulating local path sunlight and material textures. Clients walk through projects virtually before foundation concrete is poured.",
      deliverables: ["Interactive VR Executables", "Drone Context Overlays", "Daylight Path Studies"],
    },
  ]

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 font-body">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Studio
        </Link>

        {/* Header Summary */}
        <div className="max-w-3xl mb-16">
          <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest flex items-center gap-1.5 font-headings mb-3">
            <Sparkles size={12} />
            Our Spatial Capabilities
          </span>
          <h1 className="font-headings text-4xl sm:text-5xl font-black text-primary mb-6">
            Architectural & Design Services
          </h1>
          <p className="text-sm text-mutedText font-light leading-relaxed">
            G Architects combines structural engineering expertise with modern aesthetics inspired by BIG and Zaha Hadid. We manage every phase, from raw land contour surveys and site approvals to full visual rendering and construction-ready drawings.
          </p>
        </div>

        {/* Core Services List */}
        <div className="space-y-12 mb-20">
          {serviceList.map((srv, idx) => (
            <div
              key={srv.id}
              className="bg-white border border-borderLine rounded-architectural p-8 shadow-architectural grid grid-cols-1 lg:grid-cols-12 gap-8 items-start hover:border-accent transition-colors duration-300"
            >
              {/* Left Column (Info) */}
              <div className="lg:col-span-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-background border border-borderLine rounded-architectural flex items-center justify-center text-accent">
                    <Building size={20} />
                  </div>
                  <div>
                    <h2 className="font-headings text-lg font-bold text-primary">
                      {srv.title}
                    </h2>
                    <span className="text-xs text-mutedText font-medium">
                      {srv.subtitle}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs md:text-sm text-mutedText leading-relaxed font-light mb-6">
                  {srv.desc}
                </p>
              </div>

              {/* Right Column (Deliverables) */}
              <div className="lg:col-span-4 bg-background rounded-architectural p-6 border border-borderLine self-stretch flex flex-col justify-between">
                <div>
                  <h4 className="font-headings text-[10px] font-bold uppercase tracking-wider text-primary mb-3">
                    Project Deliverables
                  </h4>
                  <ul className="space-y-2">
                    {srv.deliverables.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-primary font-medium">
                        <BookmarkCheck size={14} className="text-accent shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    const quoteBtn = document.querySelector('[title="View Daily Updates"]')?.nextElementSibling as HTMLElement
                    if (quoteBtn) quoteBtn.click()
                  }}
                  className="mt-6 w-full py-2 bg-primary text-white uppercase text-[9px] font-bold tracking-widest rounded-architectural hover:bg-accent transition-colors"
                >
                  Inquire For Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Methodology segment */}
        <div className="border-t border-borderLine pt-20">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] text-accent font-bold uppercase tracking-widest font-headings mb-2 block">
              Methodology
            </span>
            <h2 className="font-headings text-2xl md:text-3xl font-extrabold text-primary mb-4">
              Structural Excellence Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "1. Spatial Concept",
                desc: "We analyze site lines, solar angles, and wind corridors to generate a cantilevered spatial plan.",
                icon: <Cpu size={20} />,
              },
              {
                title: "2. Technical Detail",
                desc: "Drafting the working engineering schedules, HVAC routes, and foundation calculations.",
                icon: <Layers size={20} />,
              },
              {
                title: "3. Precision Build",
                desc: "Providing rigorous oversight to ensure the structural concrete and joinery match plans.",
                icon: <ShieldCheck size={20} />,
              },
            ].map((step, i) => (
              <div key={i} className="bg-white border border-borderLine rounded-architectural p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-background border border-borderLine flex items-center justify-center text-accent mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="font-headings text-sm font-bold text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-mutedText leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
