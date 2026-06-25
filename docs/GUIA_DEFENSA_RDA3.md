# Guía breve de defensa — RDA 3

## Arquitectura cliente-servidor

El navegador ejecuta React y solicita recursos mediante HTTP. Express recibe esas solicitudes, aplica reglas de seguridad, consulta SQL Server con Prisma y devuelve JSON. Esta separación permite que interfaz, API y datos evolucionen sin mezclar responsabilidades.

## MVC en frontend

- **Modelo:** `src/modelo` centraliza API, sesión, carrito y validaciones.
- **Vista:** `src/vista` contiene componentes React y estilos para mostrar información al usuario.
- **Controlador:** `src/controlador/useMediFastController.js` coordina eventos, estados visuales, autorización y llamadas al modelo.

## MVC en backend

- **Modelo:** operaciones Prisma en `server/modelo/js`.
- **Vista:** respuestas JSON homogéneas en `server/vista`.
- **Controlador:** controllers, routes y middleware en `server/controlador` coordinan casos de uso y reglas HTTP.

## API REST

Una API REST expone recursos mediante URL y métodos HTTP. Por ejemplo: `GET /api/productos` consulta productos, `POST /api/pedidos` crea un pedido y `PUT /api/usuarios/:id/rol` cambia un rol. Las respuestas usan JSON y códigos como 200, 201, 400, 401 y 403.

## JWT, autenticación y autorización

JWT es un token firmado que el backend entrega tras un login correcto. React lo guarda en `localStorage` para que pueda comprobarse en DevTools y lo manda como `Authorization: Bearer ...` en rutas privadas.

- **Autenticación:** prueba quién es la persona; ocurre al validar usuario y contraseña.
- **Autorización:** decide qué puede hacer esa persona; `requireRole("admin")` protege operaciones administrativas.
- **Roles:** `admin` administra productos, usuarios y todos los pedidos; `user` compra y consulta sus propios pedidos.

## Riesgos OWASP mitigados

| Riesgo | Mitigación aplicada |
| --- | --- |
| Broken Access Control | JWT, middleware de autenticación, roles y controles visuales de React. |
| Authentication Failures | bcrypt, expiración JWT, mensajes controlados y rate limit para login/registro. |
| Injection | Prisma, express-validator y sanitización XSS. |
| Security Misconfiguration | Helmet, CORS configurable, `.env.example`, `.gitignore` y errores sin stack en producción. |
| Cryptographic Failures | Secretos en variables de entorno y solo últimos cuatro dígitos de tarjeta persistidos. |

## Checkout, stock e inventario

El frontend impide superar el stock mostrado y el backend lo vuelve a verificar dentro de una transacción. Al confirmar un pedido se crean detalles, pago y movimiento `SALIDA_VENTA`, y se reduce `stockActual`. Si el stock cambió mientras el usuario compraba, el backend responde 400 y protege la integridad de datos.

## Pruebas realizadas

- Backend: 11 pruebas para login, credenciales inválidas, 401, 403, acceso admin, validación de producto, stock insuficiente, tarjeta y transacción de pedido/pago/inventario.
- Frontend: 7 pruebas para total de carrito, límite de stock, cédula, tarjeta, vencimiento, CVV y sesión local.
- Calidad: ESLint en ambos proyectos y build de producción React.

## Evidencia que se debe mostrar

1. Prisma Studio: relaciones y pedido/pago/movimiento.
2. Interfaz: login admin y user, token en Local Storage y panel condicionado por rol.
3. Network: encabezado Bearer y respuestas 401/403/200.
4. Checkout: tarjeta, transferencia, éxito y error de stock.
5. Terminal: pruebas, lint y build.

## Aprendizajes del reto

El proyecto demuestra que una tienda no se resuelve solo con pantallas: requiere contratos claros entre cliente y servidor, validación en ambas capas, seguridad por defecto, transacciones para inventario y evidencia automatizada de que las reglas críticas siguen funcionando.
