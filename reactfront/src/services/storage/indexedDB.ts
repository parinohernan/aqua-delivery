import Dexie, { Table } from 'dexie';
import type { Cliente, Pedido, Producto, Pago, Zona, TipoPago } from '@/types/entities';
import { DB_CONFIG, DB_STORES } from '@/utils/constants';

/**
 * Base de datos IndexedDB usando Dexie
 * Almacena datos localmente para funcionamiento offline
 */
class AquaDeliveryDB extends Dexie {
  // Tablas
  clientes!: Table<Cliente, number>;
  pedidos!: Table<Pedido, number>;
  productos!: Table<Producto, number>;
  pagos!: Table<Pago, number>;
  zonas!: Table<Zona, number>;
  tiposPago!: Table<TipoPago, number>;

  constructor() {
    super(DB_CONFIG.NAME);

    this.version(DB_CONFIG.VERSION).stores({
      [DB_STORES.CLIENTES]: '++id, codigo, nombre, apellido, telefono, activo',
      [DB_STORES.PEDIDOS]: '++id, codigo, clienteId, estado, fecha',
      [DB_STORES.PRODUCTOS]: '++id, codigo, nombre, activo',
      [DB_STORES.PAGOS]: '++id, clienteId, fecha',
      [DB_STORES.ZONAS]: '++id, nombre, activo',
      [DB_STORES.TIPOS_PAGO]: '++id, nombre, activo',
    });
  }
}

// Exportar instancia singleton
export const db = new AquaDeliveryDB();

/**
 * Utilidades para operaciones comunes con IndexedDB
 */
export const dbUtils = {
  /**
   * Limpia todas las tablas
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      db.clientes.clear(),
      db.pedidos.clear(),
      db.productos.clear(),
      db.pagos.clear(),
      db.zonas.clear(),
      db.tiposPago.clear(),
    ]);
  },

  /**
   * Obtiene el conteo de registros en todas las tablas
   */
  async getCounts(): Promise<Record<string, number>> {
    return {
      clientes: await db.clientes.count(),
      pedidos: await db.pedidos.count(),
      productos: await db.productos.count(),
      pagos: await db.pagos.count(),
      zonas: await db.zonas.count(),
      tiposPago: await db.tiposPago.count(),
    };
  },
};

export default db;

