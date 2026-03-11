"use client";
import React from 'react';
import { Bell, AlertTriangle} from 'lucide-react';
import { INITIAL_DATA } from '@/data/mockData';

export const AlertasCRM = () => {
  return (
    <div className="bg-white dark:bg-mouse-gray p-6 rounded-3xl border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-gray-800 dark:text-white">Alertas del Sistema</h3>
        <span className="bg-neon-green-light/10 text-neon-green-light px-3 py-1 rounded-full text-xs font-bold">
          {INITIAL_DATA.alertas.length} Activas
        </span>
      </div>

      <div className="space-y-4">
        {INITIAL_DATA.alertas.map((alerta) => (
          <div key={alerta.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-mouse-gray-dark border border-transparent hover:border-neon-green-light/30 transition-all">
            <div className={`p-2 rounded-xl ${
              alerta.tipo === 'urgente' ? 'bg-red-100 text-red-500' : 'bg-neon-green-light/10 text-neon-green-light'
            }`}>
              {alerta.tipo === 'urgente' ? <AlertTriangle size={18} /> : <Bell size={18} />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alerta.mensaje}</p>
              <span className="text-xs text-gray-500">{alerta.tiempo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};