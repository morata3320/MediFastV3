# MediFastV3 — RDA 3

MediFastV3 es una farmacia online construida como aplicación cliente-servidor. El frontend final es React + Vite y consume una API REST en Node.js/Express. La solución incluye autenticación JWT, roles, catálogo, carrito, checkout, pagos, control de stock e inventario.

## Tecnologías

- Frontend: React 19, Vite, CSS propio, ESLint y Vitest.
- Backend: Node.js, Express, Prisma ORM, Jest, Supertest y ESLint.
- Base de datos: SQL Server.
- Seguridad: JWT, bcrypt, Helmet, CORS restringido, rate limiting, express-validator y sanitización XSS.

## Arquitectura MVC

### Frontend React

`frontend-react/src/` conserva separación MVC:

- `modelo/`: API centralizada, sesión, carrito y validaciones de checkout.
- `vista/`: componentes visuales de catálogo, carrito, autenticación, checkout y administración.
- `controlador/`: hook `useMediFastController`, que coordina estado, reglas de negocio de interfaz y llamadas al modelo.

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

- **Broken Access Control:** middleware JWT y `requireRole` protegen rutas privadas y administrativas; el frontend también oculta acciones administrativas a usuarios comunes.
- **Authentication Failures:** contraseñas con bcrypt, JWT con expiración y límite de intentos en login/registro.
- **Injection:** Prisma parametriza consultas; `express-validator` y sanitización XSS validan entradas.
- **Security Misconfiguration:** Helmet, CORS por `CORS_ORIGIN`, manejo de errores sin stack en producción, `.env` ignorado por Git.
- **Cryptographic Failures:** secretos en variables de entorno y ninguna tarjeta completa almacenada.

## Instalación local

### 1. Base de datos y backend

Copie `server/.env.example` como `server/.env` y reemplace los marcadores de SQL Server y JWT. No suba este archivo al repositorio.

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
- Frontend: 7 pruebas Vitest para carrito, validaciones de checkout y sesión en `localStorage`.
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

`frontend/` se conserva como versión histórica. Para la entrega final utilice `frontend-react/` o renómbrelo a `frontend/` conservando su contenido React.

## Despliegue

- Frontend: Vercel o Netlify. Configure `VITE_API_URL` con la URL pública del backend.
- Backend: Render. Configure `NODE_ENV=production`, `CORS_ORIGIN`, `DATABASE_URL`, `JWT_SECRET` y `JWT_EXPIRES_IN`.
- Base de datos: SQL Server local no es accesible desde la nube. Para producción se requiere una instancia SQL Server accesible públicamente de forma segura o mediante red privada, y actualizar `DATABASE_URL`.

Mientras no exista esa base accesible, el despliegue soportado es local: backend en `localhost:3000`, frontend en `localhost:5173` y SQL Server local.

## Evidencias y defensa

Consulte [EVIDENCIAS_RDA3.md](docs/EVIDENCIAS_RDA3.md) para las capturas y [GUIA_DEFENSA_RDA3.md](docs/GUIA_DEFENSA_RDA3.md) para la explicación técnica.
