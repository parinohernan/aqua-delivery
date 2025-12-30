import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { cacheData, getCachedData } from '@/services/storage/cache';
import { DB_STORES } from '@/utils/constants';
import type { Producto } from '@/types/entities';

/**
 * Servicio de Productos
 * Maneja todas las operaciones relacionadas con productos
 */
class ProductosService {
  /**
   * Obtiene todos los productos
   */
  async getAll(): Promise<Producto[]> {
    try {
      const productos = await apiClient.get<Producto[]>(endpoints.productos());
      
      // Guardar en caché
      await cacheData(DB_STORES.PRODUCTOS, productos);
      
      return productos;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      
      // Intentar obtener de caché si hay error de red
      try {
        const cached = await getCachedData<Producto>(DB_STORES.PRODUCTOS);
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
   * Obtiene un producto por ID
   */
  async getById(id: number): Promise<Producto> {
    return await apiClient.get<Producto>(endpoints.producto(id));
  }

  /**
   * Crea un nuevo producto
   */
  async create(data: Partial<Producto>): Promise<Producto> {
    const producto = await apiClient.post<Producto>(endpoints.productos(), data);
    
    // Actualizar caché
    const allProductos = await this.getAll();
    await cacheData(DB_STORES.PRODUCTOS, allProductos);
    
    return producto;
  }

  /**
   * Actualiza un producto
   */
  async update(id: number, data: Partial<Producto>): Promise<Producto> {
    const producto = await apiClient.put<Producto>(endpoints.producto(id), data);
    
    // Actualizar caché
    const allProductos = await this.getAll();
    await cacheData(DB_STORES.PRODUCTOS, allProductos);
    
    return producto;
  }

  /**
   * Elimina un producto
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(endpoints.producto(id));
    
    // Actualizar caché
    const allProductos = await this.getAll();
    await cacheData(DB_STORES.PRODUCTOS, allProductos);
  }
}

export const productosService = new ProductosService();
export default productosService;

