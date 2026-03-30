"use client";
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import Paginator from '@/app/components/ui/Paginator'; 

interface Vendedor {
  id: number;
  nombre: string;
  avatar: string;
  ventas: number;
  meta: number;
}

const TablaVendedores = ({ vendedoresData = [] }: { vendedoresData: Vendedor[] }) => {
  const [busqueda, setBusqueda] = useState("");

  const vendedoresFiltrados = vendedoresData?.filter(v => 
    v.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const pag = usePagination(vendedoresFiltrados);

  return (
    <div className="mt-8 bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm transition-all">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Ranking de Equipo</h3>
          <p className="text-xs text-gray-500">Página {pag.page} de {pag.totalPages} · {vendedoresFiltrados.length} resultados</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-green-light transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre..."
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
          <thead className="bg-gray-50 dark:bg-mouse-gray-dark text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Vendedor</th>
              <th className="px-6 py-4">Progreso de Meta</th>
              <th className="px-6 py-4 text-right">Ventas Actuales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {pag.pageItems.map((v) => {
              // Cálculo de porcentaje para la barra de progreso
              const porcentaje = Math.min((v.ventas / v.meta) * 100, 100);

              return (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/row">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-neon-green-light/10 flex items-center justify-center text-neon-green-light font-bold border border-neon-green-light/20 group-hover/row:border-neon-green-light transition-colors">
                      {v.avatar}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{v.nombre}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-neon-green-light transition-all duration-1000" 
                          style={{ width: `${porcentaje}%`, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-500">{Math.round(porcentaje)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                    ${v.ventas.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            
            {vendedoresFiltrados.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">
                  No se encontraron resultados para &quot;{busqueda}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginator
        page={pag.page}
        totalPages={pag.totalPages}
        totalItems={pag.totalItems}
        pageSize={pag.pageSize}
        onPageChange={pag.setPage}
        onPageSizeChange={pag.setPageSize}
        canPrev={pag.canPrev}
        canNext={pag.canNext}
      />
    </div>
  );
};

export default TablaVendedores;