# Checklist de evidencias — RDA 3

Tome capturas con fecha visible cuando sea posible. Oculte contraseñas, cadenas JWT completas, datos personales y cualquier cadena de conexión.

## Base de datos y Prisma

- [ ] Prisma Studio mostrando las tablas principales.
- [ ] Tabla `Rol` y tabla `Usuario` con la relación `rolId`.
- [ ] Producto con `stockActual`, `stockMinimo`, `precioVenta` y estado activo.
- [ ] Pedido creado con sus `PedidoDetalle`, `Pago` y `MovimientoInventario`.

## Autenticación y autorización

- [ ] Login exitoso como `admin`.
- [ ] Login exitoso como `user`.
- [ ] DevTools > Application > Local Storage: presencia de `mf_token` y `mf_user` (oculte el valor completo del token).
- [ ] DevTools > Network: solicitud privada con encabezado `Authorization: Bearer …` (oculte el token completo).
- [ ] Solicitud sin token que responde 401.
- [ ] Solicitud de user hacia ruta admin que responde 403.
- [ ] Solicitud de admin hacia ruta admin que responde 200 o 201.

## Interfaz React

- [ ] Panel de administración visible con admin.
- [ ] Usuario normal sin acceso ni botón de administración.
- [ ] Producto etiquetado como “Stock bajo”.
- [ ] Producto etiquetado como “Sin stock” y botón Agregar deshabilitado.
- [ ] Carrito con imagen, cantidades, subtotales y total.
- [ ] Mensaje al intentar superar el stock disponible.

## Checkout e inventario

- [ ] Checkout válido con tarjeta; no mostrar ni capturar número completo después de enviar.
- [ ] Checkout válido con transferencia y comprobante/referencia.
- [ ] Mensaje “Pedido registrado correctamente”.
- [ ] Pedido, pago y movimiento `SALIDA_VENTA` visibles en Prisma Studio.
- [ ] Error claro de stock insuficiente.

## Calidad

- [ ] Terminal backend: `npm test` con 11 pruebas correctas.
- [ ] Terminal backend: `npm run lint` sin errores.
- [ ] Terminal frontend: `npm test` con 7 pruebas correctas.
- [ ] Terminal frontend: `npm run lint` sin errores.
- [ ] Terminal frontend: `npm run build` exitoso.
