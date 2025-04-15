import { apiPublicClient } from '@/lib/api/apiClient'
import { SignupUserState } from '@/lib/interfaces';
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Por favor ingresa tu nombre'),
  last_name: z.string().min(2, 'Por favor ingresa tu apellido'),
  email: z.string().email('Por favor ingresa un correo valido'),
  phone: z.string().min(8, 'Por favor ingresa un número valido'),
  address: z.string().min(10, 'Por favor ingresa una dirección valida'),
  password: z.string().min(6, 'Por favor ingresa una contraseña valida'),
  confirm_pass: z.string().min(6, 'Por favor ingresa una contraseña valida')
}).refine((data) => data.password === data.confirm_pass, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_pass"], // path of error
});

export async function signupAction(formState: SignupUserState, formdata: FormData): Promise<SignupUserState> {

  const validatedFields = signupSchema.safeParse({
    name: formdata.get('name'),
    last_name: formdata.get('last_name'),
    email: formdata.get('email'),
    phone: formdata.get('phone'),
    address: formdata.get('address'),
    password: formdata.get('password'),
    confirm_pass: formdata.get('confirm_pass'),
  })

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string> = {};
    validatedFields.error.errors.forEach((error) => {
      if (error.path[0]) {
        fieldErrors[error.path[0]] = error.message;
      }
    });

    return {
      state: {
        name: formdata.get('name') as string || '',
        last_name: formdata.get('last_name') as string || '',
        email: formdata.get('email') as string || '',
        phone: formdata.get('phone') as string || '',
        address: formdata.get('address') as string || '',
        password: formdata.get('password') as string || '',
        confirm_pass: formdata.get('confirm_pass') as string || '',
        msg: 'Por favor revisa los campos',
      },
      errors: fieldErrors,
      success: false,
    }
  }

  try {
    const response = await apiPublicClient.post('/auth/register', {
      first_name: validatedFields.data.name,
      last_name: validatedFields.data.last_name,
      email: validatedFields.data.email,
      phone: validatedFields.data.phone,
      address: validatedFields.data.address,
      password: validatedFields.data.password,
    })

    if (response.status !== 201) {
      return {
        state: {
          name: '',
          last_name: '',
          email: '',
          phone: '',
          address: '',
          password: '',
          confirm_pass: '',
          msg: response.data.message,
        },
        success: false,
      }
    }

    return {
      state: {
        name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirm_pass: '',
        msg: 'Usuario registrado con éxito',
      },
      success: true,
    }
  } catch (error) {
    console.log(error, 'error')
    return {
      state: {
        name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirm_pass: '',
        msg: 'Error al registrar usuario',
      },
      success: false,
    }
  }

}