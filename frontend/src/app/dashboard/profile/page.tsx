'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Divider,
  Avatar,
  Stack
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon
} from '@mui/icons-material'

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Profile
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          {/* Profile Avatar */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'primary.main',
                fontSize: '3rem',
                mb: 2
              }}
            >
              {user?.first_name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.admin ? 'Administrator' : 'Customer'}
            </Typography>
          </Grid>

          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={3}>
              {/* Name */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="subtitle1">Name</Typography>
                </Stack>
                <TextField
                  fullWidth
                  value={`${user?.first_name || ''} ${user?.last_name || ''}`}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Box>
              
              {/* Email */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <EmailIcon color="primary" />
                  <Typography variant="subtitle1">Email</Typography>
                </Stack>
                <TextField
                  fullWidth
                  value={user?.email || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Box>
              
              {/* Role */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <BadgeIcon color="primary" />
                  <Typography variant="subtitle1">Role</Typography>
                </Stack>
                <TextField
                  fullWidth
                  value={user?.admin ? 'Administrator' : 'Customer'}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
