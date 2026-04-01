"use client";
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useActividadesStore } from '@/store/actividadesStore';
import {
  ActividadData,
  TipoActividadCRM,
  EstadoActividad,
  PrioridadActividad,
  TIPO_LABEL,
  PRIORIDAD_LABEL,
} from '@/data/models';
import { useLeadsStore } from '@/store/leadsStore';
import { useVendedoresStore } from '@/store/vendedoresStore';

interface ModalActividadProps {
  isOpen: boolean;
  onClose: () => void;
  actividad?: ActividadData;
  initialLeadId?: string;
  initialFecha?: string;
}

const TIPOS: TipoActividadCRM[]     = ['llamada', 'nota', 'mensaje', 'seguimiento', 'tarea'];
const PRIORIDADES: PrioridadActividad[] = ['alta', 'media', 'baja'];

const inputClass =
  'w-full mt-1 bg-gray-50 dark:bg-mouse-gray-dark p-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-neon-green-light outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm';

// datetime-local ↔ ISO helpers (timezone-aware)
const toDatetimeLocal = (iso: string): string => {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

const fromDatetimeLocal = (val: string): string => new Date(val).toISOString();

export const ModalActividad = ({ isOpen, onClose, actividad, initialLeadId, initialFecha }: ModalActividadProps) => {
  const { addActividad, updateActividad } = useActividadesStore();
  const loading = useActividadesStore((state) => state.loading);
  let submitLabel = 'Guardar';
  if (loading) submitLabel = 'Guardando...';
  else if (actividad) submitLabel = 'Actualizar';
  const leads     = useLeadsStore((state) => state.leads);
  const vendedores = useVendedoresStore((state) => state.vendedores);

  const [tipo,        setTipo]        = useState<TipoActividadCRM>('llamada');
  const [descripcion, setDescripcion] = useState('');
  const [fecha,       setFecha]       = useState('');
  const [prioridad,   setPrioridad]   = useState<PrioridadActividad>('media');
  const [leadId,      setLeadId]      = useState('');
  const [vendedorId,  setVendedorId]  = useState('');

  useEffect(() => {
    if (actividad) {
      setTipo(actividad.tipo);
      setDescripcion(actividad.descripcion);
      setFecha(toDatetimeLocal(actividad.fecha));
      setPrioridad(actividad.prioridad);
      setLeadId(actividad.leadId ?? '');
      setVendedorId(actividad.vendedorId ?? '');
    } else {
      setTipo('llamada');
      setDescripcion('');
      if (initialFecha) {
        setFecha(toDatetimeLocal(initialFecha));
      } else {
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        manana.setHours(9, 0, 0, 0);
        setFecha(toDatetimeLocal(manana.toISOString()));
      }
      setPrioridad('media');
      setLeadId(initialLeadId ?? '');
      setVendedorId('');
    }
  }, [actividad, initialLeadId, initialFecha, isOpen]);

  const handleClose = () => onClose();

  const handleSubmit = async () => {
    if (!descripcion.trim() || !fecha) return;
    const data = {
      tipo,
      descripcion: descripcion.trim(),
      fecha:       fromDatetimeLocal(fecha),
      prioridad,
      estado:      'pendiente' as EstadoActividad,
      leadId:      leadId     || undefined,
      vendedorId:  vendedorId || undefined,
    };
    if (actividad) {
      updateActividad(actividad.id, data);
      handleClose();
    } else {
      const ok = await addActividad(data);
      if (!ok) return;
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-mouse-gray w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {actividad ? 'Editar Actividad' : 'Nueva Actividad'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label htmlFor="act-tipo" className="text-xs font-bold text-gray-400 uppercase">Tipo</label>
            <select id="act-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoActividadCRM)} className={inputClass}>
              {TIPOS.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="act-descripcion" className="text-xs font-bold text-gray-400 uppercase">Descripción *</label>
            <textarea
              id="act-descripcion"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="¿Qué se debe hacer?"
            />
          </div>

          <div>
            <label htmlFor="act-fecha" className="text-xs font-bold text-gray-400 uppercase">Fecha y hora *</label>
            <input
              id="act-fecha"
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="act-prioridad" className="text-xs font-bold text-gray-400 uppercase">Prioridad</label>
            <select id="act-prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value as PrioridadActividad)} className={inputClass}>
              {PRIORIDADES.map((p) => <option key={p} value={p}>{PRIORIDAD_LABEL[p]}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="act-lead" className="text-xs font-bold text-gray-400 uppercase">Lead asociado (opcional)</label>
            <select id="act-lead" value={leadId} onChange={(e) => setLeadId(e.target.value)} className={inputClass}>
              <option value="">Sin lead</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="act-vendedor" className="text-xs font-bold text-gray-400 uppercase">Vendedor (opcional)</label>
            <select id="act-vendedor" value={vendedorId} onChange={(e) => setVendedorId(e.target.value)} className={inputClass}>
              <option value="">Sin vendedor</option>
              {vendedores.map((v) => <option key={String(v.id)} value={String(v.id)}>{v.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3 shrink-0">
          <button onClick={handleClose} className="flex-1 py-3 text-gray-500 font-bold hover:cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!descripcion.trim() || !fecha || loading}
            className="inline-flex px-6 justify-center items-center gap-2 bg-neon-green-light text-mouse-gray py-3 rounded-xl font-black shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer"
          >
            <Save size={18} />
            <span>{submitLabel}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
