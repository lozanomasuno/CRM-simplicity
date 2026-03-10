"use client";
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import TablaVendedores from '@/app/components/features/TablaVendedores';
import { useState } from 'react';
import { ModalVenta } from '../components/ui/ModalVenta';

export default function VendedoresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        
        <ModalVenta isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <TablaVendedores />
      </div>
    </DashboardLayout>
  );
}