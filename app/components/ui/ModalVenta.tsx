"use client";
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nombre: string, monto: number) => void;
}

export const ModalVenta = ({ isOpen, onClose, onSave }: ModalProps) => {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");

  const onCloseModal = () => {
      setNombre(""); 
      setMonto("");
      onClose();
  };
  if (!isOpen) return null;

  const manejarEnvio = () => {
    if (nombre && monto) {
      onSave(nombre, Number(monto));
      setNombre(""); 
      setMonto("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-mouse-gray w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Registrar Venta</h3>
          <button onClick={onCloseModal} className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Nombre del Vendedor</label>
            <input 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full mt-1 bg-gray-50 dark:bg-mouse-gray-dark p-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-neon-green-light outline-none" 
              placeholder="Ej. Javier Cartagena"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Monto de Venta ($)</label>
            <input 
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full mt-1 bg-gray-50 dark:bg-mouse-gray-dark p-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-neon-green-light outline-none" 
              placeholder="5000"
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <button onClick={onCloseModal} className="flex-1 py-3 text-gray-500 font-bold  hover:cursor-pointer">Cancelar</button>
          <button 
            onClick={manejarEnvio}
            className="inline-flex px-4 justify-center items-center bg-neon-green-light text-mouse-gray py-3 rounded-xl font-black shadow-lg"
          >
            <Save size={20} className="ml-2" /> 
            <span>Guardar</span>            
          </button>
        </div>
      </div>
    </div>
  );
};