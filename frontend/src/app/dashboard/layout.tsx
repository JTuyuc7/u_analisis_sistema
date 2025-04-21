'use client'

import Sidebar from '@/components/Sidebar'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Box, useTheme } from '@mui/material'

// const DRAWER_WIDTH = 250
const APPBAR_HEIGHT = 64

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const theme = useTheme()
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null // or a loading spinner
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: { xs: `${APPBAR_HEIGHT}px`, md: 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
