'use client'

import { useState } from 'react'
import { createCompanyUser } from '@/app/actions/adminAction'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Snackbar
} from '@mui/material'
import { Visibility, VisibilityOff, ContentCopy, Close } from '@mui/icons-material'

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  company_name: string;
  phone: string;
  address: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  company_name?: string;
}

interface CreateCompanyUserFormProps {
  onSuccess?: () => void;
}

export default function CreateCompanyUserForm({ onSuccess }: CreateCompanyUserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    company_name: '',
    phone: '',
    address: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createdAccount, setCreatedAccount] = useState<any>(null)
  const [copySnackbar, setCopySnackbar] = useState({ open: false, message: '' })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    // Validate first name
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
      isValid = false
    }

    // Validate last name
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
      isValid = false
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format'
      isValid = false
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
      isValid = false
    }

    // Validate company name
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await createCompanyUser(formData)
      
      if (response.success) {
        setSuccess(true)
        setCreatedAccount(response?.data?.account)
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          company_name: '',
          phone: '',
          address: ''
        })
        
        // if (onSuccess) {
        //   onSuccess()
        // }
      } else {
        setApiError(response.data.msg || 'Failed to create company user')
      }
    } catch (error) {
      console.error('Error creating company user:', error)
      setApiError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleCloseSnackbar = () => { 
    if (onSuccess) {
      onSuccess()
    }
    setSuccess(false)
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create Company User
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Create a new company user with an associated revenue account
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}
      
      {success && !createdAccount && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Company user created successfully!
        </Alert>
      )}
      
      {success && createdAccount && (
        <Alert
          severity="success"
          sx={{ mb: 3, position: 'relative' }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleCloseSnackbar}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          <Typography variant="subtitle2" gutterBottom>
            Company user created successfully!
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Account Number:</strong> {createdAccount?.account_number}
            </Typography>
            <Typography variant="body2">
              <strong>Account Name:</strong> {createdAccount?.account_name}
            </Typography>
            <Typography variant="body2">
              <strong>Security PIN:</strong> {createdAccount?.security_pin}
            </Typography>
            <Button
              startIcon={<ContentCopy />}
              size="small"
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => {
                const textToCopy = `Account Number: ${createdAccount?.account_number}\nAccount Name: ${createdAccount?.account_name}\nSecurity PIN: ${createdAccount?.security_pin}`;
                navigator.clipboard.writeText(textToCopy);
                setCopySnackbar({ open: true, message: 'Account information copied to clipboard!' });
              }}
            >
              Copy All Information
            </Button>
            <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
              Please save this information securely. The security PIN will not be shown again.
            </Typography>
          </Box>
        </Alert>
      )}
      
      <Snackbar
        open={copySnackbar.open}
        autoHideDuration={3000}
        onClose={() => setCopySnackbar({ ...copySnackbar, open: false })}
        message={copySnackbar.message}
      />
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
              required
              disabled={loading}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
              required
              disabled={loading}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
              disabled={loading}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              required
              disabled={loading}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              error={!!errors.company_name}
              helperText={errors.company_name}
              required
              disabled={loading}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone (Optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address (Optional)"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
              margin="normal"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Creating...' : 'Create Company User'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}
