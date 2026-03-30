"use client";
import React, { useState } from 'react';
import { Search, Eye, Pencil, CalendarPlus } from 'lucide-react';
import { Lead, EstadoLead } from '@/store/leadsStore';
import { usePagination } from '@/hooks/usePagination';
import Paginator from '@/app/components/ui/Paginator';

const ESTADO_CONFIG: Record<EstadoLead, { label: string; color: string }> = {
  nuevo:      { label: 'Nuevo',      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'         },
  contactado: { label: 'Contactado', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
  interesado: { label: 'Interesado', color: 'bg-neon-green-light/10 text-neon-green-light'                              },
  cerrado:    { label: 'Cerrado',    color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'             },
};

interface Props {
  leads: Lead[];
  onVerDetalle: (lead: Lead) => void;
  onEditar: (lead: Lead) => void;
  leadsInactivos: Set<string>;
  onProgramar?: (lead: Lead) => void;
}

const TablaLeads = ({ leads, onVerDetalle, onEditar, leadsInactivos, onProgramar }: Props) => {
  const [busqueda, setBusqueda] = useState('');

  const leadsFiltrados = leads.filter(
    (l) =>
      l.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.telefono.includes(busqueda)
  );

  const pag = usePagination(leadsFiltrados);

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short' });

  return (
    <div className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm transition-all">

      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Listado de Leads</h3>
          <p className="text-xs text-gray-500">Página {pag.page} de {pag.totalPages} · {leadsFiltrados.length} resultados</p>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-green-light transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-72 rounded-xl border border-gray-200 dark:border-gray-600
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
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Última actividad</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {pag.pageItems.map((lead) => {
              const inactivo = leadsInactivos.has(lead.id);
              const initials = lead.nombre
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/row"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border text-sm transition-colors
                          ${inactivo
                            ? 'bg-orange-100 text-orange-500 border-orange-200 dark:bg-orange-900/20 dark:border-orange-500/30'
                            : 'bg-neon-green-light/10 text-neon-green-light border-neon-green-light/20 group-hover/row:border-neon-green-light'
                          }`}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{lead.nombre}</p>
                        <p className="text-xs text-gray-400">{lead.email ?? lead.telefono}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ESTADO_CONFIG[lead.estado].color}`}>
                      {ESTADO_CONFIG[lead.estado].label}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className={`text-sm font-medium ${inactivo ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {formatFecha(lead.ultimaActividad ?? lead.createdAt)}
                    </p>
                    {inactivo && (
                      <p className="text-xs text-orange-400">Sin actividad reciente</p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onVerDetalle(lead)}
                        title="Ver detalle y actividades"
                        className="p-2 rounded-lg text-gray-400 hover:text-neon-green-light hover:bg-neon-green-light/10 transition-all hover:cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditar(lead)}
                        title="Editar lead"
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:cursor-pointer"
                      >
                        <Pencil size={16} />
                      </button>
                      {onProgramar && (
                        <button
                          onClick={() => onProgramar(lead)}
                          title="Programar actividad"
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:cursor-pointer"
                        >
                          <CalendarPlus size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {leadsFiltrados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                  {leads.length === 0
                    ? 'No hay leads registrados. Crea el primero.'
                    : `No se encontraron resultados para "${busqueda}"`}
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

export default TablaLeads;
