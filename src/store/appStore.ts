import { create } from "zustand"

// JWT Auth session state
interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  loading: boolean
  login: (credentials: any) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("g_auth_token"),
  refreshToken: localStorage.getItem("g_refresh_token"),
  user: localStorage.getItem("g_auth_user") ? JSON.parse(localStorage.getItem("g_auth_user")!) : null,
  loading: false,

  login: async (credentials) => {
    set({ loading: true })
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      localStorage.setItem("g_auth_token", data.accessToken)
      localStorage.setItem("g_refresh_token", data.refreshToken)
      localStorage.setItem("g_auth_user", JSON.stringify(data.user))

      set({ token: data.accessToken, refreshToken: data.refreshToken, user: data.user, loading: false })
      return true
    } catch (err) {
      console.error(err)
      set({ loading: false })
      return false
    }
  },

  logout: async () => {
    const { refreshToken } = get()
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
    } catch (e) {
      console.error("Logout failed on server:", e)
    }
    localStorage.removeItem("g_auth_token")
    localStorage.removeItem("g_refresh_token")
    localStorage.removeItem("g_auth_user")
    set({ token: null, refreshToken: null, user: null })
  },

  checkAuth: async () => {
    const { token } = get()
    if (!token) return
    try {
      const res = await fetch("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        // Attempt to refresh
        const { refreshToken } = get()
        if (refreshToken) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          })
          const refreshData = await refreshRes.json()
          if (refreshRes.ok) {
            localStorage.setItem("g_auth_token", refreshData.accessToken)
            set({ token: refreshData.accessToken })
          } else {
            get().logout()
          }
        } else {
          get().logout()
        }
      }
    } catch (e) {
      console.error(e)
    }
  },
}))

// Global Application state (CMS, Projects, Leads, etc)
interface AppState {
  settings: any | null
  categories: any[]
  tags: any[]
  projects: any[]
  partners: any[]
  team: any[]
  reviews: any[]
  stories: any[]
  announcements: any[]
  leads: any[]
  metrics: any | null
  loading: boolean

  fetchSettings: () => Promise<void>
  updateSettings: (data: any) => Promise<boolean>
  
  fetchCategories: () => Promise<void>
  createCategory: (data: any) => Promise<boolean>
  updateCategory: (id: string, data: any) => Promise<boolean>
  deleteCategory: (id: string) => Promise<boolean>

  fetchTags: () => Promise<void>
  createTag: (name: string) => Promise<boolean>
  deleteTag: (id: string) => Promise<boolean>

  fetchProjects: (filters?: any) => Promise<void>
  fetchProjectBySlug: (slug: string) => Promise<any>
  createProject: (data: any) => Promise<boolean>
  updateProject: (id: string, data: any) => Promise<boolean>
  archiveProject: (id: string) => Promise<boolean>
  restoreProject: (id: string) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>

  fetchTeam: () => Promise<void>
  createTeamMember: (data: any) => Promise<boolean>
  updateTeamMember: (id: string, data: any) => Promise<boolean>
  deleteTeamMember: (id: string) => Promise<boolean>

  fetchReviews: (includeDeleted?: boolean) => Promise<void>
  createReview: (data: any) => Promise<boolean>
  updateReview: (id: string, data: any) => Promise<boolean>
  archiveReview: (id: string) => Promise<boolean>
  restoreReview: (id: string) => Promise<boolean>
  deleteReview: (id: string) => Promise<boolean>

  fetchStories: () => Promise<void>
  createStory: (data: any) => Promise<boolean>
  deleteStory: (id: string) => Promise<boolean>

  fetchAnnouncements: () => Promise<void>
  fetchAdminAnnouncements: () => Promise<void>
  createAnnouncement: (data: any) => Promise<boolean>
  updateAnnouncement: (id: string, data: any) => Promise<boolean>
  deleteAnnouncement: (id: string) => Promise<boolean>

  fetchLeads: () => Promise<void>
  createLead: (formData: FormData) => Promise<boolean>
  updateLeadStatus: (id: string, data: any) => Promise<boolean>
  deleteLead: (id: string) => Promise<boolean>

  fetchMetrics: () => Promise<void>

  fetchPartners: (includeDeleted?: boolean) => Promise<void>
  createPartner: (data: any) => Promise<boolean>
  archivePartner: (id: string) => Promise<boolean>
  restorePartner: (id: string) => Promise<boolean>
  deletePartner: (id: string) => Promise<boolean>
}

export const useAppStore = create<AppState>((set, get) => {
  const getHeaders = () => {
    const token = localStorage.getItem("g_auth_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    } as any
  }

  return {
    settings: null,
    categories: [],
    tags: [],
    projects: [],
    partners: [],
    team: [],
    reviews: [],
    stories: [],
    announcements: [],
    leads: [],
    metrics: null,
    loading: false,

    fetchSettings: async () => {
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()
        set({ settings: data })
      } catch (e) {
        console.error(e)
      }
    },

    updateSettings: async (data) => {
      try {
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchSettings()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchCategories: async () => {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        set({ categories: data })
      } catch (e) {
        console.error(e)
      }
    },

    createCategory: async (data) => {
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchCategories()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    updateCategory: async (id, data) => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchCategories()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deleteCategory: async (id) => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchCategories()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchTags: async () => {
      try {
        const res = await fetch("/api/tags")
        const data = await res.json()
        set({ tags: data })
      } catch (e) {
        console.error(e)
      }
    },

    createTag: async (name) => {
      try {
        const res = await fetch("/api/tags", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ name }),
        })
        if (res.ok) {
          get().fetchTags()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deleteTag: async (id) => {
      try {
        const res = await fetch(`/api/tags/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchTags()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchProjects: async (filters = {}) => {
      set({ loading: true })
      try {
        const params = new URLSearchParams()
        if (filters.category) params.append("category", filters.category)
        if (filters.tag) params.append("tag", filters.tag)
        if (filters.status) params.append("status", filters.status)
        if (filters.includeDeleted) params.append("includeDeleted", "true")

        const res = await fetch(`/api/projects?${params.toString()}`)
        const data = await res.json()
        set({ projects: data, loading: false })
      } catch (e) {
        console.error(e)
        set({ loading: false })
      }
    },

    fetchProjectBySlug: async (slug) => {
      try {
        const res = await fetch(`/api/projects/${slug}`)
        if (!res.ok) return null
        return await res.json()
      } catch (e) {
        console.error(e)
        return null
      }
    },

    createProject: async (data) => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchProjects()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    updateProject: async (id, data) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchProjects()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    archiveProject: async (id) => {
      try {
        const res = await fetch(`/api/projects/${id}/archive`, {
          method: "POST",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchProjects()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    restoreProject: async (id) => {
      try {
        const res = await fetch(`/api/projects/${id}/restore`, {
          method: "POST",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchProjects()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deleteProject: async (id) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchProjects()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchTeam: async () => {
      try {
        const res = await fetch("/api/team")
        const data = await res.json()
        set({ team: data })
      } catch (e) {
        console.error(e)
      }
    },

    createTeamMember: async (data) => {
      try {
        const res = await fetch("/api/team", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchTeam()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    updateTeamMember: async (id, data) => {
      try {
        const res = await fetch(`/api/team/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchTeam()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deleteTeamMember: async (id) => {
      try {
        const res = await fetch(`/api/team/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchTeam()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchReviews: async (includeDeleted = false) => {
      try {
        const res = await fetch(`/api/reviews?includeDeleted=${includeDeleted}`)
        const data = await res.json()
        set({ reviews: data })
      } catch (e) {
        console.error(e)
      }
    },

    createReview: async (data) => {
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchReviews()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    updateReview: async (id, data) => {
      try {
        const res = await fetch(`/api/reviews/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchReviews()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    archiveReview: async (id) => {
      try {
        const res = await fetch(`/api/reviews/${id}/archive`, {
          method: "POST",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchReviews()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    restoreReview: async (id) => {
      try {
        const res = await fetch(`/api/reviews/${id}/restore`, {
          method: "POST",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchReviews()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deleteReview: async (id) => {
      try {
        const res = await fetch(`/api/reviews/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchReviews()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchStories: async () => {
      try {
        const res = await fetch("/api/activities")
        const data = await res.json()
        set({ stories: data })
      } catch (e) {
        console.error(e)
      }
    },

    createStory: async (data) => {
      try {
        const res = await fetch("/api/activities", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchStories()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deleteStory: async (id) => {
      try {
        const res = await fetch(`/api/activities/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchStories()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchAnnouncements: async () => {
      try {
        const res = await fetch("/api/announcements")
        const data = await res.json()
        set({ announcements: data })
      } catch (e) {
        console.error(e)
      }
    },

    fetchAdminAnnouncements: async () => {
      try {
        const res = await fetch("/api/admin/announcements", {
          headers: getHeaders(),
        })
        const data = await res.json()
        set({ announcements: data })
      } catch (e) {
        console.error(e)
      }
    },

    createAnnouncement: async (data) => {
      try {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchAdminAnnouncements()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    updateAnnouncement: async (id, data) => {
      try {
        const res = await fetch(`/api/announcements/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchAdminAnnouncements()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deleteAnnouncement: async (id) => {
      try {
        const res = await fetch(`/api/announcements/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchAdminAnnouncements()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchLeads: async () => {
      try {
        const res = await fetch("/api/contact-requests", {
          headers: getHeaders(),
        })
        const data = await res.json()
        set({ leads: data })
      } catch (e) {
        console.error(e)
      }
    },

    createLead: async (formData) => {
      try {
        const res = await fetch("/api/contact-requests", {
          method: "POST",
          body: formData,
        })
        if (res.ok) return true
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    updateLeadStatus: async (id, data) => {
      try {
        const res = await fetch(`/api/contact-requests/${id}`, {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchLeads()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deleteLead: async (id) => {
      try {
        const res = await fetch(`/api/contact-requests/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchLeads()
          get().fetchMetrics() // update overview metric counts too
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    fetchMetrics: async () => {
      try {
        const res = await fetch("/api/admin/metrics", {
          headers: getHeaders(),
        })
        const data = await res.json()
        set({ metrics: data })
      } catch (e) {
        console.error(e)
      }
    },

    fetchPartners: async (includeDeleted = false) => {
      try {
        const res = await fetch(`/api/partners?includeDeleted=${includeDeleted}`)
        const data = await res.json()
        set({ partners: Array.isArray(data) ? data : [] })
      } catch (e) {
        console.error(e)
      }
    },

    createPartner: async (data) => {
      try {
        const res = await fetch("/api/partners", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })
        if (res.ok) {
          get().fetchPartners()
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    archivePartner: async (id) => {
      try {
        const res = await fetch(`/api/partners/${id}/archive`, {
          method: "POST",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchPartners(true)
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    restorePartner: async (id) => {
      try {
        const res = await fetch(`/api/partners/${id}/restore`, {
          method: "POST",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchPartners(true)
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },

    deletePartner: async (id) => {
      try {
        const res = await fetch(`/api/partners/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        })
        if (res.ok) {
          get().fetchPartners(true)
          return true
        }
        return false
      } catch (e) {
        console.error(e)
        return false
      }
    },
  }
})

export function convertGoogleDriveUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  
  // Pattern 1: drive.google.com/file/d/FILE_ID
  const fileDMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{25,50})/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }
  
  // Pattern 2: drive.google.com/open?id=FILE_ID
  const openIdMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{25,50})/);
  if (openIdMatch && openIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${openIdMatch[1]}`;
  }
  
  // Pattern 3: drive.google.com/uc?id=FILE_ID
  const ucIdMatch = trimmed.match(/drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]{25,50})/);
  if (ucIdMatch && ucIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${ucIdMatch[1]}`;
  }

  // Pattern 4: docs.google.com/file/d/FILE_ID
  const docsMatch = trimmed.match(/docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]{25,50})/);
  if (docsMatch && docsMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${docsMatch[1]}`;
  }

  return trimmed;
}
