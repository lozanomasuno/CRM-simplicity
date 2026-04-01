import { create } from 'zustand';
import { mapApiErrorToMessage } from '@/lib/api/http';
import { createActividad, getActividadesPorLead } from '@/lib/api/actividadesService';
import { createLead, getLeads, updateLead as updateLeadApi } from '@/lib/api/leadsService';

export type EstadoLead = 'nuevo' | 'contactado' | 'interesado' | 'cerrado';
export type TipoActividad = 'llamada' | 'nota' | 'mensaje' | 'seguimiento';

export interface Lead {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  estado: EstadoLead;
  vendedorId?: string;
  createdAt: string;
  ultimaActividad?: string;
}

export interface Actividad {
  id: string;
  leadId: string;
  tipo: TipoActividad;
  descripcion: string;
  fecha: string;
}

interface LeadsState {
  leads: Lead[];
  actividades: Actividad[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  clearError: () => void;
  fetchLeads: () => Promise<void>;
  fetchActividadesByLead: (leadId: string) => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  addLead: (data: Omit<Lead, 'id' | 'createdAt'>) => Promise<boolean>;
  updateLead: (id: string, data: Partial<Omit<Lead, 'id' | 'createdAt'>>) => Promise<boolean>;
  changeLeadStatus: (id: string, estado: EstadoLead) => Promise<boolean>;
  deleteLead: (id: string) => void;
  addActividad: (data: Omit<Actividad, 'id' | 'fecha'>) => Promise<boolean>;
  getActividadesByLead: (leadId: string) => Actividad[];
  getLeadsSinActividad: (diasLimite?: number) => Lead[];
}

export const useLeadsStore = create<LeadsState>()((set, get) => ({
  leads: [],
  actividades: [],
  loading: false,
  error: null,
  initialized: false,

  clearError: () => set({ error: null }),

  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const leads = await getLeads();
      set({ leads, initialized: true });
    } catch (error) {
      set({ error: mapApiErrorToMessage(error) });
    } finally {
      set({ loading: false });
    }
  },

  fetchActividadesByLead: async (leadId) => {
    set({ loading: true, error: null });
    try {
      const actividadesLead = await getActividadesPorLead(leadId);
      const mapped: Actividad[] = actividadesLead.map((a) => ({
        id: a.id,
        leadId: a.leadId ?? leadId,
        tipo: a.tipo === 'tarea' ? 'seguimiento' : a.tipo,
        descripcion: a.descripcion,
        fecha: a.fecha,
      }));

      set((state) => {
        const restantes = state.actividades.filter((a) => a.leadId !== leadId);
        return { actividades: [...restantes, ...mapped] };
      });
    } catch (error) {
      set({ error: mapApiErrorToMessage(error) });
    } finally {
      set({ loading: false });
    }
  },

  seedIfEmpty: async () => {
    if (get().initialized) return;
    await get().fetchLeads();
  },

  addLead: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await createLead(data);
      set((state) => ({ leads: [...state.leads, created] }));
      return true;
    } catch (error) {
      set({ error: mapApiErrorToMessage(error) });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateLead: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateLeadApi(id, data);
      set((state) => ({
        leads: state.leads.map((lead) => (lead.id === id ? updated : lead)),
      }));
      return true;
    } catch (error) {
      set({ error: mapApiErrorToMessage(error) });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  changeLeadStatus: async (id, estado) => {
    return get().updateLead(id, { estado });
  },

  deleteLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
      actividades: state.actividades.filter((actividad) => actividad.leadId !== id),
    })),

  addActividad: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await createActividad({
        leadId: data.leadId,
        tipo: data.tipo,
        descripcion: data.descripcion,
        fecha: new Date().toISOString(),
        prioridad: 'media',
        estado: 'pendiente',
      });

      const actividad: Actividad = {
        id: created.id,
        leadId: created.leadId ?? data.leadId,
        tipo: created.tipo === 'tarea' ? 'seguimiento' : created.tipo,
        descripcion: created.descripcion,
        fecha: created.fecha,
      };

      set((state) => ({
        actividades: [...state.actividades, actividad],
        leads: state.leads.map((lead) =>
          lead.id === data.leadId ? { ...lead, ultimaActividad: created.fecha } : lead
        ),
      }));

      return true;
    } catch (error) {
      set({ error: mapApiErrorToMessage(error) });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  getActividadesByLead: (leadId) =>
    get()
      .actividades.filter((actividad) => actividad.leadId === leadId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),

  getLeadsSinActividad: (diasLimite = 3) => {
    const limite = new Date();
    limite.setDate(limite.getDate() - diasLimite);
    return get().leads.filter((lead) => {
      if (lead.estado === 'cerrado') return false;
      const referencia = lead.ultimaActividad ?? lead.createdAt;
      return new Date(referencia) < limite;
    });
  },
}));
