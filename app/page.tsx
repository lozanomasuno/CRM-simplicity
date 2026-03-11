"use client";
import React, { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import TablaVendedores from './components/features/TablaVendedores';
import { ModalVenta } from './components/ui/ModalVenta';
import { Plus } from 'lucide-react';

// Definimos la estructura del vendedor
interface Vendedor {
  id: number;
  nombre: string;
  avatar: string;
  ventas: number;
  meta: number;
}

const VendedoresPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado inicial con algunos datos
  const [vendedores, setVendedores] = useState<Vendedor[]>([
    { id: 1, nombre: "Carlos Ruiz", avatar: "CR", ventas: 8500, meta: 10000 },
    { id: 2, nombre: "Ana Milena", avatar: "AM", ventas: 12000, meta: 10000 },
  ]);

  // Función para agregar un nuevo registro
  const agregarVenta = (nombre: string, monto: number) => {
    const nuevoVendedor: Vendedor = {
      id: Date.now(), // ID único temporal
      nombre: nombre,
      avatar: nombre.split(' ').map(n => n[0]).join('').toUpperCase(),
      ventas: monto,
      meta: 10000, // Meta estándar por ahora
    };

    setVendedores([...vendedores, nuevoVendedor]);
    setIsModalOpen(false); // Cerramos el modal tras guardar
  };

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
            className="flex items-center gap-2 bg-neon-green-light text-mouse-gray px-6 py-3 rounded-xl font-black shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 transition-all"
          >
            <Plus size={20} /> Nueva Venta
          </button>
        </div>


        <TablaVendedores vendedoresData={vendedores} />


        <ModalVenta 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={agregarVenta} 
        />
      </div>
    </DashboardLayout>
  );
}

export default VendedoresPage;