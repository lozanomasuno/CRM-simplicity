import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ActividadData,
  EventoCalendarioData,
  ActividadModel,
  EventoCalendarioModel,
} from '@/data/models';

export type { EstadoActividad, PrioridadActividad, TipoActividadCRM } from '@/data/models';

interface ActividadesState {
  actividades: ActividadData[];
  eventosCalendario: EventoCalendarioData[];
  seedIfEmpty: (data: ActividadData[]) => void;
  addActividad: (data: Omit<ActividadData, 'id' | 'createdAt'>) => void;
  updateActividad: (id: string, data: Partial<Omit<ActividadData, 'id' | 'createdAt'>>) => void;
  completarActividad: (id: string) => void;
  eliminarActividad: (id: string) => void;
  reagendarActividad: (id: string, nuevaFecha: string, nuevaFechaFin?: string) => void;
}

/**
 * Rebuilds the full eventosCalendario array by syncing every pending
 * activity with its existing event (or creating a new one).
 * Completed activities are automatically removed from the calendar.
 */
function rebuildEventos(
  actividades: ActividadData[],
  existingEventos: EventoCalendarioData[]
): EventoCalendarioData[] {
  const byActividadId = new Map(existingEventos.map((e) => [e.actividadId, e]));
  const result: EventoCalendarioData[] = [];

  for (const act of actividades) {
    const model = new ActividadModel(act);
    const evento = model.generarEvento(); // null when completed
    if (!evento) continue;

    const existing = byActividadId.get(act.id);
    result.push(
      existing
        ? new EventoCalendarioModel(existing).sincronizarConActividad(act)
        : evento
    );
  }

  return result;
}

export const useActividadesStore = create<ActividadesState>()(
  persist(
    (set, get) => ({
      actividades: [],
      eventosCalendario: [],

      seedIfEmpty: (data) => {
        if (get().actividades.length === 0) {
          set({ actividades: data, eventosCalendario: rebuildEventos(data, []) });
        }
      },

      addActividad: (data) => {
        const nueva: ActividadData = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        const evento = new ActividadModel(nueva).generarEvento();
        set((state) => ({
          actividades: [...state.actividades, nueva],
          eventosCalendario: evento
            ? [...state.eventosCalendario, evento]
            : state.eventosCalendario,
        }));
      },

      updateActividad: (id, data) =>
        set((state) => {
          const actividades = state.actividades.map((a) =>
            a.id === id ? { ...a, ...data } : a
          );
          return { actividades, eventosCalendario: rebuildEventos(actividades, state.eventosCalendario) };
        }),

      completarActividad: (id) =>
        set((state) => {
          const actividades = state.actividades.map((a) =>
            a.id === id ? new ActividadModel(a).marcarComoCompletada() : a
          );
          return { actividades, eventosCalendario: rebuildEventos(actividades, state.eventosCalendario) };
        }),

      eliminarActividad: (id) =>
        set((state) => ({
          actividades: state.actividades.filter((a) => a.id !== id),
          eventosCalendario: state.eventosCalendario.filter((e) => e.actividadId !== id),
        })),

      reagendarActividad: (id, nuevaFecha, nuevaFechaFin) =>
        set((state) => {
          const actividades = state.actividades.map((a) => {
            if (a.id !== id) return a;
            const reagendada = new ActividadModel(a).reagendar(nuevaFecha);
            return nuevaFechaFin ? { ...reagendada, fechaFin: nuevaFechaFin } : reagendada;
          });
          return { actividades, eventosCalendario: rebuildEventos(actividades, state.eventosCalendario) };
        }),
    }),
    { name: 'simplicity-actividades' }
  )
);
