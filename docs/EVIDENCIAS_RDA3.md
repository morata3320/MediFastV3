# Checklist de evidencias — RDA 3

Tome capturas con fecha visible cuando sea posible. Oculte contraseñas, JWT completos, cadenas de conexión y datos personales. Esta lista no inventa capturas; sirve como guía para completar la carpeta de evidencias.

## Repositorio y despliegue

- [x] `github_repo.png` — repositorio con `server/`, `frontend-react/`, `docs/`, `README.md`, `.gitignore`.
- [x] `render_backend_live.png` — backend Render activo en `https://medifastv3.onrender.com`.
- [x] `vercel_frontend_live.png` — frontend Vercel activo en `https://medi-fast-v3.vercel.app`.
- [x] `api_productos_render.png` — respuesta JSON de `https://medifastv3.onrender.com/api/productos`.
- [ ] `google_cloud_sql.png` — instancia/base Google Cloud SQL Server activa.

## Base de datos y Prisma

- [ ] `prisma_studio_tablas.png` — Prisma Studio mostrando las tablas principales.
- [ ] `rol_usuario_prisma.png` — tablas `Rol` y `Usuario` con relación `rolId`.
- [ ] `producto_stock_prisma.png` — producto con `stockActual`, `stockMinimo`, `precioVenta` y activo.
- [ ] `pedido_pago_movimiento_prisma.png` — pedido con `PedidoDetalle`, `Pago` y `MovimientoInventario`.

## Autenticación, roles y rutas protegidas

- [x] `rutas_admin_sin_login.png` — `/admin` sin login redirige a `/login`.
- [x] `rutas_user_no_autorizado.png` — usuario `user` entra a `/admin` y llega a `/no-autorizado`.
- [x] `rutas_admin_autorizado.png` — usuario `admin` ve el panel admin.
- [ ] `login_admin.png` — login exitoso como `admin`.
- [ ] `login_user.png` — login exitoso como `user`.
- [ ] `token_localstorage.png` — `mf_token` y `mf_user` en Local Storage con token oculto parcialmente.
- [ ] `network_authorization_bearer.png` — request privado con `Authorization: Bearer ...` ocultando el token.
- [ ] `api_401_sin_token.png` — ruta protegida sin token responde 401.
- [ ] `api_403_user_admin.png` — user en ruta admin responde 403.
- [ ] `api_200_admin.png` — admin en ruta admin responde 200/201.

## Interfaz React

- [ ] `panel_admin.png` — panel de administración visible con admin.
- [ ] `producto_stock_bajo.png` — producto con etiqueta “Stock bajo”.
- [ ] `producto_sin_stock.png` — producto con “Sin stock” y botón deshabilitado.
- [ ] `carrito_totales.png` — carrito con imagen, cantidades, subtotales y total.
- [ ] `categoria_select_laboratorio_datalist.png` — formulario admin con categoría como select y laboratorio con sugerencias.

## Checkout e inventario

- [ ] `checkout_exitoso.png` — checkout correcto con mensaje de pedido registrado.
- [ ] `checkout_tarjeta_mask.png` — tarjeta con máscara visual, sin capturar número completo tras enviar.
- [ ] `checkout_transferencia.png` — transferencia con comprobante/referencia.
- [ ] `stock_insuficiente.png` — error claro de stock insuficiente.

## Calidad

- [x] `backend_tests.png` — backend `npm test` correcto.
- [x] `backend_lint.png` — backend `npm run lint` sin errores.
- [x] `frontend_tests.png` — frontend `npm test` correcto.
- [x] `frontend_lint.png` — frontend `npm run lint` sin errores.
- [x] `frontend_build.png` — frontend `npm run build` exitoso.
