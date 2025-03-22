'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { useDispatch } from 'react-redux'
import { validateToken } from '@/lib/redux/slices/authSlice'
import LoadingScreen from '@/components/ui/loadingScreen'

export default function Home() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    dispatch(validateToken())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard/home')
    } else {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => { 
    if(isAuthenticated !== undefined) {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  if (isLoading) {
    return <LoadingScreen />
  }

  return null // This page will not be rendered, it's just a redirect
}
