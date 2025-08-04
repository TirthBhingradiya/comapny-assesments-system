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
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
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
      window.location.href = '/login'
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response?.data)
      // Show a more user-friendly error message
      error.message = 'Server is currently unavailable. Please try again later.'
    } else if (!error.response) {
      // Network error
      error.message = 'Unable to connect to server. Please check your internet connection.'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  updateProfile: (data: any) =>
    api.put('/auth/me', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
}

// Assets API
export const assetsAPI = {
  getAll: (params?: any) =>
    api.get('/assets', { params }),
  
  getById: (id: string) =>
    api.get(`/assets/${id}`),
  
  create: (data: any) =>
    api.post('/assets', data),
  
  update: (id: string, data: any) =>
    api.put(`/assets/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/assets/${id}`),
  
  addMaintenance: (id: string, data: any) =>
    api.post(`/assets/${id}/maintenance`, data),
  
  getStats: () =>
    api.get('/assets/stats/overview'),
  
  assignToUser: (id: string, userId: string) =>
    api.post(`/assets/${id}/assign`, { assignedTo: userId }),
  
  returnAsset: (id: string) =>
    api.post(`/assets/${id}/return`),
}

// Convenience function for getting assets
export const getAssets = async (): Promise<Asset[]> => {
  const response = await assetsAPI.getAll()
  return response.data
}

// Users API
export const usersAPI = {
  getAll: (params?: any) =>
    api.get('/users', { params }),
  
  getBasicList: () =>
    api.get('/users/basic/list'),
  
  getById: (id: string) =>
    api.get(`/users/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
  
  toggleStatus: (id: string) =>
    api.patch(`/users/${id}/toggle-status`),
  
  getTeamMembers: () =>
    api.get('/users/team/members'),
  
  getAssignmentList: () =>
    api.get('/users/assignment/list'),
  
  getProfile: (id: string) =>
    api.get(`/users/profile/${id}`),
}

export default api 