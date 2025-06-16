# Proyecto APP Urbanus

_Plataforma SaaS para unificar comercios, empresas, pymes y profesionales de servicios orientados a remodelación y construcción._

## Descripción General

APP Urbanus es una **plataforma SaaS** diseñada para conectar clientes finales con profesionales y empresas del ámbito de la remodelación y construcción (casas, departamentos, obras menores y mayores). Su objetivo es ofrecer:

- **Inmediatez** en respuestas a solicitudes de servicios.
- **Cercanía** y generación de lazos de confianza.
- **Planes de membrecía** (anual, semestral o mensual) para facilitar la contratación de servicios.

## Módulos Detallados de la Plataforma

La plataforma se compone de los siguientes módulos principales:

1.  **Autenticación (Auth)**:
    *   Gestiona el registro de usuarios, verificación de correo electrónico, inicio de sesión (con contraseña y OTP), cierre de sesión y recuperación de contraseñas.
    *   Utiliza JSON Web Tokens (JWT) para la gestión de sesiones.
    *   Incluye un sistema de OTP (One-Time Password) enviado por correo para verificar inicios de sesión.
    *   Maneja una lista negra de tokens para invalidar JWTs al cerrar sesión.

2.  **Gestión de API Keys (API Keys)**:
    *   Permite a los usuarios autenticados generar y administrar API keys para acceso programático a la plataforma.
    *   Las claves pueden tener descripciones y fechas de expiración.
    *   Soporta la revocación de API keys (soft delete).

3.  **Definición de Servicios (Services)**:
    *   Administra los tipos de servicios que se pueden ofrecer o solicitar en la plataforma (e.g., pintura, plomería).
    *   Cada servicio tiene un nombre, descripción y una lista de tareas específicas que incluye.
    *   Genera automáticamente "slugs" (URLs amigables) para cada servicio.
    *   Las operaciones CRUD para servicios (crear, leer, actualizar, eliminar) están protegidas por rate limiting.
    *   *Nota: Actualmente, las rutas de gestión de servicios no cuentan con middleware de autorización de administrador, lo que podría ser un punto a revisar.*

4.  **Gestión de Ofertas (Offers)**:
    *   Permite a los administradores crear, listar, actualizar y eliminar ofertas promocionales.
    *   Las ofertas tienen título, descripción, porcentaje de descuento (0-100%), y fecha de validez.
    *   Solo las ofertas con estado "ACTIVE" son listadas públicamente.
    *   La creación, actualización y eliminación de ofertas están restringidas a usuarios administradores.

5.  **Solicitudes de Servicio (Service Requests)**:
    *   Permite a los usuarios autenticados crear solicitudes detalladas para los servicios que necesitan.
    *   Cada solicitud incluye información de campaña, datos del cliente, tipo de categoría, servicio específico, archivos de referencia, y aceptación de términos.
    *   El estado de la solicitud (`Completed`, `In progress`, `Not completed`) se gestiona dinámicamente basado en la completitud de sus pasos internos y la aceptación de términos.
    *   *Nota: La funcionalidad de listar solicitudes actualmente muestra todas las que cumplen ciertos criterios de estado, y podría necesitar filtrado por usuario o rol administrativo dependiendo del caso de uso deseado.*

6.  **Billetera Digital (Wallet)**:
    *   Proporciona a los usuarios (con rol "USER") una billetera digital para manejar fondos.
    *   Cada billetera tiene un ID único, soporta múltiples monedas (CLP, USD configurados), y mantiene un balance por cada moneda.
    *   Funcionalidades:
        *   Creación de wallet (una por usuario).
        *   Agregar fondos a la wallet.
        *   Consultar saldo actual.
        *   Ver historial de transacciones de la wallet.
    *   Los administradores pueden listar todas las wallets existentes.
    *   Las transacciones de la wallet registran IP y navegador para auditoría.

7.  **Suscripciones (Subscriptions)**:
    *   Gestiona las suscripciones de los usuarios a diferentes planes (definidos en el módulo `Plan`).
    *   Para crear una suscripción, el usuario debe tener una wallet.
    *   El costo de la suscripción se descuenta del balance de la wallet en la moneda correspondiente.
    *   Funcionalidades:
        *   Crear suscripción.
        *   Cancelar suscripción (cambia estado a 'expired').
        *   Anular suscripción (cambia estado y restituye el monto a la wallet).
    *   Todas las operaciones de suscripción y sus efectos en la wallet se registran detalladamente en las tablas `Transaction` y `WalletTransaction`.
    *   *Nota: Las operaciones que afectan múltiples tablas (ej. crear suscripción y descontar de wallet) deberían idealmente estar envueltas en transacciones de base de datos para asegurar atomicidad.*

8.  **Planes (Plans)**:
    *   Define los diferentes planes de suscripción disponibles, incluyendo nombre del plan, moneda y precio.
    *   Estos planes son referenciados por el módulo de `Subscriptions`.

---

## Tecnologías Utilizadas

-   **Node.js:** Versión 22.x (según `README` original, verificar la versión actual del proyecto).
-   **Express.js:** Framework web para Node.js.
-   **Base de Datos:** MySQL (configurable a través de variables de entorno).
-   **ORM:** Sequelize para la interacción con la base de datos.
-   **Autenticación:**
    -   `bcrypt`: Para el hashing seguro de contraseñas.
    -   `jsonwebtoken`: Para la generación y verificación de JSON Web Tokens (JWT).
-   **Correo Electrónico:** `nodemailer` (actualmente configurado con Mailtrap, pero se recomienda externalizar credenciales).
-   **Otros:**
    -   `crypto`: Para la generación de tokens seguros y API keys.
    -   `moment-timezone`: Para manejo avanzado de fechas y zonas horarias.
    *   `express-rate-limit`: Para limitar la tasa de solicitudes a ciertos endpoints.
    *   `express-validator`: (Listado en `package.json`, aunque su uso no fue prominente en los controllers revisados, podría estar en `middlewares/validator.js`).
    *   `winston`: (Listado en `package.json`, usado a través de `src/utils/logger.js` para logging).
-   **Soporte mTLS:** Capacidad para mutual TLS para integraciones seguras (configuración manual de certificados).

---

## Variables de Entorno

Es crucial configurar las siguientes variables de entorno en un archivo `.env` en la raíz del proyecto para el correcto funcionamiento de la aplicación. Puedes usar el archivo `.env-sample` como plantilla.

| Variable              | Descripción                                                                 | Ejemplo                                              |
| --------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| `JWT_SECRET`          | Secreto para firmar los JSON Web Tokens.                                    | `yourVeryStrongSecretKey123!`                        |
| `DB_USERNAME`         | Nombre de usuario para la conexión a la base de datos.                      | `root`                                               |
| `DB_PASSWORD`         | Contraseña para la conexión a la base de datos.                             | `db_password`                                        |
| `DB_DATABASE`         | Nombre de la base de datos.                                                 | `urbanus_app_db`                                     |
| `DB_HOST`             | Host de la base de datos.                                                   | `127.0.0.1`                                          |
| `DB_PORT`             | Puerto de la base de datos.                                                 | `3306`                                               |
| `DB_DIALECT`          | Dialecto de Sequelize a utilizar.                                           | `mysql`                                              |
| `NODE_ENV`            | Entorno de ejecución de la aplicación.                                      | `development`, `test`, `production`                  |
| `PORT`                | Puerto en el que escuchará el servidor de la aplicación.                    | `3000`                                               |
| `URL_APP`             | URL base de la aplicación (para emails, etc.).                              | `http://localhost:3000`                              |
| `NAME_APP`            | Nombre de la aplicación (usado en logs).                                    | `APP Urbanus`                                        |
| `VERIFICATION_EXPIRY` | Tiempo de expiración (en segundos) para OTPs de verificación de email/login. | `300` (5 minutos)                                    |
| `MAX_ATTEMPTS`        | Número máximo de intentos para OTPs.                                        | `3`                                                  |
| `MAIL_HOST`           | Host del servidor SMTP para envío de correos.                               | `sandbox.smtp.mailtrap.io`                           |
| `MAIL_PORT`           | Puerto del servidor SMTP.                                                   | `2525`                                               |
| `MAIL_USER`           | Usuario para autenticación SMTP.                                            | `mailtrap_user`                                      |
| `MAIL_PASS`           | Contraseña para autenticación SMTP.                                         | `mailtrap_password`                                  |
| `MAIL_FROM`           | Dirección de correo "De" por defecto para los emails.                       | `"APP Urbanus" <no-reply@urbanus.com>`             |

---

## Configuración e Instalación

1.  **Clonar el Repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd nombre-del-directorio-del-proyecto
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    *   Copia el archivo `.env-sample` a `.env`.
    *   Modifica el archivo `.env` con tus configuraciones locales/producción (ver sección "Variables de Entorno").

4.  **Configurar Base de Datos:**
    *   Asegúrate de que tu servidor de base de datos (MySQL) esté corriendo y accesible con las credenciales proporcionadas en `.env`.
    *   Crea la base de datos especificada en `DB_DATABASE` si aún no existe.

5.  **Ejecutar Migraciones de Base de Datos:**
    Las migraciones definen y actualizan el esquema de tu base de datos.
    ```bash
    npm run db:migrate
    ```
    Para deshacer la última migración:
    ```bash
    npm run db:migrate:undo
    ```

6.  **Ejecutar Seeders (Opcional pero Recomendado para Desarrollo):**
    Los seeders pueblan la base de datos con datos iniciales o de prueba (e.g., tipos de servicios).
    ```bash
    npm run db:seed
    ```
    Esto ejecutará todos los seeders. Revisa el directorio `seeders/` para ver qué datos se cargarán (e.g., `seedServices.js`).

7.  **Configuración de mTLS (Opcional):**
    Si necesitas integraciones seguras utilizando mTLS:
    *   Copia tus certificados y llaves del servidor (`server.key`, `server.crt`) y la Autoridad Certificadora (`ca.crt`) en un directorio accesible (e.g., `src/certs/`).
    *   Ajusta la configuración del servidor HTTPS en `src/app.js` para cargar estos certificados. (El `README` original menciona esto; la implementación actual de `app.js` no muestra un servidor HTTPS, por lo que este paso podría requerir agregar la lógica de `https://.createServer()` si se necesita mTLS a nivel de Node/Express).

8.  **Iniciar la Aplicación:**
    *   Para desarrollo (con hot-reloading gracias a `--watch`):
        ```bash
        npm run dev
        ```
    *   Para producción (generalmente se usa un gestor de procesos como PM2):
        ```bash
        npm start
        ```
    La aplicación debería estar corriendo en el `PORT` especificado y conectada a la `DB_DATABASE`. Revisa los logs de inicio.

---

## Documentación de API Endpoints

A continuación se detallan los principales endpoints de la API. Todas las rutas están prefijadas con `/api`.

### Autenticación (`/auth`)

-   **`POST /register`**: Registro de un nuevo usuario.
    *   **Body:** `{ "name": "Test User", "email": "test@example.com", "password": "Password123" }`
    *   **Respuesta Exitosa (201):** `{ "code": 201, "message": "Usuario registrado. Verifique su correo electrónico." }`
    *   **Notas:** Envía un correo de verificación. La contraseña debe tener al menos 8 caracteres, una letra y un número.

-   **`POST /verify-email`**: Verifica el correo electrónico de un usuario (actualmente activa la cuenta sin OTP).
    *   **Body:** `{ "email": "test@example.com" }`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "message": "Correo verificado correctamente." }`

-   **`POST /login`**: Inicia el proceso de login. Verifica credenciales y envía OTP por correo.
    *   **Body:** `{ "email": "test@example.com", "password": "Password123" }`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "message": "Código de verificación enviado a su correo electrónico" }`
    *   **Notas:** El usuario debe haber verificado su correo previamente.

-   **`POST /verify-login`**: Verifica el OTP enviado para completar el login y obtener el JWT.
    *   **Body:** `{ "email": "test@example.com", "otp": "123456" }`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "message": "Autenticación exitosa", "token": "jwt_token_aqui" }`

-   **`POST /password-reset`**: Solicita un reseteo de contraseña. Envía un link con token por correo.
    *   **Body:** `{ "email": "test@example.com" }`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "message": "Correo de restablecimiento enviado." }`

-   **`POST /password-reset/confirm`**: Confirma el reseteo de contraseña usando el token y una nueva contraseña.
    *   **Body:** `{ "token": "reset_token_aqui", "newPassword": "NewPassword456" }`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "message": "Contraseña restablecida con éxito." }`

-   **`POST /logout`**: Cierra la sesión del usuario (invalida el JWT actual).
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "message": "Usuario desconectado correctamente", "logoutAt": "timestamp" }`

-   **`GET /user-info`**: Obtiene información del usuario autenticado.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "user": { "id": "uuid", "name": "Test User", "email": "test@example.com" } }`

### Gestión de API Keys (`/apikeys`)
*Requiere autenticación.*

-   **`POST /`**: Crea una nueva API key para el usuario autenticado.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Body (opcional):** `{ "description": "Mi clave para integración X", "expiresAt": "2024-12-31T23:59:59.000Z" }`
    *   **Respuesta Exitosa (201):** `{ "code": 201, "message": "API Key generada exitosamente.", "apiKey": { ...apiKeyObject } }`

-   **`GET /`**: Lista las API keys del usuario autenticado (con paginación).
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Query Params (opcional):** `page=1`, `limit=5`
    *   **Respuesta Exitosa (200):** `{ "total": 1, "totalPages": 1, "page": 1, "limit": 5, "apiKeys": [{ ...apiKeyObject }] }`

-   **`DELETE /:id`**: Revoca (soft delete) una API key específica del usuario.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Path Param:** `id` (ID de la API key)
    *   **Respuesta Exitosa (200):** `{ "code": 200, "message": "API Key revocada correctamente." }`

### Definición de Servicios (`/services`)
*Endpoints con rate limiting (20 reqs/minuto).*

-   **`POST /`**: Crea un nuevo tipo de servicio.
    *   **Body:** `{ "name": "Pintura Profesional", "description": "Servicio de pintura para interiores y exteriores.", "tasks": ["Preparación de superficie", "Aplicación de pintura base", "Acabado final"] }`
    *   **Respuesta Exitosa (201):** `{ ...serviceObject }`

-   **`GET /`**: Lista todos los tipos de servicios.
    *   **Respuesta Exitosa (200):** `[{ ...serviceObject1 }, { ...serviceObject2 }]`

-   **`GET /paginated`**: Lista los tipos de servicios con paginación.
    *   **Query Params (opcional):** `page=1`, `limit=5`
    *   **Respuesta Exitosa (200):** `{ "total": 10, "page": 1, "totalPages": 2, "data": [{ ...serviceObject }] }`

-   **`GET /:slug`**: Obtiene detalles de un servicio por su slug.
    *   **Path Param:** `slug` (e.g., "pintura-profesional")
    *   **Respuesta Exitosa (200):** `{ ...serviceObject }`

-   **`PUT /:slug`**: Actualiza un servicio existente.
    *   **Path Param:** `slug`
    *   **Body (campos a actualizar):** `{ "name": "Nuevo Nombre", "description": "Nueva desc." }`
    *   **Respuesta Exitosa (200):** `{ ...updatedServiceObject }`

-   **`DELETE /:slug`**: Elimina un servicio (soft delete si el modelo está configurado).
    *   **Path Param:** `slug`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "message": "Servicio eliminado correctamente." }`

### Gestión de Ofertas (`/offers`)

-   **`GET /offers`**: Lista todas las ofertas activas (público).
    *   **Respuesta Exitosa (200):** `{ "offer_total": 5, "offers": [{ ...offerObject }] }`
    *   *Nota: Ruta completa es `/api/offers/offers` debido a la configuración de rutas.*

-   **`POST /offers`**: Crea una nueva oferta (solo administradores).
    *   **Headers:** `Authorization: Bearer jwt_admin_token_aqui`
    *   **Body:** `{ "title": "Descuento Verano", "description": "20% off en servicios de jardinería", "discount": 20, "valid_until": "2024-09-30" }`
    *   **Respuesta Exitosa (201):** `{ ...newOfferObject }`
    *   *Nota: Ruta completa es `/api/offers/offers`.*

-   **`PUT /offers/:id`**: Actualiza una oferta existente (solo administradores).
    *   **Headers:** `Authorization: Bearer jwt_admin_token_aqui`
    *   **Path Param:** `id` (ID de la oferta)
    *   **Body (campos a actualizar):** `{ "discount": 25 }`
    *   **Respuesta Exitosa (200):** `{ ...updatedOfferObject }`
    *   *Nota: Ruta completa es `/api/offers/offers/:id`.*

-   **`DELETE /offers/:id`**: Elimina una oferta (solo administradores).
    *   **Headers:** `Authorization: Bearer jwt_admin_token_aqui`
    *   **Path Param:** `id` (ID de la oferta)
    *   **Respuesta Exitosa (200):** `{ "message": "Oferta eliminada correctamente" }`
    *   *Nota: Ruta completa es `/api/offers/offers/:id`.*

### Solicitudes de Servicio (`/service-requests`)
*Requiere autenticación.*

-   **`POST /service-request`**: Crea una nueva solicitud de servicio.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Body:** (Objeto JSON complejo, ver `ServiceRequest` model y `serviceRequestController` para detalles. Incluye `campaign`, `steps`, `client_data`, `category_type`, `service`, `terms_and_conditions: true`, `third_party_consent: true`, `date`)
    *   **Respuesta Exitosa (201):** `{ ...newServiceRequestObject }`
    *   *Nota: Ruta completa es `/api/service-requests/service-request`.*

-   **`GET /service-request`**: Lista solicitudes de servicio con `status: 'Completed'` y `step_pending: null`.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "serviceRequest_total": 3, "serviceRequests": [{ ...srObject }] }`
    *   *Nota: Ruta completa es `/api/service-requests/service-request`. Este endpoint actualmente no filtra por usuario, lo cual podría ser necesario.*

### Billetera Digital (`/wallet`)
*Requiere autenticación.*

-   **`POST /`**: Crea una billetera para el usuario autenticado (rol 'USER').
    *   **Headers:** `Authorization: Bearer jwt_user_token_aqui`
    *   **Respuesta Exitosa (201):** `{ ...walletObject }`

-   **`GET /`**: Lista todas las billeteras (solo administradores).
    *   **Headers:** `Authorization: Bearer jwt_admin_token_aqui`
    *   **Respuesta Exitosa (200):** `[{ ...walletObject1 }, { ...walletObject2 }]`

-   **`POST /add-funds`**: Agrega fondos a la billetera del usuario.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Body:** `{ "amount": 50.00 }` (la moneda se infiere de la wallet o `WalletBalance`)
    *   **Respuesta Exitosa (200):** `{ "message": "Fondos agregados exitosamente", "new_balance": 150.00, "transaction": { ...walletTransactionObject } }`

-   **`GET /balance`**: Consulta el saldo de la billetera del usuario.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Respuesta Exitosa (200):** `{ "balance": 150.00, "currency": "CLP", "is_blocked": false, ... }`

-   **`GET /transactions`**: Lista las transacciones de la billetera del usuario.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Respuesta Exitosa (200):** `{ "code": 200, "wallet_transaction_total": 5, "transactions": [{ ...formattedTxObject }] }`

### Suscripciones (`/subscriptions`)
*Requiere autenticación.*

-   **`POST /create`**: Crea una nueva suscripción para el usuario.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Body:** `{ "planType": "Plan Anual", "price": 99.99, "currency": "USD", "startDate": "2023-01-01", "endDate": "2024-01-01" }`
    *   **Respuesta Exitosa (201):** `{ "code": 201, "message": "Suscripción creada exitosamente", "subscription": { ...subscriptionObject } }`
    *   **Notas:** Requiere que el usuario tenga una wallet. Descuenta el precio del balance de la wallet.

-   **`POST /cancel`**: Cancela una suscripción existente del usuario.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Body:** `{ "subscriptionId": "uuid_de_la_suscripcion" }`
    *   **Respuesta Exitosa (200):** `{ "message": "Suscripción cancelada exitosamente" }`

-   **`POST /annul`**: Anula una suscripción activa y devuelve el monto a la wallet del usuario.
    *   **Headers:** `Authorization: Bearer jwt_token_aqui`
    *   **Body:** `{ "subscriptionId": "uuid_de_la_suscripcion" }`
    *   **Respuesta Exitosa (200):** `{ "message": "Suscripción anulada y monto devuelto a la wallet" }`

---
## Estructura del Proyecto (Resumida)

```
.
├── config/                 # Configuración (DB, etc.)
├── models/                 # Definiciones de modelos Sequelize (User, Service, Wallet, etc.)
├── seeders/                # Seeders para poblar la DB
├── src/
│   ├── app.js              # Archivo principal de la aplicación Express (setup y rutas)
│   ├── certs/              # (Opcional) Certificados SSL/mTLS
│   ├── config/             # Configuración específica de la app (mailer.js, db.js)
│   ├── controllers/        # Lógica de negocio para cada ruta/módulo
│   ├── middlewares/        # Middlewares (auth, admin, apiKey, validators)
│   ├── models/             # (Duplicado, debería ser solo un `models/` en la raíz o en `src/`)
│   ├── routes/             # Definición de rutas Express para cada módulo
│   └── utils/              # Utilidades (logger, slugUtils, tokenBlacklist)
├── .env-sample             # Plantilla para variables de entorno
├── .gitignore              # Archivos ignorados por Git
├── index.js                # Punto de entrada que usualmente solo llama a src/app.js
├── package.json            # Dependencias y scripts del proyecto
└── README.md               # Este archivo
```
*Nota: El listado original mostraba `models/` tanto en raíz como en `src/`. Se asume que la ubicación principal es `src/models/` o la raíz, pero no ambas.*

---

## Key Considerations / Best Practices

*   **Atomic Transactions:** Para operaciones complejas que modifican múltiples tablas (especialmente en los módulos de Wallet y Suscripciones), usar `sequelize.transaction()` es crucial para garantizar la atomicidad y consistencia de los datos.
*   **Validación:** Continuar aplicando validaciones robustas tanto a nivel de controlador como de modelo para asegurar la integridad de los datos. Considerar el uso más extensivo de `express-validator` para los cuerpos de las solicitudes.
*   **Manejo de Errores:** Estandarizar las respuestas de error. Aunque se usan códigos de estado HTTP correctos, el cuerpo del error podría ser más uniforme.
*   **Seguridad:**
    *   Revisar la autorización en el módulo de `Services` si se requiere que solo administradores los gestionen.
    *   La fortaleza de la contraseña se valida en el controlador; asegurar que el modelo `User` tenga una validación compatible o que la del controlador sea la única fuente.
    *   Externalizar las credenciales del `mailer.js` a variables de entorno.
*   **Pruebas:** El proyecto actualmente no especifica tests (`"test": "echo \"Error: no test specified\" && exit 1"` en `package.json`). Implementar pruebas unitarias, de integración y E2E es fundamental para la robustez y mantenibilidad.
*   **Consistencia en Rutas:** Algunos módulos tienen rutas un poco redundantes (e.g., `/api/offers/offers`). Considerar simplificar a `/api/offers`.
*   **Documentación de Modelos:** Añadir comentarios JSDoc a los modelos Sequelize para explicar cada campo y sus relaciones puede ser muy útil.
*   **Filtrado de Listas:** Asegurar que los endpoints que listan recursos (e.g., `GET /api/service-requests/service-request`) filtren adecuadamente por el usuario autenticado cuando no son para administradores.

---

## Contribuciones (Tips)

1.  Haz un **fork** del repositorio.
2.  Crea una **rama** para tu feature/fix (`git checkout -b feature/nombre-feature` o `fix/nombre-bug`).
3.  Haz **commit** de tus cambios con mensajes descriptivos y claros.
4.  **Push** a tu rama en GitHub (`git push origin feature/nombre-feature`).
5.  Crea un **Pull Request** al repositorio principal para revisión.

---

## Autor

Desarrollado por: **Mauricio Durán T.**

*(Información adicional del `package.json` y `README` original: Mauricio Durán Torres - CTO : mauricio@integraltech.cl / Líder TI – Integraltech Chile)*

Si tienes dudas o sugerencias, no dudes en contactar o abrir un issue en el repositorio.

---

## Licencia

Proyecto cerrado para uso interno de la organización. En temas de licenciamiento este proyecto está con "Licencia MIT", ante dudas y soporte contactar al equipo de soporte de **Integraltech Chile** (mauricio@integraltech.cl).
```
