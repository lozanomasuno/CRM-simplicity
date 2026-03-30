"use client";
import React, { useState } from 'react';
import { X, Phone, MessageSquare, FileText, Clock, Plus } from 'lucide-react';
import { useLeadsStore, Lead, EstadoLead, TipoActividad } from '@/store/leadsStore';

const ESTADO_CONFIG: Record<EstadoLead, { label: string; color: string }> = {
  nuevo:      { label: 'Nuevo',      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'         },
  contactado: { label: 'Contactado', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
  interesado: { label: 'Interesado', color: 'bg-neon-green-light/10 text-neon-green-light'                              },
  cerrado:    { label: 'Cerrado',    color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'             },
};

const TIPO_ICON: Record<TipoActividad, React.ReactNode> = {
  llamada:     <Phone size={13} />,
  nota:        <FileText size={13} />,
  mensaje:     <MessageSquare size={13} />,
  seguimiento: <Clock size={13} />,
};

const TIPO_LABEL: Record<TipoActividad, string> = {
  llamada: 'Llamada', nota: 'Nota', mensaje: 'Mensaje', seguimiento: 'Seguimiento',
};

const TIPO_COLOR: Record<TipoActividad, string> = {
  llamada:     'bg-blue-400',
  nota:        'bg-purple-400',
  mensaje:     'bg-yellow-400',
  seguimiento: 'bg-neon-green-light',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const inputClass =
  'w-full mt-1 bg-gray-50 dark:bg-mouse-gray-dark p-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-neon-green-light outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm';

export const ModalDetalleLead = ({ isOpen, onClose, lead }: Props) => {
  const { changeLeadStatus, addActividad } = useLeadsStore();

  // Selectors primitivos — nunca crean referencias nuevas
  const allLeads      = useLeadsStore((state) => state.leads);
  const allActividades = useLeadsStore((state) => state.actividades);

  // Derivados con useMemo para evitar re-renders infinitos
  const liveLead = React.useMemo(
    () => (lead ? (allLeads.find((l) => l.id === lead.id) ?? lead) : null),
    [allLeads, lead]
  );

  const actividades = React.useMemo(
    () =>
      lead
        ? allActividades
            .filter((a) => a.leadId === lead.id)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        : [],
    [allActividades, lead]
  );

  const [tipo,        setTipo]        = useState<TipoActividad>('llamada');
  const [descripcion, setDescripcion] = useState('');
  const [showForm,    setShowForm]    = useState(false);

  const handleClose = () => {
    setDescripcion(''); setShowForm(false); setTipo('llamada');
    onClose();
  };

  const handleAddActividad = () => {
    if (!descripcion.trim() || !lead) return;
    addActividad({ leadId: lead.id, tipo, descripcion: descripcion.trim() });
    setDescripcion('');
    setShowForm(false);
  };

  if (!isOpen || !liveLead) return null;

  const initials = liveLead.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-mouse-gray w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 flex justify-between items-start border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-green-light/10 flex items-center justify-center text-neon-green-light font-bold border border-neon-green-light/20 text-sm shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">{liveLead.nombre}</h3>
              <p className="text-sm text-gray-500">
                {liveLead.telefono}{liveLead.email ? ` · ${liveLead.email}` : ''}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:cursor-pointer shrink-0 ml-4">
            <X size={24} />
          </button>
        </div>

        {/* Pipeline */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Pipeline</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(ESTADO_CONFIG) as EstadoLead[]).map((e) => (
              <button
                key={e}
                onClick={() => changeLeadStatus(liveLead.id, e)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all hover:cursor-pointer border
                  ${liveLead.estado === e
                    ? `${ESTADO_CONFIG[e].color} border-current`
                    : 'bg-transparent text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
              >
                {ESTADO_CONFIG[e].label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Actividades ({actividades.length})
            </p>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1 text-xs font-bold text-neon-green-light hover:text-neon-green-light/70 transition-colors hover:cursor-pointer"
            >
              <Plus size={13} />
              Registrar
            </button>
          </div>

          {/* Formulario agregar actividad */}
          {showForm && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-mouse-gray-dark border border-neon-green-light/20 space-y-3 mb-4">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoActividad)}
                className={inputClass}
              >
                {(Object.keys(TIPO_LABEL) as TipoActividad[]).map((t) => (
                  <option key={t} value={t}>{TIPO_LABEL[t]}</option>
                ))}
              </select>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                placeholder="Describe la actividad..."
                className={`${inputClass} resize-none`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowForm(false); setDescripcion(''); }}
                  className="flex-1 py-2 text-gray-500 font-bold text-sm hover:cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddActividad}
                  disabled={!descripcion.trim()}
                  className="flex-1 bg-neon-green-light text-mouse-gray py-2 rounded-xl font-black text-sm disabled:opacity-40 hover:cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          {/* Timeline items */}
          {actividades.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm italic">
              Sin actividades aún. Registra la primera.
            </div>
          ) : (
            <div className="relative space-y-3 pl-2">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-700" />
              {actividades.map((a) => (
                <div key={a.id} className="flex gap-4 relative">
                  <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-white z-10 ${TIPO_COLOR[a.tipo]}`}>
                    {TIPO_ICON[a.tipo]}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{a.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {TIPO_LABEL[a.tipo]} ·{' '}
                      {new Date(a.fecha).toLocaleDateString('es', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
