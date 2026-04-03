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
  /** 1/true: habilitar registro GPS periódico (Check) con la app abierta */
  registro_gps_periodico?: boolean | number | string;
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
  alquileres?: Alquiler[];
  [key: string]: unknown;
}

export interface Alquiler {
  id: number;
  codigoEmpresa: number;
  codigoCliente: number;
  tipo: string;
  marca?: string | null;
  numeroSerie?: string | null;
  observacion?: string | null;
  montoMensual: number;
  fechaInicio: string;
  diaCobro: number;
  estado: 'ACTIVO' | 'CANCELADO';
  fechaCancelacion?: string | null;
  motivoCancelacion?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  clienteId?: number;
  codigoCliente?: number;
  cliente?: Cliente;
  cliente_nombre?: string;
  /** Saldo/deuda anterior del cliente (cuando viene del backend) */
  cliente_saldo?: number;
  /** Envases retornables que el cliente adeuda (cuando viene del backend) */
  cliente_retornables?: number;
  vendedorId?: number;
  estado: 'pendient' | 'proceso' | 'entregad' | 'anulado';
  fecha?: string;
  fecha_pedido?: string;
  fecha_programada?: string;
  fecha_entrega?: string;
  zona?: string;
  direccion?: string;
  latitud?: number | string;
  longitud?: number | string;
  total?: number;
  items?: PedidoItem[];
  /** Orden en tabla rutas cuando la lista se pidió con ordenarPorRuta (9999 = sin fila en rutas) */
  orden_reparto?: number;
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

/**
 * Item de ruta (orden de reparto por zona)
 */
export interface RutaItem {
  codigoCliente: number;
  orden: number;
}

/**
 * Cliente con orden en la ruta (para planificar reparto)
 */
export interface ClienteConOrden {
  codigoCliente: number;
  nombre: string;
  apellido?: string;
  direccion?: string;
  telefono?: string;
  zona?: string;
  orden: number;
  pedidosPendientes?: number;
}

/** Vendedor listado para filtros (GET /api/vendedores) */
export interface VendedorLista {
  id: number;
  codigo: number;
  nombre: string;
  apellido?: string;
  telegramId?: string;
  codigoEmpresa: number;
  registro_gps_periodico?: number | boolean;
}

/** Evento georreferenciado (GET /api/eventos-gps) */
export interface EventoGps {
  id: number;
  codigoEmpresa: number;
  codigoVendedor: number;
  vendedorNombre?: string | null;
  vendedorApellido?: string | null;
  evento: string;
  numeroPedido?: string | null;
  ocurridoEn: string;
  latitud: number | string;
  longitud: number | string;
  creadoEn?: string;
}

