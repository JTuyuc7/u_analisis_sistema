# Configuración de la Base de Datos

Este documento proporciona instrucciones para configurar la base de datos PostgreSQL y pgAdmin utilizando Docker Compose.

## Requisitos Previos

- Docker y Docker Compose instalados en su sistema.
- Acceso a la terminal o línea de comandos.

## Pasos para la Configuración

1. **Preparar los Archivos de Configuración**

   Asegúrese de que los siguientes archivos estén presentes en el directorio `db`:
   - `docker-compose.yml`: Configuración de los contenedores Docker.
   - `dev.env`: Variables de entorno para el entorno de desarrollo.
   - `init.sql`: Script SQL para inicializar la estructura de la base de datos.
2. **Archivos `ENV`**
   En el directorio `db` debe tener archivos con terminacion `.env` para poder almacenar los datos sensilbles de la aplicacion como contraseñas o API keys, para este caso en el modo de desarrollo o `development` debe de crear un archivo `dev.env` aca se almacenaran los datos para la configuracion de `postgres` y `phAdmin`, debe contener el siguiente formato
   ```
    POSTGRES_PASSWORD=<password>
    POSTGRES_USER=<user>
    POSTGRES_DB=<db_name>
    PGADMIN_DEFAULT_EMAIL=<default_email>
    PGADMIN_DEFAULT_PASSWORD=<password_pg_admin>
    ```

3. **Iniciar los Contenedores**

   Abra una terminal en el directorio `db` y ejecute el siguiente comando:

   ```
   docker-compose up -d
   ```

   Este comando iniciará los contenedores de PostgreSQL y pgAdmin en segundo plano.

4. **Verificar el Estado de los Contenedores**

   Para asegurarse de que los contenedores estén funcionando correctamente, ejecute:

   ```
   docker-compose ps
   ```

   Debería ver dos contenedores en estado "Up".

5. **Acceder a pgAdmin**

   - Abra su navegador web y vaya a `http://localhost:8081`
   - Inicie sesión con las credenciales especificadas en el archivo `dev.env`

6. **Conectar pgAdmin a la Base de Datos PostgreSQL**

   En pgAdmin:
   1. Haga clic derecho en "Servers" → "Register" → "Server"
   2. En la pestaña "General", asigne un nombre a la conexión (por ejemplo, "Local PostgreSQL")
   3. En la pestaña "Connection", use los siguientes detalles:
      - Host: `db` (nombre del servicio en docker-compose)
      - Port: `5432`
      - Database: `bank_app` (o el nombre especificado en `dev.env`)
      - Username: `dev_user` (o el usuario especificado en `dev.env`)
      - Password: La contraseña especificada en `dev.env`

7. **Verificar la Estructura de la Base de Datos**

   Después de conectarse, expanda el árbol de navegación:
   Servers → Local PostgreSQL → Databases → bank_app → Schemas → public → Tables

   Debería ver las siguientes tablas:
   - customer
   - account
   - transaction
   - loan
   - audit_logs

## Notas Adicionales

- La base de datos se inicializa automáticamente con la estructura definida en `init.sql`.
- Si necesita realizar cambios en la estructura de la base de datos, modifique `init.sql` y reinicie los contenedores con `docker-compose down -v` seguido de `docker-compose up -d`.
- Para entornos de producción, asegúrese de cambiar las credenciales y utilizar el archivo `prod.env`.

