'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { getAllUserTransactions } from '@/app/actions'
import { formatCurrency, formatDate } from '@/lib/utils/utils'
import { TransactionList } from '@/lib/interfaces'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  SwapHoriz as SwapHorizIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material'

export default function HomePage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [transactions, setTransactions] = useState<TransactionList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getAllUserTransactions()
        if (response.success) {
          setTransactions(response.data.transactions)
        } else {
          setError(response.data.msg)
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError('Failed to load transaction data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

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
          <Typography variant="h6">Dashboard</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Unable to load transaction data. Please try refreshing the page.
          </Typography>
        </Paper>
      </Box>
    )
  }

  // Get the last transaction
  const lastTransaction = transactions.length > 0 ? transactions[0] : null

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Welcome, {user?.first_name}!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Here's a quick overview of your account activity.
      </Typography>

      {/* Stats Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SwapHorizIcon />
                </Avatar>
                <Typography variant="h6">Transaction Summary</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {transactions.length}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Last Activity
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {lastTransaction ? formatDate(lastTransaction.transaction_date).split(' ')[0] : 'No activity'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {lastTransaction && (
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: lastTransaction.transaction_type === 'deposit' ? 'success.main' : 'primary.main' }}>
                    {lastTransaction.transaction_type === 'deposit' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                  </Avatar>
                  <Typography variant="h6">Last Transaction</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Transaction Details
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCardIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          Account: ****{lastTransaction.account.account_number.slice(-4)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          Amount: {formatCurrency(parseFloat(lastTransaction.amount))}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                      <Chip 
                        label={lastTransaction.transaction_type.toUpperCase()} 
                        color={lastTransaction.transaction_type === 'deposit' ? 'success' : 'primary'} 
                        size="small" 
                      />
                      <Typography variant="body2" color="text.secondary">
                        ID: TX{lastTransaction.transaction_id.toString().padStart(6, '0')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date: {formatDate(lastTransaction.transaction_date)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
