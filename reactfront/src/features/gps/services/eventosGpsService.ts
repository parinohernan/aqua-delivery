import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { EventoGps } from '@/types/entities';

export type EventosGpsQuery = {
  desde: Date;
  hasta: Date;
  codigoVendedor?: number | 'all';
};

export type RegistrarEventoGpsBody = {
  evento: string;
  latitud: number;
  longitud: number;
  numero_pedido?: string | null;
  ocurrido_en?: string;
};

function buildQuery(params: EventosGpsQuery): string {
  const sp = new URLSearchParams();
  sp.append('desde', params.desde.toISOString());
  sp.append('hasta', params.hasta.toISOString());
  if (params.codigoVendedor !== undefined && params.codigoVendedor !== 'all') {
    sp.append('codigo_vendedor', String(params.codigoVendedor));
  }
  return `${endpoints.eventosGps()}?${sp.toString()}`;
}

class EventosGpsService {
  async list(q: EventosGpsQuery): Promise<EventoGps[]> {
    const url = buildQuery(q);
    return apiClient.get<EventoGps[]>(url);
  }

  /** POST /api/eventos-gps (entrega, Check periódico, etc.) */
  async registrar(body: RegistrarEventoGpsBody): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(endpoints.eventosGps(), body);
  }
}

export const eventosGpsService = new EventosGpsService();
