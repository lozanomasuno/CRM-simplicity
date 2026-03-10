"use client";
import React from 'react';
import { X, Save } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalVenta = ({ isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-mouse-gray border border-gray-200 dark:border-gray-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Encabezado del Modal */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Nueva Venta</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
            <input className="w-full bg-gray-50 dark:bg-mouse-gray-dark border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-neon-green-light outline-none transition-all" placeholder="Nombre del cliente..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto ($)</label>
            <input type="number" className="w-full bg-gray-50 dark:bg-mouse-gray-dark border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-neon-green-light outline-none transition-all" placeholder="0.00" />
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">Cancelar</button>
          <button className="flex items-center gap-2 bg-neon-green-light text-mouse-gray px-6 py-2 rounded-xl font-black shadow-[0_0_15px_#39ff14] hover:scale-105 transition-transform">
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};