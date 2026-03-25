import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { cacheData, getCachedData } from '@/services/storage/cache';
import { DB_STORES } from '@/utils/constants';
import type { Alquiler, Cliente } from '@/types/entities';

/**
 * Servicio de Clientes
 * Maneja todas las operaciones relacionadas con clientes
 */
class ClientesService {
  /**
   * Obtiene todos los clientes
   */
  async getAll(): Promise<Cliente[]> {
    try {
      const clientes = await apiClient.get<Cliente[]>(endpoints.clientes());
      
      // Guardar en caché
      await cacheData(DB_STORES.CLIENTES, clientes);
      
      return clientes;
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      
      // Intentar obtener de caché si hay error de red
      try {
        const cached = await getCachedData<Cliente>(DB_STORES.CLIENTES);
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
   * Obtiene un cliente por ID
   */
  async getById(id: number): Promise<Cliente> {
    return await apiClient.get<Cliente>(endpoints.cliente(id));
  }

  /**
   * Crea un nuevo cliente
   */
  async create(data: Partial<Cliente>): Promise<Cliente> {
    const cliente = await apiClient.post<Cliente>(endpoints.clientes(), data);
    
    // Actualizar caché
    const allClientes = await this.getAll();
    await cacheData(DB_STORES.CLIENTES, allClientes);
    
    return cliente;
  }

  /**
   * Actualiza un cliente
   */
  async update(id: number, data: Partial<Cliente>): Promise<Cliente> {
    const cliente = await apiClient.put<Cliente>(endpoints.cliente(id), data);
    
    // Actualizar caché
    const allClientes = await this.getAll();
    await cacheData(DB_STORES.CLIENTES, allClientes);
    
    return cliente;
  }

  /**
   * Elimina un cliente
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(endpoints.cliente(id));
    
    // Actualizar caché
    const allClientes = await this.getAll();
    await cacheData(DB_STORES.CLIENTES, allClientes);
  }

  /**
   * Obtiene clientes desde caché
   */
  async getCached(): Promise<Cliente[]> {
    return await getCachedData<Cliente>(DB_STORES.CLIENTES);
  }

  async toggleStatus(id: number, activo: boolean): Promise<void> {
    await apiClient.put(endpoints.clienteToggleStatus(id), { activo });
  }

  async getAlquileres(clienteId: number): Promise<Alquiler[]> {
    return apiClient.get<Alquiler[]>(endpoints.clienteAlquileres(clienteId));
  }

  async createAlquiler(data: {
    codigoCliente: number;
    tipo: string;
    marca?: string;
    numeroSerie?: string;
    observacion?: string;
    montoMensual: number;
    fechaInicio: string;
  }): Promise<Alquiler> {
    return apiClient.post<Alquiler>(endpoints.alquileres(), data);
  }

  async cancelAlquiler(alquilerId: number, motivoCancelacion?: string): Promise<Alquiler> {
    return apiClient.patch<Alquiler>(endpoints.alquilerCancelar(alquilerId), {
      motivoCancelacion: motivoCancelacion || null,
    });
  }
}

export const clientesService = new ClientesService();
export default clientesService;

