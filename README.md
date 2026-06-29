# MediFastV3 — RDA 3

MediFastV3 es una farmacia online construida como aplicación cliente-servidor. El frontend final es React + Vite y consume una API REST en Node.js/Express. La solución incluye autenticación JWT, roles, catálogo, carrito, checkout, pagos, control de stock e inventario.

- Frontend final: `frontend-react/`.
- Backend: `server/`.
- Frontend desplegado: [https://medi-fast-v3.vercel.app](https://medi-fast-v3.vercel.app/).
- Backend desplegado: [https://medifastv3.onrender.com](https://medifastv3.onrender.com/).
- API productos: [https://medifastv3.onrender.com/api/productos](https://medifastv3.onrender.com/api/productos).
- Base de datos: Google Cloud SQL Server.

## Tecnologías

- Frontend: React 19, Vite, CSS propio, ESLint y Vitest.
- Backend: Node.js, Express, Prisma ORM, Jest, Supertest y ESLint.
- Base de datos: Google Cloud SQL Server en producción y SQL Server local para desarrollo.
- Seguridad: JWT, bcrypt, Helmet, CORS restringido, rate limiting, express-validator y sanitización XSS.

## Arquitectura MVC

### Frontend React

`frontend-react/src/` conserva separación MVC:

- `modelo/`: API centralizada, sesión, carrito y validaciones de checkout.
- `vista/`: componentes visuales de catálogo, carrito, autenticación, checkout y administración.
- `controlador/`: hook `useMediFastController`, que coordina estado, reglas de negocio de interfaz y llamadas al modelo.

### Rutas protegidas en React

El frontend usa React Router para navegación y protección visual:

- `/`: catálogo público.
- `/login`: login y registro.
- `/checkout`: requiere sesión.
- `/mis-pedidos`: requiere sesión.
- `/admin`: requiere rol `admin`.
- `/no-autorizado`: respuesta para usuarios autenticados sin permisos.

Esta protección mejora la experiencia y evita accesos accidentales desde la interfaz. La seguridad real permanece en el backend, donde cada ruta privada valida JWT y rol.

### Backend

`server/` implementa MVC:

- `modelo/js/`: acceso a Prisma y operaciones de usuarios, productos y pedidos.
- `vista/`: formato consistente de respuestas HTTP.
- `controlador/controllers/`: casos de uso de autenticación, productos, pedidos, usuarios y roles.
- `controlador/routes/` y `middleware/`: rutas, autorización, validación, seguridad y errores.

## Base de datos

SQL Server se accede exclusivamente mediante Prisma. El modelo incluye `Rol`, `Usuario`, `Cliente`, `DireccionCliente`, `Categoria`, `UnidadMedida`, `Producto`, `TipoMovimientoInventario`, `MovimientoInventario`, `Proveedor`, `Compra`, `CompraDetalle`, `EstadoPedido`, `MetodoPago`, `Pedido`, `PedidoDetalle` y `Pago`.

`Usuario` se relaciona con `Rol` mediante `rolId`. No se usan enums Prisma para mantener compatibilidad con SQL Server. La API conserva los aliases `precio`/`stock` además de `precioVenta`/`stockActual` para no romper el frontend.

## Funcionalidades

- Registro, login, JWT y roles `admin` / `user`.
- CRUD de productos protegido para administradores.
- Catálogo con búsqueda, categorías, oferta, receta, stock bajo y sin stock.
- Carrito persistente en `localStorage`, respetando la cantidad disponible.
- Checkout con cliente, dirección y pagos por efectivo, tarjeta o transferencia.
- La tarjeta no se persiste: el backend guarda únicamente `tarjetaUltimos4`.
- Pedido transaccional: crea detalles, valida y descuenta stock, crea pago y registra `SALIDA_VENTA` en inventario.

## Seguridad y OWASP

- **Broken Access Control:** middleware JWT, `requireRole`, rutas protegidas en React y respuestas 401/403 para rutas privadas y administrativas.
- **Identification and Authentication Failures:** contraseñas con bcrypt, JWT con expiración, cierre de sesión ante 401 y límite de intentos en login/registro.
- **Injection:** Prisma parametriza consultas; `express-validator` y sanitización XSS validan entradas.
- **Security Misconfiguration:** Helmet, CORS por `CORS_ORIGIN`, manejo de errores sin stack en producción, `.env` ignorado por Git.
- **Cryptographic Failures:** secretos en variables de entorno y ninguna tarjeta completa almacenada.
- **Security Logging and Monitoring Failures:** logger básico de solicitudes y errores controlados sin exponer secretos al cliente.

## Instalación local

### 1. Base de datos y backend

Copie `server/.env.example` como `server/.env` y reemplace los marcadores de SQL Server y JWT. No suba este archivo al repositorio.
El archivo `.env` real no se sube al repositorio. `server/.env.example` es solo una referencia segura sin credenciales reales.

```powershell
cd C:\Users\NW\Desktop\MediFastV3\server
npm install
npm run prisma:generate
npx prisma migrate deploy --schema=modelo/prisma/schema.prisma
npm run seed
npm run lint
npm test
npm run dev
```

La API queda disponible en `http://localhost:3000` y Prisma Studio se abre con:

```powershell
npm run prisma:studio
```

### 2. Frontend React

En otra terminal:

```powershell
cd C:\Users\NW\Desktop\MediFastV3\frontend-react
npm install
npm run lint
npm test
npm run build
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

Opcionalmente cree `frontend-react/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Variables de entorno

Consulte [server/.env.example](server/.env.example). Las variables requeridas son:

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto de Express. |
| `NODE_ENV` | Entorno (`development`, `test` o `production`). |
| `CORS_ORIGIN` | Origen permitido para React. |
| `DATABASE_URL` | Conexión de Prisma a SQL Server. |
| `JWT_SECRET` | Secreto de firma JWT; debe cambiarse en producción. |
| `JWT_EXPIRES_IN` | Vigencia del token. |

En producción, Render debe recibir estas variables desde su panel de entorno. Vercel debe configurar `VITE_API_URL=https://medifastv3.onrender.com`.

## Usuarios de prueba

Solo para desarrollo y demostración tras ejecutar el seed:

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `Admin123!` |
| Cliente | `user` | `User123!` |

No use estas credenciales en producción.

## Endpoints principales

| Método | Endpoint | Acceso |
| --- | --- | --- |
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/productos` | Público |
| GET | `/api/productos/:id` | Público |
| POST / PUT / DELETE | `/api/productos` | Admin |
| POST | `/api/pedidos` | Usuario autenticado |
| GET | `/api/pedidos/mis-pedidos` | Usuario autenticado |
| GET | `/api/pedidos` | Admin |
| GET | `/api/usuarios` | Admin |
| PUT | `/api/usuarios/:id/rol` | Admin |
| GET | `/api/roles` | Admin |

## Pruebas y calidad

- Backend: 11 pruebas Jest/Supertest para login, autorización, validación, stock, pedido, pago e inventario.
- Frontend: pruebas Vitest para carrito, validaciones de checkout, máscaras, sesión en `localStorage` y manejo de 401/403/red.
- Verificación realizada: lint backend y frontend sin errores; build React exitoso.

## Estructura final recomendada

```text
MediFastV3/
├── server/              # API Express, Prisma y pruebas backend
├── frontend-react/      # Frontend final React + Vite
├── docs/                # Evidencias y guía de defensa
├── README.md
├── .gitignore
└── server/.env.example
```

La carpeta histórica `frontend/` fue retirada de la entrega. El frontend final es `frontend-react/`.

## Despliegue

- Frontend: Vercel con `VITE_API_URL=https://medifastv3.onrender.com`.
- Backend: Render con `NODE_ENV=production`, `CORS_ORIGIN=https://medi-fast-v3.vercel.app`, `DATABASE_URL`, `JWT_SECRET` y `JWT_EXPIRES_IN`.
- Base de datos: Google Cloud SQL Server accesible para Render mediante la cadena segura de `DATABASE_URL`.

## Evidencias y defensa

Consulte [EVIDENCIAS_RDA3.md](docs/EVIDENCIAS_RDA3.md) para las capturas y [GUIA_DEFENSA_RDA3.md](docs/GUIA_DEFENSA_RDA3.md) para la explicación técnica.
