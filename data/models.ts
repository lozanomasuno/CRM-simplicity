// ─── Value types ──────────────────────────────────────────────
export type EstadoActividad    = 'pendiente' | 'completado';
export type PrioridadActividad = 'alta' | 'media' | 'baja';
export type TipoActividadCRM   = 'llamada' | 'nota' | 'mensaje' | 'seguimiento' | 'tarea';

// ─── Data interfaces (plain objects stored in Zustand) ────────
export interface ActividadData {
  id: string;
  tipo: TipoActividadCRM;
  descripcion: string;
  fecha: string;         // ISO – scheduled date/time
  fechaFin?: string;     // ISO – optional end time
  leadId?: string;
  clienteId?: string;
  vendedorId?: string;
  estado: EstadoActividad;
  prioridad: PrioridadActividad;
  createdAt: string;
}

export interface EventoCalendarioData {
  id: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  actividadId: string;
  vendedorId?: string;
}

// ─── ActividadModel ──────────────────────────────────────────
/**
 * Domain class for a CRM activity. Encapsulates business logic
 * (overdue detection, completion, rescheduling, calendar generation).
 * The underlying data is immutable — every mutating method returns
 * a new plain ActividadData object.
 */
export class ActividadModel {
  private readonly raw: Readonly<ActividadData>;

  constructor(data: ActividadData) {
    this.raw = Object.freeze({ ...data });
  }

  esPendiente(): boolean {
    return this.raw.estado === 'pendiente';
  }

  esAtrasada(): boolean {
    return this.esPendiente() && new Date(this.raw.fecha) < new Date();
  }

  /** Returns a new ActividadData with estado = 'completado'. */
  marcarComoCompletada(): ActividadData {
    return { ...this.raw, estado: 'completado' };
  }

  /** Returns a new ActividadData with the rescheduled date. */
  reagendar(nuevaFecha: string): ActividadData {
    return { ...this.raw, fecha: nuevaFecha };
  }

  /**
   * Returns an EventoCalendarioData to sync to the calendar.
   * Returns null when the activity is completed (no entry needed).
   */
  generarEvento(): EventoCalendarioData | null {
    if (this.raw.estado === 'completado') return null;
    return {
      id:           `evt-${this.raw.id}`,
      titulo:       `${TIPO_LABEL[this.raw.tipo]}: ${this.raw.descripcion.slice(0, 50)}`,
      fechaInicio:  this.raw.fecha,
      fechaFin:     this.raw.fechaFin ?? this.raw.fecha,
      actividadId:  this.raw.id,
      vendedorId:   this.raw.vendedorId,
    };
  }

  toPlain(): ActividadData {
    return { ...this.raw };
  }
}

// ─── EventoCalendarioModel ────────────────────────────────────
/**
 * Domain class for a calendar event. Knows how to stay in sync
 * with its source activity and how to produce a
 * react-big-calendar compatible event object.
 */
export class EventoCalendarioModel {
  private raw: EventoCalendarioData;

  constructor(data: EventoCalendarioData) {
    this.raw = { ...data };
  }

  /** Patches this event to mirror its source activity. */
  sincronizarConActividad(actividad: ActividadData): EventoCalendarioData {
    this.raw = {
      ...this.raw,
      titulo:      `${TIPO_LABEL[actividad.tipo]}: ${actividad.descripcion.slice(0, 50)}`,
      fechaInicio: actividad.fecha,
      fechaFin:    actividad.fechaFin ?? actividad.fecha,
      vendedorId:  actividad.vendedorId,
    };
    return this.toPlain();
  }

  /** React Big Calendar expects { title, start: Date, end: Date }. */
  toRBCEvent(): { title: string; start: Date; end: Date; resource: EventoCalendarioData } {
    return {
      title:    this.raw.titulo,
      start:    new Date(this.raw.fechaInicio),
      end:      new Date(this.raw.fechaFin),
      resource: this.toPlain(),
    };
  }

  toPlain(): EventoCalendarioData {
    return { ...this.raw };
  }
}

// ─── Shared display maps (used by models + UI components) ─────
export const TIPO_LABEL: Record<TipoActividadCRM, string> = {
  llamada:     'Llamada',
  nota:        'Nota',
  mensaje:     'Mensaje',
  seguimiento: 'Seguimiento',
  tarea:       'Tarea',
};

export const PRIORIDAD_LABEL: Record<PrioridadActividad, string> = {
  alta:  'Alta',
  media: 'Media',
  baja:  'Baja',
};
