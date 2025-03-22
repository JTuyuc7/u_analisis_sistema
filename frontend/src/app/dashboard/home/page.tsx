'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'

export default function HomePage() {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user.first_name}!</h1>
      <p className="text-xl">This is your dashboard home page.</p>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold">Total Transactions</h3>
            <p className="text-2xl">0</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold">Account Balance</h3>
            <p className="text-2xl">$0.00</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold">Pending Actions</h3>
            <p className="text-2xl">0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
