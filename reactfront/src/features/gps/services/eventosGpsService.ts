import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { EventoGps } from '@/types/entities';

export type EventosGpsQuery = {
  desde: Date;
  hasta: Date;
  codigoVendedor?: number | 'all';
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
}

export const eventosGpsService = new EventosGpsService();
