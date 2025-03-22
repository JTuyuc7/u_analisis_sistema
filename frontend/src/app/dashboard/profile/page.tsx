'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement profile update logic
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                id="role"
                value={user?.role || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end space-x-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
