'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { getLastTransaction, getSystemStats, getRecentUsers } from '@/app/actions'
import CreateCompanyUserForm from '@/components/admin/CreateCompanyUserForm'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material'
import {
  People as PeopleIcon,
  SwapHoriz as SwapHorizIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Business as BusinessIcon
} from '@mui/icons-material'
import { formatDate } from '@/lib/utils/utils'

interface AdminTransaction {
  id: string;
  date: string;
  amount: string;
  type: string;
  customer: {
    name: string;
    email: string;
    accountNumber: string;
  };
}

interface AdminStats {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

export default function AdminPage() {
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const [lastTransaction, setLastTransaction] = useState<AdminTransaction>({
    id: 'TX000000',
    date: new Date().toISOString().split('T')[0],
    amount: '$0.00',
    type: 'unknown',
    customer: {
      name: 'Unknown User',
      email: 'unknown@example.com',
      accountNumber: '****0000'
    }
  })
  const [stats, setStats] = useState<AdminStats[]>([])
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'create-company-user'>('dashboard')

  // Map icons to stats
  const iconMap: Record<string, React.ElementType> = {
    'Total Users': PeopleIcon,
    'Total Transactions': SwapHorizIcon,
    'Active Accounts': SettingsIcon,
    'Company Accounts': BusinessIcon,
    'Monthly Growth': TrendingUpIcon,
    'System Status': SettingsIcon
  }

  const handleViewChange = (event: SelectChangeEvent) => {
    setCurrentView(event.target.value as 'dashboard' | 'create-company-user')
  }

  useEffect(() => {
    if (!user?.admin) {
      router.push('/dashboard/home')
      return
    }

    const fetchAdminData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch last transaction
        const transactionResponse = await getLastTransaction()
        if (transactionResponse.success) {
          setLastTransaction(transactionResponse.data.transaction)
        }

        // Fetch system stats
        const statsResponse = await getSystemStats()
        if (statsResponse.success) {
          // Add icons to stats
          const statsWithIcons = statsResponse?.data?.stats?.map(stat => ({
            ...stat,
            icon: iconMap[stat?.label] || SettingsIcon
          }))
          setStats(statsWithIcons)
        }

        // Fetch recent users
        const usersResponse = await getRecentUsers()
        if (usersResponse.success) {
          setRecentUsers(usersResponse.data.users)
        }
      } catch (err) {
        console.error('Error fetching admin data:', err)
        setError('Failed to load admin dashboard data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router])

  if (!user?.admin) {
    return null
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Admin Dashboard</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Unable to load dashboard data. Please try refreshing the page.
          </Typography>
        </Paper>
      </Box>
    )
  }

  // Fallback data if API calls fail
  // const fallbackStats = [
  //   { label: 'Total Users', value: '0', icon: PeopleIcon, color: 'primary.main' },
  //   { label: 'Total Transactions', value: '0', icon: SwapHorizIcon, color: 'success.main' },
  //   { label: 'Monthly Growth', value: '0%', icon: TrendingUpIcon, color: 'secondary.main' },
  //   { label: 'System Status', value: 'Unknown', icon: SettingsIcon, color: 'warning.main' },
  // ]

  //const displayStats = stats.length > 0 ? stats : fallbackStats

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Admin Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={currentView}
            onChange={handleViewChange}
            displayEmpty
            size="small"
          >
            <MenuItem value="dashboard">Dashboard</MenuItem>
            <MenuItem value="create-company-user">Create Company User</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {currentView === 'create-company-user' ? (
        <CreateCompanyUserForm 
          onSuccess={() => setCurrentView('dashboard')}
        />
      ) : (
        <>
          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: stat.color }}>
                        <stat.icon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {stat.value}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Last Customer Transaction */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Last Customer Transaction
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {lastTransaction.customer.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {lastTransaction.customer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {lastTransaction.customer.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Transaction Details
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCardIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          Account: {lastTransaction.customer.accountNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          Amount: {lastTransaction.amount}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                      <Chip 
                        label={lastTransaction.type.toUpperCase()} 
                        color={lastTransaction.type === 'deposit' ? 'success' : 'primary'} 
                        size="small" 
                      />
                      <Typography variant="body2" color="text.secondary">
                        ID: {lastTransaction.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date: {formatDate(lastTransaction.date)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Paper>

          {/* Recent Users */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Users
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => {
                    return (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{formatDate(user.joinDate)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="primary"
                            // onClick={ () => { }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Admin Actions */}
          {/** TODO: add later  */}
          {/* <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<DescriptionIcon />}
                  color="primary"
                >
                  Generate Reports
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<ManageAccountsIcon />}
                  color="success"
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<AdminPanelSettingsIcon />}
                  color="secondary"
                >
                  System Settings
                </Button>
              </Grid>
            </Grid>
          </Paper> */}
        </>
      )}
    </Box>
  )
}
