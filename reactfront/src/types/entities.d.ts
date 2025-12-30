/**
 * Tipos de entidades del dominio
 * Define las estructuras de datos principales de la aplicación
 */

/**
 * Usuario/Vendedor del sistema
 */
export interface User {
  id?: number;
  nombre?: string;
  telegramId?: string;
  codigoEmpresa?: number;
  [key: string]: unknown;
}

/**
 * Cliente del sistema
 */
export interface Cliente {
  id: number;
  codigo?: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  latitud?: number | string;
  longitud?: number | string;
  saldo: number;
  retornables: number;
  activo?: boolean;
  zonaId?: number;
  zona?: Zona;
  [key: string]: unknown;
}

/**
 * Producto del catálogo
 */
export interface Producto {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  activo?: boolean;
  imagen?: string;
  imageURL?: string; // Campo que devuelve el backend
  esRetornable?: boolean | number;
  [key: string]: unknown;
}

/**
 * Pedido de entrega
 */
export interface Pedido {
  id: number;
  codigo?: string;
  clienteId: number;
  cliente?: Cliente;
  cliente_nombre?: string;
  vendedorId?: number;
  estado: 'pendiente' | 'en_entrega' | 'entregado' | 'cancelado';
  fecha?: string;
  direccion?: string;
  latitud?: number | string;
  longitud?: number | string;
  total?: number;
  items?: PedidoItem[];
  [key: string]: unknown;
}

/**
 * Item de un pedido
 */
export interface PedidoItem {
  id?: number;
  pedidoId?: number;
  productoId: number;
  producto?: Producto;
  cantidad: number;
  precio: number;
  subtotal: number;
  [key: string]: unknown;
}

/**
 * Pago realizado
 */
export interface Pago {
  id: number;
  clienteId: number;
  cliente?: Cliente;
  monto: number;
  tipoPagoId: number;
  tipoPago?: TipoPago;
  fecha?: string;
  observaciones?: string;
  [key: string]: unknown;
}

/**
 * Tipo de pago disponible
 */
export interface TipoPago {
  id: number;
  pago: string; // Nombre del tipo de pago
  aplicaSaldo?: boolean | number; // Si aplica saldo (cuenta corriente)
  activo?: boolean;
  [key: string]: unknown;
}

/**
 * Zona geográfica
 */
export interface Zona {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  [key: string]: unknown;
}

