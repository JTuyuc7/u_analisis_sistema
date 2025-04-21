'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import Link from 'next/link'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  SwapHoriz as SwapHorizIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  
} from '@mui/icons-material'
import { logout } from '@/lib/redux/slices/authSlice'
import { logoutAccountAction } from '@/lib/redux/slices/accountSlice'

const DRAWER_WIDTH = 250
const APPBAR_HEIGHT = 64

const Sidebar = () => {
  const dispatch = useDispatch()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard/home' },
    { icon: SwapHorizIcon, label: 'Operations', path: '/dashboard/operations' },
    { icon: HistoryIcon, label: 'Transactions', path: '/dashboard/transactions' },
    { icon: PersonIcon, label: 'Profile', path: '/dashboard/profile' },
    { icon: SettingsIcon, label: 'Settings', path: '/dashboard/settings' },
    // { icon: LogoutIcon, label: 'Logout', path: '/auth/logout' },
  ]

  if (user?.admin) {
    menuItems.push({
      icon: SecurityIcon,
      label: 'Admin',
      path: '/dashboard/admin'
    })
  }

  const logoutFunction = () => { 
    router.push('/auth/login')
    handleDrawerToggle()
    dispatch(logout())
    dispatch(logoutAccountAction())
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ p: 3, height: APPBAR_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" component="h1" align="center">
          Banca - GT
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              component={Link}
              href={item.path}
              onClick={() => isMobile && handleDrawerToggle()}
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </Box>
        <Box>
          <ListItem
            onClick={logoutFunction}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
              },
              borderRadius: 1,
              mb: 1,
              marginBottom: 4
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </List>
    </Box>
  )

  return (
    <>
      {isMobile && (
        <AppBar
          position="fixed"
          color='primary'
          enableColorOnDark
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            height: APPBAR_HEIGHT,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                height: '100vh',
                position: 'fixed',
                border: 'none'
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>
    </>
  )
}

export default Sidebar
