import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import multer from "multer"
import path from "path"
import fs from "fs"
import crypto from "crypto"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import pool from "./db.js"

dotenv.config()

const app = express()

// --- Nodemailer SMTP Transporter Setup ---
const smtpPort = parseInt(process.env.SMTP_PORT || "587")
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtpout.secureserver.net",
  port: smtpPort,
  secure: smtpPort === 465, // true for 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER || "contact@garchitectsanddevelopers.in",
    pass: process.env.SMTP_PASS || "Saichand765899#",
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 60000,
  debug: true,
  logger: true,
})
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

// --- Helper: Generate UUID ---
const uuid = () => crypto.randomUUID()

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
    const [rows]: any = await pool.execute("SELECT * FROM User WHERE email = ?", [email])
    const user = rows[0]
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
    await pool.execute("UPDATE User SET refreshToken = ? WHERE id = ?", [refreshToken, user.id])

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
    const [rows]: any = await pool.execute("SELECT * FROM User WHERE refreshToken = ?", [refreshToken])
    const user = rows[0]
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
    const [rows]: any = await pool.execute("SELECT * FROM User WHERE refreshToken = ?", [refreshToken])
    const user = rows[0]
    if (user) {
      await pool.execute("UPDATE User SET refreshToken = NULL WHERE id = ?", [user.id])
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
    const [rows]: any = await pool.execute("SELECT * FROM SiteSettings WHERE id = ?", ["global-settings"])
    let settings = rows[0]
    if (!settings) {
      const id = "global-settings"
      await pool.execute("INSERT INTO SiteSettings (id, updatedAt) VALUES (?, NOW())", [id])
      const [newRows]: any = await pool.execute("SELECT * FROM SiteSettings WHERE id = ?", [id])
      settings = newRows[0]
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
    const fields: string[] = []
    const values: any[] = []

    if (heroTitle !== undefined) { fields.push("heroTitle = ?"); values.push(heroTitle) }
    if (heroSubtitle !== undefined) { fields.push("heroSubtitle = ?"); values.push(heroSubtitle) }
    if (aboutTitle !== undefined) { fields.push("aboutTitle = ?"); values.push(aboutTitle) }
    if (aboutContent !== undefined) { fields.push("aboutContent = ?"); values.push(aboutContent) }
    if (contactPhone !== undefined) { fields.push("contactPhone = ?"); values.push(contactPhone) }
    if (contactEmail !== undefined) { fields.push("contactEmail = ?"); values.push(contactEmail) }
    if (officeAddress !== undefined) { fields.push("officeAddress = ?"); values.push(officeAddress) }
    if (socialMedia !== undefined) { fields.push("socialMedia = ?"); values.push(socialMedia) }
    if (footerContent !== undefined) { fields.push("footerContent = ?"); values.push(footerContent) }
    if (yearsExperience !== undefined) { fields.push("yearsExperience = ?"); values.push(parseInt(yearsExperience)) }
    if (totalProjectsCount !== undefined) { fields.push("totalProjectsCount = ?"); values.push(parseInt(totalProjectsCount)) }
    if (designAwardsCount !== undefined) { fields.push("designAwardsCount = ?"); values.push(parseInt(designAwardsCount)) }
    if (showSpatialEvolutions !== undefined) { fields.push("showSpatialEvolutions = ?"); values.push(Boolean(showSpatialEvolutions) ? 1 : 0) }
    if (showTeam !== undefined) { fields.push("showTeam = ?"); values.push(Boolean(showTeam) ? 1 : 0) }
    if (showFaq !== undefined) { fields.push("showFaq = ?"); values.push(Boolean(showFaq) ? 1 : 0) }
    if (milestones !== undefined) { fields.push("milestones = ?"); values.push(milestones) }
    if (mapEmbedUrl !== undefined) { fields.push("mapEmbedUrl = ?"); values.push(mapEmbedUrl) }

    fields.push("updatedAt = NOW()")
    values.push("global-settings")

    await pool.execute(`UPDATE SiteSettings SET ${fields.join(", ")} WHERE id = ?`, values)

    const [rows]: any = await pool.execute("SELECT * FROM SiteSettings WHERE id = ?", ["global-settings"])
    res.json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 3. MEDIA LIBRARY ENDPOINTS
// ==========================================

app.get("/api/media", authenticateToken, async (req: any, res: any) => {
  try {
    const [rows]: any = await pool.execute("SELECT * FROM MediaAsset ORDER BY createdAt DESC")
    res.json(rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/media/upload", authenticateToken, upload.single("file"), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" })

  const filePath = `/uploads/${req.file.filename}`
  const fileType = req.file.mimetype.startsWith("image/") ? "image" : req.file.mimetype.startsWith("video/") ? "video" : "drawing"
  const id = uuid()

  try {
    await pool.execute(
      "INSERT INTO MediaAsset (id, filename, filePath, fileType, fileSize, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
      [id, req.file.originalname, filePath, fileType, req.file.size]
    )
    const [rows]: any = await pool.execute("SELECT * FROM MediaAsset WHERE id = ?", [id])
    res.status(201).json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/media/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    const [rows]: any = await pool.execute("SELECT * FROM MediaAsset WHERE id = ?", [req.params.id])
    const asset = rows[0]
    if (!asset) return res.status(404).json({ error: "Asset not found" })

    // Remove from disk
    const diskPath = path.join(__dirname, "..", asset.filePath)
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath)
    }

    await pool.execute("DELETE FROM MediaAsset WHERE id = ?", [req.params.id])
    res.json({ message: "Asset deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Endpoint to parse public Google Drive folders and return direct image links
app.post("/api/admin/fetch-drive-folder", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { folderUrl } = req.body
  if (!folderUrl) return res.status(400).json({ error: "Folder URL is required" })

  // Extract folder ID
  const match = folderUrl.match(/(?:folders\/|id=)([a-zA-Z0-9_-]{25,50})/)
  if (!match) return res.status(400).json({ error: "Invalid Google Drive folder URL" })

  const folderId = match[1]
  const url = `https://drive.google.com/embeddedfolderview?id=${folderId}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `Google Drive returned status code ${response.status}` })
    }

    const html = await response.text()
    const regex = /\/file\/d\/([a-zA-Z0-9_-]{25,45})\/view/g
    const fileIds: string[] = []
    let m;
    while ((m = regex.exec(html)) !== null) {
      if (!fileIds.includes(m[1])) {
        fileIds.push(m[1])
      }
    }

    const imageUrls = fileIds.map(id => `https://lh3.googleusercontent.com/d/${id}`)
    res.json({ imageUrls })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 4. PROJECT CATEGORY ENDPOINTS
// ==========================================

app.get("/api/categories", async (req: any, res: any) => {
  try {
    const [rows]: any = await pool.execute("SELECT * FROM ProjectCategory ORDER BY name ASC")
    res.json(rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/categories", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, description } = req.body
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  const id = uuid()
  try {
    await pool.execute(
      "INSERT INTO ProjectCategory (id, name, description, slug, createdAt) VALUES (?, ?, ?, ?, NOW())",
      [id, name, description || null, slug]
    )
    const [rows]: any = await pool.execute("SELECT * FROM ProjectCategory WHERE id = ?", [id])
    res.status(201).json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/categories/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, description } = req.body
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  try {
    await pool.execute(
      "UPDATE ProjectCategory SET name = ?, description = ?, slug = ? WHERE id = ?",
      [name, description || null, slug, req.params.id]
    )
    const [rows]: any = await pool.execute("SELECT * FROM ProjectCategory WHERE id = ?", [req.params.id])
    res.json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/categories/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    // Check if category has active projects
    const [countRows]: any = await pool.execute(
      "SELECT COUNT(*) as count FROM Project WHERE categoryId = ? AND deletedAt IS NULL",
      [req.params.id]
    )
    if (countRows[0].count > 0) {
      return res.status(400).json({ error: "Cannot delete category linked to active projects" })
    }
    await pool.execute("DELETE FROM ProjectCategory WHERE id = ?", [req.params.id])
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
    const [rows]: any = await pool.execute("SELECT * FROM Tag ORDER BY name ASC")
    res.json(rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/tags", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name } = req.body
  const id = uuid()
  try {
    await pool.execute("INSERT INTO Tag (id, name, createdAt) VALUES (?, ?, NOW())", [id, name])
    const [rows]: any = await pool.execute("SELECT * FROM Tag WHERE id = ?", [id])
    res.status(201).json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/tags/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("DELETE FROM Tag WHERE id = ?", [req.params.id])
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
    let sql = `
      SELECT p.*, pc.id as cat_id, pc.name as cat_name, pc.slug as cat_slug, pc.description as cat_description
      FROM Project p
      LEFT JOIN ProjectCategory pc ON p.categoryId = pc.id
    `
    const conditions: string[] = []
    const params: any[] = []

    if (includeDeleted !== "true") {
      conditions.push("p.deletedAt IS NULL")
    }

    if (category) {
      conditions.push("pc.slug = ?")
      params.push(category)
    }

    if (status) {
      conditions.push("p.status = ?")
      params.push(status)
    }

    if (tag) {
      conditions.push("p.id IN (SELECT pt.projectId FROM ProjectTag pt JOIN Tag t ON pt.tagId = t.id WHERE t.name = ?)")
      params.push(tag)
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ")
    }

    sql += " ORDER BY p.featured DESC, p.featuredOrder ASC, p.createdAt DESC"

    const [rows]: any = await pool.execute(sql, params)

    // Fetch tags for all projects
    const projectIds = rows.map((r: any) => r.id)
    let tagsMap: any = {}
    if (projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",")
      const [tagRows]: any = await pool.execute(
        `SELECT pt.projectId, t.id as tagId, t.name as tagName FROM ProjectTag pt JOIN Tag t ON pt.tagId = t.id WHERE pt.projectId IN (${placeholders})`,
        projectIds
      )
      for (const tr of tagRows) {
        if (!tagsMap[tr.projectId]) tagsMap[tr.projectId] = []
        tagsMap[tr.projectId].push({ tag: { id: tr.tagId, name: tr.tagName } })
      }
    }

    // Shape response to match Prisma format
    const projects = rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      categoryId: r.categoryId,
      projectType: r.projectType,
      location: r.location,
      area: r.area,
      status: r.status,
      projectStartDate: r.projectStartDate,
      completionDate: r.completionDate,
      coverImage: r.coverImage,
      beforeImage: r.beforeImage,
      afterImage: r.afterImage,
      siteArea: r.siteArea,
      builtArea: r.builtArea,
      floors: r.floors,
      budgetRange: r.budgetRange,
      storyTitle: r.storyTitle,
      storyProcess: r.storyProcess,
      storyChallenge: r.storyChallenge,
      storySolution: r.storySolution,
      featured: r.featured,
      featuredOrder: r.featuredOrder,
      metaTitle: r.metaTitle,
      metaDescription: r.metaDescription,
      metaKeywords: r.metaKeywords,
      ogImage: r.ogImage,
      deletedAt: r.deletedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      category: r.cat_id ? { id: r.cat_id, name: r.cat_name, slug: r.cat_slug, description: r.cat_description } : null,
      tags: tagsMap[r.id] || [],
    }))

    res.json(projects)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/projects/:slug", async (req: any, res: any) => {
  try {
    const [rows]: any = await pool.execute(
      `SELECT p.*, pc.id as cat_id, pc.name as cat_name, pc.slug as cat_slug, pc.description as cat_description
       FROM Project p
       LEFT JOIN ProjectCategory pc ON p.categoryId = pc.id
       WHERE p.slug = ?`,
      [req.params.slug]
    )
    const project = rows[0]
    if (!project) return res.status(404).json({ error: "Project not found" })

    // Fetch gallery
    const [gallery]: any = await pool.execute(
      "SELECT * FROM ProjectGallery WHERE projectId = ? ORDER BY displayOrder ASC",
      [project.id]
    )

    // Fetch drawings
    const [drawings]: any = await pool.execute(
      "SELECT * FROM ProjectDrawing WHERE projectId = ? ORDER BY displayOrder ASC",
      [project.id]
    )

    // Fetch tags
    const [tagRows]: any = await pool.execute(
      "SELECT pt.projectId, t.id as tagId, t.name as tagName FROM ProjectTag pt JOIN Tag t ON pt.tagId = t.id WHERE pt.projectId = ?",
      [project.id]
    )

    // Fetch reviews
    const [reviews]: any = await pool.execute(
      "SELECT * FROM Review WHERE projectId = ? AND deletedAt IS NULL",
      [project.id]
    )

    res.json({
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      categoryId: project.categoryId,
      projectType: project.projectType,
      location: project.location,
      area: project.area,
      status: project.status,
      projectStartDate: project.projectStartDate,
      completionDate: project.completionDate,
      coverImage: project.coverImage,
      beforeImage: project.beforeImage,
      afterImage: project.afterImage,
      siteArea: project.siteArea,
      builtArea: project.builtArea,
      floors: project.floors,
      budgetRange: project.budgetRange,
      storyTitle: project.storyTitle,
      storyProcess: project.storyProcess,
      storyChallenge: project.storyChallenge,
      storySolution: project.storySolution,
      featured: project.featured,
      featuredOrder: project.featuredOrder,
      metaTitle: project.metaTitle,
      metaDescription: project.metaDescription,
      metaKeywords: project.metaKeywords,
      ogImage: project.ogImage,
      deletedAt: project.deletedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      category: project.cat_id ? { id: project.cat_id, name: project.cat_name, slug: project.cat_slug, description: project.cat_description } : null,
      gallery,
      drawings,
      tags: tagRows.map((tr: any) => ({ tag: { id: tr.tagId, name: tr.tagName } })),
      reviews,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/projects", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const {
    title, description, categoryId, projectType, location, area, status,
    projectStartDate, completionDate, coverImage, beforeImage, afterImage,
    siteArea, builtArea, floors, budgetRange,
    storyTitle, storyProcess, storyChallenge, storySolution,
    featured, featuredOrder,
    metaTitle, metaDescription, metaKeywords, ogImage,
    tags, gallery, drawings
  } = req.body

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  const id = uuid()

  try {
    await pool.execute(
      `INSERT INTO Project (id, slug, title, description, categoryId, projectType, location, area, status,
        projectStartDate, completionDate, coverImage, beforeImage, afterImage, siteArea, builtArea, floors, budgetRange,
        storyTitle, storyProcess, storyChallenge, storySolution, featured, featuredOrder,
        metaTitle, metaDescription, metaKeywords, ogImage, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id, slug, title, description, categoryId, projectType, location, area, status,
        projectStartDate ? new Date(projectStartDate) : new Date(),
        new Date(completionDate),
        coverImage, beforeImage || null, afterImage || null,
        siteArea || null, builtArea || null, floors ? parseInt(floors) : 1, budgetRange || null,
        storyTitle || null, storyProcess || null, storyChallenge || null, storySolution || null,
        featured || false, featuredOrder ? parseInt(featuredOrder) : 0,
        metaTitle || null, metaDescription || null, metaKeywords || null, ogImage || null,
      ]
    )

    // Save tags
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await pool.execute("INSERT INTO ProjectTag (projectId, tagId) VALUES (?, ?)", [id, tagId])
      }
    }

    // Save gallery
    if (gallery && Array.isArray(gallery)) {
      for (let i = 0; i < gallery.length; i++) {
        const gId = uuid()
        await pool.execute(
          "INSERT INTO ProjectGallery (id, projectId, imageUrl, displayOrder, createdAt) VALUES (?, ?, ?, ?, NOW())",
          [gId, id, gallery[i], i]
        )
      }
    }

    // Save drawings
    if (drawings && Array.isArray(drawings)) {
      for (let i = 0; i < drawings.length; i++) {
        const dId = uuid()
        await pool.execute(
          "INSERT INTO ProjectDrawing (id, projectId, title, drawingType, fileUrl, displayOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
          [dId, id, drawings[i].title, drawings[i].drawingType, drawings[i].fileUrl, i]
        )
      }
    }

    // Fetch the created project with category and tags
    const [rows]: any = await pool.execute(
      `SELECT p.*, pc.id as cat_id, pc.name as cat_name, pc.slug as cat_slug
       FROM Project p LEFT JOIN ProjectCategory pc ON p.categoryId = pc.id WHERE p.id = ?`,
      [id]
    )
    const project = rows[0]
    const [tagRows]: any = await pool.execute(
      "SELECT pt.projectId, t.id as tagId, t.name as tagName FROM ProjectTag pt JOIN Tag t ON pt.tagId = t.id WHERE pt.projectId = ?",
      [id]
    )

    res.status(201).json({
      ...project,
      category: project.cat_id ? { id: project.cat_id, name: project.cat_name, slug: project.cat_slug } : null,
      tags: tagRows.map((tr: any) => ({ tag: { id: tr.tagId, name: tr.tagName } })),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/projects/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const {
    title, description, categoryId, projectType, location, area, status,
    projectStartDate, completionDate, coverImage, beforeImage, afterImage,
    siteArea, builtArea, floors, budgetRange,
    storyTitle, storyProcess, storyChallenge, storySolution,
    featured, featuredOrder,
    metaTitle, metaDescription, metaKeywords, ogImage,
    tags, gallery, drawings
  } = req.body

  try {
    // Delete existing tags to rebuild
    await pool.execute("DELETE FROM ProjectTag WHERE projectId = ?", [req.params.id])

    await pool.execute(
      `UPDATE Project SET title = ?, description = ?, categoryId = ?, projectType = ?, location = ?, area = ?, status = ?,
        projectStartDate = ?, completionDate = ?, coverImage = ?, beforeImage = ?, afterImage = ?,
        siteArea = ?, builtArea = ?, floors = ?, budgetRange = ?,
        storyTitle = ?, storyProcess = ?, storyChallenge = ?, storySolution = ?,
        featured = ?, featuredOrder = ?,
        metaTitle = ?, metaDescription = ?, metaKeywords = ?, ogImage = ?, updatedAt = NOW()
       WHERE id = ?`,
      [
        title, description, categoryId, projectType, location, area, status,
        projectStartDate ? new Date(projectStartDate) : undefined,
        completionDate ? new Date(completionDate) : undefined,
        coverImage, beforeImage || null, afterImage || null,
        siteArea || null, builtArea || null, floors ? parseInt(floors) : 1, budgetRange || null,
        storyTitle || null, storyProcess || null, storyChallenge || null, storySolution || null,
        featured !== undefined ? featured : false, featuredOrder ? parseInt(featuredOrder) : 0,
        metaTitle || null, metaDescription || null, metaKeywords || null, ogImage || null,
        req.params.id,
      ]
    )

    // Rebuild tags
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await pool.execute("INSERT INTO ProjectTag (projectId, tagId) VALUES (?, ?)", [req.params.id, tagId])
      }
    }

    // Update gallery
    if (gallery && Array.isArray(gallery)) {
      await pool.execute("DELETE FROM ProjectGallery WHERE projectId = ?", [req.params.id])
      for (let i = 0; i < gallery.length; i++) {
        const gId = uuid()
        await pool.execute(
          "INSERT INTO ProjectGallery (id, projectId, imageUrl, displayOrder, createdAt) VALUES (?, ?, ?, ?, NOW())",
          [gId, req.params.id, gallery[i], i]
        )
      }
    }

    // Update drawings
    if (drawings && Array.isArray(drawings)) {
      await pool.execute("DELETE FROM ProjectDrawing WHERE projectId = ?", [req.params.id])
      for (let i = 0; i < drawings.length; i++) {
        const dId = uuid()
        await pool.execute(
          "INSERT INTO ProjectDrawing (id, projectId, title, drawingType, fileUrl, displayOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
          [dId, req.params.id, drawings[i].title, drawings[i].drawingType, drawings[i].fileUrl, i]
        )
      }
    }

    const [rows]: any = await pool.execute("SELECT * FROM Project WHERE id = ?", [req.params.id])
    res.json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Soft delete
app.post("/api/projects/:id/archive", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("UPDATE Project SET deletedAt = NOW() WHERE id = ?", [req.params.id])
    const [rows]: any = await pool.execute("SELECT * FROM Project WHERE id = ?", [req.params.id])
    res.json({ message: "Project archived", project: rows[0] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Restore
app.post("/api/projects/:id/restore", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("UPDATE Project SET deletedAt = NULL WHERE id = ?", [req.params.id])
    const [rows]: any = await pool.execute("SELECT * FROM Project WHERE id = ?", [req.params.id])
    res.json({ message: "Project restored", project: rows[0] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/projects/:id", authenticateToken, requireRole(["SuperAdmin"]), async (req: any, res: any) => {
  try {
    await pool.execute("DELETE FROM Project WHERE id = ?", [req.params.id])
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
    let sql = `
      SELECT r.*, p.id as proj_id, p.title as proj_title, p.slug as proj_slug, p.coverImage as proj_coverImage
      FROM Review r
      LEFT JOIN Project p ON r.projectId = p.id
    `
    if (includeDeleted !== "true") {
      sql += " WHERE r.deletedAt IS NULL"
    }
    sql += " ORDER BY r.createdAt DESC"

    const [rows]: any = await pool.execute(sql)

    const reviews = rows.map((r: any) => ({
      id: r.id,
      clientName: r.clientName,
      clientPhoto: r.clientPhoto,
      rating: r.rating,
      review: r.review,
      projectId: r.projectId,
      deletedAt: r.deletedAt,
      createdAt: r.createdAt,
      project: r.proj_id ? { id: r.proj_id, title: r.proj_title, slug: r.proj_slug, coverImage: r.proj_coverImage } : null,
    }))

    res.json(reviews)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/reviews", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { clientName, clientPhoto, rating, review, projectId } = req.body
  const id = uuid()
  try {
    await pool.execute(
      "INSERT INTO Review (id, clientName, clientPhoto, rating, review, projectId, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [id, clientName, clientPhoto || null, parseInt(rating), review, projectId || null]
    )
    const [rows]: any = await pool.execute("SELECT * FROM Review WHERE id = ?", [id])
    res.status(201).json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/reviews/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { clientName, clientPhoto, rating, review, projectId } = req.body
  try {
    await pool.execute(
      "UPDATE Review SET clientName = ?, clientPhoto = ?, rating = ?, review = ?, projectId = ? WHERE id = ?",
      [clientName, clientPhoto || null, parseInt(rating), review, projectId || null, req.params.id]
    )
    const [rows]: any = await pool.execute("SELECT * FROM Review WHERE id = ?", [req.params.id])
    res.json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/reviews/:id/archive", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("UPDATE Review SET deletedAt = NOW() WHERE id = ?", [req.params.id])
    res.json({ message: "Review archived" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/reviews/:id/restore", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("UPDATE Review SET deletedAt = NULL WHERE id = ?", [req.params.id])
    res.json({ message: "Review restored" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/reviews/:id", authenticateToken, requireRole(["SuperAdmin"]), async (req: any, res: any) => {
  try {
    await pool.execute("DELETE FROM Review WHERE id = ?", [req.params.id])
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
    const [rows]: any = await pool.execute(
      "SELECT * FROM Activity WHERE expiryDate > NOW() ORDER BY displayOrder ASC"
    )
    res.json(rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/activities", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { title, mediaUrl, thumbnailUrl, mediaType, displayOrder, expiryHours } = req.body
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + (parseInt(expiryHours) || 24))
  const id = uuid()

  try {
    await pool.execute(
      "INSERT INTO Activity (id, title, mediaUrl, thumbnailUrl, mediaType, displayOrder, expiryDate, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [id, title, mediaUrl, thumbnailUrl || null, mediaType || "image", displayOrder ? parseInt(displayOrder) : 0, expiryDate]
    )
    const [rows]: any = await pool.execute("SELECT * FROM Activity WHERE id = ?", [id])
    res.status(201).json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/activities/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("DELETE FROM Activity WHERE id = ?", [req.params.id])
    res.json({ message: "Story deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 9. LATEST NEWS / ANNOUNCEMENT POPUP MODULE
// ==========================================

app.get("/api/announcements", async (req: any, res: any) => {
  const now = new Date()
  try {
    const [rows]: any = await pool.execute(
      `SELECT a.*, p.id as proj_id, p.title as proj_title, p.slug as proj_slug, p.coverImage as proj_coverImage
       FROM Announcement a
       LEFT JOIN Project p ON a.projectId = p.id
       WHERE a.active = 1 AND a.startDate <= ? AND a.endDate >= ?
       ORDER BY a.createdAt DESC`,
      [now, now]
    )

    const announcements = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      startDate: r.startDate,
      endDate: r.endDate,
      active: r.active,
      imageUrl: r.imageUrl,
      externalLink: r.externalLink,
      projectId: r.projectId,
      createdAt: r.createdAt,
      project: r.proj_id ? { id: r.proj_id, title: r.proj_title, slug: r.proj_slug, coverImage: r.proj_coverImage } : null,
    }))

    res.json(announcements)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Admin endpoint to get all popups
app.get("/api/admin/announcements", authenticateToken, async (req: any, res: any) => {
  try {
    const [rows]: any = await pool.execute(
      `SELECT a.*, p.id as proj_id, p.title as proj_title, p.slug as proj_slug, p.coverImage as proj_coverImage
       FROM Announcement a
       LEFT JOIN Project p ON a.projectId = p.id
       ORDER BY a.createdAt DESC`
    )

    const announcements = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      startDate: r.startDate,
      endDate: r.endDate,
      active: r.active,
      imageUrl: r.imageUrl,
      externalLink: r.externalLink,
      projectId: r.projectId,
      createdAt: r.createdAt,
      project: r.proj_id ? { id: r.proj_id, title: r.proj_title, slug: r.proj_slug, coverImage: r.proj_coverImage } : null,
    }))

    res.json(announcements)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/announcements", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { title, content, startDate, endDate, active, imageUrl, externalLink, projectId } = req.body
  const id = uuid()
  try {
    await pool.execute(
      `INSERT INTO Announcement (id, title, content, startDate, endDate, active, imageUrl, externalLink, projectId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, title, content, new Date(startDate), new Date(endDate), active !== undefined ? active : true, imageUrl || null, externalLink || null, projectId || null]
    )

    const [rows]: any = await pool.execute(
      `SELECT a.*, p.id as proj_id, p.title as proj_title, p.slug as proj_slug, p.coverImage as proj_coverImage
       FROM Announcement a LEFT JOIN Project p ON a.projectId = p.id WHERE a.id = ?`,
      [id]
    )
    const r = rows[0]
    res.status(201).json({
      ...r,
      project: r.proj_id ? { id: r.proj_id, title: r.proj_title, slug: r.proj_slug, coverImage: r.proj_coverImage } : null,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/announcements/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { title, content, startDate, endDate, active, imageUrl, externalLink, projectId } = req.body
  try {
    await pool.execute(
      `UPDATE Announcement SET title = ?, content = ?, startDate = ?, endDate = ?, active = ?, imageUrl = ?, externalLink = ?, projectId = ?
       WHERE id = ?`,
      [title, content, new Date(startDate), new Date(endDate), active, imageUrl || null, externalLink || null, projectId || null, req.params.id]
    )

    const [rows]: any = await pool.execute(
      `SELECT a.*, p.id as proj_id, p.title as proj_title, p.slug as proj_slug, p.coverImage as proj_coverImage
       FROM Announcement a LEFT JOIN Project p ON a.projectId = p.id WHERE a.id = ?`,
      [req.params.id]
    )
    const r = rows[0]
    res.json({
      ...r,
      project: r.proj_id ? { id: r.proj_id, title: r.proj_title, slug: r.proj_slug, coverImage: r.proj_coverImage } : null,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/announcements/:id", authenticateToken, requireRole(["SuperAdmin"]), async (req: any, res: any) => {
  try {
    await pool.execute("DELETE FROM Announcement WHERE id = ?", [req.params.id])
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
    let sql = "SELECT * FROM Partner"
    if (includeDeleted !== "true") {
      sql += " WHERE deletedAt IS NULL"
    }
    sql += " ORDER BY name ASC"
    const [rows]: any = await pool.execute(sql)
    res.json(rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/partners", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, logo, website, description } = req.body
  const id = uuid()
  try {
    await pool.execute(
      "INSERT INTO Partner (id, name, logo, website, description, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
      [id, name, logo, website || null, description || null]
    )
    const [rows]: any = await pool.execute("SELECT * FROM Partner WHERE id = ?", [id])
    res.status(201).json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/partners/:id/archive", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("UPDATE Partner SET deletedAt = NOW() WHERE id = ?", [req.params.id])
    res.json({ message: "Partner archived" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/partners/:id/restore", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("UPDATE Partner SET deletedAt = NULL WHERE id = ?", [req.params.id])
    res.json({ message: "Partner restored" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/partners/:id", authenticateToken, requireRole(["SuperAdmin"]), async (req: any, res: any) => {
  try {
    await pool.execute("DELETE FROM Partner WHERE id = ?", [req.params.id])
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
    const [rows]: any = await pool.execute("SELECT * FROM TeamMember ORDER BY displayOrder ASC")
    res.json(rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/team", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, designation, bio, profileImage, displayOrder } = req.body
  const id = uuid()
  try {
    await pool.execute(
      "INSERT INTO TeamMember (id, name, designation, bio, profileImage, displayOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [id, name, designation, bio, profileImage, displayOrder ? parseInt(displayOrder) : 0]
    )
    const [rows]: any = await pool.execute("SELECT * FROM TeamMember WHERE id = ?", [id])
    res.status(201).json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/team/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { name, designation, bio, profileImage, displayOrder } = req.body
  try {
    await pool.execute(
      "UPDATE TeamMember SET name = ?, designation = ?, bio = ?, profileImage = ?, displayOrder = ? WHERE id = ?",
      [name, designation, bio, profileImage, displayOrder ? parseInt(displayOrder) : 0, req.params.id]
    )
    const [rows]: any = await pool.execute("SELECT * FROM TeamMember WHERE id = ?", [req.params.id])
    res.json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/team/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("DELETE FROM TeamMember WHERE id = ?", [req.params.id])
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
  const id = uuid()

  try {
    await pool.execute(
      `INSERT INTO ContactLead (id, name, phone, email, projectType, serviceType, budget, message, attachmentUrl, source, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, name, phone, email, projectType, serviceType || "Architectural Planning", budget, message, attachmentUrl || null, source || "Website Form"]
    )
    const [rows]: any = await pool.execute("SELECT * FROM ContactLead WHERE id = ?", [id])
    const lead = rows[0]

    // Prepare HTML content from replyemail.html template on disk
    let templatePath = path.join(__dirname, "replyemail.html")
    if (!fs.existsSync(templatePath)) {
      const altPaths = [
        path.join(process.cwd(), "server", "src", "replyemail.html"),
        path.join(process.cwd(), "src", "replyemail.html"),
        path.join(process.cwd(), "replyemail.html"),
      ]
      for (const alt of altPaths) {
        if (fs.existsSync(alt)) {
          templatePath = alt
          break
        }
      }
    }
    let htmlContent = ""
    try {
      htmlContent = fs.readFileSync(templatePath, "utf-8")
      htmlContent = htmlContent
        .replace(/{{name}}/g, name || "")
        .replace(/{{phone}}/g, phone || "")
        .replace(/{{email}}/g, email || "")
        .replace(/{{message}}/g, message || "")
        .replace(/{{serviceType}}/g, serviceType || "Architectural Planning")
        .replace(/{{projectType}}/g, projectType || "")
        .replace(/{{budget}}/g, budget || "")
    } catch (err) {
      console.error("Failed to read email template file from disk:", err)
      // Fallback html if the template file loading fails
      htmlContent = `
        <h3>New Contact Lead</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service:</strong> ${serviceType}</p>
        <p><strong>Type:</strong> ${projectType}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Brief:</strong> ${message}</p>
      `
    }

    // Prepare notification email to the business (G Architects admin inbox)
    const mailToBusiness: any = {
      from: process.env.SMTP_USER || "contact@garchitectsanddevelopers.in",
      to: process.env.SMTP_USER || "contact@garchitectsanddevelopers.in",
      subject: `New Client Brief Submission from ${name}`,
      html: htmlContent
    }

    // Attach blueprint file if present
    if (req.file) {
      mailToBusiness.attachments = [
        {
          filename: req.file.originalname,
          path: req.file.path,
        }
      ]
    }

    // Prepare confirmation email to the client user
    const mailToUser = {
      from: process.env.SMTP_USER || "contact@garchitectsanddevelopers.in",
      to: email,
      subject: 'Thank You for Contacting G Architects & Consultants!',
      html: htmlContent
    }

    // Trigger emails in background
    transporter.sendMail(mailToBusiness).then(() => {
      console.log(`Lead notification email sent successfully to ${mailToBusiness.to}`)
    }).catch((err) => {
      console.error("Failed to send email to business:", err)
    })

    transporter.sendMail(mailToUser).then(() => {
      console.log(`Confirmation email sent successfully to client ${email}`)
    }).catch((err) => {
      console.error("Failed to send reply email to client user:", err)
    })

    res.status(201).json(lead)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/contact-requests", authenticateToken, async (req: any, res: any) => {
  try {
    const [rows]: any = await pool.execute("SELECT * FROM ContactLead ORDER BY createdAt DESC")
    res.json(rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.patch("/api/contact-requests/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  const { status, notes, assignedTo, followUpDate } = req.body
  try {
    const fields: string[] = []
    const values: any[] = []

    if (status !== undefined) { fields.push("status = ?"); values.push(status) }
    if (notes !== undefined) { fields.push("notes = ?"); values.push(notes) }
    if (assignedTo !== undefined) { fields.push("assignedTo = ?"); values.push(assignedTo) }
    if (followUpDate !== undefined) { fields.push("followUpDate = ?"); values.push(new Date(followUpDate)) }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" })
    }

    values.push(req.params.id)
    await pool.execute(`UPDATE ContactLead SET ${fields.join(", ")} WHERE id = ?`, values)

    const [rows]: any = await pool.execute("SELECT * FROM ContactLead WHERE id = ?", [req.params.id])
    res.json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/contact-requests/:id", authenticateToken, requireRole(["SuperAdmin", "Admin"]), async (req: any, res: any) => {
  try {
    await pool.execute("DELETE FROM ContactLead WHERE id = ?", [req.params.id])
    res.json({ message: "Inquiry deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==========================================
// 13. ADMIN OVERVIEW / METRICS WIDGETS
// ==========================================
app.post("/api/analytics/track", async (req: any, res: any) => {
  const { path: pagePath, projectId } = req.body
  if (!pagePath) return res.status(400).json({ error: "Path is required" })
  const id = uuid()
  try {
    await pool.execute(
      "INSERT INTO PageView (id, path, projectId, createdAt) VALUES (?, ?, ?, NOW())",
      [id, pagePath, projectId || null]
    )
    const [rows]: any = await pool.execute("SELECT * FROM PageView WHERE id = ?", [id])
    res.status(201).json(rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/admin/metrics", authenticateToken, async (req: any, res: any) => {
  try {
    const [totalProjectsRows]: any = await pool.execute("SELECT COUNT(*) as count FROM Project WHERE deletedAt IS NULL")
    const totalProjects = totalProjectsRows[0].count

    const [activeProjectsRows]: any = await pool.execute("SELECT COUNT(*) as count FROM Project WHERE deletedAt IS NULL AND status != 'COMPLETED'")
    const activeProjects = activeProjectsRows[0].count

    const [totalReviewsRows]: any = await pool.execute("SELECT COUNT(*) as count FROM Review WHERE deletedAt IS NULL")
    const totalReviews = totalReviewsRows[0].count

    const [newLeadsRows]: any = await pool.execute("SELECT COUNT(*) as count FROM ContactLead WHERE status = 'New'")
    const newLeads = newLeadsRows[0].count

    const [allLeadsRows]: any = await pool.execute("SELECT COUNT(*) as count FROM ContactLead")
    const allLeads = allLeadsRows[0].count

    const [activeStoriesRows]: any = await pool.execute("SELECT COUNT(*) as count FROM Activity WHERE expiryDate > NOW()")
    const activeStories = activeStoriesRows[0].count

    const [activeAnnouncementsRows]: any = await pool.execute("SELECT COUNT(*) as count FROM Announcement WHERE active = 1")
    const activeAnnouncements = activeAnnouncementsRows[0].count

    // Real visitor analytics from PageView table
    const [websiteVisitsRows]: any = await pool.execute("SELECT COUNT(*) as count FROM PageView WHERE path = '/'")
    const websiteVisits = websiteVisitsRows[0].count

    // Most visited project calculation
    const [mostVisitedGroup]: any = await pool.execute(
      `SELECT projectId, COUNT(id) as visit_count FROM PageView WHERE projectId IS NOT NULL GROUP BY projectId ORDER BY visit_count DESC LIMIT 1`
    )

    let mostVisitedProjectTitle = "NONE"
    if (mostVisitedGroup.length > 0 && mostVisitedGroup[0].projectId) {
      const [pRows]: any = await pool.execute("SELECT title FROM Project WHERE id = ?", [mostVisitedGroup[0].projectId])
      if (pRows.length > 0) mostVisitedProjectTitle = pRows[0].title.toUpperCase()
    }

    // Lead conversion rate: (total enquiries / total homepage visits) * 100
    let conversionRate = 0
    if (websiteVisits > 0) {
      conversionRate = parseFloat(((allLeads / websiteVisits) * 100).toFixed(1))
    }

    res.json({
      totalProjects,
      activeProjects,
      totalReviews,
      newLeads,
      activeStories,
      activeAnnouncements,
      websiteVisits: websiteVisits || 1, // fallback to 1 if no visits yet to avoid UI division by 0
      mostVisitedProject: mostVisitedProjectTitle,
      conversionRate: conversionRate || 0.0,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})


// --- Export for Vercel Serverless ---
export default app

// --- Local Dev Server Boot ---
// Only start listening when running directly (not on Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`)
  })
}
