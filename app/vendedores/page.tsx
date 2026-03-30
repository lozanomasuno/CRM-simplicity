"use client";
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import TablaVendedores from '@/app/components/features/TablaVendedores';
import { ModalVenta } from '../components/ui/ModalVenta';
import { Plus } from 'lucide-react';
import { useVendedoresStore } from '@/store/vendedoresStore';
import { vendedorSeeds } from '@/data/seeds';

export default function VendedoresPage() {
  const vendedores  = useVendedoresStore((state) => state.vendedores);
  const seedIfEmpty = useVendedoresStore((state) => state.seedIfEmpty);
  const addVenta    = useVendedoresStore((state) => state.addVenta);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { seedIfEmpty(vendedorSeeds); }, [seedIfEmpty]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Gestión de Vendedores</h1>
            <p className="text-gray-500 text-sm">Administra el rendimiento de tu equipo en tiempo real.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-neon-green-light text-mouse-gray px-6 py-3 rounded-xl font-black shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 transition-all hover:cursor-pointer"
          >
            <Plus size={20} /> Nueva Venta
          </button>
        </div>
        <ModalVenta
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(nombre, monto) => { addVenta(nombre, monto); setIsModalOpen(false); }}
        />
        <TablaVendedores vendedoresData={vendedores} />
      </div>
    </DashboardLayout>
  );
}