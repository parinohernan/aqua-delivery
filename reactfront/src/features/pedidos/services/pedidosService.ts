import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { cacheData, getCachedData } from '@/services/storage/cache';
import { DB_STORES } from '@/utils/constants';
import type { Pedido } from '@/types/entities';

/**
 * Servicio de Pedidos
 * Maneja todas las operaciones relacionadas con pedidos
 */
class PedidosService {
  /**
   * Obtiene todos los pedidos
   * @param incluirDetalles - Si es false, no carga los detalles de items (más rápido)
   * @param estado - Filtrar por estado (pendient, proceso, entregad, anulado)
   */
  async getAll(incluirDetalles: boolean = true, estado?: string): Promise<Pedido[]> {
    try {
      const params = new URLSearchParams();
      if (!incluirDetalles) {
        params.append('incluirDetalles', 'false');
      }
      if (estado && estado !== 'todos') {
        params.append('estado', estado);
      }
      
      const queryString = params.toString();
      const url = queryString ? `${endpoints.pedidos()}?${queryString}` : endpoints.pedidos();
      
      const pedidos = await apiClient.get<Pedido[]>(url);
      
      // Guardar en caché
      await cacheData(DB_STORES.PEDIDOS, pedidos);
      
      return pedidos;
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      
      // Intentar obtener de caché si hay error de red
      try {
        const cached = await getCachedData<Pedido>(DB_STORES.PEDIDOS);
        if (cached.length > 0) {
          console.log('Usando datos en caché');
          return cached;
        }
      } catch (cacheError) {
        console.error('Error obteniendo de caché:', cacheError);
      }
      
      throw error;
    }
  }

  /**
   * Obtiene un pedido por ID
   */
  async getById(id: number): Promise<Pedido> {
    return await apiClient.get<Pedido>(endpoints.pedido(id));
  }

  /**
   * Crea un nuevo pedido
   */
  async create(data: Partial<Pedido>): Promise<Pedido> {
    const pedido = await apiClient.post<Pedido>(endpoints.pedidos(), data);
    
    // Actualizar caché
    const allPedidos = await this.getAll();
    await cacheData(DB_STORES.PEDIDOS, allPedidos);
    
    return pedido;
  }

  /**
   * Actualiza un pedido
   */
  async update(id: number, data: Partial<Pedido>): Promise<Pedido> {
    const pedido = await apiClient.put<Pedido>(endpoints.pedido(id), data);
    
    // Actualizar caché
    const allPedidos = await this.getAll();
    await cacheData(DB_STORES.PEDIDOS, allPedidos);
    
    return pedido;
  }

  /**
   * Elimina un pedido
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(endpoints.pedido(id));
    
    // Actualizar caché
    const allPedidos = await this.getAll();
    await cacheData(DB_STORES.PEDIDOS, allPedidos);
  }
}

export const pedidosService = new PedidosService();
export default pedidosService;

