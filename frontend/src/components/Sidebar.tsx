'use client'

import React, { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
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
  Paper,
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
  Menu as MenuIcon
} from '@mui/icons-material'

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard/home' },
    { icon: SwapHorizIcon, label: 'Transactions', path: '/dashboard/transactions' },
    { icon: HistoryIcon, label: 'History', path: '/dashboard/history' },
    { icon: PersonIcon, label: 'Profile', path: '/dashboard/profile' },
  ]

  // Add admin route if user has admin role
  if (user.admin) {
    menuItems.push({ 
      icon: SecurityIcon, 
      label: 'Admin', 
      path: '/dashboard/admin' 
    })
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Dashboard
        </Typography>
      </Box>
      
      <List>
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
      </List>
    </Box>
  )

  if (isMobile) {
    return (
      <>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: 250,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </>
    )
  }

  return (
    <Box sx={{ 
      width: 250,
      height: '100vh',
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      overflowY: 'auto'
    }}>
      {drawerContent}
    </Box>
  )
}

export default Sidebar
