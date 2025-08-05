import axios from 'axios'

export interface Asset {
  _id: string
  name: string
  type: 'equipment' | 'furniture' | 'electronics' | 'vehicle' | 'software' | 'other'
  category: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  location: string
  assignedTo?: {
    _id: string
    firstName: string
    lastName: string
    email: string
    employeeId: string
    department?: string
  }
  status: 'active' | 'maintenance' | 'retired' | 'lost' | 'stolen'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  warrantyExpiry?: string
  maintenanceHistory: Array<{
    date: string
    description: string
    cost: number
    performedBy: string
  }>
  notes?: string
  images?: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response?.data)
      error.message = 'Server is currently unavailable. Please try again later.'
    } else if (!error.response) {
      // Network error or timeout
      error.message = 'Unable to connect to server. Please check your internet connection.'
    }
    return Promise.reject(error)
  }
)

// Helper function to create fallback responses
const createFallbackResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK'
})

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await api.post('/auth/login', credentials)
    } catch (error) {
      throw error
    }
  },
  
  register: async (userData: any) => {
    try {
      return await api.post('/auth/register', userData)
    } catch (error) {
      throw error
    }
  },
  
  getProfile: async () => {
    try {
      return await api.get('/auth/me')
    } catch (error) {
      throw error
    }
  },
  
  updateProfile: async (data: any) => {
    try {
      return await api.put('/auth/me', data)
    } catch (error) {
      throw error
    }
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    try {
      return await api.put('/auth/change-password', data)
    } catch (error) {
      throw error
    }
  },
}

// Assets API
export const assetsAPI = {
  getAll: async (params?: any) => {
    try {
      return await api.get('/assets', { params })
    } catch (error) {
      // Return fallback data if API is unavailable
      console.warn('API unavailable, using fallback data:', error)
      return createFallbackResponse({
        assets: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        }
      })
    }
  },
  
  getById: async (id: string) => {
    try {
      return await api.get(`/assets/${id}`)
    } catch (error) {
      throw error
    }
  },
  
  create: async (data: any) => {
    try {
      return await api.post('/assets', data)
    } catch (error) {
      throw error
    }
  },
  
  update: async (id: string, data: any) => {
    try {
      return await api.put(`/assets/${id}`, data)
    } catch (error) {
      throw error
    }
  },
  
  delete: async (id: string) => {
    try {
      return await api.delete(`/assets/${id}`)
    } catch (error) {
      throw error
    }
  },
  
  addMaintenance: async (id: string, data: any) => {
    try {
      return await api.post(`/assets/${id}/maintenance`, data)
    } catch (error) {
      throw error
    }
  },
  
  getStats: async () => {
    try {
      return await api.get('/assets/stats/overview')
    } catch (error) {
      // Return fallback stats if API is unavailable
      console.warn('API unavailable, using fallback stats:', error)
      return createFallbackResponse({
        totalAssets: 0,
        activeAssets: 0,
        maintenanceAssets: 0,
        retiredAssets: 0,
        totalValue: 0,
        assetsByType: [],
        assetsByCondition: []
      })
    }
  },
  
  assignToUser: async (id: string, userId: string) => {
    try {
      return await api.post(`/assets/${id}/assign`, { assignedTo: userId })
    } catch (error) {
      throw error
    }
  },
  
  returnAsset: async (id: string) => {
    try {
      return await api.post(`/assets/${id}/return`)
    } catch (error) {
      throw error
    }
  },
}

// Convenience function for getting assets
export const getAssets = async (): Promise<Asset[]> => {
  try {
    const response = await assetsAPI.getAll()
    return response.data.assets || []
  } catch (error) {
    console.error('Error getting assets:', error)
    return []
  }
}

// Users API
export const usersAPI = {
  getAll: async (params?: any) => {
    try {
      return await api.get('/users', { params })
    } catch (error) {
      // Return fallback data if API is unavailable
      console.warn('API unavailable, using fallback user data:', error)
      return createFallbackResponse({
        users: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        }
      })
    }
  },
  
  getBasicList: async () => {
    try {
      return await api.get('/users/basic/list')
    } catch (error) {
      // Return fallback data if API is unavailable
      console.warn('API unavailable, using fallback basic user data:', error)
      return createFallbackResponse({
        users: []
      })
    }
  },
  
  getById: async (id: string) => {
    try {
      return await api.get(`/users/${id}`)
    } catch (error) {
      throw error
    }
  },
  
  update: async (id: string, data: any) => {
    try {
      return await api.put(`/users/${id}`, data)
    } catch (error) {
      throw error
    }
  },
  
  delete: async (id: string) => {
    try {
      return await api.delete(`/users/${id}`)
    } catch (error) {
      throw error
    }
  },
  
  toggleStatus: async (id: string) => {
    try {
      return await api.patch(`/users/${id}/toggle-status`)
    } catch (error) {
      throw error
    }
  },
  
  getTeamMembers: async () => {
    try {
      return await api.get('/users/team/members')
    } catch (error) {
      // Return fallback data if API is unavailable
      console.warn('API unavailable, using fallback team data:', error)
      return createFallbackResponse({
        members: []
      })
    }
  },
  
  getAssignmentList: async () => {
    try {
      return await api.get('/users/assignment/list')
    } catch (error) {
      // Return fallback data if API is unavailable
      console.warn('API unavailable, using fallback assignment data:', error)
      return createFallbackResponse({
        users: []
      })
    }
  },
  
  getProfile: async (id: string) => {
    try {
      return await api.get(`/users/profile/${id}`)
    } catch (error) {
      throw error
    }
  },
}

export default api 