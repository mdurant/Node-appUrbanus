# Proyecto APP Urbanus

_Plataforma SaaS para unificar comercios, empresas, pymes y profesionales de servicios orientados a remodelación y construcción._

## Descripción General

APP Urbanus es una **plataforma SaaS** diseñada para conectar clientes finales con profesionales y empresas del ámbito de la remodelación y construcción (casas, departamentos, obras menores y mayores). Su objetivo es ofrecer:

- **Inmediatez** en respuestas a solicitudes de servicios.  
- **Cercanía** y generación de lazos de confianza.  
- **Planes de membrecía** (anual, semestral o mensual) para facilitar la contratación de servicios.  

Actualmente, la plataforma integra módulos de:

1. **Autenticación**: Incluye JWT y soporte para mTLS.  
2. **Ofertas**: Los proveedores pueden publicar y administrar sus ofertas de servicios.  
3. **Servicios**: Solicitud y seguimiento de servicios (remodelaciones, arreglos, obras, etc.).  
4. **Billetera Digital (Wallet)**: Manejo de fondos, transacciones y recargas.  
5. **Invitaciones** (en desarrollo): Permitirá compartir beneficios o cupones con otros usuarios.  

---

## Tecnologías

- **Node.js 22.x**
- **Express** (framework web para Node)
- **MySQL** (base de datos relacional)
- **Sequelize** (ORM para Node)
- **bcrypt** (hashing de contraseñas)
- **JSON Web Tokens (JWT)** (autenticación)
- **mTLS** (mutual TLS para integraciones seguras)
- Otras librerías populares de **NPM** para logging, mailing, etc.

---

## Configuración e Instalación

1. **Clona** este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/app-urbanus.git

2. **Entra al directorio del proyecto**
    ```bash
    cd app-urbanus
3. **Instala Dependencias**
    ```bash
    npm install
4. **Configura tu archivo ENV**
    ```bash
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=urbanus_db
DB_USERNAME=admin
DB_PASSWORD=secret
DB_DIALECT=mysql
JWT_SECRET=supersecret
PORT=3443
5. **Configura tus certificados mTLS (opcional/ si requieres integraciones seguras):**
- Copia tus llaves y certificados (server.key, server.crt, ca.crt) en src/certs/.
- Ajusta app.js según tu ruta de certificados.
6. **Ejecuta las migraciones o sincroniza la Base de Datos**
    ```bash
    npm run db:migrate
(Dependiendo de la configuración de Sequelize o scripts custom.)
7. **Inicia la aplicación, ejemplo: Ambiente DEV**
    ```bash
    npm run dev

## Uso

### Autenticación (`/api/auth`):
- **POST** `/register`: Registro de nuevos usuarios.  
- **POST** `/login`: Autenticación con JWT.  
- **POST** `/logout`: Cierre de sesión (invalida token).  
- **GET** `/user-info`: Obtener datos del usuario autenticado.  

### Ofertas (`/api/offers`):
- **POST** `/`: Crear una nueva oferta.  
- **GET** `/`: Listar ofertas activas.  
- **PUT** `/:id`: Actualizar oferta.  
- **DELETE** `/:id`: Eliminar oferta.  

### Servicios (`/api/service-requests`):
- **POST** `/`: Crear una solicitud de servicio.  
- **GET** `/`: Listar solicitudes del usuario.  
- *Más rutas en desarrollo.*  

### Billetera Digital (`/api/wallet`):
- **POST** `/add-funds`: Agregar fondos.  
- **GET** `/balance`: Ver el saldo.  
- **GET** `/transactions`: Historial de transacciones.  

*(El detalle exacto puede variar según el estado de desarrollo y las últimas implementaciones.)*

---

## Contribución
1. Haz un **fork** del repositorio.  
2. Crea una **rama** para tu feature/fix.  
3. Haz **commit** de tus cambios con mensajes descriptivos.  
4. **Push** a tu rama en GitHub.  
5. Crea un **Pull Request** al repositorio principal.  

---

## Autor
Desarrollado por **Mauricio Durán – Líder TI – Integraltech Chile**

Si tienes dudas o sugerencias, no dudes en contactarnos o abrir un issue.

---

## Licencia
Proyecto cerrado para uso interno de la organización. Para consultas de licenciamiento, contactar al equipo de soporte de **Integraltech Chile**.

## Estructura del Proyecto


```bash
├─ src/
│  ├─ certs/         # Certificados SSL (server.key, server.crt, ca.crt)
│  ├─ config/        # Configuración de DB, mailer, etc.
│  ├─ controllers/   # Controladores de cada módulo (auth, offers, etc.)
│  ├─ middlewares/   # Middlewares de validación y seguridad
│  ├─ models/        # Definición de modelos (Sequelize)
│  ├─ routes/        # Endpoints de la aplicación (authRoutes, offersRoutes, etc.)
│  ├─ utils/         # Utilidades y helpers (logger, tokenBlacklist, etc.)
│  ├─ app.js         # Configuración y arranque del servidor (mTLS, Express)
│  └─ ...
├─ package.json
├─ .env.example
└─ ...

---

