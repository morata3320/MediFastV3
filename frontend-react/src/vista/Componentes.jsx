import { useRef, useState } from "react";
import { formatExpiry, validateCheckout } from "../modelo/checkoutValidation.js";

function imgSrc(imagen) {
  if (!imagen) return "/assets/placeholder.svg";
  return imagen.startsWith("http") ? imagen : `/${imagen}`;
}
const stockOf = (producto) => Number(producto.stockActual ?? producto.stock ?? 0);
const priceOf = (producto) => Number(producto.precio ?? producto.precioVenta ?? 0);
const requiredProductFields = ["nombre", "categoria", "precio", "stock", "descripcion"];

function decimalValue(value) {
  if (typeof value === "number") return value;
  return Number(String(value ?? "").trim().replace(",", "."));
}

function productFieldInvalid(form, field) {
  const value = form[field];
  if (requiredProductFields.includes(field) && String(value ?? "").trim() === "") return true;
  if (field === "precio") return Number.isNaN(decimalValue(value)) || decimalValue(value) < 0;
  if (field === "stock") return !Number.isInteger(Number(value)) || Number(value) < 0;
  return false;
}

export function Header({ user, busqueda, setBusqueda, cart, setCartOpen, setAuthMode, logoutUser, cargarAdmin }) {
  const cantidad = cart.reduce((total, item) => total + item.cantidad, 0);
  const rol = user?.role || user?.rol;
  return <>
    <div className="topbar"><span>Atención en línea</span><span>Entregas en Ecuador</span></div>
    <header className="header">
      <div className="brand"><div className="logo">M</div><div><h1>MediFast</h1><p>Farmacia online</p></div></div>
      <form className="search" onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="buscar">Buscar producto</label><input id="buscar" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar producto" /><button type="submit">Buscar</button></form>
      <button className="btn-main" onClick={() => setCartOpen(true)}>Carrito ({cantidad})</button>
    </header>
    <nav className="authbar" aria-label="Sesión">{user ? <><span>Sesión: <strong>{user.username}</strong> ({rol})</span>{rol === "admin" && <button onClick={cargarAdmin}>Administración</button>}<button onClick={logoutUser}>Salir</button></> : <><button onClick={() => setAuthMode("login")}>Login</button><button onClick={() => setAuthMode("register")}>Registro</button></>}</nav>
  </>;
}

export function Catalogo({ productos, categorias, categoria, setCategoria, agregar, loading, error, recargar }) {
  return <main className="container"><section className="hero"><h2>Farmacia online para productos de salud</h2><p>Catálogo conectado a API REST, Prisma y SQL Server.</p></section><section aria-labelledby="catalogo-title"><h2 id="catalogo-title">Catálogo de productos</h2><div className="chips">{categorias.map((item) => <button key={item} className={item === categoria ? "active" : ""} onClick={() => setCategoria(item)}>{item}</button>)}</div>{loading && <p className="state-message">Cargando catálogo...</p>}{error && <div className="state-message state-error"><p>{error}</p><button onClick={recargar}>Reintentar</button></div>}{!loading && !error && productos.length === 0 && <p className="state-message">No se encontraron productos.</p>}{!loading && !error && <div className="grid">{productos.map((producto) => { const stock = stockOf(producto); return <article className="card" key={producto.id}>{producto.oferta && <span className="badge">Oferta</span>}{producto.requiereReceta && <span className="badge receta">Receta</span>}<img src={imgSrc(producto.imagen)} alt={producto.nombre} /><div className="card-body"><p className="lab">{producto.laboratorio}</p><h3>{producto.nombre}</h3><p>{producto.descripcion}</p><p className={`stock ${stock === 0 ? "out-of-stock" : ""}`}>Stock: {stock}</p>{stock === 0 ? <span className="stock-badge no-stock">Sin stock</span> : stock <= Number(producto.stockMinimo ?? 5) && <span className="stock-badge low-stock">Stock bajo</span>}<div className="price-row"><strong>${priceOf(producto).toFixed(2)}</strong><button disabled={stock === 0} onClick={() => agregar(producto)}>{stock === 0 ? "Sin stock" : "Agregar"}</button></div></div></article>; })}</div>}</section></main>;
}

export function CartDrawer({ open, setOpen, cart, totals, cambiarCantidad, quitar, iniciarCheckout }) {
  if (!open) return null;
  return <aside className="drawer" aria-label="Carrito"><div className="drawer-head"><h2>Carrito</h2><button onClick={() => setOpen(false)}>Cerrar</button></div>{cart.length === 0 ? <p className="state-message">Tu carrito está vacío.</p> : <>{cart.map((item) => <div className="cart-item" key={item.id}><img className="cart-thumb" src={imgSrc(item.imagen)} alt={item.nombre} /><div className="cart-info"><h3 className="cart-name">{item.nombre}</h3><p className="cart-price">${priceOf(item).toFixed(2)} × {item.cantidad}</p><p className="cart-subtotal">Subtotal: ${(priceOf(item) * item.cantidad).toFixed(2)}</p></div><div className="qty"><button onClick={() => cambiarCantidad(item.id, -1)}>-</button><span>{item.cantidad}</span><button disabled={item.cantidad >= stockOf(item)} title="Aumentar cantidad" onClick={() => cambiarCantidad(item.id, 1)}>+</button><button onClick={() => quitar(item.id)}>Quitar</button></div></div>)}<div className="totals"><p>Subtotal: ${totals.subtotal.toFixed(2)}</p><p>Envío: ${totals.envio.toFixed(2)}</p><h3>Total: ${totals.total.toFixed(2)}</h3></div><button className="btn-full" onClick={iniciarCheckout}>Finalizar compra</button></>}</aside>;
}

export function AuthModal({ mode, setAuthMode, loginUser, registerUser, submitting }) {
  const [form, setForm] = useState({ identifier: "", username: "", email: "", password: "" });
  if (!mode) return null;
  const isLogin = mode === "login";
  async function submit(event) { event.preventDefault(); if (isLogin) await loginUser(form.identifier, form.password); else await registerUser(form.username, form.email, form.password); }
  return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={() => setAuthMode(null)}>Cerrar</button><h2>{isLogin ? "Iniciar sesión" : "Crear cuenta"}</h2><form onSubmit={submit}>{isLogin ? <div className="field"><label>Usuario o correo</label><input required value={form.identifier} onChange={(event) => setForm({ ...form, identifier: event.target.value })} /></div> : <><div className="field"><label>Usuario</label><input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></div><div className="field"><label>Correo</label><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div></>}<div className="field"><label>Contraseña</label><input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div><button className="btn-full" disabled={submitting} type="submit">{submitting ? "Procesando..." : isLogin ? "Entrar" : "Registrarme"}</button></form><p className="hint">Admin: admin / Admin123! · Usuario: user / User123!</p></section></div>;
}

export function CheckoutModal({ open, setCheckoutOpen, totals, confirmarPedido, submitting }) {
  const initialForm = { nombres: "", apellidos: "", email: "", telefono: "", cedula: "", ciudad: "", direccion: "", referencia: "", metodo: "Efectivo", comprobante: "", tarjeta: "", vencimiento: "", cvv: "" };
  const [form, setForm] = useState(initialForm); const [errors, setErrors] = useState({});
  if (!open) return null;
  function update(field, value) { if (["telefono", "cedula", "tarjeta", "cvv"].includes(field)) value = value.replace(/\D/g, ""); if (field === "tarjeta") value = value.slice(0, 16); if (field === "cedula") value = value.slice(0, 10); if (field === "cvv") value = value.slice(0, 4); if (field === "vencimiento") value = formatExpiry(value); setForm({ ...form, [field]: value }); }
  async function submit(event) { event.preventDefault(); const nextErrors = validateCheckout(form); setErrors(nextErrors); if (Object.keys(nextErrors).length) return; const pedido = await confirmarPedido({ cliente: { nombres: form.nombres, apellidos: form.apellidos, cedula: form.cedula, telefono: form.telefono, email: form.email || undefined }, direccion: { ciudad: form.ciudad, direccion: form.direccion, referencia: form.referencia || undefined }, pago: { metodo: form.metodo, comprobante: form.comprobante || undefined, tarjeta: form.tarjeta || undefined, vencimiento: form.vencimiento || undefined, cvv: form.cvv || undefined } }); if (pedido) setForm(initialForm); }
  const fields = [["nombres", "Nombres *"], ["apellidos", "Apellidos"], ["email", "Correo"], ["telefono", "Teléfono *"], ["cedula", "Cédula *"], ["ciudad", "Ciudad *"], ["direccion", "Dirección *"], ["referencia", "Referencia de entrega"]];
  return <div className="modal-backdrop"><section className="modal modal-wide" role="dialog" aria-modal="true"><button className="modal-close" onClick={() => setCheckoutOpen(false)}>Cerrar</button><h2>Confirmar pedido</h2><p>Total a pagar: <strong>${totals.total.toFixed(2)}</strong></p><form onSubmit={submit} className="checkout-form"><h3>Datos de entrega</h3><div className="checkout-grid">{fields.map(([field, label]) => <div className="field" key={field}><label>{label}</label><input value={form[field]} inputMode={["telefono", "cedula"].includes(field) ? "numeric" : undefined} onChange={(event) => update(field, event.target.value)} aria-invalid={Boolean(errors[field])} />{errors[field] && <small className="field-error">{errors[field]}</small>}</div>)}</div><h3>Pago</h3><div className="field"><label>Método de pago *</label><select value={form.metodo} onChange={(event) => update("metodo", event.target.value)}><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option></select></div>{form.metodo === "Tarjeta" && <div className="checkout-grid">{[["tarjeta", "Número de tarjeta"], ["vencimiento", "Vencimiento"], ["cvv", "CVV"]].map(([field, label]) => <div className="field" key={field}><label>{label} *</label><input value={form[field]} inputMode="numeric" maxLength={field === "tarjeta" ? 16 : field === "vencimiento" ? 5 : 4} placeholder={field === "vencimiento" ? "MM/AA" : undefined} onChange={(event) => update(field, event.target.value)} aria-invalid={Boolean(errors[field])} />{errors[field] && <small className="field-error">{errors[field]}</small>}</div>)}</div>}{form.metodo === "Transferencia" && <div className="field"><label>Comprobante o referencia *</label><input value={form.comprobante} onChange={(event) => update("comprobante", event.target.value)} aria-invalid={Boolean(errors.comprobante)} />{errors.comprobante && <small className="field-error">{errors.comprobante}</small>}</div>}<button className="btn-full" type="submit" disabled={submitting}>{submitting ? "Registrando pedido..." : "Confirmar pedido"}</button></form></section></div>;
}

export function AdminPanel({ open, setAdminOpen, productos, pedidos, usuarios, roles, guardarProductoAdmin, eliminarProductoAdmin, cambiarRolUsuario, cambiarEstadoPedido }) {
  const empty = { nombre: "", categoria: "", precio: "", stock: "", descripcion: "", imagen: "assets/placeholder.svg", laboratorio: "", requiereReceta: false, oferta: false };
  const estadosPedido = ["Pendiente", "Pagado", "En preparación", "Enviado", "Entregado", "Cancelado"];
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(null);
  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  if (!open) return null;

  const invalidFields = requiredProductFields.filter((field) => productFieldInvalid(form, field));
  const canSave = invalidFields.length === 0;
  const isEditing = Boolean(form.id);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  function markTouched(field) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function showFieldError(field) {
    return productFieldInvalid(form, field) && (submitted || touched[field]);
  }

  function fieldMessage(field) {
    if (["precio", "stock"].includes(field) && String(form[field] ?? "").trim() !== "") {
      return field === "precio" ? "Ingrese un precio válido." : "Ingrese un stock entero válido.";
    }
    return "Campo obligatorio.";
  }

  function editar(producto) {
    const precio = producto.precio ?? producto.precioVenta ?? "";
    setForm({ id: producto.id, nombre: producto.nombre || "", categoria: producto.categoria?.nombre || producto.categoria || "", precio: String(precio).replace(",", "."), stock: String(producto.stock ?? producto.stockActual ?? ""), descripcion: producto.descripcion || "", imagen: producto.imagen || empty.imagen, laboratorio: producto.laboratorio || "", requiereReceta: Boolean(producto.requiereReceta), oferta: Boolean(producto.oferta) });
    setTouched({});
    setSubmitted(false);
    setHighlight(true);
    window.setTimeout(() => setHighlight(false), 1200);
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      firstInputRef.current?.focus();
    }, 0);
  }

  function cancelarEdicion() {
    setForm(empty);
    setTouched({});
    setSubmitted(false);
    firstInputRef.current?.focus();
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (!canSave) return;
    const precio = decimalValue(form.precio);
    const payload = { ...form, categoria: String(form.categoria).trim(), precio, precioVenta: precio, stock: Number(form.stock), stockActual: Number(form.stock) };
    const saved = await guardarProductoAdmin(payload);
    if (saved) {
      setForm(empty);
      setTouched({});
      setSubmitted(false);
    }
  }

  function eliminar(producto) {
    if (window.confirm("¿Está seguro de eliminar este producto? Esta acción no se puede deshacer.")) {
      eliminarProductoAdmin(producto.id);
    }
  }

  function clientePedido(pedido) {
    if (pedido.cliente) return `${pedido.cliente.nombres || ""} ${pedido.cliente.apellidos || ""}`.trim();
    return pedido.usuario?.username || "Cliente no especificado";
  }

  function direccionPedido(pedido) {
    if (!pedido.direccionCliente) return "No registrada";
    return [pedido.direccionCliente.direccion, pedido.direccionCliente.ciudad, pedido.direccionCliente.referencia].filter(Boolean).join(" · ");
  }

  function pagoPedido(pedido) {
    const pago = pedido.pagos?.[0];
    if (!pago) return "No registrado";
    const base = pago.metodoPago?.nombre || "Pago";
    return pago.comprobante ? `${base} · Ref: ${pago.comprobante}` : base;
  }

  return <section className="admin-panel"><div className="admin-head"><div><h2>Panel de administración</h2><p>Productos, pedidos y usuarios registrados.</p></div><button onClick={() => setAdminOpen(false)}>Cerrar panel</button></div><div className="admin-grid"><section ref={formRef} className={`admin-card product-form-card ${highlight ? "form-editing-highlight" : ""}`}><div className="form-title-row"><div><h3>{isEditing ? `Editar producto #${form.id}` : "Crear producto"}</h3>{isEditing && <p className="editing-state">Editando producto: {form.nombre}</p>}</div>{isEditing && <button type="button" onClick={cancelarEdicion}>Cancelar edición</button>}</div><form onSubmit={submit} noValidate>{[["nombre", "Nombre *"], ["categoria", "Categoría *"], ["precio", "Precio *"], ["stock", "Stock *"], ["descripcion", "Descripción *"], ["imagen", "Imagen"], ["laboratorio", "Laboratorio"]].map(([field, label], index) => { const hasError = showFieldError(field); return <div className="field" key={field}><label>{label}</label>{field === "descripcion" ? <textarea className={hasError ? "required-missing" : ""} value={form[field]} onBlur={() => markTouched(field)} onChange={(event) => updateField(field, event.target.value)} /> : <input ref={index === 0 ? firstInputRef : null} className={hasError ? "required-missing" : ""} type={field === "stock" ? "number" : "text"} inputMode={field === "precio" ? "decimal" : field === "stock" ? "numeric" : undefined} min={field === "stock" ? "0" : undefined} value={form[field]} onBlur={() => markTouched(field)} onChange={(event) => updateField(field, event.target.value)} />}{hasError && <small className="field-error">{fieldMessage(field)}</small>}</div>; })}<div className="checkbox-row"><label className="check"><input type="checkbox" checked={form.requiereReceta} onChange={(event) => updateField("requiereReceta", event.target.checked)} /><span>Requiere receta</span></label><label className="check"><input type="checkbox" checked={form.oferta} onChange={(event) => updateField("oferta", event.target.checked)} /><span>Oferta</span></label></div>{!canSave && (submitted || Object.keys(touched).length > 0) && <p className="form-help">Complete los campos obligatorios para guardar el producto.</p>}<button className={`btn-full save-product ${isEditing ? "editing-button" : ""}`} type="submit">{isEditing ? "Actualizar producto" : "Guardar producto"}</button></form></section><section className="admin-card orders-card"><h3>Pedidos</h3>{pedidos.length ? pedidos.map((pedido) => { const totalProductos = pedido.detalles?.reduce((total, item) => total + Number(item.cantidad || 0), 0) || 0; const estadoActual = pedido.estadoPedido?.nombre || "Pendiente"; const abierto = detalleAbierto === pedido.id; return <article className="mini-card order-card" key={pedido.id}><div className="order-summary"><div><h4>Pedido #{pedido.id}</h4><p>Cliente: {clientePedido(pedido)}</p><p>Fecha: {pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : "Sin fecha"}</p><p>Total: ${Number(pedido.total || 0).toFixed(2)}</p></div><div><p>Estado: <strong>{estadoActual}</strong></p><p>Pago: {pagoPedido(pedido)}</p><p>Dirección: {direccionPedido(pedido)}</p><p>Productos: {totalProductos}</p></div></div><div className="order-actions"><button type="button" onClick={() => setDetalleAbierto(abierto ? null : pedido.id)}>{abierto ? "Ocultar detalle" : "Ver detalle"}</button><label><span>Estado</span><select value={estadoActual} onChange={(event) => cambiarEstadoPedido(pedido.id, event.target.value)}>{estadosPedido.map((estado) => <option key={estado} value={estado}>{estado}</option>)}</select></label></div>{abierto && <div className="order-detail"><h5>Detalle del pedido</h5><p>Cliente: {clientePedido(pedido)} {pedido.cliente?.cedula ? `· Cédula: ${pedido.cliente.cedula}` : ""} {pedido.cliente?.telefono ? `· Tel: ${pedido.cliente.telefono}` : ""}</p><p>Dirección: {direccionPedido(pedido)}</p><p>Pago: {pagoPedido(pedido)}</p><p>Estado actual: {estadoActual}</p><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead><tbody>{pedido.detalles?.map((detalle) => <tr key={detalle.id}><td>{detalle.producto?.nombre || `Producto #${detalle.productoId}`}</td><td>{detalle.cantidad}</td><td>${Number(detalle.precioUnitario || 0).toFixed(2)}</td><td>${Number(detalle.subtotal || 0).toFixed(2)}</td></tr>)}</tbody></table><p className="order-total">Total: ${Number(pedido.total || 0).toFixed(2)}</p></div>}</article>; }) : <p>Sin pedidos registrados.</p>}</section></div><section className="admin-card"><h3>Usuarios</h3><table><thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th></tr></thead><tbody>{usuarios.map((usuario) => <tr key={usuario.id}><td>{usuario.username}</td><td>{usuario.email}</td><td><select value={usuario.rolId || ""} onChange={(event) => cambiarRolUsuario(usuario.id, event.target.value)}>{roles.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}</select></td></tr>)}</tbody></table></section><section className="admin-card"><h3>Productos</h3><table><thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>{productos.map((producto) => <tr key={producto.id}><td>{producto.nombre}</td><td>${priceOf(producto).toFixed(2)}</td><td>{stockOf(producto)}</td><td><button onClick={() => editar(producto)}>Editar</button><button className="danger" onClick={() => eliminar(producto)}>Eliminar</button></td></tr>)}</tbody></table></section></section>;
}

export function Toast({ message }) { return message ? <div className="toast" role="status">{message}</div> : null; }
