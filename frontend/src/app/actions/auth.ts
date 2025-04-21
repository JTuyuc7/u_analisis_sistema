'use server'

import { apiPublicClient } from '@/lib/api/apiClient'
import { AuthInterface } from '@/lib/interfaces';
import { z } from 'zod'

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface LoginUserState {
  state: { 
    email: string | undefined,
    password: string | undefined,
    genericMsg?: string | undefined,
  }
  success?: boolean,
  user?: AuthInterface | undefined
  token: string
}

const loginSchema = z.object({
  email: z.string().email('Por favor ingresa un correo valido'),
  password: z.string().min(6, 'Por favor ingresa revisa tu contraseña'),
})

export async function loginAction(formState: LoginUserState, formData: FormData): Promise<LoginUserState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { 
      state: { 
        email: validatedFields.error?.errors[0]?.message,
        password: validatedFields.error?.errors[1]?.message, 
        genericMsg: 'Por favor revisa los campos',
      },
      token: '',
      user: undefined,
      success: false,
    }
  }

  try {
    const response = await apiPublicClient.post('/auth/login', {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    })
    const token = response.headers['authorization'].split(' ')[1];

    if (response.status !== 200) { 
      return {
        state: {
          email: undefined,
          password: undefined,
          genericMsg: response.data.message,
        },
        success: false,
        user: undefined,
        token: '',
      }
    }

    return {
      state: {
        email: undefined,
        password: undefined,
        genericMsg: response.data.message,
      },
      success: true,
      user: response.data.customer,
      token: token,
    }
  } catch (e: unknown) { 

    return {
      state: {
        email: undefined,
        password: undefined,
        genericMsg: (e as ApiError)?.response?.data?.message || 'An unexpected error occurred',
      },
      success: false,
      user: undefined,
      token: '',
    }
  }
}
