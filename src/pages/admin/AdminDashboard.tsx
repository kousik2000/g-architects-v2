import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore, useAppStore, convertGoogleDriveUrl } from "../../store/appStore"
import {
  LayoutDashboard,
  Layers,
  Image as ImageIcon,
  FolderHeart,
  Users,
  MessageSquare,
  Sparkles,
  Volume2,
  Briefcase,
  Settings,
  ShieldAlert,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Download,
  CheckCircle,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const {
    projects, fetchProjects, createProject, updateProject, archiveProject, restoreProject, deleteProject,
    categories, fetchCategories, createCategory, updateCategory, deleteCategory,
    tags, fetchTags, createTag, deleteTag,
    team, fetchTeam, createTeamMember, updateTeamMember, deleteTeamMember,
    reviews, fetchReviews, createReview, updateReview, archiveReview, restoreReview, deleteReview,
    stories, fetchStories, createStory, deleteStory,
    announcements, fetchAdminAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
    leads, fetchLeads, updateLeadStatus, deleteLead,
    settings, fetchSettings, updateSettings,
    metrics, fetchMetrics,
    partners, fetchPartners, createPartner, archivePartner, restorePartner, deletePartner,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState("overview")

  // Authentication check
  useEffect(() => {
    if (!token) {
      navigate("/admin/login")
    } else {
      loadTabContext()
    }
  }, [token, activeTab])

  const loadTabContext = () => {
    fetchMetrics()
    fetchLeads()
    if (activeTab === "projects") {
      fetchProjects({ includeDeleted: true })
      fetchCategories()
      fetchTags()
    } else if (activeTab === "categories") {
      fetchCategories()
      fetchTags()
    } else if (activeTab === "media") {
      fetchMediaAssets()
    } else if (activeTab === "team") {
      fetchTeam()
    } else if (activeTab === "reviews") {
      fetchReviews(true)
      fetchProjects()
    } else if (activeTab === "stories") {
      fetchStories()
    } else if (activeTab === "announcements") {
      fetchAdminAnnouncements()
    } else if (activeTab === "partners") {
      fetchPartners(true)
    } else if (activeTab === "settings") {
      fetchSettings()
    }
  }

  // Media Library state
  const [mediaAssets, setMediaAssets] = useState<any[]>([])
  const [mediaUploading, setMediaUploading] = useState(false)
  const fetchMediaAssets = async () => {
    try {
      const res = await fetch("/api/media", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setMediaAssets(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setMediaUploading(true)
    const formData = new FormData()
    formData.append("file", e.target.files[0])

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.ok) {
        fetchMediaAssets()
      } else {
        alert("Upload failed")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setMediaUploading(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Delete this media asset permanently?")) return
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) fetchMediaAssets()
    } catch (e) {
      console.error(e)
    }
  }

  // --- Projects Edit Modal State ---
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  // Project Form Fields
  const [pTitle, setPTitle] = useState("")
  const [pDescription, setPDescription] = useState("")
  const [pCategoryId, setPCategoryId] = useState("")
  const [pProjectType, setPProjectType] = useState("")
  const [pLocation, setPLocation] = useState("")
  const [pArea, setPArea] = useState("")
  const [pStatus, setPStatus] = useState("CONCEPT")
  const [pStartDate, setPStartDate] = useState("")
  const [pCompletionDate, setPCompletionDate] = useState("")
  const [pCoverImage, setPCoverImage] = useState("")
  const [pBeforeImage, setPBeforeImage] = useState("")
  const [pAfterImage, setPAfterImage] = useState("")
  const [pSiteArea, setPSiteArea] = useState("")
  const [pBuiltArea, setPBuiltArea] = useState("")
  const [pFloors, setPFloors] = useState(1)
  const [pBudgetRange, setPBudgetRange] = useState("")
  const [pStoryTitle, setPStoryTitle] = useState("")
  const [pStoryProcess, setPStoryProcess] = useState("")
  const [pStoryChallenge, setPStoryChallenge] = useState("")
  const [pStorySolution, setPStorySolution] = useState("")
  const [pFeatured, setPFeatured] = useState(false)
  const [pFeaturedOrder, setPFeaturedOrder] = useState(0)

  // Project tags selection
  const [pTags, setPTags] = useState<string[]>([]) // array of tag IDs

  // Gallery URLs reordering
  const [pGallery, setPGallery] = useState<string[]>([])
  const [newGalleryUrl, setNewGalleryUrl] = useState("")
  const [driveFolderUrl, setDriveFolderUrl] = useState("")
  const [isFetchingDrive, setIsFetchingDrive] = useState(false)

  // Technical drawings lists
  const [pDrawings, setPDrawings] = useState<any[]>([]) // array of { title, drawingType, fileUrl }
  const [drawTitle, setDrawTitle] = useState("")
  const [drawType, setDrawType] = useState("Floor Plan")
  const [drawUrl, setDrawUrl] = useState("")

  // Open Project form for Creating
  const openCreateProject = () => {
    setEditingProjectId(null)
    setPTitle("")
    setPDescription("")
    setPCategoryId(categories[0]?.id || "")
    setPProjectType("Villa")
    setPLocation("Kolkata")
    setPArea("3,500 sq ft")
    setPStatus("CONCEPT")
    setPStartDate(new Date().toISOString().split("T")[0])
    setPCompletionDate(new Date().toISOString().split("T")[0])
    setPCoverImage("")
    setPBeforeImage("")
    setPAfterImage("")
    setPSiteArea("")
    setPBuiltArea("")
    setPFloors(1)
    setPBudgetRange("")
    setPStoryTitle("")
    setPStoryProcess("")
    setPStoryChallenge("")
    setPStorySolution("")
    setPFeatured(false)
    setPFeaturedOrder(0)
    setPTags([])
    setPGallery([])
    setPDrawings([])
    setDriveFolderUrl("")
    setProjectModalOpen(true)
  }

  // Open Project form for Editing
  const openEditProject = (proj: any) => {
    setEditingProjectId(proj.id)
    setPTitle(proj.title)
    setPDescription(proj.description)
    setPCategoryId(proj.categoryId)
    setPProjectType(proj.projectType)
    setPLocation(proj.location)
    setPArea(proj.area)
    setPStatus(proj.status)
    setPStartDate(new Date(proj.projectStartDate).toISOString().split("T")[0])
    setPCompletionDate(new Date(proj.completionDate).toISOString().split("T")[0])
    setPCoverImage(proj.coverImage)
    setPBeforeImage(proj.beforeImage || "")
    setPAfterImage(proj.afterImage || "")
    setPSiteArea(proj.siteArea || "")
    setPBuiltArea(proj.builtArea || "")
    setPFloors(proj.floors || 1)
    setPBudgetRange(proj.budgetRange || "")
    setPStoryTitle(proj.storyTitle || "")
    setPStoryProcess(proj.storyProcess || "")
    setPStoryChallenge(proj.storyChallenge || "")
    setPStorySolution(proj.storySolution || "")
    setPFeatured(proj.featured)
    setPFeaturedOrder(proj.featuredOrder)

    // Set selected tag IDs
    setPTags(proj.tags?.map((t: any) => t.tagId) || [])

    // Set gallery URLs
    setPGallery(proj.gallery?.map((g: any) => g.imageUrl) || [])

    // Set drawings
    setPDrawings(proj.drawings || [])
    setDriveFolderUrl("")

    setProjectModalOpen(true)
  }

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: pTitle,
      description: pDescription,
      categoryId: pCategoryId,
      projectType: pProjectType,
      location: pLocation,
      area: pArea,
      status: pStatus,
      projectStartDate: pStartDate,
      completionDate: pCompletionDate,
      coverImage: pCoverImage,
      beforeImage: pBeforeImage || null,
      afterImage: pAfterImage || null,
      siteArea: pSiteArea || null,
      builtArea: pBuiltArea || null,
      floors: pFloors,
      budgetRange: pBudgetRange || null,
      storyTitle: pStoryTitle || null,
      storyProcess: pStoryProcess || null,
      storyChallenge: pStoryChallenge || null,
      storySolution: pStorySolution || null,
      featured: pFeatured,
      featuredOrder: pFeaturedOrder,
      tags: pTags,
      gallery: pGallery,
      drawings: pDrawings,
    }

    let success = false
    if (editingProjectId) {
      success = await updateProject(editingProjectId, payload)
    } else {
      success = await createProject(payload)
    }

    if (success) {
      setProjectModalOpen(false)
      fetchProjects({ includeDeleted: true })
      fetchMetrics()
    } else {
      alert("Error saving project settings.")
    }
  }

  // Fetch images list from public Google Drive folder link
  const handleFetchDriveFolder = async () => {
    if (!driveFolderUrl) return
    setIsFetchingDrive(true)
    try {
      const res = await fetch("/api/admin/fetch-drive-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folderUrl: driveFolderUrl }),
      })
      const data = await res.json()
      if (res.ok && data.imageUrls) {
        if (data.imageUrls.length === 0) {
          alert("No public images found in this Google Drive folder. Please make sure the folder is public ('Anyone with the link can view').")
        } else {
          setPGallery([...pGallery, ...data.imageUrls])
          setDriveFolderUrl("")
          alert(`Successfully fetched and appended ${data.imageUrls.length} images from Google Drive!`)
        }
      } else {
        alert(data.error || "Failed to fetch images from Google Drive.")
      }
    } catch (e: any) {
      console.error(e)
      alert("Error contacting server: " + e.message)
    } finally {
      setIsFetchingDrive(false)
    }
  }

  // Gallery ordering helpers
  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    const updated = [...pGallery]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= updated.length) return
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setPGallery(updated)
  }

  // Drawings reordering and adding helpers
  const addDrawingItem = () => {
    if (!drawTitle || !drawUrl) return
    setPDrawings([...pDrawings, { title: drawTitle, drawingType: drawType, fileUrl: drawUrl }])
    setDrawTitle("")
    setDrawUrl("")
  }

  const moveDrawingItem = (index: number, direction: "up" | "down") => {
    const updated = [...pDrawings]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= updated.length) return
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setPDrawings(updated)
  }

  // --- Category Editor State ---
  const [catName, setCatName] = useState("")
  const [catDesc, setCatDesc] = useState("")
  const [editingCatId, setEditingCatId] = useState<string | null>(null)

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName) return
    let success = false
    if (editingCatId) {
      success = await updateCategory(editingCatId, { name: catName, description: catDesc })
    } else {
      success = await createCategory({ name: catName, description: catDesc })
    }
    if (success) {
      setCatName("")
      setCatDesc("")
      setEditingCatId(null)
    }
  }

  // --- Tag Editor State ---
  const [tagName, setTagName] = useState("")
  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagName) return
    const success = await createTag(tagName)
    if (success) setTagName("")
  }

  // --- Team Member Modal & State ---
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [tName, setTName] = useState("")
  const [tDesignation, setTDesignation] = useState("")
  const [tBio, setTBio] = useState("")
  const [tImage, setTImage] = useState("")
  const [tOrder, setTOrder] = useState(0)

  const openCreateTeam = () => {
    setEditingTeamId(null)
    setTName("")
    setTDesignation("")
    setTBio("")
    setTImage("")
    setTOrder(0)
    setTeamModalOpen(true)
  }

  const openEditTeam = (member: any) => {
    setEditingTeamId(member.id)
    setTName(member.name)
    setTDesignation(member.designation)
    setTBio(member.bio)
    setTImage(member.profileImage)
    setTOrder(member.displayOrder)
    setTeamModalOpen(true)
  }

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { name: tName, designation: tDesignation, bio: tBio, profileImage: tImage, displayOrder: tOrder }
    let success = false
    if (editingTeamId) {
      success = await updateTeamMember(editingTeamId, payload)
    } else {
      success = await createTeamMember(payload)
    }
    if (success) setTeamModalOpen(false)
  }

  // --- Review Modal & State ---
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [revClientName, setRevClientName] = useState("")
  const [revClientPhoto, setRevClientPhoto] = useState("")
  const [revRating, setRevRating] = useState(5)
  const [revReviewText, setRevReviewText] = useState("")
  const [revProjectId, setRevProjectId] = useState("")

  const openCreateReview = () => {
    setEditingReviewId(null)
    setRevClientName("")
    setRevClientPhoto("")
    setRevRating(5)
    setRevReviewText("")
    setRevProjectId("")
    setReviewModalOpen(true)
  }

  const openEditReview = (rev: any) => {
    setEditingReviewId(rev.id)
    setRevClientName(rev.clientName)
    setRevClientPhoto(rev.clientPhoto || "")
    setRevRating(rev.rating)
    setRevReviewText(rev.review)
    setRevProjectId(rev.projectId || "")
    setReviewModalOpen(true)
  }

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      clientName: revClientName,
      clientPhoto: revClientPhoto || null,
      rating: revRating,
      review: revReviewText,
      projectId: revProjectId || null,
    }
    let success = false
    if (editingReviewId) {
      success = await updateReview(editingReviewId, payload)
    } else {
      success = await createReview(payload)
    }
    if (success) {
      setReviewModalOpen(false)
      fetchReviews(true)
    }
  }

  // --- Partner State ---
  const [partName, setPartName] = useState("")
  const [partLogo, setPartLogo] = useState("")
  const [partWebsite, setPartWebsite] = useState("")
  const [partDesc, setPartDesc] = useState("")
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partName) return
    const success = await createPartner({ name: partName, logo: partLogo, website: partWebsite, description: partDesc })
    if (success) {
      setPartName("")
      setPartLogo("")
      setPartWebsite("")
      setPartDesc("")
    }
  }

  // --- Story State ---
  const [storyTitle, setStoryTitle] = useState("")
  const [storyMediaUrl, setStoryMediaUrl] = useState("")
  const [storyMediaType, setStoryMediaType] = useState("image")
  const [storyThumb, setStoryThumb] = useState("")
  const [storyOrder, setStoryOrder] = useState(0)
  const [storyHours, setStoryHours] = useState(24)

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storyTitle || !storyMediaUrl) return
    const success = await createStory({
      title: storyTitle,
      mediaUrl: storyMediaUrl,
      mediaType: storyMediaType,
      thumbnailUrl: storyThumb || null,
      displayOrder: storyOrder,
      expiryHours: storyHours,
    })
    if (success) {
      setStoryTitle("")
      setStoryMediaUrl("")
      setStoryThumb("")
      setStoryOrder(0)
    }
  }

  // --- Announcement State ---
  const [newsModalOpen, setNewsModalOpen] = useState(false)
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)
  const [newsTitle, setNewsTitle] = useState("")
  const [newsContent, setNewsContent] = useState("")
  const [newsStart, setNewsStart] = useState("")
  const [newsEnd, setNewsEnd] = useState("")
  const [newsActive, setNewsActive] = useState(true)
  const [newsImageUrl, setNewsImageUrl] = useState("")
  const [newsExternalLink, setNewsExternalLink] = useState("")
  const [newsProjectId, setNewsProjectId] = useState("")

  const openCreateNews = () => {
    setEditingNewsId(null)
    setNewsTitle("")
    setNewsContent("")
    setNewsStart(new Date().toISOString().split("T")[0])
    // Default end date: 30 days from now
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)
    setNewsEnd(endDate.toISOString().split("T")[0])
    setNewsActive(true)
    setNewsImageUrl("")
    setNewsExternalLink("")
    setNewsProjectId("")
    setNewsModalOpen(true)
  }

  const openEditNews = (news: any) => {
    setEditingNewsId(news.id)
    setNewsTitle(news.title)
    setNewsContent(news.content)
    setNewsStart(new Date(news.startDate).toISOString().split("T")[0])
    setNewsEnd(new Date(news.endDate).toISOString().split("T")[0])
    setNewsActive(news.active)
    setNewsImageUrl(news.imageUrl || "")
    setNewsExternalLink(news.externalLink || "")
    setNewsProjectId(news.projectId || "")
    setNewsModalOpen(true)
  }

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: newsTitle,
      content: newsContent,
      startDate: newsStart,
      endDate: newsEnd,
      active: newsActive,
      imageUrl: newsImageUrl || null,
      externalLink: newsExternalLink || null,
      projectId: newsProjectId || null,
    }
    let success = false
    if (editingNewsId) {
      success = await updateAnnouncement(editingNewsId, payload)
    } else {
      success = await createAnnouncement(payload)
    }
    if (success) setNewsModalOpen(false)
  }

  // --- CRM Leads State ---
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [leadNotes, setLeadNotes] = useState("")
  const [leadAssigned, setLeadAssigned] = useState("")
  const [leadFollowUp, setLeadFollowUp] = useState("")

  const openLeadDetail = (lead: any) => {
    setSelectedLead(lead)
    setLeadNotes(lead.notes || "")
    setLeadAssigned(lead.assignedTo || "")
    setLeadFollowUp(lead.followUpDate ? new Date(lead.followUpDate).toISOString().split("T")[0] : "")
  }

  const handleUpdateLead = async () => {
    if (!selectedLead) return
    const success = await updateLeadStatus(selectedLead.id, {
      status: selectedLead.status,
      notes: leadNotes,
      assignedTo: leadAssigned,
      followUpDate: leadFollowUp || null,
    })
    if (success) {
      setSelectedLead(null)
    }
  }

  const handleDeleteLeadPermanently = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer inquiry? This action cannot be undone.")) return
    const success = await deleteLead(id)
    if (success) {
      alert("Inquiry deleted successfully.")
    } else {
      alert("Failed to delete inquiry.")
    }
  }

  // --- Site CMS Settings State ---
  const [sHeroTitle, setSHeroTitle] = useState("")
  const [sHeroSubtitle, setSHeroSubtitle] = useState("")
  const [sAboutTitle, setSAboutTitle] = useState("")
  const [sAboutContent, setSAboutContent] = useState("")
  const [sPhone, setSPhone] = useState("")
  const [sEmail, setSEmail] = useState("")
  const [sAddress, setSAddress] = useState("")
  const [sFooter, setSFooter] = useState("")
  // New extended fields
  const [sYearsExp, setSYearsExp] = useState(0)
  const [sTotalProjects, setSTotalProjects] = useState(0)
  const [sAwards, setSAwards] = useState(0)
  const [sShowSpatial, setSShowSpatial] = useState(true)
  const [sShowTeam, setSShowTeam] = useState(true)
  const [sShowFaq, setSShowFaq] = useState(true)
  const [sMapUrl, setSMapUrl] = useState("")
  const [sMilestones, setSMilestones] = useState<{ year: string; title: string; desc: string }[]>([])

  useEffect(() => {
    if (settings) {
      setSHeroTitle(settings.heroTitle)
      setSHeroSubtitle(settings.heroSubtitle)
      setSAboutTitle(settings.aboutTitle)
      setSAboutContent(settings.aboutContent)
      setSPhone(settings.contactPhone)
      setSEmail(settings.contactEmail)
      setSAddress(settings.officeAddress)
      setSFooter(settings.footerContent || "")
      setSYearsExp(settings.yearsExperience || 0)
      setSTotalProjects(settings.totalProjectsCount || 0)
      setSAwards(settings.designAwardsCount || 0)
      setSShowSpatial(settings.showSpatialEvolutions !== false)
      setSShowTeam(settings.showTeam !== false)
      setSShowFaq(settings.showFaq !== false)
      setSMapUrl(settings.mapEmbedUrl || "")
      try {
        setSMilestones(settings.milestones ? JSON.parse(settings.milestones) : [])
      } catch {
        setSMilestones([])
      }
    }
  }, [settings])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await updateSettings({
      heroTitle: sHeroTitle,
      heroSubtitle: sHeroSubtitle,
      aboutTitle: sAboutTitle,
      aboutContent: sAboutContent,
      contactPhone: sPhone,
      contactEmail: sEmail,
      officeAddress: sAddress,
      footerContent: sFooter,
      yearsExperience: sYearsExp,
      totalProjectsCount: sTotalProjects,
      designAwardsCount: sAwards,
      showSpatialEvolutions: sShowSpatial,
      showTeam: sShowTeam,
      showFaq: sShowFaq,
      mapEmbedUrl: sMapUrl,
      milestones: JSON.stringify(sMilestones),
    })
    if (success) {
      alert("Site settings updated successfully!")
    }
  }

  // Sidebar navigation panel details
  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { id: "projects", label: "Projects", icon: <Briefcase size={16} /> },
    { id: "categories", label: "Categories & Tags", icon: <Layers size={16} /> },
    { id: "media", label: "Media Library", icon: <ImageIcon size={16} /> },
    { id: "team", label: "Team Members", icon: <Users size={16} /> },
    { id: "leads", label: "Quote Leads", icon: <FolderHeart size={16} /> },
    { id: "reviews", label: "Reviews", icon: <MessageSquare size={16} /> },
    { id: "stories", label: "Daily Stories", icon: <Sparkles size={16} /> },
    { id: "announcements", label: "Announcements", icon: <Volume2 size={16} /> },
    { id: "partners", label: "Partners", icon: <CheckCircle size={16} /> },
    { id: "settings", label: "CMS Settings", icon: <Settings size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-[#111111] text-white font-body flex">
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-[#1A1A1A] border-r border-white/5 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-1.5 shrink-0 mb-1">
              <img src="/logov1-g.png" className="h-[32px] object-contain mr-[2px]" />
              <span className="text-accent text-lg font-extrabold mb-[-4px]">.</span>
              <div className="flex flex-col text-[10px] font-headings font-extrabold leading-none text-white tracking-tight">
                <div className="flex gap-1 items-center">
                  <span>ARCHITECTS</span>
                  <span className="text-accent">&</span>
                </div>
                <span>DEVELOPERS</span>
              </div>
            </div>
            <span className="text-[8px] uppercase tracking-wider text-mutedText block mt-2 font-semibold">
              Admin Control Panel
            </span>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-architectural text-xs font-semibold tracking-wide transition-all ${activeTab === item.id
                    ? "bg-accent text-white"
                    : "text-mutedText hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-white truncate max-w-[120px]">{user?.name || "Gautam Sen"}</p>
            <span className="text-[9px] text-mutedText uppercase font-bold tracking-wider">{user?.role || "Admin"}</span>
          </div>
          <button
            onClick={() => {
              logout()
              navigate("/admin/login")
            }}
            className="p-2 rounded bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-mutedText transition-colors"
            title="Log Out Session"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <main className="flex-grow p-8 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="font-headings text-2xl font-black uppercase text-white">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-mutedText mt-1">
              Logged in session as Gautam Sen. Coordinates active.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-xs font-bold uppercase tracking-wider text-accent border border-accent/25 hover:bg-accent/15 px-4 py-2 rounded-architectural transition-colors"
          >
            Launch Client Site
          </button>
        </div>

        {/* =========================================================
            TAB CONTENT: OVERVIEW
            ========================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
              {[
                { label: "Total Projects", count: metrics?.totalProjects || 0 },
                { label: "Active Designs", count: metrics?.activeProjects || 0 },
                { label: "Client Reviews", count: metrics?.totalReviews || 0 },
                { label: "New Leads", count: metrics?.newLeads || 0, highlight: true },
                { label: "Live Stories", count: metrics?.activeStories || 0 },
                { label: "News Popups", count: metrics?.activeAnnouncements || 0 },
              ].map((c, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-white/5 p-4 rounded-architectural">
                  <span className="text-[9px] uppercase tracking-wider text-mutedText font-bold">{c.label}</span>
                  <p className={`text-2xl font-headings font-black mt-2 ${c.highlight ? "text-accent" : "text-white"}`}>
                    {c.count}
                  </p>
                </div>
              ))}
            </div>

            {/* Simulated Analytics Script Visual panel */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white">
                  Plausible / Google Analytics Tracker Metrics
                </h3>
                <span className="px-2 py-0.5 text-[8px] bg-green-500/10 text-green-500 rounded font-bold uppercase">
                  Connected Script Active
                </span>
              </div>
              <div className="grid grid-cols-4 gap-6 text-center border-b border-white/5 pb-6 mb-6">
                <div>
                  <span className="text-mutedText text-[10px] uppercase font-bold tracking-wider block">Website Visits (Month)</span>
                  <strong className="text-xl font-headings text-white mt-1 block">
                    {metrics?.websiteVisits !== undefined ? metrics.websiteVisits : "..."}
                  </strong>
                </div>
                <div>
                  <span className="text-mutedText text-[10px] uppercase font-bold tracking-wider block">Lead Conversion Rate</span>
                  <strong className="text-xl font-headings text-accent mt-1 block">
                    {metrics?.conversionRate !== undefined ? `${metrics.conversionRate}%` : "..."}
                  </strong>
                </div>
                <div>
                  <span className="text-mutedText text-[10px] uppercase font-bold tracking-wider block">Most Visited Project</span>
                  <strong className="text-sm font-headings text-white mt-2 block truncate" title={metrics?.mostVisitedProject || "NONE"}>
                    {metrics?.mostVisitedProject || "NONE"}
                  </strong>
                </div>
                <div>
                  <span className="text-mutedText text-[10px] uppercase font-bold tracking-wider block">Active Story Engagements</span>
                  <strong className="text-xl font-headings text-white mt-1 block">340 Views</strong>
                </div>
              </div>

              {/* Fake coordinate line representing charts */}
              <div className="h-[120px] bg-[#111111] rounded-architectural border border-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 flex flex-col justify-between p-2">
                  <div className="border-b border-dashed border-white" />
                  <div className="border-b border-dashed border-white" />
                  <div className="border-b border-dashed border-white" />
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-mutedText">
                  Studio traffic line graph visualizer (Plausible tracker data API)
                </div>
              </div>
            </div>

            {/* Recent Leads and Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Leads */}
              <div className="lg:col-span-8 bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
                <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white mb-4">
                  Recent Customer quote leads
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-mutedText uppercase text-[9px] font-bold">
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Scope</th>
                        <th className="py-2.5">Budget</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leads.slice(0, 5).map((l) => (
                        <tr key={l.id} className="hover:bg-white/5">
                          <td className="py-2.5 font-bold">{l.name}</td>
                          <td className="py-2.5">{l.serviceType}</td>
                          <td className="py-2.5">{l.budget}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${l.status === "New" ? "bg-accent/15 text-accent" : "bg-white/10 text-mutedText"
                              }`}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-4 bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural space-y-4">
                <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white mb-2">
                  Quick Studio Actions
                </h3>
                <button
                  onClick={() => {
                    setActiveTab("projects")
                    setTimeout(openCreateProject, 100)
                  }}
                  className="w-full py-3 bg-accent text-white uppercase text-[10px] font-bold tracking-widest rounded-architectural hover:bg-opacity-90 flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Add New Project
                </button>
                <button
                  onClick={() => setActiveTab("media")}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white uppercase text-[10px] font-bold tracking-widest rounded-architectural flex items-center justify-center gap-2 border border-white/5"
                >
                  <ImageIcon size={14} />
                  Upload Media File
                </button>
                <button
                  onClick={() => setActiveTab("stories")}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white uppercase text-[10px] font-bold tracking-widest rounded-architectural flex items-center justify-center gap-2 border border-white/5"
                >
                  <Sparkles size={14} />
                  Post Daily Activity Story
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: PROJECTS MODULE
            ========================================================= */}
        {activeTab === "projects" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-architectural border border-white/5">
              <span className="text-xs font-semibold text-mutedText">
                Manage architectural drafts, elevations, drawings, and filter keywords.
              </span>
              <button
                onClick={openCreateProject}
                className="px-5 py-2.5 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded-architectural hover:bg-opacity-95 flex items-center gap-2"
              >
                <Plus size={14} />
                Create Project
              </button>
            </div>

            {/* Projects table list */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-architectural overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-mutedText uppercase text-[9px] font-bold">
                    <th className="p-4">Project Scope</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4">Timeline</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.map((proj) => (
                    <tr
                      key={proj.id}
                      className={`hover:bg-white/5 ${proj.deletedAt ? "opacity-45 bg-red-500/[0.02]" : ""}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded overflow-hidden bg-white/10 shrink-0">
                            <img src={proj.coverImage} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{proj.title}</span>
                            <span className="text-[10px] text-mutedText">{proj.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{proj.category?.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-accent">
                          {proj.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {proj.featured ? (
                          <span className="text-[9px] text-green-500 font-bold uppercase">YES (#{proj.featuredOrder})</span>
                        ) : (
                          <span className="text-[9px] text-mutedText font-bold uppercase">NO</span>
                        )}
                      </td>
                      <td className="p-4">
                        {new Date(proj.projectStartDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} -{" "}
                        {new Date(proj.completionDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditProject(proj)}
                          className="p-1.5 rounded bg-white/5 hover:bg-accent text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>

                        {/* Soft Delete Archive/Restore */}
                        {proj.deletedAt ? (
                          <button
                            onClick={async () => {
                              if (await restoreProject(proj.id)) {
                                fetchProjects({ includeDeleted: true })
                                fetchMetrics()
                              }
                            }}
                            className="p-1.5 rounded bg-green-500/10 hover:bg-green-500/30 text-green-500 transition-colors"
                            title="Restore"
                          >
                            <RefreshCw size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (confirm("Archive this project? It will hide from client views.")) {
                                if (await archiveProject(proj.id)) {
                                  fetchProjects({ includeDeleted: true })
                                  fetchMetrics()
                                }
                              }
                            }}
                            className="p-1.5 rounded bg-orange-500/10 hover:bg-orange-500/30 text-orange-500 transition-colors"
                            title="Archive"
                          >
                            <ShieldAlert size={12} />
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            if (confirm("Permanently delete this project from SQLite? This action is irreversible.")) {
                              if (await deleteProject(proj.id)) {
                                fetchProjects({ includeDeleted: true })
                                fetchMetrics()
                              }
                            }
                          }}
                          className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/30 text-red-500 transition-colors"
                          title="Delete Permanently"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: CATEGORIES & TAGS
            ========================================================= */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
            {/* Categories */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural space-y-6">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3">
                Project Categories
              </h3>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    placeholder="e.g. Interior Design"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Short Description</label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    placeholder="e.g. Custom spacing, joineries..."
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white uppercase text-[10px] font-bold tracking-widest rounded"
                >
                  {editingCatId ? "Update Category" : "Add Category"}
                </button>
              </form>

              <div className="divide-y divide-white/5 pt-4">
                {categories.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white block">{c.name}</strong>
                      <span className="text-[10px] text-mutedText leading-none">{c.description}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCatId(c.id)
                          setCatName(c.name)
                          setCatDesc(c.description || "")
                        }}
                        className="text-[10px] text-accent font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(c.id)}
                        className="text-[10px] text-red-500 font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural space-y-6">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3">
                Project Filter Tags
              </h3>

              <form onSubmit={handleSaveTag} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Tag Name</label>
                  <input
                    type="text"
                    required
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                    placeholder="e.g. Villa"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white uppercase text-[10px] font-bold tracking-widest rounded"
                >
                  Create Tag
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-4">
                {tags.map((t) => (
                  <span
                    key={t.id}
                    className="text-xs bg-[#111111] border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2"
                  >
                    <span>#{t.name}</span>
                    <button
                      onClick={() => deleteTag(t.id)}
                      className="text-red-500 hover:text-red-600 font-bold text-[9px] uppercase tracking-wide border border-white/10 rounded px-1"
                    >
                      X
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: MEDIA LIBRARY
            ========================================================= */}
        {activeTab === "media" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white mb-4">
                Upload New Image/Drawing/Video
              </h3>

              <div className="border-2 border-dashed border-white/10 rounded-architectural p-8 text-center bg-[#111111] relative hover:border-accent transition-colors">
                <input
                  type="file"
                  onChange={handleMediaUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={mediaUploading}
                />
                <ImageIcon className="mx-auto text-mutedText mb-3 opacity-60" size={32} />
                <p className="text-xs text-white">
                  {mediaUploading ? "Uploading file..." : "Drag files here or click to browse local folders"}
                </p>
                <span className="text-[10px] text-mutedText block mt-1">Supports PNG, JPG, WEBP, and PDF blueprint sheets</span>
              </div>
            </div>

            {/* Media Asset grid list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {mediaAssets.map((asset) => (
                <div key={asset.id} className="bg-[#1A1A1A] border border-white/5 rounded-architectural overflow-hidden group">
                  <div className="aspect-[4/3] bg-[#111111] border-b border-white/5 relative flex items-center justify-center">
                    {asset.fileType === "image" ? (
                      <img src={asset.filePath} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-accent">Drawing Schematics</span>
                    )}

                    <button
                      onClick={() => handleDeleteMedia(asset.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="p-3 text-[10px]">
                    <p className="font-bold text-white truncate">{asset.filename}</p>
                    <span className="text-mutedText font-mono block truncate mt-1 bg-black/40 p-1 rounded select-all" title="Click to select file url">
                      {asset.filePath}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: TEAM MEMBERS
            ========================================================= */}
        {activeTab === "team" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-architectural border border-white/5">
              <span className="text-xs font-semibold text-mutedText">Add, edit, or re-order the core architecture leaders.</span>
              <button
                onClick={openCreateTeam}
                className="px-4 py-2 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Member
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {team.map((member) => (
                <div key={member.id} className="bg-[#1A1A1A] border border-white/5 rounded-architectural p-5 space-y-4">
                  <div className="w-full aspect-square rounded bg-[#111111] overflow-hidden">
                    <img src={member.profileImage} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-headings text-sm font-bold text-white">{member.name}</h4>
                    <span className="text-[9px] uppercase font-bold text-accent tracking-widest">{member.designation}</span>
                  </div>
                  <p className="text-[11px] text-mutedText leading-relaxed line-clamp-3">{member.bio}</p>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <span className="text-[9px] text-mutedText font-semibold">Order: #{member.displayOrder}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditTeam(member)} className="text-[10px] text-accent font-bold">Edit</button>
                      <button onClick={() => deleteTeamMember(member.id)} className="text-[10px] text-red-500 font-bold">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: CRM LEADS LIST
            ========================================================= */}
        {activeTab === "leads" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#1A1A1A] border border-white/5 rounded-architectural overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-mutedText uppercase text-[9px] font-bold">
                    <th className="p-4">Contact</th>
                    <th className="p-4">Required Service</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Assigned To</th>
                    <th className="p-4">Next Follow Up</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5">
                      <td className="p-4">
                        <div>
                          <strong className="text-white block">{lead.name}</strong>
                          <span className="text-[10px] text-mutedText block">{lead.email}</span>
                          <span className="text-[10px] text-mutedText block">{lead.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="text-white block font-medium">{lead.serviceType}</span>
                          <span className="text-[9px] text-mutedText block">Type: {lead.projectType}</span>
                        </div>
                      </td>
                      <td className="p-4">{lead.budget}</td>
                      <td className="p-4">{lead.assignedTo || "Unassigned"}</td>
                      <td className="p-4">
                        {lead.followUpDate
                          ? new Date(lead.followUpDate).toLocaleDateString("en-IN")
                          : "None"}
                      </td>
                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, { status: e.target.value })}
                          className="bg-[#111111] border border-white/15 text-[10px] font-bold uppercase rounded px-2 py-1 text-accent"
                        >
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Closed</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openLeadDetail(lead)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-accent text-white font-bold uppercase tracking-wider rounded text-[10px] transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteLeadPermanently(lead.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold uppercase tracking-wider rounded text-[10px] transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lead Details Overlay Modal */}
            {selectedLead && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-[#1A1A1A] border border-white/10 rounded-architectural max-w-lg w-full p-6 relative">
                  <button onClick={() => setSelectedLead(null)} className="absolute top-4 right-4 text-mutedText hover:text-white">
                    <X size={20} />
                  </button>

                  <h3 className="font-headings text-md font-bold mb-4 text-white">Lead Details: {selectedLead.name}</h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <strong className="text-mutedText block">Client Message</strong>
                      <p className="bg-[#111111] p-3 rounded text-white leading-relaxed mt-1">{selectedLead.message}</p>
                    </div>

                    {selectedLead.attachmentUrl && (
                      <div>
                        <strong className="text-mutedText block">Lead Blueprints/Photos Attachment</strong>
                        <a
                          href={selectedLead.attachmentUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1.5 bg-accent text-white px-3 py-1.5 rounded font-bold uppercase text-[9px]"
                        >
                          <Download size={12} /> Download Attachment
                        </a>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Assigned Designer</label>
                        <input
                          type="text"
                          value={leadAssigned}
                          onChange={(e) => setLeadAssigned(e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white"
                          placeholder="e.g. Gautam Sen"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Follow Up Date</label>
                        <input
                          type="date"
                          value={leadFollowUp}
                          onChange={(e) => setLeadFollowUp(e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Developer Admin Remarks / Notes</label>
                      <textarea
                        rows={3}
                        value={leadNotes}
                        onChange={(e) => setLeadNotes(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white resize-none"
                        placeholder="Client requested callback for cliff foundations detail..."
                      />
                    </div>

                    <button
                      onClick={handleUpdateLead}
                      className="w-full py-2.5 bg-accent text-white font-bold uppercase text-xs rounded"
                    >
                      Update Lead Records
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: REVIEWS MANAGER
            ========================================================= */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-architectural border border-white/5">
              <span className="text-xs font-semibold text-mutedText">Manage developer testimonials and connect directly to project records.</span>
              <button
                onClick={openCreateReview}
                className="px-4 py-2 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Review
              </button>
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-architectural overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-mutedText uppercase text-[9px] font-bold">
                    <th className="p-4">Client Name</th>
                    <th className="p-4">Connected Project</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Review Text</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reviews.map((rev) => (
                    <tr
                      key={rev.id}
                      className={`hover:bg-white/5 ${rev.deletedAt ? "opacity-45 bg-red-500/[0.02]" : ""}`}
                    >
                      <td className="p-4 font-bold text-white">{rev.clientName}</td>
                      <td className="p-4">{rev.project?.title || "None"}</td>
                      <td className="p-4 text-accent">{"★".repeat(rev.rating)}</td>
                      <td className="p-4 max-w-xs truncate">{rev.review}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditReview(rev)}
                          className="text-[10px] text-accent font-bold"
                        >
                          Edit
                        </button>

                        {rev.deletedAt ? (
                          <button
                            onClick={async () => {
                              if (await restoreReview(rev.id)) fetchReviews(true)
                            }}
                            className="text-[10px] text-green-500 font-bold"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (confirm("Archive this review?")) {
                                if (await archiveReview(rev.id)) fetchReviews(true)
                              }
                            }}
                            className="text-[10px] text-orange-500 font-bold"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (confirm("Permanently delete review?")) {
                              if (await deleteReview(rev.id)) fetchReviews(true)
                            }
                          }}
                          className="text-[10px] text-red-500 font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: DAILY STORIES
            ========================================================= */}
        {activeTab === "stories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Story creator */}
            <div className="lg:col-span-5 bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural space-y-6">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3">
                Post Daily Construction Story
              </h3>
              <form onSubmit={handleSaveStory} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Story Title</label>
                  <input
                    type="text"
                    required
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white"
                    placeholder="e.g. Concrete Pouring Zenith Tower"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Story Media Path</label>
                  <input
                    type="text"
                    required
                    value={storyMediaUrl}
                    onChange={(e) => setStoryMediaUrl(convertGoogleDriveUrl(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white font-mono"
                    placeholder="e.g. /uploads/concrete.jpg"
                  />
                  <span className="text-[8px] text-mutedText mt-1 block">Copy this from the Media Library tab.</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Media Type</label>
                    <select
                      value={storyMediaType}
                      onChange={(e) => setStoryMediaType(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 text-xs rounded px-2 py-2 text-white"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Expiry Hours</label>
                    <input
                      type="number"
                      value={storyHours}
                      onChange={(e) => setStoryHours(parseInt(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded"
                >
                  Publish Story Update
                </button>
              </form>
            </div>

            {/* Stories List */}
            <div className="lg:col-span-7 bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural space-y-4">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3">
                Live Stories (Expiring in 24-72h)
              </h3>

              <div className="divide-y divide-white/5">
                {stories.map((story) => (
                  <div key={story.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#111111] overflow-hidden shrink-0">
                        <img src={story.mediaUrl} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <strong className="text-white block">{story.title}</strong>
                        <span className="text-[9px] text-mutedText block uppercase font-semibold">
                          Expires: {new Date(story.expiryDate).toLocaleTimeString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteStory(story.id)}
                      className="text-red-500 font-bold hover:text-red-600 uppercase text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: ANNOUNCEMENTS
            ========================================================= */}
        {activeTab === "announcements" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-architectural border border-white/5">
              <span className="text-xs font-semibold text-mutedText">Post announcements that popup on page entry for consumers.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Clear all dismissed announcement flags so they reappear on site
                    Object.keys(localStorage).filter(k => k.startsWith("g_news_dismissed_")).forEach(k => localStorage.removeItem(k))
                    alert("Dismissed flags cleared. Reload the homepage to see the popup.")
                  }}
                  className="px-3 py-2 border border-white/20 text-white uppercase text-[10px] font-bold tracking-widest rounded hover:bg-white/10 transition-colors"
                >
                  Preview on Site
                </button>
                <button
                  onClick={openCreateNews}
                  className="px-4 py-2 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Announcement
                </button>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-architectural overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-mutedText uppercase text-[9px] font-bold">
                    <th className="p-4">Title</th>
                    <th className="p-4">Content</th>
                    <th className="p-4">Valid Range</th>
                    <th className="p-4">Active Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {announcements.map((news) => (
                    <tr key={news.id} className="hover:bg-white/5">
                      <td className="p-4 font-bold text-white">{news.title}</td>
                      <td className="p-4 max-w-xs truncate">{news.content}</td>
                      <td className="p-4">
                        {new Date(news.startDate).toLocaleDateString()} -{" "}
                        {new Date(news.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {news.active ? (
                          <span className="text-green-500 font-bold uppercase text-[9px]">Active</span>
                        ) : (
                          <span className="text-mutedText font-bold uppercase text-[9px]">Disabled</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditNews(news)} className="text-accent font-bold text-[10px]">Edit</button>
                        <button onClick={() => deleteAnnouncement(news.id)} className="text-red-500 font-bold text-[10px]">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
          OVERLAY MODAL: ANNOUNCEMENT CREATE / EDIT
          ========================================================= */}
        {newsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="absolute inset-0" onClick={() => setNewsModalOpen(false)} />
            <div className="relative bg-[#1A1A1A] border border-white/10 rounded-architectural max-w-lg w-full shadow-2xl z-10 flex flex-col" style={{ maxHeight: "90vh" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <h3 className="font-headings text-sm font-bold text-white uppercase">
                  {editingNewsId ? "Edit Announcement" : "New Announcement"}
                </h3>
                <button onClick={() => setNewsModalOpen(false)} className="p-1.5 text-mutedText hover:text-white hover:bg-white/10 rounded transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form */}
              <div className="overflow-y-auto flex-grow">
                <form id="news-form" onSubmit={handleSaveNews} className="p-6 space-y-5 text-xs text-white">

                  {/* Title */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1.5">Announcement Title *</label>
                    <input
                      type="text" required value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
                      placeholder="e.g. New Project Launch — Villa Horizon"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1.5">Content / Body Text *</label>
                    <textarea
                      rows={3} required value={newsContent} onChange={(e) => setNewsContent(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-accent resize-none"
                      placeholder="Describe the announcement. This appears in the popup on the homepage."
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1.5">Start Date *</label>
                      <input
                        type="date" required value={newsStart} onChange={(e) => setNewsStart(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1.5">End Date *</label>
                      <input
                        type="date" required value={newsEnd} onChange={(e) => setNewsEnd(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[10px] text-mutedText uppercase font-bold tracking-wider mb-4">Optional Enhancements</p>

                    {/* Banner Image URL */}
                    <div className="mb-4">
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1.5">Banner Image URL</label>
                      <input
                        type="url" value={newsImageUrl} onChange={(e) => setNewsImageUrl(convertGoogleDriveUrl(e.target.value))}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white font-mono text-[10px] focus:outline-none focus:border-accent"
                        placeholder="https://... or /uploads/..."
                      />
                      {newsImageUrl && (
                        <div className="mt-2 rounded overflow-hidden border border-white/10 h-24">
                          <img src={newsImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = "none" }} />
                        </div>
                      )}
                      <p className="text-[9px] text-white/30 mt-1">Displayed as a full-width banner at top of popup.</p>
                    </div>

                    {/* Project Link */}
                    <div className="mb-4">
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1.5">Link to Project (CTA Button)</label>
                      <select
                        value={newsProjectId} onChange={(e) => { setNewsProjectId(e.target.value); if (e.target.value) setNewsExternalLink("") }}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
                      >
                        <option value="">— No Project —</option>
                        {projects.filter(p => !p.deletedAt).map((p: any) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <p className="text-[9px] text-white/30 mt-1">Adds a "View Project" button that redirects to the project detail page.</p>
                    </div>

                    {/* External Link — only show if no project selected */}
                    {!newsProjectId && (
                      <div className="mb-4">
                        <label className="text-[10px] uppercase font-bold text-mutedText block mb-1.5">External Link / Download URL</label>
                        <input
                          type="url" value={newsExternalLink} onChange={(e) => setNewsExternalLink(e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white font-mono text-[10px] focus:outline-none focus:border-accent"
                          placeholder="https://... (brochure, form, etc.)"
                        />
                        <p className="text-[9px] text-white/30 mt-1">Adds an "Open Link" button (opens in new tab). Used if no project is linked.</p>
                      </div>
                    )}
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between py-3 border-t border-white/10">
                    <div>
                      <span className="text-xs font-medium text-white block">Mark as Active</span>
                      <span className="text-[9px] text-white/40">Shows on website within date range</span>
                    </div>
                    <button
                      type="button" onClick={() => setNewsActive(!newsActive)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${newsActive ? "bg-accent" : "bg-white/20"}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${newsActive ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>

                </form>
              </div>

              {/* Sticky Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0 bg-[#1A1A1A]">
                <button type="button" onClick={() => setNewsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase">
                  Cancel
                </button>
                <button type="submit" form="news-form" className="px-5 py-2 bg-accent text-white rounded text-[10px] font-bold uppercase tracking-wider">
                  {editingNewsId ? "Update Announcement" : "Publish Announcement"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: PARTNERS
            ========================================================= */}
        {activeTab === "partners" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Creator */}
            <div className="lg:col-span-5 bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural space-y-6">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3">
                Add Partner Company Logo
              </h3>
              <form onSubmit={handleSavePartner} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white"
                    placeholder="e.g. Saint-Gobain Glass"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Logo Name / Label</label>
                  <input
                    type="text"
                    required
                    value={partLogo}
                    onChange={(e) => setPartLogo(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white"
                    placeholder="e.g. Saint-Gobain"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Website URL</label>
                  <input
                    type="url"
                    value={partWebsite}
                    onChange={(e) => setPartWebsite(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 text-xs rounded px-3 py-2 text-white"
                    placeholder="https://www.saint-gobain.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded"
                >
                  Register Partner Logo
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-7 bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural overflow-hidden">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3 mb-4">
                scrolling partners roster
              </h3>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-mutedText uppercase text-[9px] font-bold">
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Website</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {partners.map((part) => (
                    <tr
                      key={part.id}
                      className={`hover:bg-white/5 ${part.deletedAt ? "opacity-40 bg-red-500/[0.02]" : ""}`}
                    >
                      <td className="py-2.5 font-bold text-white">{part.name}</td>
                      <td className="py-2.5 text-accent">{part.website || "None"}</td>
                      <td className="py-2.5 text-right space-x-2">
                        {part.deletedAt ? (
                          <button onClick={async () => {
                            if (await restorePartner(part.id)) fetchPartners(true)
                          }} className="text-[10px] text-green-500 font-bold">Restore</button>
                        ) : (
                          <button onClick={async () => {
                            if (confirm("Archive partner?")) {
                              if (await archivePartner(part.id)) fetchPartners(true)
                            }
                          }} className="text-[10px] text-orange-500 font-bold">Archive</button>
                        )}
                        <button onClick={async () => {
                          if (confirm("Permanently delete partner logo?")) {
                            if (await deletePartner(part.id)) fetchPartners(true)
                          }
                        }} className="text-[10px] text-red-500 font-bold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB CONTENT: GLOBAL CMS SETTINGS
            ========================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">

            {/* ── SECTION 1: Hero Content ── */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                Hero Section Content
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Hero Title</label>
                  <input type="text" value={sHeroTitle} onChange={(e) => setSHeroTitle(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Hero Subtitle</label>
                  <input type="text" value={sHeroSubtitle} onChange={(e) => setSHeroSubtitle(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Hero Stats (0 = hidden) ── */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                Hero Stats Counter
                <span className="text-[9px] text-mutedText font-normal ml-2 normal-case">(Set to 0 to hide on website)</span>
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Years Experience</label>
                  <input type="number" min="0" value={sYearsExp} onChange={(e) => setSYearsExp(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Total Projects</label>
                  <input type="number" min="0" value={sTotalProjects} onChange={(e) => setSTotalProjects(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Design Awards</label>
                  <input type="number" min="0" value={sAwards} onChange={(e) => setSAwards(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Section Visibility ── */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                Section Visibility Controls
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Spatial Evolutions (Before/After Slider)", value: sShowSpatial, set: setSShowSpatial },
                  { label: "Team Section (Meet Our Leadership)", value: sShowTeam, set: setSShowTeam },
                  { label: "FAQ Accordion Section", value: sShowFaq, set: setSShowFaq },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-xs text-white font-medium">{label}</span>
                    <button
                      type="button"
                      onClick={() => set(!value)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? "bg-accent" : "bg-white/20"}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-mutedText mt-4">Hiding a section also removes it from the top navigation bar.</p>
            </div>

            {/* ── SECTION 4: About Content ── */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                About / Journey Section
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Section Title</label>
                  <input type="text" value={sAboutTitle} onChange={(e) => setSAboutTitle(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">About Content Paragraph</label>
                  <textarea rows={3} value={sAboutContent} onChange={(e) => setSAboutContent(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent resize-none" />
                </div>
              </div>
            </div>

            {/* ── SECTION 5: Milestones Editor ── */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                Studio Milestones Timeline
              </h3>
              <div className="space-y-3 mb-4">
                {sMilestones.map((m, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-[#111111] p-3 rounded-lg border border-white/5">
                    <div className="col-span-2">
                      <label className="text-[9px] text-mutedText uppercase font-bold block mb-1">Year</label>
                      <input type="text" value={m.year}
                        onChange={(e) => { const u = [...sMilestones]; u[idx] = { ...u[idx], year: e.target.value }; setSMilestones(u) }}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded px-2 py-1.5 text-white text-xs" placeholder="2024" />
                    </div>
                    <div className="col-span-4">
                      <label className="text-[9px] text-mutedText uppercase font-bold block mb-1">Title</label>
                      <input type="text" value={m.title}
                        onChange={(e) => { const u = [...sMilestones]; u[idx] = { ...u[idx], title: e.target.value }; setSMilestones(u) }}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded px-2 py-1.5 text-white text-xs" placeholder="Milestone Title" />
                    </div>
                    <div className="col-span-5">
                      <label className="text-[9px] text-mutedText uppercase font-bold block mb-1">Description</label>
                      <input type="text" value={m.desc}
                        onChange={(e) => { const u = [...sMilestones]; u[idx] = { ...u[idx], desc: e.target.value }; setSMilestones(u) }}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded px-2 py-1.5 text-white text-xs" placeholder="Brief description..." />
                    </div>
                    <div className="col-span-1 flex items-end pb-0.5">
                      <button type="button" onClick={() => setSMilestones(sMilestones.filter((_, i) => i !== idx))}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded w-full flex items-center justify-center mt-5">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setSMilestones([...sMilestones, { year: "", title: "", desc: "" }])}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                <Plus size={12} />
                Add Milestone
              </button>
            </div>

            {/* ── SECTION 6: Contact Info ── */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                Contact Information
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Phone</label>
                  <input type="text" value={sPhone} onChange={(e) => setSPhone(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Email</label>
                  <input type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Office Address</label>
                  <input type="text" value={sAddress} onChange={(e) => setSAddress(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>

            {/* ── SECTION 7: Google Maps Embed ── */}
            <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-architectural">
              <h3 className="font-headings text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                Google Maps Embed
              </h3>
              <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">
                Maps iFrame src URL <span className="text-white/40 normal-case">(paste the URL value from the iframe src="..." attribute)</span>
              </label>
              <input type="text" value={sMapUrl} onChange={(e) => setSMapUrl(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-accent mb-4"
                placeholder="https://www.google.com/maps/embed?pb=..." />
              {sMapUrl && (
                <div className="rounded overflow-hidden border border-white/10">
                  <iframe src={sMapUrl} width="100%" height="200" style={{ border: 0 }} loading="lazy" title="Map Preview" />
                </div>
              )}
            </div>

            {/* ── SAVE BUTTON ── */}
            <form onSubmit={handleSaveSettings}>
              <button type="submit"
                className="w-full py-4 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded-architectural shadow hover:bg-opacity-95 flex items-center justify-center gap-2">
                <CheckCircle size={14} />
                Save All CMS Configuration
              </button>
            </form>
          </div>
        )}



      </main>

      {/* =========================================================
          OVERLAY MODAL: PROJECT CREATION/EDITING
          ========================================================= */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          {/* Clicking backdrop closes modal */}
          <div className="absolute inset-0" onClick={() => setProjectModalOpen(false)} />

          <div className="relative bg-[#1A1A1A] border border-white/10 rounded-architectural w-full max-w-4xl shadow-2xl z-10 flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Sticky header inside modal */}
            <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10 shrink-0">
              <h3 className="font-headings text-md font-bold text-white uppercase">
                {editingProjectId ? "Modify Project Parameters" : "Draft New Project Coordinates"}
              </h3>
              <button
                onClick={() => setProjectModalOpen(false)}
                className="p-1.5 text-mutedText hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>{/* end sticky header */}

            {/* Scrollable form body */}
            <div className="overflow-y-auto flex-grow px-6 md:px-8 py-6">
              <form id="project-form" onSubmit={handleSaveProject} className="space-y-6 text-xs text-white">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      value={pTitle}
                      onChange={(e) => setPTitle(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white font-bold"
                      placeholder="e.g. Villa Horizon"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Project Category</label>
                    <select
                      value={pCategoryId}
                      onChange={(e) => setPCategoryId(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Project/Scope Type</label>
                    <input
                      type="text"
                      required
                      value={pProjectType}
                      onChange={(e) => setPProjectType(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2"
                      placeholder="e.g. Residential Villa"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={pLocation}
                      onChange={(e) => setPLocation(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2"
                      placeholder="e.g. Alibaug, Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Built Area</label>
                    <input
                      type="text"
                      required
                      value={pArea}
                      onChange={(e) => setPArea(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2"
                      placeholder="e.g. 5,400 sq ft"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Workflow Status</label>
                    <select
                      value={pStatus}
                      onChange={(e) => setPStatus(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-accent"
                    >
                      <option>CONCEPT</option>
                      <option>DESIGN</option>
                      <option>APPROVAL</option>
                      <option>CONSTRUCTION</option>
                      <option>COMPLETED</option>
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Project Started Date</label>
                    <input
                      type="date"
                      required
                      value={pStartDate}
                      onChange={(e) => setPStartDate(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Project Completion Date</label>
                    <input
                      type="date"
                      required
                      value={pCompletionDate}
                      onChange={(e) => setPCompletionDate(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Row 4 (SEO fields) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Meta Description</label>
                    <input
                      type="text"
                      value={pDescription.substring(0, 100)}
                      disabled
                      className="w-full bg-[#111111]/50 border border-white/5 rounded px-3 py-2 text-mutedText"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Featured Settings</label>
                    <div className="flex items-center gap-4 py-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={pFeatured}
                          onChange={(e) => setPFeatured(e.target.checked)}
                        />
                        <span>Mark Featured Project</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span>Featured Order:</span>
                        <input
                          type="number"
                          value={pFeaturedOrder}
                          onChange={(e) => setPFeaturedOrder(parseInt(e.target.value))}
                          className="w-16 bg-[#111111] border border-white/10 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Paths Input */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      required
                      value={pCoverImage}
                      onChange={(e) => setPCoverImage(convertGoogleDriveUrl(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 font-mono text-accent"
                      placeholder="/uploads/file.jpg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Before Image URL (Contour)</label>
                    <input
                      type="text"
                      value={pBeforeImage}
                      onChange={(e) => setPBeforeImage(convertGoogleDriveUrl(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 font-mono"
                      placeholder="/uploads/raw.jpg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">After Image URL (Design)</label>
                    <input
                      type="text"
                      value={pAfterImage}
                      onChange={(e) => setPAfterImage(convertGoogleDriveUrl(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 font-mono"
                      placeholder="/uploads/done.jpg"
                    />
                  </div>
                </div>

                {/* Project Tags Selection Checkbox */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-2">Design Tag Associations</label>
                  <div className="flex flex-wrap gap-4 bg-[#111111] p-3 rounded border border-white/5">
                    {tags.map((t) => {
                      const checked = pTags.includes(t.id)
                      return (
                        <label key={t.id} className="flex items-center gap-2 font-semibold">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPTags([...pTags, t.id])
                              } else {
                                setPTags(pTags.filter((id) => id !== t.id))
                              }
                            }}
                          />
                          <span>#{t.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Project Gallery Reordering */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-2">
                    Completed Gallery Photos Ordering
                  </label>
                  <div className="space-y-2 max-h-36 overflow-y-auto bg-[#111111] p-3 rounded border border-white/5">
                    {pGallery.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
                        <span className="font-mono truncate max-w-sm">{url}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveGalleryItem(index, "up")}
                            className="p-1 bg-white/5 hover:bg-accent rounded text-white"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGalleryItem(index, "down")}
                            className="p-1 bg-white/5 hover:bg-accent rounded text-white"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPGallery(pGallery.filter((_, i) => i !== index))}
                            className="p-1 bg-red-500/10 hover:bg-red-500 rounded text-red-500 hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(convertGoogleDriveUrl(e.target.value))}
                      className="flex-grow bg-[#111111] border border-white/10 rounded px-3 py-2 text-xs"
                      placeholder="Enter image url (e.g. /uploads/123.jpg) to append"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newGalleryUrl) return
                        setPGallery([...pGallery, newGalleryUrl])
                        setNewGalleryUrl("")
                      }}
                      className="px-4 py-2 bg-accent text-white uppercase text-[10px] font-bold tracking-widest rounded shrink-0"
                    >
                      Add Photo
                    </button>
                  </div>

                  <div className="relative flex py-2.5 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-white/30 uppercase text-[9px] font-bold tracking-widest">OR</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={driveFolderUrl}
                      onChange={(e) => setDriveFolderUrl(e.target.value)}
                      className="flex-grow bg-[#111111] border border-white/10 rounded px-3 py-2 text-xs"
                      placeholder="Paste public Google Drive folder link to fetch all photos"
                    />
                    <button
                      type="button"
                      onClick={handleFetchDriveFolder}
                      disabled={isFetchingDrive || !driveFolderUrl}
                      className="px-4 py-2 bg-[#222222] hover:bg-[#333333] border border-white/10 text-white uppercase text-[10px] font-bold tracking-widest rounded disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isFetchingDrive ? "Fetching..." : "Fetch Folder"}
                    </button>
                  </div>
                  <p className="text-[8px] text-white/30 mt-1">
                    * Note: Google Drive folder must be set to <strong>"Anyone with the link can view"</strong>. All image IDs will be parsed and linked using <code>lh3.googleusercontent.com/d/</code>.
                  </p>
                </div>

                {/* Project Drawings Section */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-2">
                    Technical Drawings & Elevational Blueprints
                  </label>
                  <div className="space-y-2 max-h-36 overflow-y-auto bg-[#111111] p-3 rounded border border-white/5">
                    {pDrawings.map((draw, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
                        <div>
                          <strong className="text-white">{draw.title}</strong>{" "}
                          <span className="text-[9px] uppercase bg-white/10 px-1 py-0.5 rounded text-accent font-bold">
                            {draw.drawingType}
                          </span>
                          <span className="font-mono text-[9px] block truncate text-mutedText">{draw.fileUrl}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveDrawingItem(index, "up")}
                            className="p-1 bg-white/5 hover:bg-accent rounded text-white"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDrawingItem(index, "down")}
                            className="p-1 bg-white/5 hover:bg-accent rounded text-white"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPDrawings(pDrawings.filter((_, i) => i !== index))}
                            className="p-1 bg-red-500/10 hover:bg-red-500 rounded text-red-500 hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <input
                      type="text"
                      value={drawTitle}
                      onChange={(e) => setDrawTitle(e.target.value)}
                      className="bg-[#111111] border border-white/10 rounded px-2.5 py-1.5"
                      placeholder="Drawing Title (e.g. Floor Layout Plan)"
                    />
                    <select
                      value={drawType}
                      onChange={(e) => setDrawType(e.target.value)}
                      className="bg-[#111111] border border-white/10 rounded px-2.5 py-1.5"
                    >
                      <option>Floor Plan</option>
                      <option>Elevation</option>
                      <option>Section</option>
                      <option>Working Drawing</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={drawUrl}
                        onChange={(e) => setDrawUrl(convertGoogleDriveUrl(e.target.value))}
                        className="flex-grow bg-[#111111] border border-white/10 rounded px-2.5 py-1.5"
                        placeholder="Blueprint File URL"
                      />
                      <button
                        type="button"
                        onClick={addDrawingItem}
                        className="px-3 py-1.5 bg-accent text-white uppercase text-[10px] font-bold rounded"
                      >
                        Add Drawing
                      </button>
                    </div>
                  </div>
                </div>

                {/* Story Narrative Fields */}
                <div className="border-t border-white/10 pt-4 space-y-4">
                  <h4 className="font-headings text-xs font-bold text-accent">Studio Story Description (Detailed case study)</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Story Title / Concept</label>
                      <input
                        type="text"
                        value={pStoryTitle}
                        onChange={(e) => setPStoryTitle(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white"
                        placeholder="e.g. Sculpting double cantilever heights"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Design Process</label>
                      <textarea
                        rows={2}
                        value={pStoryProcess}
                        onChange={(e) => setPStoryProcess(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Structural Challenge</label>
                      <textarea
                        rows={2}
                        value={pStoryChallenge}
                        onChange={(e) => setPStoryChallenge(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Design Engineering Solution</label>
                      <textarea
                        rows={2}
                        value={pStorySolution}
                        onChange={(e) => setPStorySolution(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white resize-none"
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>{/* end scrollable body */}

            {/* Sticky footer with save CTAs */}
            <div className="flex justify-end gap-3 px-6 md:px-8 py-4 border-t border-white/10 shrink-0 bg-[#1A1A1A]">
              <button
                type="button"
                onClick={() => setProjectModalOpen(false)}
                className="px-5 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded font-bold uppercase tracking-wider text-[10px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="project-form"
                className="px-6 py-2.5 bg-accent text-white rounded font-bold uppercase tracking-wider text-[10px]"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          OVERLAY MODAL: TEAM MEMBER CREATOR
          ========================================================= */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-architectural max-w-lg w-full p-6 text-xs text-white">
            <h3 className="font-headings text-md font-bold mb-4">
              {editingTeamId ? "Edit Team Profile" : "Register Team Leader"}
            </h3>

            <form onSubmit={handleSaveTeam} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={tDesignation}
                  onChange={(e) => setTDesignation(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Profile Photo Path</label>
                <input
                  type="text"
                  required
                  value={tImage}
                  onChange={(e) => setTImage(convertGoogleDriveUrl(e.target.value))}
                  className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white font-mono"
                  placeholder="/uploads/profile.jpg"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Short Biography Description</label>
                <textarea
                  rows={3}
                  required
                  value={tBio}
                  onChange={(e) => setTBio(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/5 rounded text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-accent text-white rounded">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          OVERLAY MODAL: REVIEW CREATOR
          ========================================================= */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-architectural max-w-lg w-full p-6 text-xs text-white">
            <h3 className="font-headings text-md font-bold mb-4">
              {editingReviewId ? "Edit Testimonial Details" : "Record Developer Testimonial"}
            </h3>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Client Developer Name</label>
                <input
                  type="text"
                  required
                  value={revClientName}
                  onChange={(e) => setRevClientName(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Link Project Reference</label>
                  <select
                    value={revProjectId}
                    onChange={(e) => setRevProjectId(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded px-2.5 py-2 text-white"
                  >
                    <option value="">No Project Linked</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Rating Stars</label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(parseInt(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded px-2.5 py-2 text-accent"
                  >
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-mutedText block mb-1">Testimonial Review Brief</label>
                <textarea
                  rows={4}
                  required
                  value={revReviewText}
                  onChange={(e) => setRevReviewText(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/5 rounded text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-accent text-white rounded">
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
