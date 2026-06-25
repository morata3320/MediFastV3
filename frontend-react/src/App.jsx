import { useMediFastController } from "./controlador/useMediFastController.js";

import {
  Header,
  Catalogo,
  CartDrawer,
  AuthModal,
  CheckoutModal,
  AdminPanel,
  Toast
} from "./vista/Componentes.jsx";

import "./styles.css";

export default function App() {
  const c = useMediFastController();

  return (
    <>
      <Header
        user={c.user}
        busqueda={c.busqueda}
        setBusqueda={c.setBusqueda}
        cart={c.cart}
        setCartOpen={c.setCartOpen}
        setAuthMode={c.setAuthMode}
        logoutUser={c.logoutUser}
        cargarAdmin={c.cargarAdmin}
      />

      <Catalogo
        productos={c.productosFiltrados}
        categorias={c.categorias}
        categoria={c.categoria}
        setCategoria={c.setCategoria}
        agregar={c.agregar}
        loading={c.catalogLoading}
        error={c.catalogError}
        recargar={c.cargarProductos}
      />

      <CartDrawer
        open={c.cartOpen}
        setOpen={c.setCartOpen}
        cart={c.cart}
        totals={c.totals}
        cambiarCantidad={c.cambiarCantidad}
        quitar={c.quitar}
        iniciarCheckout={c.iniciarCheckout}
      />

      <AuthModal
        mode={c.authMode}
        setAuthMode={c.setAuthMode}
        loginUser={c.loginUser}
        registerUser={c.registerUser}
        submitting={c.isSubmitting}
      />

      <CheckoutModal
        open={c.checkoutOpen}
        setCheckoutOpen={c.setCheckoutOpen}
        totals={c.totals}
        confirmarPedido={c.confirmarPedido}
        submitting={c.isSubmitting}
      />

      <AdminPanel
        open={c.adminOpen}
        setAdminOpen={c.setAdminOpen}
        productos={c.adminProductos}
        pedidos={c.adminPedidos}
        usuarios={c.adminUsuarios}
        roles={c.adminRoles}
        guardarProductoAdmin={c.guardarProductoAdmin}
        eliminarProductoAdmin={c.eliminarProductoAdmin}
        cambiarRolUsuario={c.cambiarRolUsuario}
        cambiarEstadoPedido={c.cambiarEstadoPedido}
      />

      <Toast message={c.toast} />

      <footer className="footer">MediFast · Farmacia online con compra segura</footer>
    </>
  );
}
