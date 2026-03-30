import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  seedIfEmpty: (data: Lead[]) => void;
  addLead: (data: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, data: Partial<Omit<Lead, 'id' | 'createdAt'>>) => void;
  changeLeadStatus: (id: string, estado: EstadoLead) => void;
  deleteLead: (id: string) => void;
  addActividad: (data: Omit<Actividad, 'id' | 'fecha'>) => void;
  getActividadesByLead: (leadId: string) => Actividad[];
  getLeadsSinActividad: (diasLimite?: number) => Lead[];
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: [],
      actividades: [],

      seedIfEmpty: (data) => {
        if (get().leads.length === 0) {
          set({ leads: data });
        }
      },

      addLead: (data) =>
        set((state) => ({
          leads: [
            ...state.leads,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateLead: (id, data) =>
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, ...data } : l)),
        })),

      changeLeadStatus: (id, estado) =>
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, estado } : l)),
        })),

      deleteLead: (id) =>
        set((state) => ({
          leads: state.leads.filter((l) => l.id !== id),
          actividades: state.actividades.filter((a) => a.leadId !== id),
        })),

      addActividad: (data) => {
        const fecha = new Date().toISOString();
        set((state) => ({
          actividades: [
            ...state.actividades,
            { ...data, id: crypto.randomUUID(), fecha },
          ],
          leads: state.leads.map((l) =>
            l.id === data.leadId ? { ...l, ultimaActividad: fecha } : l
          ),
        }));
      },

      getActividadesByLead: (leadId) =>
        get()
          .actividades.filter((a) => a.leadId === leadId)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),

      getLeadsSinActividad: (diasLimite = 3) => {
        const limite = new Date();
        limite.setDate(limite.getDate() - diasLimite);
        return get().leads.filter((l) => {
          if (l.estado === 'cerrado') return false;
          const ref = l.ultimaActividad ?? l.createdAt;
          return new Date(ref) < limite;
        });
      },
    }),
    { name: 'simplicity-leads' }
  )
);
