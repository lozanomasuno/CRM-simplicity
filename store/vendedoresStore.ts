import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Vendedor {
  id: number;
  nombre: string;
  avatar: string;
  ventas: number;
  meta: number;
}

interface VendedoresState {
  vendedores: Vendedor[];
  seedIfEmpty: (data: Vendedor[]) => void;
  addVenta: (nombre: string, monto: number) => void;
}

export const useVendedoresStore = create<VendedoresState>()(
  persist(
    (set, get) => ({
      vendedores: [],

      seedIfEmpty: (data) => {
        if (get().vendedores.length === 0) {
          set({ vendedores: data });
        }
      },

      addVenta: (nombre, monto) =>
        set((state) => {
          const existing = state.vendedores.find((v) => v.nombre === nombre);
          if (existing) {
            return {
              vendedores: state.vendedores.map((v) =>
                v.nombre === nombre ? { ...v, ventas: v.ventas + monto } : v
              ),
            };
          }
          return {
            vendedores: [
              ...state.vendedores,
              {
                id: Date.now(),
                nombre,
                avatar: nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
                ventas: monto,
                meta: 50_000,
              },
            ],
          };
        }),
    }),
    { name: 'simplicity-vendedores' }
  )
);
