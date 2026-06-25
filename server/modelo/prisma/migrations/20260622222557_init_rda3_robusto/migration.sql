BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Rol] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Rol_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Rol_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Rol_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[Usuario] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [rolId] INT NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [Usuario_activo_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Usuario_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Usuario_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Usuario_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [Usuario_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Cliente] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuarioId] INT,
    [nombres] NVARCHAR(1000) NOT NULL,
    [apellidos] NVARCHAR(1000) NOT NULL,
    [cedula] NVARCHAR(1000),
    [telefono] NVARCHAR(1000),
    [email] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Cliente_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Cliente_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Cliente_usuarioId_key] UNIQUE NONCLUSTERED ([usuarioId]),
    CONSTRAINT [Cliente_cedula_key] UNIQUE NONCLUSTERED ([cedula])
);

-- CreateTable
CREATE TABLE [dbo].[DireccionCliente] (
    [id] INT NOT NULL IDENTITY(1,1),
    [clienteId] INT NOT NULL,
    [ciudad] NVARCHAR(1000) NOT NULL,
    [direccion] NVARCHAR(1000) NOT NULL,
    [referencia] NVARCHAR(1000),
    [principal] BIT NOT NULL CONSTRAINT [DireccionCliente_principal_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DireccionCliente_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DireccionCliente_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Categoria] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000),
    [activo] BIT NOT NULL CONSTRAINT [Categoria_activo_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Categoria_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Categoria_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Categoria_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[UnidadMedida] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [abreviatura] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [UnidadMedida_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UnidadMedida_nombre_key] UNIQUE NONCLUSTERED ([nombre]),
    CONSTRAINT [UnidadMedida_abreviatura_key] UNIQUE NONCLUSTERED ([abreviatura])
);

-- CreateTable
CREATE TABLE [dbo].[Producto] (
    [id] INT NOT NULL IDENTITY(1,1),
    [categoriaId] INT NOT NULL,
    [unidadMedidaId] INT NOT NULL,
    [nombre] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(1000) NOT NULL,
    [precioVenta] FLOAT(53) NOT NULL,
    [precioCompra] FLOAT(53) NOT NULL CONSTRAINT [Producto_precioCompra_df] DEFAULT 0,
    [stockActual] INT NOT NULL CONSTRAINT [Producto_stockActual_df] DEFAULT 0,
    [stockMinimo] INT NOT NULL CONSTRAINT [Producto_stockMinimo_df] DEFAULT 5,
    [imagen] NVARCHAR(1000),
    [requiereReceta] BIT NOT NULL CONSTRAINT [Producto_requiereReceta_df] DEFAULT 0,
    [laboratorio] NVARCHAR(1000),
    [principioActivo] NVARCHAR(1000),
    [oferta] BIT NOT NULL CONSTRAINT [Producto_oferta_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [Producto_activo_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Producto_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Producto_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Proveedor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [rucCedula] NVARCHAR(1000),
    [telefono] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [direccion] NVARCHAR(1000),
    [activo] BIT NOT NULL CONSTRAINT [Proveedor_activo_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Proveedor_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Proveedor_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Proveedor_rucCedula_key] UNIQUE NONCLUSTERED ([rucCedula])
);

-- CreateTable
CREATE TABLE [dbo].[Compra] (
    [id] INT NOT NULL IDENTITY(1,1),
    [proveedorId] INT NOT NULL,
    [fecha] DATETIME2 NOT NULL CONSTRAINT [Compra_fecha_df] DEFAULT CURRENT_TIMESTAMP,
    [subtotal] FLOAT(53) NOT NULL,
    [iva] FLOAT(53) NOT NULL CONSTRAINT [Compra_iva_df] DEFAULT 0,
    [total] FLOAT(53) NOT NULL,
    [estado] NVARCHAR(1000) NOT NULL CONSTRAINT [Compra_estado_df] DEFAULT 'Registrada',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Compra_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Compra_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CompraDetalle] (
    [id] INT NOT NULL IDENTITY(1,1),
    [compraId] INT NOT NULL,
    [productoId] INT NOT NULL,
    [cantidad] INT NOT NULL,
    [costoUnitario] FLOAT(53) NOT NULL,
    [subtotal] FLOAT(53) NOT NULL,
    CONSTRAINT [CompraDetalle_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TipoMovimientoInventario] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [TipoMovimientoInventario_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TipoMovimientoInventario_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[MovimientoInventario] (
    [id] INT NOT NULL IDENTITY(1,1),
    [productoId] INT NOT NULL,
    [tipoMovimientoId] INT NOT NULL,
    [cantidad] INT NOT NULL,
    [stockAnterior] INT NOT NULL,
    [stockNuevo] INT NOT NULL,
    [motivo] NVARCHAR(1000),
    [referencia] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MovimientoInventario_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [MovimientoInventario_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EstadoPedido] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [EstadoPedido_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [EstadoPedido_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[MetodoPago] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [MetodoPago_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MetodoPago_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[Pedido] (
    [id] INT NOT NULL IDENTITY(1,1),
    [usuarioId] INT NOT NULL,
    [clienteId] INT,
    [direccionClienteId] INT,
    [estadoPedidoId] INT NOT NULL,
    [subtotal] FLOAT(53) NOT NULL,
    [envio] FLOAT(53) NOT NULL CONSTRAINT [Pedido_envio_df] DEFAULT 0,
    [iva] FLOAT(53) NOT NULL CONSTRAINT [Pedido_iva_df] DEFAULT 0,
    [total] FLOAT(53) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Pedido_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Pedido_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PedidoDetalle] (
    [id] INT NOT NULL IDENTITY(1,1),
    [pedidoId] INT NOT NULL,
    [productoId] INT NOT NULL,
    [cantidad] INT NOT NULL,
    [precioUnitario] FLOAT(53) NOT NULL,
    [subtotal] FLOAT(53) NOT NULL,
    CONSTRAINT [PedidoDetalle_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Pago] (
    [id] INT NOT NULL IDENTITY(1,1),
    [pedidoId] INT NOT NULL,
    [metodoPagoId] INT NOT NULL,
    [monto] FLOAT(53) NOT NULL,
    [comprobante] NVARCHAR(1000),
    [tarjetaUltimos4] NVARCHAR(1000),
    [estado] NVARCHAR(1000) NOT NULL CONSTRAINT [Pago_estado_df] DEFAULT 'Pendiente',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Pago_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Pago_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Usuario] ADD CONSTRAINT [Usuario_rolId_fkey] FOREIGN KEY ([rolId]) REFERENCES [dbo].[Rol]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Cliente] ADD CONSTRAINT [Cliente_usuarioId_fkey] FOREIGN KEY ([usuarioId]) REFERENCES [dbo].[Usuario]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DireccionCliente] ADD CONSTRAINT [DireccionCliente_clienteId_fkey] FOREIGN KEY ([clienteId]) REFERENCES [dbo].[Cliente]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Producto] ADD CONSTRAINT [Producto_categoriaId_fkey] FOREIGN KEY ([categoriaId]) REFERENCES [dbo].[Categoria]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Producto] ADD CONSTRAINT [Producto_unidadMedidaId_fkey] FOREIGN KEY ([unidadMedidaId]) REFERENCES [dbo].[UnidadMedida]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Compra] ADD CONSTRAINT [Compra_proveedorId_fkey] FOREIGN KEY ([proveedorId]) REFERENCES [dbo].[Proveedor]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CompraDetalle] ADD CONSTRAINT [CompraDetalle_compraId_fkey] FOREIGN KEY ([compraId]) REFERENCES [dbo].[Compra]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CompraDetalle] ADD CONSTRAINT [CompraDetalle_productoId_fkey] FOREIGN KEY ([productoId]) REFERENCES [dbo].[Producto]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MovimientoInventario] ADD CONSTRAINT [MovimientoInventario_productoId_fkey] FOREIGN KEY ([productoId]) REFERENCES [dbo].[Producto]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MovimientoInventario] ADD CONSTRAINT [MovimientoInventario_tipoMovimientoId_fkey] FOREIGN KEY ([tipoMovimientoId]) REFERENCES [dbo].[TipoMovimientoInventario]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Pedido] ADD CONSTRAINT [Pedido_usuarioId_fkey] FOREIGN KEY ([usuarioId]) REFERENCES [dbo].[Usuario]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Pedido] ADD CONSTRAINT [Pedido_clienteId_fkey] FOREIGN KEY ([clienteId]) REFERENCES [dbo].[Cliente]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Pedido] ADD CONSTRAINT [Pedido_direccionClienteId_fkey] FOREIGN KEY ([direccionClienteId]) REFERENCES [dbo].[DireccionCliente]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Pedido] ADD CONSTRAINT [Pedido_estadoPedidoId_fkey] FOREIGN KEY ([estadoPedidoId]) REFERENCES [dbo].[EstadoPedido]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PedidoDetalle] ADD CONSTRAINT [PedidoDetalle_pedidoId_fkey] FOREIGN KEY ([pedidoId]) REFERENCES [dbo].[Pedido]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PedidoDetalle] ADD CONSTRAINT [PedidoDetalle_productoId_fkey] FOREIGN KEY ([productoId]) REFERENCES [dbo].[Producto]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Pago] ADD CONSTRAINT [Pago_pedidoId_fkey] FOREIGN KEY ([pedidoId]) REFERENCES [dbo].[Pedido]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Pago] ADD CONSTRAINT [Pago_metodoPagoId_fkey] FOREIGN KEY ([metodoPagoId]) REFERENCES [dbo].[MetodoPago]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
