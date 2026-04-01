export type EstadoLead = 'nuevo' | 'contactado' | 'interesado' | 'cerrado';
export type TipoActividad = 'llamada' | 'nota' | 'mensaje' | 'seguimiento' | 'tarea';
export type EstadoActividad = 'pendiente' | 'completado';
export type PrioridadActividad = 'alta' | 'media' | 'baja';

export interface LeadApi {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  estado: EstadoLead;
  vendedorId?: string;
  createdAt: string;
  ultimaActividad?: string;
}

export interface ActividadApi {
  id: string;
  leadId?: string;
  vendedorId?: string;
  tipo: TipoActividad;
  descripcion: string;
  fecha: string;
  fechaFin?: string;
  estado: EstadoActividad;
  prioridad: PrioridadActividad;
  createdAt: string;
}

export interface CalendarioEventoApi {
  id: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  actividadId: string;
  vendedorId?: string;
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

function asEstadoLead(value: unknown): EstadoLead {
  const raw = asString(value).toLowerCase();
  if (raw === 'contactado' || raw === 'interesado' || raw === 'cerrado') return raw;
  return 'nuevo';
}

function asTipoActividad(value: unknown): TipoActividad {
  const raw = asString(value).toLowerCase();
  if (raw === 'nota' || raw === 'mensaje' || raw === 'seguimiento' || raw === 'tarea') return raw;
  return 'llamada';
}

function asEstadoActividad(value: unknown): EstadoActividad {
  return asString(value).toLowerCase() === 'completado' ? 'completado' : 'pendiente';
}

function asPrioridad(value: unknown): PrioridadActividad {
  const raw = asString(value).toLowerCase();
  if (raw === 'alta' || raw === 'baja') return raw;
  return 'media';
}

function asDateIso(value: unknown): string {
  const v = asString(value);
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function normalizeLead(payload: unknown): LeadApi {
  const p = (payload ?? {}) as Record<string, unknown>;
  return {
    id: asString(p.id),
    nombre: asString(p.nombre),
    telefono: asString(p.telefono),
    email: asString(p.email) || undefined,
    estado: asEstadoLead(p.estado),
    vendedorId: asString(p.vendedorId) || undefined,
    createdAt: asDateIso(p.createdAt ?? p.fechaCreacion),
    ultimaActividad: asString(p.ultimaActividad) ? asDateIso(p.ultimaActividad) : undefined,
  };
}

export function normalizeActividad(payload: unknown): ActividadApi {
  const p = (payload ?? {}) as Record<string, unknown>;
  return {
    id: asString(p.id),
    leadId: asString(p.leadId) || undefined,
    vendedorId: asString(p.vendedorId) || undefined,
    tipo: asTipoActividad(p.tipo),
    descripcion: asString(p.descripcion),
    fecha: asDateIso(p.fecha ?? p.fechaInicio),
    fechaFin: asString(p.fechaFin) ? asDateIso(p.fechaFin) : undefined,
    estado: asEstadoActividad(p.estado),
    prioridad: asPrioridad(p.prioridad),
    createdAt: asDateIso(p.createdAt ?? p.fechaCreacion ?? p.fecha),
  };
}

export function normalizeCalendarioEvento(payload: unknown): CalendarioEventoApi {
  const p = (payload ?? {}) as Record<string, unknown>;
  const id = asString(p.id);
  const actividadId = asString(p.actividadId ?? p.idActividad ?? id);
  const fechaInicio = asDateIso(p.fechaInicio ?? p.inicio ?? p.fecha);
  const fechaFin = asDateIso(p.fechaFin ?? p.fin ?? p.fechaFinActividad ?? p.fecha ?? fechaInicio);

  return {
    id,
    titulo: asString(p.titulo ?? p.descripcion ?? 'Actividad'),
    fechaInicio,
    fechaFin,
    actividadId,
    vendedorId: asString(p.vendedorId) || undefined,
  };
}
