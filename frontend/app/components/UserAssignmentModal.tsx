'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import { usersAPI } from '@/lib/api'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  employeeId: string
  department: string
  role: string
  position?: string
}

interface UserAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (userId: string) => void
  assetName: string
  currentUserRole: string
  currentUserDepartment: string
}

export default function UserAssignmentModal({
  isOpen,
  onClose,
  onAssign,
  assetName,
  currentUserRole,
  currentUserDepartment
}: UserAssignmentModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching users for assignment...')
      
      // Use the same endpoint as dashboard (which works)
      const response = await usersAPI.getBasicList()

      const users :User[]= response.data.users || []
      users.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.role}) - ${user.department}`)
      })
      
      setUsers(users)
      
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.employeeId.toLowerCase().includes(searchLower)
    )
  }).filter(user => user.role === 'employee') // Only show employees for assignment

  const handleAssign = () => {
    if (!selectedUserId) {
      toast.error('Please select a user')
      return
    }
    onAssign(selectedUserId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Asset</h2>
            <p className="text-sm text-gray-500 mt-1">
              Assign "{assetName}" to a user
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" text="Loading users..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'No users found matching your search' : 'No users available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedUserId === user._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUserId(user._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                                                     <div className="flex items-center space-x-4 mt-1">
                             <span className="text-xs text-gray-400">
                               ID: {user.employeeId}
                             </span>
                             <span className="text-xs text-gray-400">
                               {user.department}
                             </span>
                             {user.position && (
                               <span className="text-xs text-gray-400">
                                 {user.position}
                               </span>
                             )}
                             <span className="text-xs text-gray-400 capitalize">
                               {user.role}
                             </span>
                           </div>
                        </div>
                      </div>
                    </div>
                    {selectedUserId === user._id && (
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedUserId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Asset
          </button>
        </div>
      </div>
    </div>
  )
} 