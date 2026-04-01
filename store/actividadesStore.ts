import { create } from 'zustand';
import {
  ActividadData,
  EventoCalendarioData,
  ActividadModel,
  EventoCalendarioModel,
} from '@/data/models';
import { mapApiErrorToMessage } from '@/lib/api/http';
import {
  createActividad,
  completarActividad as completarActividadApi,
  eliminarActividad as eliminarActividadApi,
} from '@/lib/api/actividadesService';
import { getCalendario, getCalendarioPorVendedor } from '@/lib/api/calendarioService';

export type { EstadoActividad, PrioridadActividad, TipoActividadCRM } from '@/data/models';

interface ActividadesState {
  actividades: ActividadData[];
  eventosCalendario: EventoCalendarioData[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  clearError: () => void;
  fetchActividades: () => Promise<void>;
  fetchCalendario: (vendedorId?: string) => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  addActividad: (data: Omit<ActividadData, 'id' | 'createdAt'>) => Promise<boolean>;
  updateActividad: (id: string, data: Partial<Omit<ActividadData, 'id' | 'createdAt'>>) => void;
  completarActividad: (id: string) => Promise<boolean>;
  eliminarActividad: (id: string) => Promise<boolean>;
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
  (set, get) => ({
    actividades: [],
    eventosCalendario: [],
    loading: false,
    error: null,
    initialized: false,

    clearError: () => set({ error: null }),

    fetchActividades: async () => {
      await get().fetchCalendario();
    },

    fetchCalendario: async (vendedorId) => {
      set({ loading: true, error: null });
      try {
        const eventos = vendedorId
          ? await getCalendarioPorVendedor(vendedorId)
          : await getCalendario();

        const actividades = eventos.map<ActividadData>((evento) => ({
          id: evento.actividadId,
          tipo: 'seguimiento',
          descripcion: evento.titulo,
          fecha: evento.fechaInicio,
          fechaFin: evento.fechaFin,
          vendedorId: evento.vendedorId,
          estado: 'pendiente',
          prioridad: 'media',
          createdAt: evento.fechaInicio,
        }));

        const eventosCalendario: EventoCalendarioData[] = eventos.map((evento) => ({
          id: evento.id,
          titulo: evento.titulo,
          fechaInicio: evento.fechaInicio,
          fechaFin: evento.fechaFin,
          actividadId: evento.actividadId,
          vendedorId: evento.vendedorId,
        }));

        set({ actividades, eventosCalendario, initialized: true });
      } catch (error) {
        set({ error: mapApiErrorToMessage(error) });
      } finally {
        set({ loading: false });
      }
    },

    seedIfEmpty: async () => {
      if (get().initialized) return;
      await get().fetchCalendario();
    },

    addActividad: async (data) => {
      set({ loading: true, error: null });
      try {
        const created = await createActividad({
          leadId: data.leadId,
          vendedorId: data.vendedorId,
          tipo: data.tipo,
          descripcion: data.descripcion,
          fecha: data.fecha,
          fechaFin: data.fechaFin,
          prioridad: data.prioridad,
          estado: data.estado,
        });

        const nueva: ActividadData = {
          id: created.id,
          tipo: created.tipo,
          descripcion: created.descripcion,
          fecha: created.fecha,
          fechaFin: created.fechaFin,
          leadId: created.leadId,
          vendedorId: created.vendedorId,
          estado: created.estado,
          prioridad: created.prioridad,
          createdAt: created.createdAt,
        };

        const evento = new ActividadModel(nueva).generarEvento();
        set((state) => ({
          actividades: [...state.actividades, nueva],
          eventosCalendario: evento
            ? [...state.eventosCalendario, evento]
            : state.eventosCalendario,
        }));

        return true;
      } catch (error) {
        set({ error: mapApiErrorToMessage(error) });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    updateActividad: (id, data) =>
      set((state) => {
        const actividades = state.actividades.map((actividad) =>
          actividad.id === id ? { ...actividad, ...data } : actividad
        );
        return {
          actividades,
          eventosCalendario: rebuildEventos(actividades, state.eventosCalendario),
        };
      }),

    completarActividad: async (id) => {
      set({ loading: true, error: null });
      try {
        await completarActividadApi(id);
        set((state) => {
          const actividades = state.actividades.map((actividad) =>
            actividad.id === id ? new ActividadModel(actividad).marcarComoCompletada() : actividad
          );
          return {
            actividades,
            eventosCalendario: rebuildEventos(actividades, state.eventosCalendario),
          };
        });
        return true;
      } catch (error) {
        set({ error: mapApiErrorToMessage(error) });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    eliminarActividad: async (id) => {
      set({ loading: true, error: null });
      try {
        await eliminarActividadApi(id);
        set((state) => ({
          actividades: state.actividades.filter((actividad) => actividad.id !== id),
          eventosCalendario: state.eventosCalendario.filter((evento) => evento.actividadId !== id),
        }));
        return true;
      } catch (error) {
        set({ error: mapApiErrorToMessage(error) });
        return false;
      } finally {
        set({ loading: false });
      }
    },

    reagendarActividad: (id, nuevaFecha, nuevaFechaFin) =>
      set((state) => {
        const actividades = state.actividades.map((actividad) => {
          if (actividad.id !== id) return actividad;
          const reagendada = new ActividadModel(actividad).reagendar(nuevaFecha);
          return nuevaFechaFin ? { ...reagendada, fechaFin: nuevaFechaFin } : reagendada;
        });
        return {
          actividades,
          eventosCalendario: rebuildEventos(actividades, state.eventosCalendario),
        };
      }),
  })
);
