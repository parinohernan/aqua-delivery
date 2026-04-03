import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { VendedorLista } from '@/types/entities';

class VendedoresService {
  async list(): Promise<VendedorLista[]> {
    return apiClient.get<VendedorLista[]>(endpoints.vendedores());
  }
}

export const vendedoresService = new VendedoresService();
