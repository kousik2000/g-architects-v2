import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // 1. Clean existing records
  await prisma.user.deleteMany()
  await prisma.siteSettings.deleteMany()
  await prisma.projectTag.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.projectDrawing.deleteMany()
  await prisma.projectGallery.deleteMany()
  await prisma.review.deleteMany()
  await prisma.project.deleteMany()
  await prisma.projectCategory.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.partner.deleteMany()
  await prisma.contactLead.deleteMany()
  await prisma.mediaAsset.deleteMany()

  // 2. Create Admin Users
  const hashedPassword = await bcrypt.hash("admin123", 10)
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@garchitects.com",
      password: hashedPassword,
      name: "Gautam Sen",
      role: "SuperAdmin",
    },
  })
  console.log("Seeded SuperAdmin:", superAdmin.email)

  // 3. Create SiteSettings
  const settings = await prisma.siteSettings.create({
    data: {
      heroTitle: "CRAFTING SPATIAL TRANSFORMATIONS",
      heroSubtitle: "Modern architectural studio shaping sustainable & luxurious environments.",
      aboutTitle: "OUR JOURNEY",
      aboutContent: "Founded with a vision of bridging organic curves and functional geometries, G Architects has evolved from a boutique atelier to an award-winning spatial design laboratory. We reject typical box structures in favor of fluid forms, sculptural lines, and passive climate-responsive architectural engineering.",
      contactPhone: "+91 98765 43210",
      contactEmail: "info@garchitects.com",
      officeAddress: "102, Design District, Sector 5, Salt Lake, Kolkata, West Bengal, India",
      socialMedia: JSON.stringify({
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
      }),
      footerContent: "© 2026 G Architects & Developers. All rights reserved.",
    },
  })
  console.log("Seeded default site settings.")

  // 4. Create Categories
  const catPlanning = await prisma.projectCategory.create({
    data: { name: "Architectural Planning", slug: "architectural-planning", description: "Floor plans, structural engineering layouts, and blueprints." }
  })
  const catExterior = await prisma.projectCategory.create({
    data: { name: "Exterior Design", slug: "exterior-design", description: "Villas, luxury residential frontages, and commercial elevations." }
  })
  const catInterior = await prisma.projectCategory.create({
    data: { name: "Interior Design", slug: "interior-design", description: "High-end kitchens, master suites, commercial offices, and retail lobbies." }
  })
  const catLandscape = await prisma.projectCategory.create({
    data: { name: "Landscape Design", slug: "landscape-design", description: "Resort garden layouts, luxury pools, and organic pathways." }
  })
  console.log("Seeded categories.")

  // 5. Create Tags
  const tagVilla = await prisma.tag.create({ data: { name: "Villa" } })
  const tagModern = await prisma.tag.create({ data: { name: "Modern" } })
  const tagLuxury = await prisma.tag.create({ data: { name: "Luxury" } })
  const tagCommercial = await prisma.tag.create({ data: { name: "Commercial" } })
  const tagResidential = await prisma.tag.create({ data: { name: "Residential" } })
  const tagSustainable = await prisma.tag.create({ data: { name: "Sustainable" } })
  console.log("Seeded project tags.")

  // 6. Seed Projects
  // Project 1: Villa Horizon (Exterior Design, Luxury, Completed, Before/After)
  const p1 = await prisma.project.create({
    data: {
      title: "Villa Horizon",
      slug: "villa-horizon",
      description: "Perched atop a coastal cliff, Villa Horizon combines a dramatic cantilevered concrete envelope with high-efficiency glass screens. The design utilizes architectural passive heating and custom rainwater harvesting networks, embodying an ultra-modern luxury home in perfect harmony with its environment.",
      categoryId: catExterior.id,
      projectType: "Residential Villa",
      location: "Alibaug, Maharashtra",
      area: "5,400 sq ft",
      status: "COMPLETED",
      projectStartDate: new Date("2024-03-15"),
      completionDate: new Date("2025-11-20"),
      coverImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      beforeImage: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      siteArea: "9,000 sq ft",
      builtArea: "5,400 sq ft",
      floors: 2,
      budgetRange: "₹4.5 - 5.5 Cr",
      storyTitle: "Harnessing Oceanic Geometries",
      storyProcess: "Our design process began by analyzing wind trajectories and sunlight angles on the cliff face. We created a modular cantilevered design that limits land impact while maximizing ocean panoramas.",
      storyChallenge: "The primary challenge was structural: stabilizing a 15-meter cantilever over a soft granite cliff while meeting high-wind structural requirements.",
      storySolution: "We anchored the home using deep reinforced pile foundations and deployed a high-tensile structural steel truss frame integrated with a hollow lightweight concrete core.",
      featured: true,
      featuredOrder: 1,
      metaTitle: "Villa Horizon | Luxury Modern Coastal Villa Design",
      metaDescription: "Explore Gautam Sen's award-winning coastal residential masterpiece featuring cantilevered concrete structures and sustainable active passive cooling systems.",
      metaKeywords: "modern villa, cantilevered architecture, alibaug villa, luxury home",
    }
  })

  // Project 2: Zenith Commercial Tower (Exterior Design, Commercial, Construction)
  const p2 = await prisma.project.create({
    data: {
      title: "Zenith Office Tower",
      slug: "zenith-office-tower",
      description: "Zenith Office Tower is an iconic, multi-tiered commercial headquarters. It integrates a twisting structural skeleton to deflect direct sunlight and utilizes internal double-height garden atriums to support passive ventilation.",
      categoryId: catExterior.id,
      projectType: "Corporate Office Hub",
      location: "Sector 5, Salt Lake, Kolkata",
      area: "85,000 sq ft",
      status: "CONSTRUCTION",
      projectStartDate: new Date("2025-01-10"),
      completionDate: new Date("2027-06-30"),
      coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      siteArea: "32,000 sq ft",
      builtArea: "85,000 sq ft",
      floors: 12,
      budgetRange: "₹25 - 30 Cr",
      storyTitle: "Sculpting the Twisting Skyscraper",
      storyProcess: "Developing a corporate hub required analyzing high density workflows and urban constraints to create a fluid, vertical tower.",
      storyChallenge: "Reducing the heat island effect and structural grid sizing on a tight corner city plot.",
      storySolution: "We introduced a 15-degree structural twist and built living vertical green walls along the eastern and western facades.",
      featured: true,
      featuredOrder: 2,
    }
  })

  // Project 3: Minimalist Penthouse (Interior Design, Residential, Completed)
  const p3 = await prisma.project.create({
    data: {
      title: "Minimalist Penthouse",
      slug: "minimalist-penthouse",
      description: "A high-end interior transformation featuring seamless concrete floors, floating solid oak ceilings, and concealed spatial controls. Designed for visual quietness, every cabinet and fixture blends into the wall geometries.",
      categoryId: catInterior.id,
      projectType: "Luxury Penthouse Interior",
      location: "Gurugram, Haryana",
      area: "3,200 sq ft",
      status: "COMPLETED",
      projectStartDate: new Date("2024-08-01"),
      completionDate: new Date("2025-02-15"),
      coverImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      siteArea: "3,200 sq ft",
      builtArea: "3,200 sq ft",
      floors: 1,
      budgetRange: "₹1.2 - 1.8 Cr",
      storyTitle: "The Art of Visual Silence",
      storyProcess: "We stripped away baseboards, door trims, and visible lighting trims to establish absolute alignment of joints and planes.",
      storyChallenge: "Concealing heavy structural air ducts and smart home automation arrays without dropping ceilings below 3 meters.",
      storySolution: "We milled custom shadowline wall reveals that hide returns and integrated touchpanels behind magnetic timber panels.",
      featured: false,
    }
  })

  // Project 4: Oasis Resort & Spa (Landscape Design, Luxury, Concept)
  const p4 = await prisma.project.create({
    data: {
      title: "Oasis Wellness Resort",
      slug: "oasis-wellness-resort",
      description: "An eco-conscious wellness landscape integrating natural bioswales, stepping stone corridors, and mineral springs. The landscape design curves around existing old trees, respecting local geography.",
      categoryId: catLandscape.id,
      projectType: "Wellness Retreat",
      location: "Munnar, Kerala",
      area: "12 Acres",
      status: "CONCEPT",
      projectStartDate: new Date("2025-05-01"),
      completionDate: new Date("2026-12-01"),
      coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      siteArea: "12 Acres",
      builtArea: "1.5 Acres",
      floors: 1,
      budgetRange: "₹15 - 18 Cr",
      storyTitle: "Preserving Munnar's Slopes",
      storyProcess: "Mapping the site's organic contour lines to define paths that follow natural runoff basins.",
      storyChallenge: "Building luxury resort rooms along a steep, muddy mountain gradient prone to monsoon mudslides.",
      storySolution: "We created timber-stilted cabins and anchored pathways using native deep-root vetiver grass networks.",
      featured: true,
      featuredOrder: 3,
    }
  })

  // 7. Associate Tags with Projects
  await prisma.projectTag.createMany({
    data: [
      { projectId: p1.id, tagId: tagVilla.id },
      { projectId: p1.id, tagId: tagModern.id },
      { projectId: p1.id, tagId: tagLuxury.id },
      { projectId: p1.id, tagId: tagResidential.id },

      { projectId: p2.id, tagId: tagModern.id },
      { projectId: p2.id, tagId: tagCommercial.id },
      { projectId: p2.id, tagId: tagSustainable.id },

      { projectId: p3.id, tagId: tagModern.id },
      { projectId: p3.id, tagId: tagLuxury.id },
      { projectId: p3.id, tagId: tagResidential.id },

      { projectId: p4.id, tagId: tagLuxury.id },
      { projectId: p4.id, tagId: tagSustainable.id },
    ]
  })

  // 8. Seed Project Gallery Images (with displayOrder)
  await prisma.projectGallery.createMany({
    data: [
      { projectId: p1.id, imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
      { projectId: p1.id, imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", displayOrder: 1 },
      { projectId: p1.id, imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", displayOrder: 2 },

      { projectId: p3.id, imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
      { projectId: p3.id, imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80", displayOrder: 1 },
    ]
  })

  // 9. Seed Project Technical Drawings
  await prisma.projectDrawing.createMany({
    data: [
      { projectId: p1.id, title: "Main Site Layout Plan", drawingType: "Floor Plan", fileUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
      { projectId: p1.id, title: "North-West Structural Elevation", drawingType: "Elevation", fileUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80", displayOrder: 1 },
      
      { projectId: p2.id, title: "Level 1-5 Ventilation Layouts", drawingType: "Working Drawing", fileUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
    ]
  })

  // 10. Seed Team Members (with displayOrder)
  await prisma.teamMember.createMany({
    data: [
      { name: "Gautam Sen", designation: "Principal Architect & Founder", bio: "With 20+ years designing projects across Europe and Asia, Gautam leads G Architects' spatial design research.", profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80", displayOrder: 0 },
      { name: "Sanjana Roy", designation: "Partner & Lead Interior Designer", bio: "Sanjana specializes in visual tranquility and custom millwork designs. She holds a Masters in Architecture from Milan.", profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80", displayOrder: 1 },
      { name: "Vikram Malhotra", designation: "Director of Landscape Engineering", bio: "Vikram blends active hydrological design with organic flora layouts. He leads our sustainable site infrastructure.", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80", displayOrder: 2 },
    ]
  })

  // 11. Seed Reviews (linked to projects)
  await prisma.review.createMany({
    data: [
      { clientName: "Amitabh Singhania", rating: 5, review: "The spatial planning of Villa Horizon exceeded our wildest dreams. Sitting in the cantilevered lounge feels like floating over the ocean. True architectural masters.", projectId: p1.id },
      { clientName: "Devika & Rohan Mehta", rating: 5, review: "The interior team transformed our Haryana penthouse into a sanctuary. The absolute clean alignments, hidden doors, and lighting design reflect phenomenal execution detail.", projectId: p3.id },
    ]
  })

  // 12. Seed Activities (Instagram Stories)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 3)
  await prisma.activity.createMany({
    data: [
      { title: "Pouring concrete slabs at Zenith Tower Site", mediaUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80", mediaType: "image", displayOrder: 0, expiryDate: tomorrow },
      { title: "Reviewing materials palette for MUNNAR Oasis project", mediaUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80", mediaType: "image", displayOrder: 1, expiryDate: tomorrow },
      { title: "Initial concept sketch for a new Himalayan chalet", mediaUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80", mediaType: "image", displayOrder: 2, expiryDate: tomorrow },
    ]
  })

  // 13. Seed Announcement (active popup)
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  await prisma.announcement.create({
    data: {
      title: "EXCLUSIVE PRIVATE CONSULTATION OFFER",
      content: "Book a direct spatial design review with Gautam Sen at our Kolkata studio this month. Limited to 5 private developers. Email us at consult@garchitects.com to secure your slot.",
      startDate: new Date(),
      endDate: nextMonth,
      active: true,
    }
  })

  // 14. Seed Partners
  await prisma.partner.createMany({
    data: [
      { name: "LafargeHolcim India", logo: "LafargeHolcim", website: "https://www.lafargeholcim.com" },
      { name: "Tata Steel Construction", logo: "Tata Steel", website: "https://www.tatasteel.com" },
      { name: "Saint-Gobain Glass", logo: "Saint-Gobain", website: "https://www.saint-gobain.com" },
      { name: "Schneider Electric Domotics", logo: "Schneider Electric", website: "https://www.se.com" },
    ]
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
