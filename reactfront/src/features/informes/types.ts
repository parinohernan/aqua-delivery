/**
 * Tipos para los informes y reportes
 */

/**
 * Producto en el informe resumen
 */
export interface ProductoInforme {
  descripcion: string;
  cantidad: number;
  total: number;
}

/**
 * Informe resumen de ventas
 */
export interface InformeResumen {
  totalPedidos: number;
  totalClientes: number;
  totalVentas: number;
  productos: ProductoInforme[];
}

/**
 * Producto comprado por un cliente
 */
export interface ProductoCliente {
  codigo: number;
  descripcion: string;
  cantidadTotal: number;
  totalPagado: number;
  precioPromedio: number;
  pedidosConEsteProducto: number;
}

/**
 * Pedido individual de un cliente
 */
export interface PedidoCliente {
  codigo: number;
  fechaPedido: string;
  fechaEntrega: string;
  total: number;
  cantidadItems: number;
}

/**
 * Cliente con detalles en el informe detallado
 */
export interface ClienteDetallado {
  codigo: number;
  nombre: string;
  apellido: string;
  telefono: string;
  totalPedidos: number;
  totalComprado: number;
  productos: ProductoCliente[];
  pedidos: PedidoCliente[];
}

/**
 * Informe detallado por cliente
 */
export interface InformeDetallado {
  clientes: ClienteDetallado[];
}

/**
 * Tipo de informe disponible
 */
export type TipoInforme = 'resumen' | 'detallado';

