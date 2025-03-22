'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { startTransition, useActionState, useEffect } from 'react'
import { useTheme } from '@/app/ClientThemeProvider'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material'
import { Brightness4, Brightness7, PersonAdd } from '@mui/icons-material'
import { signupAction } from '@/app/actions'

export default function SignupPage() {

  const router = useRouter()
  const { isDarkTheme, toggleTheme } = useTheme()
  const [formState, action, isPending] = useActionState(signupAction, {
    state: {
      name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirm_pass: '',
      msg: '',
    },
    success: false,
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
      router.push('/auth/login')
    }
  }, [formState.success, router])

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
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
          Crear cuenta
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {formState.state.msg && (
            <Alert severity={formState.success ? "success" : "error"} sx={{ mb: 2 }}>
              {formState.state.msg}
            </Alert>
          )}

          <Box
            sx={{
              display: { xs: 'block', sm: 'grid' },
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            <TextField
              error={!!formState.errors?.name}
              helperText={formState.errors?.name}
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre"
              name="name"
              autoComplete="name"
              autoFocus
            // value={formState.state.name}
            />
            <TextField
              error={!!formState?.errors?.last_name}
              helperText={formState?.errors?.last_name}
              margin="normal"
              required
              fullWidth
              id="last_name"
              label="apellido"
              name="last_name"
              autoComplete="name"
              autoFocus
            />
          </Box>

          <TextField
            error={!!formState?.errors?.email}
            helperText={formState?.errors?.email}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            type="email"
            // autoFocus
          />

          <Box
            sx={{
              display: { xs: 'block', sm: 'grid' },
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            <TextField
              error={!!formState?.errors?.phone}
              helperText={formState?.errors?.phone}
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Teléfono"
              name="phone"
              autoComplete="phone"
              autoFocus
            />

            <TextField
              error={!!formState?.errors?.address}
              helperText={formState?.errors?.address}
              margin="normal"
              required
              fullWidth
              id="address"
              label="Dirección"
              name="address"
              autoComplete="address"
              autoFocus
            />
          </Box>

          <TextField
            error={!!formState?.errors
              ?.password}
            helperText={formState?.errors
              ?.password}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="new-password"
          />

          <TextField
            error={!!formState?.errors
              ?.confirm_pass}
            helperText={formState?.errors
              ?.confirm_pass}
            margin="normal"
            required
            fullWidth
            name="confirm_pass"
            label="Confirmar contraseña"
            type="password"
            id="confirm_pass"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isPending}
            sx={{ mt: 3, mb: 2 }}
            startIcon={<PersonAdd />}
            size='large'
          >
            {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/auth/login" passHref
              style={{
                textDecoration: 'underline',
              }}
            >
              <Typography variant="body2" sx={{ mt: 2 }}>
                ¿Ya tienes una cuenta?{' '} Inicia sesión
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
