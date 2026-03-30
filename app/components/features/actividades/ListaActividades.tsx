"use client";
import React, { useState, useMemo } from 'react';
import {
  Search, CheckCircle2, Pencil, Trash2,
  Phone, FileText, MessageSquare, Clock, CheckSquare,
} from 'lucide-react';
import { useLeadsStore } from '@/store/leadsStore';
import {
  ActividadData, TipoActividadCRM,
  ActividadModel, TIPO_LABEL, PRIORIDAD_LABEL,
} from '@/data/models';
import { usePagination } from '@/hooks/usePagination';
import Paginator from '@/app/components/ui/Paginator';

// ─── Display maps ─────────────────────────────────────────────
const TIPO_ICON: Record<TipoActividadCRM, React.ReactNode> = {
  llamada:     <Phone size={13} />,
  nota:        <FileText size={13} />,
  mensaje:     <MessageSquare size={13} />,
  seguimiento: <Clock size={13} />,
  tarea:       <CheckSquare size={13} />,
};

const TIPO_COLOR: Record<TipoActividadCRM, string> = {
  llamada:     'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  nota:        'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  mensaje:     'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  seguimiento: 'bg-neon-green-light/10 text-neon-green-light',
  tarea:       'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
};

const PRIORIDAD_COLOR: Record<string, string> = {
  alta:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  media: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  baja:  'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

type Filtro = 'todas' | 'pendientes' | 'atrasadas' | 'completadas';

interface Props {
  actividades: ActividadData[];
  onEditar: (a: ActividadData) => void;
  onCompletar: (id: string) => void;
  onEliminar: (id: string) => void;
}

const ListaActividades = ({ actividades, onEditar, onCompletar, onEliminar }: Props) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtro,   setFiltro]   = useState<Filtro>('todas');

  const leads   = useLeadsStore((state) => state.leads);
  const leadMap = useMemo(() => new Map(leads.map((l) => [l.id, l.nombre])), [leads]);

  const counts = useMemo(() => {
    const ahora = new Date();
    return {
      pendientes:  actividades.filter((a) => a.estado === 'pendiente' && new Date(a.fecha) >= ahora).length,
      atrasadas:   actividades.filter((a) => a.estado === 'pendiente' && new Date(a.fecha) < ahora).length,
      completadas: actividades.filter((a) => a.estado === 'completado').length,
    };
  }, [actividades]);

  const filtradas = useMemo(() => {
    return actividades
      .filter((a) => {
        const match = a.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        if (!match) return false;
        const model = new ActividadModel(a);
        switch (filtro) {
          case 'pendientes':  return a.estado === 'pendiente' && !model.esAtrasada();
          case 'atrasadas':   return model.esAtrasada();
          case 'completadas': return a.estado === 'completado';
          default:            return true;
        }
      })
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [actividades, busqueda, filtro]);

  const pag = usePagination(filtradas);

  const FILTROS: { key: Filtro; label: string; count: number }[] = [
    { key: 'todas',       label: 'Todas',       count: actividades.length },
    { key: 'pendientes',  label: 'Pendientes',  count: counts.pendientes  },
    { key: 'atrasadas',   label: 'Atrasadas',   count: counts.atrasadas   },
    { key: 'completadas', label: 'Completadas', count: counts.completadas },
  ];

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">

      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Listado de Actividades</h3>
            <p className="text-xs text-gray-500">Página {pag.page} de {pag.totalPages} · {filtradas.length} resultados</p>
          </div>
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-green-light transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar actividad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-mouse-gray-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-green-light/30 focus:border-neon-green-light transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all hover:cursor-pointer
                ${filtro === f.key
                  ? 'bg-neon-green-light/10 text-neon-green-light border border-neon-green-light/30'
                  : 'bg-gray-100 dark:bg-mouse-gray-dark text-gray-500 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              {f.label}
              <span className="ml-1.5 font-mono">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-mouse-gray-dark text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Prioridad</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {pag.pageItems.map((a) => {
              const atrasada   = new ActividadModel(a).esAtrasada();
              const leadNombre = a.leadId ? leadMap.get(a.leadId) : undefined;

              return (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${TIPO_COLOR[a.tipo]}`}>
                      {TIPO_ICON[a.tipo]}
                      {TIPO_LABEL[a.tipo]}
                    </span>
                  </td>

                  <td className="px-6 py-4 max-w-xs">
                    <p className={`text-sm font-medium truncate ${a.estado === 'completado' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {a.descripcion}
                    </p>
                    {leadNombre && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{leadNombre}</p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {(() => {
                      let colorFecha = 'text-gray-700 dark:text-gray-300';
                      if (atrasada) colorFecha = 'text-red-500';
                      else if (a.estado === 'completado') colorFecha = 'text-gray-400';
                      return (
                        <>
                          <p className={`text-sm font-medium ${colorFecha}`}>
                            {formatFecha(a.fecha)}
                          </p>
                          {atrasada && <p className="text-xs text-red-400">Atrasada</p>}
                        </>
                      );
                    })()}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${PRIORIDAD_COLOR[a.prioridad]}`}>
                      {PRIORIDAD_LABEL[a.prioridad]}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {a.estado === 'pendiente' && (
                        <button
                          onClick={() => onCompletar(a.id)}
                          title="Marcar como completada"
                          className="p-2 rounded-lg text-gray-400 hover:text-neon-green-light hover:bg-neon-green-light/10 transition-all hover:cursor-pointer"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onEditar(a)}
                        title="Editar"
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:cursor-pointer"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onEliminar(a.id)}
                        title="Eliminar"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}

            {filtradas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                  {actividades.length === 0
                    ? 'No hay actividades registradas. Crea la primera.'
                    : 'Sin resultados para el filtro seleccionado.'}
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

export default ListaActividades;
