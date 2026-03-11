"use client";
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import TablaVendedores from '@/app/components/features/TablaVendedores';
import { useState } from 'react';
import { ModalVenta } from '../components/ui/ModalVenta';

interface Vendedor {
  id: number;
  nombre: string;
  avatar: string;
  ventas: number;
  meta: number;
}

export default function VendedoresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  const handleSave = (nombre: string, monto: number) => {
    setVendedores(prev => {
      const existing = prev.find(v => v.nombre === nombre);
      if (existing) {
        return prev.map(v => v.nombre === nombre ? { ...v, ventas: v.ventas + monto } : v);
      } else {
        const newId = prev.length + 1;
        const newVendedor: Vendedor = {
          id: newId,
          nombre,
          avatar: '', // Default avatar, you can update this
          ventas: monto,
          meta: 10000 // Default meta, adjust as needed
        };
        return [...prev, newVendedor];
      }
    });
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="h-full flex justify-between gap-4">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Gestión de Vendedores
          </h1>
          <button onClick={() => setIsModalOpen(true)} className="text-mouse-gray px-6 py-2 border border-gray-200 rounded-xl font-bold hover:cursor-pointer  transition-all">
            + Nueva Venta
          </button>
        </div>
        
        <ModalVenta isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
        <TablaVendedores vendedoresData={vendedores} />
      </div>
    </DashboardLayout>
  );
}