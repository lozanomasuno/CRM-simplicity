"use client";
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useLeadsStore, EstadoLead, Lead } from '@/store/leadsStore';

interface ModalLeadProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
}

const ESTADOS: { value: EstadoLead; label: string }[] = [
  { value: 'nuevo',      label: 'Nuevo'      },
  { value: 'contactado', label: 'Contactado' },
  { value: 'interesado', label: 'Interesado' },
  { value: 'cerrado',    label: 'Cerrado'    },
];

const inputClass =
  'w-full mt-1 bg-gray-50 dark:bg-mouse-gray-dark p-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-neon-green-light outline-none text-gray-900 dark:text-white placeholder:text-gray-400';

function getInitialFormState(lead?: Lead) {
  return {
    nombre: lead?.nombre ?? '',
    telefono: lead?.telefono ?? '',
    email: lead?.email ?? '',
    estado: lead?.estado ?? ('nuevo' as EstadoLead),
  };
}

export const ModalLead = ({ isOpen, onClose, lead }: ModalLeadProps) => {
  const { addLead, updateLead } = useLeadsStore();
  const loading = useLeadsStore((state) => state.loading);
  let submitLabel = 'Guardar';
  if (loading) submitLabel = 'Guardando...';
  else if (lead) submitLabel = 'Actualizar';
  const initialState = getInitialFormState(lead);
  const [nombre,   setNombre]   = useState(initialState.nombre);
  const [telefono, setTelefono] = useState(initialState.telefono);
  const [email,    setEmail]    = useState(initialState.email);
  const [estado,   setEstado]   = useState<EstadoLead>(initialState.estado);

  const handleClose = () => {
    setNombre(''); setTelefono(''); setEmail(''); setEstado('nuevo');
    onClose();
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !telefono.trim()) return;
    let ok = false;
    if (lead) {
      ok = await updateLead(lead.id, {
        nombre:   nombre.trim(),
        telefono: telefono.trim(),
        email:    email.trim() || undefined,
        estado,
      });
    } else {
      ok = await addLead({
        nombre:   nombre.trim(),
        telefono: telefono.trim(),
        email:    email.trim() || undefined,
        estado,
      });
    }
    if (ok) handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-mouse-gray w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">

        <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {lead ? 'Editar Lead' : 'Nuevo Lead'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="lead-nombre" className="text-xs font-bold text-gray-400 uppercase">Nombre *</label>
            <input
              id="lead-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div>
            <label htmlFor="lead-telefono" className="text-xs font-bold text-gray-400 uppercase">Teléfono *</label>
            <input
              id="lead-telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className={inputClass}
              placeholder="Ej. +57 300 123 4567"
            />
          </div>
          <div>
            <label htmlFor="lead-email" className="text-xs font-bold text-gray-400 uppercase">Email (opcional)</label>
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="juan@ejemplo.com"
            />
          </div>
          <div>
            <label htmlFor="lead-estado" className="text-xs font-bold text-gray-400 uppercase">Estado</label>
            <select
              id="lead-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoLead)}
              className={inputClass}
            >
              {ESTADOS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 text-gray-500 font-bold hover:cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!nombre.trim() || !telefono.trim() || loading}
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
