import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { User, VendedorLista } from '@/types/entities';

class VendedoresService {
  async list(): Promise<VendedorLista[]> {
    return apiClient.get<VendedorLista[]>(endpoints.vendedores());
  }

  /** PATCH /api/vendedores/me — actualiza preferencias del vendedor autenticado */
  async patchMe(payload: { registro_gps_periodico: boolean | number }): Promise<User> {
    return apiClient.patch<User>(endpoints.vendedorMe(), payload);
  }
}

export const vendedoresService = new VendedoresService();
