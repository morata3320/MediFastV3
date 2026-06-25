export function adminPanelHTML() {
  return `
    <section id="admin-panel" class="admin-panel" aria-labelledby="admin-title">
      <div class="admin-header">
        <div>
          <h2 id="admin-title">Panel de administracion</h2>
          <p>Gestion de productos, pedidos y usuarios registrados en SQL Server.</p>
        </div>
        <button id="btn-admin-close" type="button">Cerrar panel</button>
      </div>

      <div class="admin-grid">
        <section class="admin-card">
          <h3 id="admin-form-title">Crear producto</h3>

          <form id="admin-product-form" class="admin-form">
            <input type="hidden" id="admin-product-id" />

            <label for="admin-nombre">Nombre</label>
            <input id="admin-nombre" type="text" required />

            <label for="admin-categoria">Categoria</label>
            <input id="admin-categoria" type="text" required />

            <label for="admin-precio">Precio</label>
            <input id="admin-precio" type="number" step="0.01" min="0" required />

            <label for="admin-stock">Stock</label>
            <input id="admin-stock" type="number" min="0" required />

            <label for="admin-descripcion">Descripcion</label>
            <textarea id="admin-descripcion" rows="3" required></textarea>

            <label for="admin-imagen">Imagen</label>
            <input id="admin-imagen" type="text" placeholder="assets/img/producto.jpg" />

            <label for="admin-laboratorio">Laboratorio</label>
            <input id="admin-laboratorio" type="text" />

            <div class="admin-checks">
              <label>
                <input id="admin-receta" type="checkbox" />
                Requiere receta
              </label>

              <label>
                <input id="admin-oferta" type="checkbox" />
                Oferta
              </label>
            </div>

            <div class="admin-actions">
              <button type="submit">Guardar producto</button>
              <button id="btn-admin-form-clear" type="button">Limpiar</button>
            </div>
          </form>
        </section>

        <section class="admin-card">
          <h3>Pedidos registrados</h3>
          <div id="admin-pedidos" class="admin-list">
            Cargando pedidos...
          </div>
        </section>

        <section class="admin-card admin-card-full">
          <h3>Usuarios registrados</h3>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody id="admin-usuarios">
                <tr>
                  <td colspan="5">Cargando usuarios...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section class="admin-card">
        <h3>Productos registrados</h3>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="admin-productos">
              <tr>
                <td colspan="6">Cargando productos...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

export function productoRowsHTML(productos) {
  if (!productos.length) {
    return `
      <tr>
        <td colspan="6">No hay productos registrados.</td>
      </tr>
    `;
  }

  return productos.map((p) => `
    <tr>
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>$${Number(p.precio).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button
          type="button"
          class="btn-admin-edit"
          data-id="${p.id}"
        >
          Editar
        </button>

        <button
          type="button"
          class="btn-admin-delete"
          data-id="${p.id}"
        >
          Eliminar
        </button>
      </td>
    </tr>
  `).join("");
}

export function pedidosHTML(pedidos) {
  if (!pedidos.length) {
    return `<p>No hay pedidos registrados todavia.</p>`;
  }

  return pedidos.map((pedido) => `
    <article class="pedido-admin-item">
      <h4>Pedido #${pedido.id}</h4>
      <p><strong>Cliente:</strong> ${pedido.usuario?.username || "Sin usuario"}</p>
      <p><strong>Total:</strong> $${Number(pedido.total).toFixed(2)}</p>
      <p><strong>Fecha:</strong> ${new Date(pedido.createdAt).toLocaleString()}</p>
      <p><strong>Items:</strong> ${pedido.detalles?.length || 0}</p>
    </article>
  `).join("");
}

export function usuariosRowsHTML(usuarios) {
  if (!usuarios.length) {
    return `
      <tr>
        <td colspan="5">No hay usuarios registrados.</td>
      </tr>
    `;
  }

  return usuarios.map((u) => `
    <tr>
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>
        <span class="admin-role ${u.role === "admin" ? "admin-role-admin" : "admin-role-user"}">
          ${u.role}
        </span>
      </td>
      <td>${new Date(u.createdAt).toLocaleString()}</td>
    </tr>
  `).join("");
}