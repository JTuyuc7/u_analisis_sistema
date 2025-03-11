# API Bancaria Backend

Servidor Node.js Express usando TypeScript y TypeORM para un sistema bancario.

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crear un archivo `.env` en el directorio raíz con las siguientes variables:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=bank_db
JWT_SECRET=your_jwt_secret
```

3. Configurar la base de datos:
- Asegúrese de que PostgreSQL esté instalado y en ejecución
- Crear una base de datos llamada `bank_db`
- Las tablas se crearán automáticamente al iniciar el servidor (gracias a la opción de sincronización de TypeORM)

## Ejecutar el Servidor

Modo desarrollo:
```bash
npm run dev
```

Modo producción:
```bash
npm run build
npm start
```

## Endpoints de la API

### Clientes

Todos los endpoints requieren autenticación JWT. Las rutas de administrador requieren privilegios de administrador.

- `GET /api/customers`
  - Obtener todos los clientes
  - Requiere: Autenticación

- `GET /api/customers/:id`
  - Obtener cliente por ID
  - Requiere: Autenticación

- `POST /api/customers`
  - Crear un nuevo cliente
  - Requiere: Autenticación, Privilegios de administrador
  - Cuerpo:
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "address": "123 Main St"
    }
    ```

- `PUT /api/customers/:id`
  - Actualizar un cliente
  - Requiere: Autenticación, Privilegios de administrador
  - Cuerpo: Igual que POST (los campos son opcionales)

- `DELETE /api/customers/:id`
  - Eliminar un cliente
  - Requiere: Autenticación, Privilegios de administrador

## Autenticación

### Nuevos Endpoints de Autenticación

- `POST /api/auth/register`
  - Registrar un nuevo usuario
  - No requiere autenticación
  - Cuerpo de la solicitud:
    ```json
    {
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan@ejemplo.com",
      "password": "contraseñasegura",
      "phone": "1234567890",
      "address": "Calle Principal 123, Ciudad"
    }
    ```
  - Respuesta exitosa (201 Created):
    ```json
    {
      "message": "Cliente registrado exitosamente",
      "customer": {
        "customer_id": 1,
        "first_name": "Juan",
        "last_name": "Pérez",
        "email": "juan@ejemplo.com",
        "phone": "1234567890",
        "address": "Calle Principal 123, Ciudad",
        "admin": false,
        "created_at": "2025-03-10T23:32:40.000Z",
        "updated_at": "2025-03-10T23:32:40.000Z"
      }
    }
    ```

- `POST /api/auth/login`
  - Iniciar sesión de usuario
  - No requiere autenticación
  - Cuerpo de la solicitud:
    ```json
    {
      "email": "juan@ejemplo.com",
      "password": "contraseñasegura"
    }
    ```
  - Respuesta exitosa (200 OK):
    ```json
    {
      "message": "Inicio de sesión exitoso",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "customer": {
        "customer_id": 1,
        "first_name": "Juan",
        "last_name": "Pérez",
        "email": "juan@ejemplo.com",
        "phone": "1234567890",
        "address": "Calle Principal 123, Ciudad",
        "admin": false,
        "created_at": "2025-03-10T23:32:40.000Z",
        "updated_at": "2025-03-10T23:32:40.000Z"
      }
    }
    ```

Para rutas protegidas, incluir el token JWT recibido en el encabezado de Autorización:
```javascript
Authorization: Bearer your_jwt_token
```

## Manejo de Errores

La API devuelve códigos de estado HTTP y mensajes de error apropiados:

- 200: Éxito
- 201: Recurso creado
- 400: Solicitud incorrecta
- 401: No autorizado
- 403: Prohibido
- 404: No encontrado
- 500: Error del servidor

## Linting y Control de Calidad

El proyecto utiliza ESLint para mantener un código consistente y de alta calidad.

### Comandos de Linting

```bash
# Ejecutar el linter
npm run lint

# Corregir automáticamente los problemas de linting
npm run lint:fix
```

### Configuración de Linting

- El linter está configurado en `.eslintrc.json` con reglas específicas para TypeScript
- Se ejecuta automáticamente en cada Pull Request a través de GitHub Actions
- Reglas principales:
  - Indentación de 2 espacios
  - Comillas simples
  - Punto y coma obligatorio
  - Reglas específicas de TypeScript

### Integración Continua

El linting se ejecuta automáticamente en cada Pull Request que afecte a archivos en el directorio `backend/`. Esto asegura que todo el código nuevo cumpla con los estándares del proyecto antes de ser fusionado.
