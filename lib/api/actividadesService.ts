interface ActividadApi {
  id: string;
  leadId?: string;
  vendedorId?: string;
  tipo: 'llamada' | 'nota' | 'mensaje' | 'seguimiento' | 'tarea';
  descripcion: string;
  fecha: string;
  fechaFin?: string;
  estado: 'pendiente' | 'completado';
  prioridad: 'alta' | 'media' | 'baja';
  createdAt: string;
}

export interface ActividadPayload {
  leadId?: string;
  vendedorId?: string;
  tipo: 'llamada' | 'nota' | 'mensaje' | 'seguimiento' | 'tarea';
  descripcion: string;
  fecha: string;
  fechaFin?: string;
  prioridad: 'alta' | 'media' | 'baja';
  estado?: 'pendiente' | 'completado';
}

export async function getActividadesPorLead(leadId: string): Promise<ActividadApi[]> {
  const { httpRequest } = await import('@/lib/api/http');
  const { normalizeActividad } = await import('@/lib/api/types');
  const data = await httpRequest<unknown[]>(`/api/actividades/lead/${leadId}`);
  return Array.isArray(data) ? data.map((item) => normalizeActividad(item)) : [];
}

export async function createActividad(payload: ActividadPayload): Promise<ActividadApi> {
  const { httpRequest } = await import('@/lib/api/http');
  const { normalizeActividad } = await import('@/lib/api/types');
  const data = await httpRequest<unknown>('/api/actividades', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeActividad(data);
}

export async function completarActividad(id: string): Promise<ActividadApi> {
  const { httpRequest } = await import('@/lib/api/http');
  const { normalizeActividad } = await import('@/lib/api/types');
  const data = await httpRequest<unknown>(`/api/actividades/${id}/completar`, {
    method: 'PUT',
  });
  return normalizeActividad(data);
}

export async function eliminarActividad(id: string): Promise<void> {
  const { httpRequest } = await import('@/lib/api/http');
  await httpRequest<unknown>(`/api/actividades/${id}`, {
    method: 'DELETE',
  });
}
