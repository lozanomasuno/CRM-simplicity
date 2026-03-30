"use client";
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useLeadsStore } from '@/store/leadsStore';

export const AlertasLeads = () => {
  const leads      = useLeadsStore((state) => state.leads);
  const actividades = useLeadsStore((state) => state.actividades);

  // Derivado reactivo: leads sin actividad en los últimos 3 días
  const leadsInactivos = React.useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 3);
    return leads.filter((l) => {
      if (l.estado === 'cerrado') return false;
      const ref = l.ultimaActividad ?? l.createdAt;
      return new Date(ref) < limite;
    });
  }, [leads, actividades]);

  return (
    <div className="bg-white dark:bg-mouse-gray p-6 rounded-3xl border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-gray-800 dark:text-white">Sin seguimiento</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            leadsInactivos.length > 0
              ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400'
              : 'bg-neon-green-light/10 text-neon-green-light'
          }`}
        >
          {leadsInactivos.length} {leadsInactivos.length === 1 ? 'alerta' : 'alertas'}
        </span>
      </div>

      <div className="space-y-4">
        {leadsInactivos.length === 0 ? (
          <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-mouse-gray-dark border border-transparent">
            <div className="p-2 rounded-xl bg-neon-green-light/10 text-neon-green-light">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Todo al día</p>
              <span className="text-xs text-gray-500">Todos los leads tienen actividad reciente</span>
            </div>
          </div>
        ) : (
          leadsInactivos.map((lead) => {
            const ref  = lead.ultimaActividad ?? lead.createdAt;
            const dias = Math.floor((Date.now() - new Date(ref).getTime()) / 86_400_000);
            return (
              <div
                key={lead.id}
                className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-mouse-gray-dark border border-transparent hover:border-orange-300/50 transition-all"
              >
                <div className="p-2 rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400 shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.nombre}</p>
                  <span className="text-xs text-gray-500">
                    Sin actividad hace {dias} {dias === 1 ? 'día' : 'días'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
