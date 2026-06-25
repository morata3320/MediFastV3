import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ApiError,
  getCurrentUser,
  getToken,
  login,
  logoutSession,
  pedidosApi,
  productosApi,
  register,
  rolesApi,
  usuariosApi
} from "../modelo/api.js";
import { addToCart, getTotals, readCart, removeItem, updateQty, writeCart } from "../modelo/cartModel.js";

function roleOf(user) {
  return user?.role || user?.rol;
}

export function useMediFastController() {
  const [productos, setProductos] = useState([]);
  const [cart, setCart] = useState(readCart());
  const [user, setUser] = useState(getCurrentUser());
  const [categoria, setCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminProductos, setAdminProductos] = useState([]);
  const [adminPedidos, setAdminPedidos] = useState([]);
  const [adminUsuarios, setAdminUsuarios] = useState([]);
  const [adminRoles, setAdminRoles] = useState([]);

  const notify = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }, []);

  const handleApiError = useCallback((error) => {
    if (error instanceof ApiError && error.status === 401) {
      logoutSession();
      setUser(null);
      setAdminOpen(false);
      setCheckoutOpen(false);
      notify("Su sesión expiró. Inicie sesión nuevamente.");
      return;
    }
    if (error instanceof ApiError && error.status === 403) {
      notify("No tiene permisos para esta acción.");
      return;
    }
    notify(error.message || "No se pudo completar la solicitud.");
  }, [notify]);

  const cargarProductos = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError("");
    try {
      setProductos(await productosApi.listar());
    } catch (error) {
      setCatalogError(error.message || "No se pudo cargar el catálogo.");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    const requestId = window.setTimeout(cargarProductos, 0);
    return () => window.clearTimeout(requestId);
  }, [cargarProductos]);
  useEffect(() => { writeCart(cart); }, [cart]);

  const categorias = useMemo(() => ["Todos", ...new Set(productos.map((p) => p.categoria))], [productos]);
  const productosFiltrados = useMemo(() => {
    const query = busqueda.toLowerCase().trim();
    return productos.filter((producto) => {
      const categoriaOk = categoria === "Todos" || producto.categoria === categoria;
      const busquedaOk = !query || [producto.nombre, producto.categoria, producto.descripcion, producto.laboratorio]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
      return categoriaOk && busquedaOk;
    });
  }, [productos, categoria, busqueda]);
  const totals = useMemo(() => getTotals(cart), [cart]);

  function agregar(producto) {
    const stock = Number(producto.stockActual ?? producto.stock ?? 0);
    const enCarrito = cart.find((item) => item.id === producto.id)?.cantidad || 0;
    if (stock <= 0) return notify("Este producto no tiene stock disponible.");
    if (enCarrito >= stock) return notify(`Stock insuficiente para ${producto.nombre}.`);
    setCart((items) => addToCart(items, producto));
    notify("Producto agregado al carrito.");
  }

  function cambiarCantidad(id, delta) {
    const item = cart.find((producto) => producto.id === id);
    if (delta > 0 && item && item.cantidad >= Number(item.stockActual ?? item.stock ?? 0)) {
      return notify(`Stock insuficiente para ${item.nombre}.`);
    }
    setCart((items) => updateQty(items, id, delta));
  }

  async function loginUser(identifier, password) {
    setIsSubmitting(true);
    try {
      const logged = await login(identifier, password);
      setUser(logged);
      setAuthMode(null);
      notify("Login correcto.");
      return true;
    } catch (error) {
      notify(error.status === 401 ? "Credenciales incorrectas." : error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function registerUser(username, email, password) {
    setIsSubmitting(true);
    try {
      const created = await register(username, email, password);
      setUser(created);
      setAuthMode(null);
      notify("Cuenta creada correctamente.");
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function logoutUser() {
    logoutSession();
    setUser(null);
    setAdminOpen(false);
    notify("Sesión cerrada.");
  }

  function iniciarCheckout() {
    if (!cart.length) return notify("El carrito está vacío.");
    if (!getToken() || !user) {
      setCartOpen(false);
      setAuthMode("login");
      return notify("Debe iniciar sesión para comprar.");
    }
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  async function confirmarPedido(checkout) {
    const items = cart.map((item) => ({ productoId: item.id, cantidad: item.cantidad }));
    setIsSubmitting(true);
    try {
      const pedido = await pedidosApi.crear(items, checkout.pago, checkout.cliente, checkout.direccion);
      setCart([]);
      setCheckoutOpen(false);
      await cargarProductos();
      notify("Pedido registrado correctamente.");
      return pedido;
    } catch (error) {
      handleApiError(error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  function requireAdmin() {
    if (roleOf(user) !== "admin") {
      notify("No tiene permisos para esta acción.");
      return false;
    }
    return true;
  }

  async function cargarAdmin() {
    if (!requireAdmin()) return;
    setIsSubmitting(true);
    try {
      const [productosAdmin, pedidos, usuarios, roles] = await Promise.all([productosApi.listar(), pedidosApi.todos(), usuariosApi.listar(), rolesApi.listar()]);
      setAdminProductos(productosAdmin);
      setAdminPedidos(pedidos);
      setAdminUsuarios(usuarios);
      setAdminRoles(roles);
      setAdminOpen(true);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function guardarProductoAdmin(producto) {
    if (!requireAdmin()) return false;
    setIsSubmitting(true);
    try {
      if (producto.id) await productosApi.actualizar(producto.id, producto);
      else await productosApi.crear(producto);
      await cargarProductos();
      await cargarAdmin();
      notify(producto.id ? "Producto actualizado." : "Producto creado.");
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function eliminarProductoAdmin(id) {
    if (!requireAdmin()) return;
    setIsSubmitting(true);
    try {
      await productosApi.eliminar(id);
      await cargarProductos();
      await cargarAdmin();
      notify("Producto eliminado.");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function cambiarRolUsuario(id, rolId) {
    if (!requireAdmin()) return;
    try {
      await usuariosApi.actualizarRol(id, rolId);
      notify("Rol de usuario actualizado.");
      await cargarAdmin();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function cambiarEstadoPedido(id, estado) {
    if (!requireAdmin()) return;
    setIsSubmitting(true);
    try {
      await pedidosApi.actualizarEstado(id, estado);
      notify("Estado de pedido actualizado.");
      await cargarAdmin();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    productosFiltrados, categorias, categoria, setCategoria, busqueda, setBusqueda, cart, totals, user,
    toast, catalogLoading, catalogError, isSubmitting, cartOpen, setCartOpen, authMode, setAuthMode,
    checkoutOpen, setCheckoutOpen, adminOpen, setAdminOpen, adminProductos, adminPedidos, adminUsuarios,
    adminRoles, agregar, cambiarCantidad, quitar: (id) => setCart((items) => removeItem(items, id)),
    loginUser, registerUser, logoutUser, iniciarCheckout, confirmarPedido, cargarAdmin,
    guardarProductoAdmin, eliminarProductoAdmin, cambiarRolUsuario, cambiarEstadoPedido, cargarProductos
  };
}
