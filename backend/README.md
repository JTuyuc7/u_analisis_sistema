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
PORT=4001
DB_HOST=localhost
DB_PORT=5433
DB_USER=dev_user
DB_PASSWORD=dev_my_secret_password
DB_NAME=bank_app_db
JWT_SECRET=your_jwt_secret_super_secret_with_32_characters
```

3. Configurar la base de datos:
- Asegúrese de que PostgreSQL esté instalado y en ejecución
- Crear una base de datos llamada `bank_app_db`

4. Configuración de Docker:
- El archivo `docker-compose.yml` en el directorio `db/` incluye la ejecución del script `init.sql` para inicializar la base de datos.
- Esta configuración es útil para el desarrollo y pruebas, ya que garantiza que la base de datos tenga la estructura correcta al iniciar el contenedor.
- Para entornos de producción, considere usar las migraciones de TypeORM en lugar de depender del script `init.sql`.

## Uso de init.sql vs Migraciones

- **init.sql**: 
  - Útil para configuración inicial rápida en entornos de desarrollo.
  - Proporciona un estado consistente de la base de datos al iniciar el contenedor.
  - No es ideal para manejar cambios incrementales en la estructura de la base de datos.

- **Migraciones de TypeORM**:
  - Recomendadas para gestionar cambios en la estructura de la base de datos a lo largo del tiempo.
  - Permiten un control más granular sobre los cambios en el esquema.
  - Más adecuadas para entornos de producción y para manejar actualizaciones de la base de datos.

Se recomienda usar ambos enfoques de manera complementaria:
- Utilice `init.sql` para la configuración inicial rápida en desarrollo.
- Use migraciones para gestionar cambios incrementales y en producción.

## Migraciones de la Base de Datos

1. Generar una nueva migración:
```bash
npm run migration:generate -- src/migrations/NombreDeLaMigracion
```

2. Ejecutar las migraciones:
```bash
npm run migration:run
```

3. Revertir la última migración:
```bash
npm run migration:revert
```

Nota: Al usar migraciones, asegúrese de que no entren en conflicto con la estructura definida en `init.sql`. Es recomendable usar migraciones para todos los cambios de esquema una vez que el proyecto esté en producción.

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

## Seeding de Datos Iniciales

El servidor está configurado para ejecutar automáticamente el seeder de datos iniciales al iniciar. Esto creará algunos clientes y cuentas de prueba en la base de datos.

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

## Gestión de Cuentas

### Endpoints de Cuentas

- `POST /api/accounts`
  - Crear una nueva cuenta bancaria
  - Requiere: Autenticación (usa el ID del cliente del token JWT)
  - Cuerpo:
    ```json
    {
      "accountType": "checking",
      "accountName": "Cuenta Principal"
    }
    ```
  - Respuesta exitosa (201 Created):
    ```json
    {
      "message": "Account created successfully",
      "account": {
        "account_id": 1,
        "account_number": "1234567890"
      }
    }
    ```

- `GET /api/accounts`
  - Listar todas las cuentas del cliente autenticado
  - Requiere: Autenticación
  - Respuesta exitosa (200 OK):
    ```json
    [
      {
        "account_id": 1,
        "account_number": "1234567890",
        "account_type": "checking",
        "account_name": "Cuenta Principal",
        "balance": 1000.00,
        "status": "active",
        "created_at": "2025-03-12T22:00:00.000Z"
      }
    ]
    ```

- `POST /api/accounts/transfer`
  - Realizar transferencia entre cuentas
  - Requiere: Autenticación
  - Cuerpo:
    ```json
    {
      "fromAccountId": 1,
      "toAccountId": 2,
      "amount": 500.00,
      "description": "Pago de servicios"
    }
    ```
  - Respuesta exitosa (200 OK):
    ```json
    {
      "message": "Transfer completed successfully"
    }
    ```

- `GET /api/accounts/:accountId/transactions`
  - Listar transacciones de una cuenta
  - Requiere: Autenticación
  - Respuesta exitosa (200 OK):
    ```json
    [
      {
        "transaction_id": 1,
        "transaction_type": "transfer",
        "amount": -500.00,
        "description": "Pago de servicios",
        "transaction_date": "2025-03-12T22:05:00.000Z",
        "related_account_id": 2
      }
    ]
    ```

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

### Configuración de Linting y Git Hooks

- El linter está configurado en `eslint.config.js` con reglas específicas para TypeScript
- Se ejecuta automáticamente en:
  - Cada Pull Request a través de GitHub Actions
  - Antes de cada commit mediante Husky pre-commit hook
- La carpeta `src/migrations/` está excluida del linting
- Reglas principales:
  - Indentación de 2 espacios
  - Comillas simples
  - Punto y coma obligatorio
  - Reglas específicas de TypeScript

### Git Hooks con Husky

El proyecto utiliza Husky para ejecutar automáticamente el linting antes de cada commit:
- El hook pre-commit ejecuta `npm run lint`
- Se instala automáticamente al ejecutar `npm install` gracias al script "prepare"
- Asegura que todo el código commiteado cumpla con los estándares de linting
- Las migraciones están excluidas del proceso de linting

### Integración Continua

El linting se ejecuta automáticamente en cada Pull Request que afecte a archivos en el directorio `backend/`. Esto asegura que todo el código nuevo cumpla con los estándares del proyecto antes de ser fusionado.

## Documentación de la API con Swagger

La API está documentada usando Swagger/OpenAPI. Esto proporciona una interfaz interactiva para explorar y probar todos los endpoints disponibles.

### Acceso a la documentación Swagger

Una vez que el servidor esté en ejecución, puede acceder a la documentación interactiva en:

```
http://localhost:4001/api-docs
```

### Características de la documentación Swagger

- **Exploración visual**: Interfaz gráfica que muestra todos los endpoints organizados por grupos.
- **Pruebas interactivas**: Permite realizar solicitudes reales a la API directamente desde la interfaz.
- **Documentación detallada**: Muestra parámetros requeridos, esquemas de respuesta y códigos de estado HTTP.
- **Autenticación integrada**: Soporte para probar endpoints protegidos usando tokens JWT.

### Autenticación en Swagger UI

Para probar endpoints protegidos que requieren autenticación:

1. Primero, realice una solicitud POST a `/api/auth/login` para obtener un token JWT.
2. Haga clic en el botón "Authorize" (Autorizar) en la parte superior de la página Swagger UI.
3. Ingrese su token en el formato: `Bearer su_token_jwt` (sin las comillas).
4. Haga clic en "Authorize" y cierre el diálogo.

Ahora podrá probar todos los endpoints protegidos sin recibir errores de autenticación.

### Documentación de los endpoints

Cada endpoint está documentado con:
- Descripción de la funcionalidad
- Parámetros requeridos
- Esquemas de solicitud y respuesta
- Posibles códigos de estado
- Requisitos de autenticación

Esta documentación se genera automáticamente a partir de los comentarios JSDoc en los archivos de rutas, proporcionando siempre información actualizada de la API.
