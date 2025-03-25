'use client'

import Sidebar from '@/components/Sidebar'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null // or a loading spinner
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pt-20 md:pt-5 sm:bg-red-500 p-8 overflow-auto sm:-[250px]">
        {children}
      </main>
    </div>
  )
}
