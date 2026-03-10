"use client";
import React, { useState } from 'react';
import { Search } from 'lucide-react'; 

interface Vendedor {
  id: number;
  nombre: string;
  avatar: string;
  ventas: number;
  meta: number;
}

const vendedoresData: Vendedor[] = [
  { id: 1, nombre: "Carlos García", avatar: "CG", ventas: 45000, meta: 40000 },
  { id: 2, nombre: "María López", avatar: "ML", ventas: 38000, meta: 40000 },
  { id: 3, nombre: "Juan Rodríguez", avatar: "JR", ventas: 52000, meta: 40000 },
];

const TablaVendedores = () => {
  const [busqueda, setBusqueda] = useState("");

  // Lógica de filtrado en tiempo real
  const vendedoresFiltrados = vendedoresData.filter( v => 
    v.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="mt-8 bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm transition-all">
      
      {/* CABECERA CON BUSCADOR */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Ranking de Vendedores</h3>
          <p className="text-xs text-gray-500">Visualizando {vendedoresFiltrados.length} resultados</p>
        </div>

        {/* El Input de Búsqueda Creativo */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-green-light transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar vendedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-64 rounded-xl border border-gray-200 dark:border-gray-600 
                       bg-gray-50 dark:bg-mouse-gray-dark text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-neon-green-light/30 focus:border-neon-green-light
                       transition-all placeholder:text-gray-400"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {/* ... (Aquí va el <thead> y <tbody> que ya tenías, pero usando 'vendedoresFiltrados' en lugar de 'vendedoresData') */}
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {vendedoresFiltrados.map((v) => {

             // const porcentaje = Math.min((v.ventas / v.meta) * 100, 100);

              return (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/row">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-neon-green-light/10 flex items-center justify-center text-neon-green-light font-bold border border-neon-green-light/20 group-hover/row:border-neon-green-light transition-colors">
                      {v.avatar}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{v.nombre}</span>
                  </td>
                  {/* ... resto de las celdas (progreso y ventas) igual que antes ... */}
                </tr>
              );
            })}
            
            {/* Mensaje si no hay resultados */}
            {vendedoresFiltrados.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">
                  No se encontraron vendedores que coincidan con &quot;{busqueda}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaVendedores;