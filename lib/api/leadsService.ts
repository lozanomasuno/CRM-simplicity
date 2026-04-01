import { httpRequest } from '@/lib/api/http';
import { LeadApi, normalizeLead } from '@/lib/api/types';

export interface LeadPayload {
  nombre: string;
  telefono: string;
  email?: string;
  estado: 'nuevo' | 'contactado' | 'interesado' | 'cerrado';
  vendedorId?: string;
}

export async function getLeads(): Promise<LeadApi[]> {
  const data = await httpRequest<unknown[]>('/api/leads');
  return Array.isArray(data) ? data.map(normalizeLead) : [];
}

export async function createLead(payload: LeadPayload): Promise<LeadApi> {
  const data = await httpRequest<unknown>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeLead(data);
}

export async function updateLead(id: string, payload: Partial<LeadPayload>): Promise<LeadApi> {
  const data = await httpRequest<unknown>(`/api/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return normalizeLead(data);
}
