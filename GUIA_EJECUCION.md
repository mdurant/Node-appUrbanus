# Guía Completa de Ejecución y Desarrollo - APP Urbanus

Esta guía proporciona todos los pasos necesarios para configurar, ejecutar y continuar desarrollando en el proyecto APP Urbanus.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: Versión 22.x o superior
- **MySQL**: Servidor de base de datos MySQL en ejecución
- **npm**: Gestor de paquetes de Node.js (viene con Node.js)
- **Git**: Para clonar el repositorio (si aplica)

### Verificar Instalaciones

```bash
node --version    # Debe mostrar v22.x o superior
npm --version     # Debe mostrar la versión de npm
mysql --version   # Debe mostrar la versión de MySQL
```

---

## 🚀 Pasos de Configuración Inicial

### 1. Clonar el Repositorio (si aplica)

```bash
git clone <URL_DEL_REPOSITORIO>
cd Node-appUrbanus
```

Si ya tienes el proyecto localmente, navega al directorio:

```bash
cd /Users/mdurant/Node-appUrbanus
```

### 2. Instalar Dependencias

Instala todas las dependencias del proyecto:

```bash
npm install
```

Esto instalará las siguientes dependencias principales:
- `express`: Framework web
- `sequelize`: ORM para MySQL
- `mysql2`: Driver de MySQL
- `bcrypt`: Hashing de contraseñas
- `jsonwebtoken`: Manejo de JWT
- `nodemailer`: Envío de correos
- `winston`: Sistema de logging
- `express-rate-limit`: Rate limiting
- `express-validator`: Validación de datos
- `moment-timezone`: Manejo de fechas
- `crypto`: Utilidades criptográficas

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env-sample`:

```bash
cp .env-sample .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Autenticación JWT
JWT_SECRET=yourVeryStrongSecretKey123!

# Base de Datos MySQL
DB_USERNAME=root
DB_PASSWORD=tu_contraseña_mysql
DB_DATABASE=urbanus_app_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql

# Entorno de Ejecución
NODE_ENV=development

# Servidor
PORT=3000
URL_APP=http://localhost:3000
NAME_APP=APP Urbanus

# Verificación OTP
VERIFICATION_EXPIRY=300
MAX_ATTEMPTS=3

# Configuración de Correo (Mailtrap o tu proveedor SMTP)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=tu_usuario_mailtrap
MAIL_PASS=tu_contraseña_mailtrap
MAIL_FROM="APP Urbanus" <no-reply@urbanus.com>
```

**⚠️ IMPORTANTE**: 
- Nunca subas el archivo `.env` al repositorio (debe estar en `.gitignore`)
- Usa valores seguros y únicos en producción
- Para producción, usa un servicio de correo real (no Mailtrap)

### 4. Crear la Base de Datos

Conéctate a MySQL y crea la base de datos:

```bash
mysql -u root -p
```

Luego ejecuta:

```sql
CREATE DATABASE urbanus_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

O si prefieres hacerlo desde la línea de comandos:

```bash
mysql -u root -p -e "CREATE DATABASE urbanus_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Ejecutar Migraciones

Las migraciones crean las tablas en la base de datos:

```bash
npm run db:migrate
```

Esto ejecutará todas las migraciones pendientes y creará el esquema de la base de datos.

**Si necesitas deshacer la última migración:**

```bash
npm run db:migrate:undo
```

### 6. Ejecutar Seeders (Opcional pero Recomendado)

Los seeders pueblan la base de datos con datos iniciales:

```bash
npm run db:seed
```

Esto cargará datos de ejemplo como tipos de servicios iniciales.

---

## ▶️ Ejecutar la Aplicación

### Modo Desarrollo (con hot-reload)

```bash
npm run dev
```

O también puedes usar:

```bash
npm start
```

Ambos comandos ejecutan `node --watch src/app.js`, que reinicia automáticamente el servidor cuando detecta cambios en los archivos.

### Modo Producción

Para producción, se recomienda usar un gestor de procesos como **PM2**:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
pm2 start src/app.js --name app-urbanus

# Ver logs
pm2 logs app-urbanus

# Detener la aplicación
pm2 stop app-urbanus
```

### Verificar que la Aplicación Está Corriendo

Una vez iniciada, deberías ver en la consola:

```
Servidor escuchando en el puerto 3000
Entorno de ejecución: development
Nombre de Base de datos conectada es: urbanus_app_db
...
```

La aplicación estará disponible en: `http://localhost:3000`

---

## 🧪 Probar la API

### Endpoint de Prueba

Puedes probar que el servidor está funcionando haciendo una petición a cualquier endpoint. Por ejemplo, listar servicios:

```bash
curl http://localhost:3000/api/services
```

### Usar Postman o Thunder Client

Importa las siguientes rutas principales para probar:

- **Autenticación**: `POST /api/auth/register`, `POST /api/auth/login`
- **Servicios**: `GET /api/services`
- **Ofertas**: `GET /api/offers/offers`
- **Wallet**: `POST /api/wallet` (requiere autenticación)

---

## 📁 Estructura del Proyecto para Desarrollo

```
Node-appUrbanus/
├── config/                    # Configuración de Sequelize
│   └── config.js              # Configuración de BD por entorno
├── models/                    # Modelos Sequelize (raíz)
│   ├── user.js
│   ├── service.js
│   ├── wallet.js
│   └── ...
├── migrations/                # Migraciones de BD (si existen)
├── seeders/                   # Seeders de BD
│   └── seedServices.js
├── src/
│   ├── app.js                 # ⭐ Archivo principal de Express
│   ├── config/
│   │   ├── db.js              # Conexión a BD
│   │   └── mailer.js          # Configuración de correo
│   ├── controllers/           # ⭐ Lógica de negocio
│   │   ├── authController.js
│   │   ├── walletController.js
│   │   ├── serviceController.js
│   │   └── ...
│   ├── middlewares/           # ⭐ Middlewares personalizados
│   │   ├── authMiddleware.js  # Verificación JWT
│   │   ├── adminMiddleware.js # Verificación de admin
│   │   └── ...
│   ├── routes/                # ⭐ Definición de rutas
│   │   ├── authRoutes.js
│   │   ├── walletRoutes.js
│   │   └── ...
│   ├── models/                # Modelos (duplicado, revisar)
│   └── utils/                 # Utilidades
│       ├── logger.js
│       └── slugUtils.js
├── .env                       # ⚠️ Variables de entorno (NO subir)
├── .env-sample                # Plantilla de variables
├── package.json               # Dependencias y scripts
└── README.md                  # Documentación principal
```

---

## 🔧 Comandos Útiles para Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia con hot-reload
npm start                # Inicia la aplicación

# Base de Datos
npm run db:migrate       # Ejecuta migraciones
npm run db:migrate:undo  # Deshace última migración
npm run db:seed          # Ejecuta seeders
```

### Comandos Adicionales Útiles

```bash
# Ver logs en tiempo real (si usas PM2)
pm2 logs

# Reiniciar aplicación (PM2)
pm2 restart app-urbanus

# Ver estado de procesos (PM2)
pm2 status

# Verificar conexión a BD
mysql -u root -p -e "USE urbanus_app_db; SHOW TABLES;"
```

---

## 📝 Flujo de Desarrollo Típico

### 1. Crear una Nueva Funcionalidad

1. **Crear/Modificar Modelo** (si es necesario):
   ```bash
   # Editar en models/ o src/models/
   ```

2. **Crear Migración** (si cambias el esquema):
   ```bash
   # Usar Sequelize CLI para generar migración
   npx sequelize-cli migration:generate --name nombre-migracion
   ```

3. **Crear/Modificar Controller**:
   ```bash
   # Editar en src/controllers/
   ```

4. **Crear/Modificar Rutas**:
   ```bash
   # Editar en src/routes/
   # Registrar en src/app.js
   ```

5. **Agregar Middlewares** (si es necesario):
   ```bash
   # Editar en src/middlewares/
   ```

6. **Probar**:
   - Reinicia el servidor (automático con `--watch`)
   - Prueba con Postman/Thunder Client
   - Verifica logs en consola

### 2. Trabajar con la Base de Datos

**Crear una nueva migración:**
```bash
npx sequelize-cli migration:generate --name add-new-column-to-users
```

**Aplicar migraciones:**
```bash
npm run db:migrate
```

**Crear un seeder:**
```bash
npx sequelize-cli seed:generate --name seed-plans
```

**Ejecutar seeders:**
```bash
npm run db:seed
```

---

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

1. **Registro**: `POST /api/auth/register`
2. **Verificar Email**: `POST /api/auth/verify-email`
3. **Login**: `POST /api/auth/login` (envía OTP)
4. **Verificar OTP**: `POST /api/auth/verify-login` (obtiene JWT)
5. **Usar JWT**: Incluir en header `Authorization: Bearer <token>`

### Roles de Usuario

- **USER**: Usuario regular (puede crear wallets, suscripciones, etc.)
- **ADMIN**: Administrador (puede gestionar ofertas, ver todas las wallets, etc.)

### Middlewares de Autenticación

- `authMiddleware`: Verifica JWT válido
- `adminMiddleware`: Verifica que el usuario sea ADMIN

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de Conexión a Base de Datos

1. Verifica que MySQL esté corriendo:
   ```bash
   mysql.server start  # macOS
   # o
   sudo systemctl start mysql  # Linux
   ```

2. Verifica credenciales en `.env`

3. Verifica que la base de datos exista:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Error: "JWT_SECRET is not defined"

Asegúrate de que el archivo `.env` existe y tiene `JWT_SECRET` definido.

### Error: "Port 3000 already in use"

```bash
# Encontrar proceso usando el puerto
lsof -ti:3000

# Matar el proceso
kill -9 $(lsof -ti:3000)

# O cambiar el puerto en .env
PORT=3001
```

### Las Migraciones No Se Ejecutan

Verifica que el archivo `config/config.js` esté correctamente configurado y que las variables de entorno estén cargadas.

---

## 📚 Recursos y Referencias

### Documentación de Endpoints

Consulta el `README.md` principal para la documentación completa de todos los endpoints de la API.

### Módulos Principales

1. **Autenticación** (`/api/auth`)
2. **API Keys** (`/api/apikeys`)
3. **Servicios** (`/api/services`)
4. **Ofertas** (`/api/offers`)
5. **Solicitudes de Servicio** (`/api/service-requests`)
6. **Wallet** (`/api/wallet`)
7. **Suscripciones** (`/api/subscriptions`)

### Mejores Prácticas

- ✅ Usar transacciones de BD para operaciones complejas
- ✅ Validar datos en controllers y modelos
- ✅ Usar middlewares de autenticación donde sea necesario
- ✅ Registrar errores con el logger
- ✅ No exponer información sensible en logs
- ✅ Usar variables de entorno para configuración

---

## 🚀 Próximos Pasos para Continuar el Desarrollo

1. **Implementar Tests**: Actualmente no hay tests. Considera agregar:
   - Tests unitarios (Jest, Mocha)
   - Tests de integración
   - Tests E2E

2. **Mejorar Seguridad**:
   - Revisar autorización en módulo de Services
   - Externalizar credenciales de mailer a variables de entorno
   - Implementar rate limiting más granular

3. **Optimizar Rutas**:
   - Simplificar rutas redundantes (ej: `/api/offers/offers` → `/api/offers`)

4. **Agregar Transacciones de BD**:
   - Envolver operaciones complejas (Wallet, Subscriptions) en transacciones

5. **Mejorar Documentación**:
   - Agregar JSDoc a modelos
   - Documentar mejor los endpoints con Swagger/OpenAPI

---

## 📞 Soporte

Para dudas o problemas:
- **Contacto**: mauricio@integraltech.cl
- **Autor**: Mauricio Durán Torres - CTO Integraltech Chile

---

## 📄 Licencia

MIT License - Proyecto para uso interno de la organización.

---

**¡Listo para desarrollar! 🎉**

