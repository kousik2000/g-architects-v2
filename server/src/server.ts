import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

dotenv.config()

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "g_architects_secret_key_12345"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "g_architects_refresh_secret_key_9876"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(uploadsDir))

// --- Multer File Uploader ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// --- Authentication Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(401).json({ error: "Access token missing" })

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Access token expired or invalid" })
    req.user = user
    next()
  })
}

// Check admin role
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }
    next()
  }
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

app.post("/api/auth/login", async (req: any, res: any) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" })
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    )
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    )

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    })

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/auth/refresh", async (req: any, res: any) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required" })

  try {
    const user = await prisma.user.findFirst({ where: { refreshToken } })
    if (!user) return res.status(403).json({ error: "Invalid refresh token" })

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Refresh token expired" })

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      )
      res.json({ accessToken: newAccessToken })
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/auth/logout", async (req: any, res: any) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(200).json({ message: "Logged out" })

  try {
    const user = await prisma.user.findFirst({ where: { refreshToken } })
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      })
    }
    res.json({ message: "Logged out successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/auth/verify", authenticateToken, (req: any, res: any) => {
  res.json({ valid: true, user: req.user })
})

// ==========================================
// 2. SITE SETTINGS CMS ENDPOINTS
// ==========================================

app.get("/api/settings", async (req: any, res: any) => {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: "global-settings" } })
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "global-settings" } })
    }
    res.json(settings)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/settings", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const {
    heroTitle, heroSubtitle, aboutTitle, aboutContent,
    contactPhone, contactEmail, officeAddress, socialMedia, footerContent,
    yearsExperience, totalProjectsCount, designAwardsCount,
    showSpatialEvolutions, showTeam, showFaq,
    milestones, mapEmbedUrl,
  } = req.body
  try {
    const settings = await prisma.siteSettings.update({
      where: { id: "global-settings" },
      data: {
        heroTitle, heroSubtitle, aboutTitle, aboutContent,
        contactPhone, contactEmail, officeAddress, socialMedia, footerContent,
        yearsExperience: yearsExperience !== undefined ? parseInt(yearsExperience) : undefined,
        totalProjectsCount: totalProjectsCount !== undefined ? parseInt(totalProjectsCount) : undefined,
        designAwardsCount: designAwardsCount !== undefined ? parseInt(designAwardsCount) : undefined,
        showSpatialEvolutions: showSpatialEvolutions !== undefined ? Boolean(showSpatialEvolutions) : undefined,
        showTeam: showTeam !== undefined ? Boolean(showTeam) : undefined,
        showFaq: showFaq !== undefined ? Boolean(showFaq) : undefined,
        milestones: milestones !== undefined ? milestones : undefined,
        mapEmbedUrl: mapEmbedUrl !== undefined ? mapEmbedUrl : undefined,
      },
    })
    res.json(settings)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 3. MEDIA LIBRARY ENDPOINTS
// ==========================================

app.get("/api/media", authenticateToken, async (req: any, res: any) => {
  try {
    const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } })
    res.json(assets)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/media/upload", authenticateToken, upload.single("file"), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" })

  const filePath = `/uploads/${req.file.filename}`
  const fileType = req.file.mimetype.startsWith("image/") ? "image" : req.file.mimetype.startsWith("video/") ? "video" : "drawing"

  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: req.file.originalname,
        filePath,
        fileType,
        fileSize: req.file.size,
      },
    })
    res.status(201).json(asset)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/media/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } })
    if (!asset) return res.status(404).json({ error: "Asset not found" })

    // Remove from disk
    const diskPath = path.join(__dirname, "..", asset.filePath)
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath)
    }

    await prisma.mediaAsset.delete({ where: { id: req.params.id } })
    res.json({ message: "Asset deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 4. PROJECT CATEGORY ENDPOINTS
// ==========================================

app.get("/api/categories", async (req: any, res: any) => {
  try {
    const cats = await prisma.projectCategory.findMany({ orderBy: { name: "asc" } })
    res.json(cats)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/categories", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, description } = req.body
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  try {
    const cat = await prisma.projectCategory.create({
      data: { name, description, slug },
    })
    res.status(201).json(cat)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/categories/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, description } = req.body
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  try {
    const cat = await prisma.projectCategory.update({
      where: { id: req.params.id },
      data: { name, description, slug },
    })
    res.json(cat)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/categories/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    // Check if category has active projects
    const count = await prisma.project.count({ where: { categoryId: req.params.id, deletedAt: null } })
    if (count > 0) {
      return res.status(400).json({ error: "Cannot delete category linked to active projects" })
    }
    await prisma.projectCategory.delete({ where: { id: req.params.id } })
    res.json({ message: "Category deleted" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 5. PROJECT TAGS ENDPOINTS
// ==========================================

app.get("/api/tags", async (req: any, res: any) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } })
    res.json(tags)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/tags", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name } = req.body
  try {
    const tag = await prisma.tag.create({ data: { name } })
    res.status(201).json(tag)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/tags/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await prisma.tag.delete({ where: { id: req.params.id } })
    res.json({ message: "Tag deleted" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 6. PROJECTS MODULE
// ==========================================

app.get("/api/projects", async (req: any, res: any) => {
  const { category, tag, status, includeDeleted } = req.query
  try {
    const filter: any = {}

    // Exclude deleted projects by default
    if (includeDeleted !== "true") {
      filter.deletedAt = null
    }

    if (category) {
      filter.category = { slug: category }
    }

    if (status) {
      filter.status = status
    }

    if (tag) {
      filter.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      };
    }

    const projects = await prisma.project.findMany({
      where: filter,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: [
        { featured: "desc" },
        { featuredOrder: "asc" },
        { createdAt: "desc" },
      ],
    })
    res.json(projects)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/projects/:slug", async (req: any, res: any) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        gallery: { orderBy: { displayOrder: "asc" } },
        drawings: { orderBy: { displayOrder: "asc" } },
        tags: { include: { tag: true } },
        reviews: { where: { deletedAt: null } },
      },
    })
    if (!project) return res.status(404).json({ error: "Project not found" })
    res.json(project)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/projects", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const {
    title,
    description,
    categoryId,
    projectType,
    location,
    area,
    status,
    projectStartDate,
    completionDate,
    coverImage,
    beforeImage,
    afterImage,
    siteArea,
    builtArea,
    floors,
    budgetRange,
    storyTitle,
    storyProcess,
    storyChallenge,
    storySolution,
    featured,
    featuredOrder,
    metaTitle,
    metaDescription,
    metaKeywords,
    ogImage,
    tags, // Array of Tag IDs
  } = req.body

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  try {
    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        categoryId,
        projectType,
        location,
        area,
        status,
        projectStartDate: projectStartDate ? new Date(projectStartDate) : new Date(),
        completionDate: new Date(completionDate),
        coverImage,
        beforeImage,
        afterImage,
        siteArea,
        builtArea,
        floors: floors ? parseInt(floors) : 1,
        budgetRange,
        storyTitle,
        storyProcess,
        storyChallenge,
        storySolution,
        featured: featured || false,
        featuredOrder: featuredOrder ? parseInt(featuredOrder) : 0,
        metaTitle,
        metaDescription,
        metaKeywords,
        ogImage,
        tags: tags ? {
          create: tags.map((tagId: string) => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } }
      }
    })
    res.status(201).json(project)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/projects/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const {
    title,
    description,
    categoryId,
    projectType,
    location,
    area,
    status,
    projectStartDate,
    completionDate,
    coverImage,
    beforeImage,
    afterImage,
    siteArea,
    builtArea,
    floors,
    budgetRange,
    storyTitle,
    storyProcess,
    storyChallenge,
    storySolution,
    featured,
    featuredOrder,
    metaTitle,
    metaDescription,
    metaKeywords,
    ogImage,
    tags, // Array of Tag IDs
    gallery, // Array of gallery URLs or existing items
    drawings // Array of drawings objects
  } = req.body

  try {
    // 1. Delete existing tags, gallery items, and drawings to rebuild them simply
    await prisma.projectTag.deleteMany({ where: { projectId: req.params.id } })

    // 2. Build update payload
    const updatedData: any = {
      title,
      description,
      categoryId,
      projectType,
      location,
      area,
      status,
      projectStartDate: projectStartDate ? new Date(projectStartDate) : undefined,
      completionDate: completionDate ? new Date(completionDate) : undefined,
      coverImage,
      beforeImage,
      afterImage,
      siteArea,
      builtArea,
      floors: floors ? parseInt(floors) : 1,
      budgetRange,
      storyTitle,
      storyProcess,
      storyChallenge,
      storySolution,
      featured: featured !== undefined ? featured : false,
      featuredOrder: featuredOrder ? parseInt(featuredOrder) : 0,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      tags: tags ? {
        create: tags.map((tagId: string) => ({
          tag: { connect: { id: tagId } }
        }))
      } : undefined,
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: updatedData,
    })

    // Update gallery if provided
    if (gallery && Array.isArray(gallery)) {
      await prisma.projectGallery.deleteMany({ where: { projectId: req.params.id } })
      await prisma.projectGallery.createMany({
        data: gallery.map((url: string, index: number) => ({
          projectId: req.params.id,
          imageUrl: url,
          displayOrder: index,
        })),
      })
    }

    // Update drawings if provided
    if (drawings && Array.isArray(drawings)) {
      await prisma.projectDrawing.deleteMany({ where: { projectId: req.params.id } })
      await prisma.projectDrawing.createMany({
        data: drawings.map((d: any, index: number) => ({
          projectId: req.params.id,
          title: d.title,
          drawingType: d.drawingType,
          fileUrl: d.fileUrl,
          displayOrder: index,
        })),
      })
    }

    res.json(project)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Soft delete
app.post("/api/projects/:id/archive", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    })
    res.json({ message: "Project archived", project })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Restore
app.post("/api/projects/:id/restore", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { deletedAt: null },
    })
    res.json({ message: "Project restored", project })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/projects/:id", authenticateToken, requireRole(["SuperAdmin"]), async (req: any, res: any) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } })
    res.json({ message: "Project permanently deleted" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 7. REVIEWS MODULE
// ==========================================

app.get("/api/reviews", async (req: any, res: any) => {
  const { includeDeleted } = req.query
  try {
    const filter: any = {}
    if (includeDeleted !== "true") {
      filter.deletedAt = null
    }
    const reviews = await prisma.review.findMany({
      where: filter,
      include: { project: true },
      orderBy: { createdAt: "desc" },
    })
    res.json(reviews)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/reviews", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { clientName, clientPhoto, rating, review, projectId } = req.body
  try {
    const rev = await prisma.review.create({
      data: { clientName, clientPhoto, rating: parseInt(rating), review, projectId },
    })
    res.status(201).json(rev)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/reviews/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { clientName, clientPhoto, rating, review, projectId } = req.body
  try {
    const rev = await prisma.review.update({
      where: { id: req.params.id },
      data: { clientName, clientPhoto, rating: parseInt(rating), review, projectId },
    })
    res.json(rev)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/reviews/:id/archive", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await prisma.review.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } })
    res.json({ message: "Review archived" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/reviews/:id/restore", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await prisma.review.update({ where: { id: req.params.id }, data: { deletedAt: null } })
    res.json({ message: "Review restored" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/reviews/:id", authenticateToken, requireRole(["SuperAdmin"]), async (req: any, res: any) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } })
    res.json({ message: "Review permanently deleted" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 8. DAILY ACTIVITIES (STORIES) MODULE
// ==========================================

app.get("/api/activities", async (req: any, res: any) => {
  try {
    const stories = await prisma.activity.findMany({
      where: {
        expiryDate: {
          gt: new Date(),
        },
      },
      orderBy: { displayOrder: "asc" },
    })
    res.json(stories)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/activities", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { title, mediaUrl, thumbnailUrl, mediaType, displayOrder, expiryHours } = req.body
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + (parseInt(expiryHours) || 24))

  try {
    const story = await prisma.activity.create({
      data: {
        title,
        mediaUrl,
        thumbnailUrl,
        mediaType: mediaType || "image",
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        expiryDate,
      },
    })
    res.status(201).json(story)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/activities/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } })
    res.json({ message: "Story deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 9. LATEST NEWS / ANNOUNCEMENT POPUP MODULE
// ==========================================

const announcementInclude = {
  project: { select: { id: true, title: true, slug: true, coverImage: true } },
}

app.get("/api/announcements", async (req: any, res: any) => {
  const now = new Date()
  try {
    const popups = await prisma.announcement.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: "desc" },
      include: announcementInclude,
    })
    res.json(popups)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Admin endpoint to get all popups
app.get("/api/admin/announcements", authenticateToken, async (req: any, res: any) => {
  try {
    const list = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: announcementInclude,
    })
    res.json(list)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/announcements", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { title, content, startDate, endDate, active, imageUrl, externalLink, projectId } = req.body
  try {
    const news = await prisma.announcement.create({
      data: {
        title,
        content,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active: active !== undefined ? active : true,
        imageUrl: imageUrl || null,
        externalLink: externalLink || null,
        projectId: projectId || null,
      },
      include: announcementInclude,
    })
    res.status(201).json(news)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/announcements/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { title, content, startDate, endDate, active, imageUrl, externalLink, projectId } = req.body
  try {
    const news = await prisma.announcement.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active,
        imageUrl: imageUrl || null,
        externalLink: externalLink || null,
        projectId: projectId || null,
      },
      include: announcementInclude,
    })
    res.json(news)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/announcements/:id", authenticateToken, requireRole(["SuperAdmin"]), async (req: any, res: any) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } })
    res.json({ message: "Announcement deleted" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 10. PARTNERS MODULE
// ==========================================

app.get("/api/partners", async (req: any, res: any) => {
  const { includeDeleted } = req.query
  try {
    const filter: any = {}
    if (includeDeleted !== "true") {
      filter.deletedAt = null
    }
    const partners = await prisma.partner.findMany({
      where: filter,
      orderBy: { name: "asc" },
    })
    res.json(partners)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/partners", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, logo, website, description } = req.body
  try {
    const part = await prisma.partner.create({ data: { name, logo, website, description } })
    res.status(201).json(part)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/partners/:id/archive", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await prisma.partner.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } })
    res.json({ message: "Partner archived" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/partners/:id/restore", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await prisma.partner.update({ where: { id: req.params.id }, data: { deletedAt: null } })
    res.json({ message: "Partner restored" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/partners/:id", authenticateToken, requireRole(["SuperAdmin"]), async (req: any, res: any) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } })
    res.json({ message: "Partner permanently deleted" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 11. TEAM MEMBERS MODULE
// ==========================================

app.get("/api/team", async (req: any, res: any) => {
  try {
    const list = await prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" } })
    res.json(list)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/team", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, designation, bio, profileImage, displayOrder } = req.body
  try {
    const member = await prisma.teamMember.create({
      data: { name, designation, bio, profileImage, displayOrder: displayOrder ? parseInt(displayOrder) : 0 },
    })
    res.status(201).json(member)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/team/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, designation, bio, profileImage, displayOrder } = req.body
  try {
    const member = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: { name, designation, bio, profileImage, displayOrder: displayOrder ? parseInt(displayOrder) : 0 },
    })
    res.json(member)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/team/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await prisma.teamMember.delete({ where: { id: req.params.id } })
    res.json({ message: "Team member deleted" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 12. CONTACT REQUESTS & LEADS MODULE
// ==========================================

app.post("/api/contact-requests", upload.single("attachment"), async (req: any, res: any) => {
  const { name, phone, email, projectType, serviceType, budget, message, source } = req.body
  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : undefined

  try {
    const lead = await prisma.contactLead.create({
      data: {
        name,
        phone,
        email,
        projectType,
        serviceType: serviceType || "Architectural Planning",
        budget,
        message,
        attachmentUrl,
        source: source || "Website Form",
      },
    })
    res.status(201).json(lead)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/contact-requests", authenticateToken, async (req: any, res: any) => {
  try {
    const leads = await prisma.contactLead.findMany({ orderBy: { createdAt: "desc" } })
    res.json(leads)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.patch("/api/contact-requests/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { status, notes, assignedTo, followUpDate } = req.body
  try {
    const lead = await prisma.contactLead.update({
      where: { id: req.params.id },
      data: {
        status,
        notes,
        assignedTo,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      },
    })
    res.json(lead)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 13. ADMIN OVERVIEW / METRICS WIDGETS
// ==========================================
app.get("/api/admin/metrics", authenticateToken, async (req: any, res: any) => {
  try {
    const totalProjects = await prisma.project.count({ where: { deletedAt: null } })
    const activeProjects = await prisma.project.count({ where: { deletedAt: null, status: { not: "COMPLETED" } } })
    const totalReviews = await prisma.review.count({ where: { deletedAt: null } })
    const newLeads = await prisma.contactLead.count({ where: { status: "New" } })
    const activeStories = await prisma.activity.count({ where: { expiryDate: { gt: new Date() } } })
    const activeAnnouncements = await prisma.announcement.count({ where: { active: true } })

    res.json({
      totalProjects,
      activeProjects,
      totalReviews,
      newLeads,
      activeStories,
      activeAnnouncements,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// --- Server Boot ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
