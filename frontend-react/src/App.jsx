import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { AdminRoute, ProtectedRoute } from "./controlador/rutas.jsx";
import { useMediFastController } from "./controlador/useMediFastController.js";

import {
  Header,
  Catalogo,
  CartDrawer,
  AuthModal,
  AuthPage,
  CheckoutModal,
  AdminPanel,
  MisPedidosPage,
  AccessDenied,
  NotFound,
  Toast
} from "./vista/Componentes.jsx";

import "./styles.css";

function LoginRoute({ controller }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const mode = params.get("mode") === "register" ? "register" : "login";
  const from = location.state?.from || "/";

  return <AuthPage mode={mode} loginUser={controller.loginUser} registerUser={controller.registerUser} submitting={controller.isSubmitting} onSuccess={() => navigate(from, { replace: true })} />;
}

function CatalogPage({ controller, navigate }) {
  return <Catalogo productos={controller.productosFiltrados} categorias={controller.categorias} categoria={controller.categoria} setCategoria={controller.setCategoria} agregar={controller.agregar} loading={controller.catalogLoading} error={controller.catalogError} recargar={controller.cargarProductos} iniciarCheckout={() => controller.iniciarCheckout(() => navigate("/checkout"))} />;
}

function CheckoutPage({ controller }) {
  const navigate = useNavigate();
  return <CheckoutModal open setCheckoutOpen={() => navigate("/")} totals={controller.totals} confirmarPedido={async (checkout) => { const pedido = await controller.confirmarPedido(checkout); if (pedido) navigate("/", { replace: true }); return pedido; }} submitting={controller.isSubmitting} />;
}

function AdminPage({ controller }) {
  const navigate = useNavigate();
  const { cargarAdmin } = controller;
  useEffect(() => {
    cargarAdmin();
  }, [cargarAdmin]);

  return <AdminPanel open setAdminOpen={() => navigate("/")} productos={controller.adminProductos} categorias={controller.adminCategorias} pedidos={controller.adminPedidos} usuarios={controller.adminUsuarios} roles={controller.adminRoles} guardarProductoAdmin={controller.guardarProductoAdmin} eliminarProductoAdmin={controller.eliminarProductoAdmin} cambiarRolUsuario={controller.cambiarRolUsuario} cambiarEstadoPedido={controller.cambiarEstadoPedido} />;
}

export default function App() {
  const c = useMediFastController();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("mf_theme") || "light");

  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === "dark");
    localStorage.setItem("mf_theme", theme);
  }, [theme]);

  return (
    <>
      <Header
        user={c.user}
        busqueda={c.busqueda}
        setBusqueda={c.setBusqueda}
        cart={c.cart}
        setCartOpen={c.setCartOpen}
        theme={theme}
        toggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        logoutUser={() => {
          c.logoutUser();
          navigate("/");
        }}
      />

      <Routes>
        <Route path="/" element={<CatalogPage controller={c} navigate={navigate} />} />
        <Route path="/login" element={<LoginRoute controller={c} />} />
        <Route path="/checkout" element={<ProtectedRoute user={c.user}><CheckoutPage controller={c} /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute user={c.user}><AdminPage controller={c} /></AdminRoute>} />
        <Route path="/mis-pedidos" element={<ProtectedRoute user={c.user}><MisPedidosPage pedidos={c.misPedidos} cargarMisPedidos={c.cargarMisPedidos} loading={c.isSubmitting} /></ProtectedRoute>} />
        <Route path="/no-autorizado" element={<AccessDenied user={c.user} logoutUser={() => { c.logoutUser(); navigate("/"); }} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <CartDrawer
        open={c.cartOpen}
        setOpen={c.setCartOpen}
        cart={c.cart}
        totals={c.totals}
        cambiarCantidad={c.cambiarCantidad}
        quitar={c.quitar}
        iniciarCheckout={() => c.iniciarCheckout(() => navigate("/checkout"))}
      />

      <AuthModal
        mode={c.authMode}
        setAuthMode={c.setAuthMode}
        loginUser={c.loginUser}
        registerUser={c.registerUser}
        submitting={c.isSubmitting}
      />

      <Toast message={c.toast} />

      <footer className="footer">MediFast · Farmacia online con compra segura</footer>
    </>
  );
}
