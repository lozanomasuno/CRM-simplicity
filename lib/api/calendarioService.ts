import { httpRequest } from '@/lib/api/http';
import { CalendarioEventoApi, normalizeCalendarioEvento } from '@/lib/api/types';

export async function getCalendario(): Promise<CalendarioEventoApi[]> {
  const data = await httpRequest<unknown[]>('/api/calendario');
  return Array.isArray(data) ? data.map(normalizeCalendarioEvento) : [];
}

export async function getCalendarioPorVendedor(vendedorId: string): Promise<CalendarioEventoApi[]> {
  const data = await httpRequest<unknown[]>(`/api/calendario/vendedor/${vendedorId}`);
  return Array.isArray(data) ? data.map(normalizeCalendarioEvento) : [];
}
