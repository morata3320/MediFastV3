# MediFastV3 – Farmacia Online

## Descripción general

MediFastV3 es una plataforma web tipo farmacia online. Permite consultar un catálogo de productos médicos, buscar y filtrar productos, gestionar un carrito de compras, realizar checkout, registrar pedidos y administrar productos, usuarios, roles y estados de pedido desde un panel protegido.

El sistema incluye autenticación con JWT, roles `admin` y `user`, rutas protegidas, validaciones de formularios, control de stock, pagos por efectivo/tarjeta/transferencia y despliegue en la nube.

Repositorio GitHub: [https://github.com/morata3320/MediFastV3](https://github.com/morata3320/MediFastV3)

## Arquitectura

El proyecto usa arquitectura cliente-servidor:

- El frontend React se ejecuta en el navegador y consume la API mediante HTTP.
- El backend Express expone endpoints REST, valida seguridad y aplica reglas de negocio.
- La base SQL Server en Google Cloud SQL almacena usuarios, productos, pedidos, pagos e inventario.
- Prisma ORM conecta el backend con SQL Server.

### MVC en frontend

El frontend final está en `frontend-react/` y mantiene una separación MVC visible:

- `frontend-react/src/modelo`: API, sesión, carrito y validaciones.
- `frontend-react/src/controlador`: estado, hooks, navegación y rutas protegidas.
- `frontend-react/src/vista`: componentes visuales, pantallas, formularios y panel admin.

### MVC en backend

El backend está en `server/` y mantiene estructura MVC:

- `server/modelo`: Prisma, modelos y acceso a datos.
- `server/vista`: respuestas JSON homogéneas.
- `server/controlador`: servidor, controladores, rutas y middleware.
- `server/controlador/routes`: definición de rutas REST.
- `server/controlador/controllers`: casos de uso HTTP.
- `server/controlador/middleware`: autenticación, autorización, CORS, validadores, rate limit y errores.

## Tecnologías

### Frontend

- React
- Vite
- React Router
- Fetch API
- CSS responsive
- Vitest
- ESLint

### Backend

- Node.js
- Express
- Prisma ORM
- SQL Server
- JWT
- Helmet
- CORS
- Jest
- Supertest
- ESLint

### Base de datos

- Google Cloud SQL Server
- SQL Server local para desarrollo

### Despliegue

- Vercel para frontend
- Render para backend
- Google Cloud SQL para base de datos

## URLs de producción

- Frontend: [https://medi-fast-v3.vercel.app](https://medi-fast-v3.vercel.app)
- Backend: [https://medifastv3.onrender.com](https://medifastv3.onrender.com)
- API productos: [https://medifastv3.onrender.com/api/productos](https://medifastv3.onrender.com/api/productos)

## Funcionalidades principales

- Catálogo de productos.
- Búsqueda y filtros.
- Carrito de compras.
- Checkout.
- Métodos de pago: efectivo, tarjeta y transferencia.
- Pedidos.
- Cambio de estado del pedido.
- CRUD de productos.
- Gestión de usuarios y roles.
- Modo oscuro.
- Rutas protegidas.
- Validaciones de formularios.
- Mensajes de error y éxito.
- Stock bajo/sin stock.
- Movimiento de inventario por venta.

## Seguridad aplicada

- Autenticación con JWT.
- Roles `admin` y `user`.
- Rutas protegidas en frontend.
- Middleware de autenticación en backend.
- Autorización por rol en rutas administrativas.
- CORS restringido al dominio del frontend.
- Helmet activo para cabeceras de seguridad.
- Rate limit en login/registro.
- Hash de contraseñas con bcrypt.
- Validación y sanitización de entradas.
- Manejo de errores controlados.
- No exposición de errores internos de Prisma.
- No exposición de `passwordHash`.
- No se guarda número completo de tarjeta; solo últimos 4 dígitos cuando aplica.
- Variables sensibles fuera del repositorio mediante `.env`.

## OWASP aplicado

1. **Broken Access Control:** rutas protegidas, JWT requerido en rutas privadas y autorización por rol `admin/user`.
2. **Identification and Authentication Failures:** login con JWT, hash de contraseñas, expiración de token y rate limit en autenticación.
3. **Injection:** Prisma ORM, validaciones con `express-validator` y sanitización contra HTML/script.
4. **Security Misconfiguration:** Helmet, CORS restringido, `.env` ignorado, errores sin stack en producción.
5. **Cryptographic Failures:** contraseñas con hash, secretos en variables de entorno y tarjetas no almacenadas completas.
6. **Security Logging and Monitoring Failures:** logger de requests y registro de errores 4xx/5xx sin exponer tokens ni contraseñas.

## Rutas principales

### Frontend

- `/`
- `/login`
- `/checkout`
- `/admin`
- `/mis-pedidos`
- `/no-autorizado`

### Backend

- `GET /api/productos`
- `GET /api/productos/:id`
- `POST /api/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/pedidos`
- `POST /api/pedidos`
- `PATCH /api/pedidos/:id/estado`
- `GET /api/usuarios`
- `GET /api/roles`
- `GET /api/categorias`

## Roles de prueba

Credenciales de demostración para defensa y pruebas. No se muestran en la interfaz pública.

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Admin | `admin` | `Admin123!` |
| Usuario | `user` | `User123!` |

## Instalación local

### Backend

Crear `server/.env` tomando como referencia `server/.env.example`.

```bash
cd server
npm install
npm run prisma:generate
npm run seed
npm run dev
```

Comandos útiles de Prisma:

```bash
npx prisma validate --schema=modelo/prisma/schema.prisma
npx prisma migrate status --schema=modelo/prisma/schema.prisma
npx prisma studio --schema=modelo/prisma/schema.prisma
```

### Frontend

```bash
cd frontend-react
npm install
npm run dev
```

Para desarrollo local puede configurarse `frontend-react/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Variables de entorno

El archivo real `server/.env` no se sube al repositorio. Use `server/.env.example` como referencia segura.

Variables principales:

- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Ejemplo local y ejemplo de producción están documentados en [server/.env.example](server/.env.example).

## Pruebas

### Backend

```bash
cd server
npm test
npm run lint
```

Pruebas backend: Jest + Supertest para login, autorización, validaciones, checkout, stock, pagos y pedidos.

### Frontend

```bash
cd frontend-react
npm test
npm run lint
npm run build
```

Pruebas frontend: Vitest para carrito, validaciones, máscaras, sesión, errores 401/403/409 y manejo de red.

## Despliegue

### Frontend

Vercel:

- Root directory: `frontend-react`
- Variable recomendada: `VITE_API_URL=https://medifastv3.onrender.com`

### Backend

Render:

- Root directory: `server`
- Start command: `npm start`
- Variables necesarias:
  - `NODE_ENV=production`
  - `CORS_ORIGIN=https://medi-fast-v3.vercel.app`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`

### Base de datos

Google Cloud SQL Server:

- La base debe ser accesible desde Render.
- La cadena `DATABASE_URL` real se configura solo en variables de entorno.
- No se suben credenciales reales al repositorio.

## Evidencias sugeridas

- GitHub con commits.
- Vercel live.
- Render live.
- Google Cloud SQL.
- API productos.
- Login JWT.
- Rutas protegidas.
- `401` sin token.
- `403` con usuario sin permisos.
- `200` con admin.
- CRUD productos.
- Checkout.
- Tests backend/frontend.
- Lint backend/frontend.
- Build frontend.

Ver checklist en [docs/EVIDENCIAS_RDA3.md](docs/EVIDENCIAS_RDA3.md) y guía técnica en [docs/GUIA_DEFENSA_RDA3.md](docs/GUIA_DEFENSA_RDA3.md).

## Estructura final

```text
MediFastV3/
├─ server/
├─ frontend-react/
├─ docs/
├─ README.md
├─ .gitignore
└─ server/.env.example
```

## Estado final

MediFastV3 cumple con:

- Frontend React final en `frontend-react/`.
- Backend API REST en `server/`.
- Persistencia en Google Cloud SQL Server.
- Seguridad con JWT y roles.
- Rutas protegidas.
- Checkout con pagos y stock.
- Pruebas automatizadas.
- Lint y build.
- Despliegue en Vercel y Render.
- Documentación para entrega y defensa RDA3.
