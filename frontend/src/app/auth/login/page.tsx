'use client'

import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setUser } from '@/lib/redux/slices/authSlice'
import Link from 'next/link'
import { startTransition, useActionState, useEffect } from 'react'
import { loginAction } from '@/app/actions'
import { useTheme } from '@/app/ClientThemeProvider'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Alert
} from '@mui/material'
import { Brightness4, Brightness7, Login } from '@mui/icons-material'
import { AuthInterface } from '@/lib/interfaces'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isDarkTheme, toggleTheme } = useTheme()

  const [formState, action, isPending] = useActionState(loginAction, {
    state: { email: undefined, password: undefined, genericMsg: undefined },
    success: false,
    user: undefined,
    token: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => {
      action(formData)
    })
  }
  useEffect(() => {
    if (formState.success) {
      dispatch(setUser({ user: formState.user as AuthInterface, token: formState.token  }))
      router.push('/dashboard/home')
    }
  }, [formState.user, formState.success, dispatch, router])

  return (
    <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}
      >
        {/* <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {isDarkTheme ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box> */}

        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Inicia sesión
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {formState?.state?.email && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formState.state.email}
            </Alert>
          )}
          {formState?.state?.password && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formState.state.password}
            </Alert>
          )}

          {formState?.state?.genericMsg && (
            <Alert severity={formState.success ? 'success' : 'error'} sx={{ mb: 2 }}>
              {formState.state.genericMsg}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            type="email"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isPending}
            sx={{ mt: 3, mb: 2 }}
            startIcon={<Login />}
            size='large'
          >
            {isPending ? 'Iniciando Sesion...' : 'Iniciar Sesión'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/auth/signup" passHref
              style={{
                textDecoration: 'underline',
              }}
            >
              <Typography variant="body2" sx={{ mt: 2 }}> 
                No tienes una cuenta?{' '} Crea una
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
