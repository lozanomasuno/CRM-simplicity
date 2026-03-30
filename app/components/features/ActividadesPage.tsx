"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ListChecks, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useActividadesStore } from '@/store/actividadesStore';
import type { ActividadData } from '@/data/models';
import { actividadSeeds } from '@/data/seeds';
import { ActividadModel } from '@/data/models';
import ListaActividades from './actividades/ListaActividades';
import { ModalActividad } from './actividades/ModalActividad';

const ActividadesPage = () => {
  const actividades        = useActividadesStore((state) => state.actividades);
  const seedIfEmpty        = useActividadesStore((state) => state.seedIfEmpty);
  const completarActividad = useActividadesStore((state) => state.completarActividad);
  const eliminarActividad  = useActividadesStore((state) => state.eliminarActividad);

  useEffect(() => { seedIfEmpty(actividadSeeds); }, [seedIfEmpty]);

  const [isModalOpen,       setIsModalOpen]       = useState(false);
  const [actividadEditar,   setActividadEditar]   = useState<ActividadData | undefined>(undefined);

  const metricas = useMemo(() => {
    const ahora    = new Date();
    const hoyStart = new Date(); hoyStart.setHours(0, 0, 0, 0);
    const hoyEnd   = new Date(); hoyEnd.setHours(23, 59, 59, 999);
    return {
      total:          actividades.length,
      pendientes:     actividades.filter((a) => a.estado === 'pendiente' && new Date(a.fecha) >= ahora).length,
      atrasadas:      actividades.filter((a) => a.estado === 'pendiente' && new Date(a.fecha) < ahora).length,
      completadasHoy: actividades.filter((a) => {
        const f = new Date(a.fecha);
        return a.estado === 'completado' && f >= hoyStart && f <= hoyEnd;
      }).length,
    };
  }, [actividades]);

  const atrasadas = useMemo(
    () => actividades.filter((a) => new ActividadModel(a).esAtrasada()),
    [actividades]
  );

  const handleEditar = (a: ActividadData) => {
    setActividadEditar(a);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActividadEditar(undefined);
  };

  const METRICAS_CONFIG = [
    { label: 'Total',           value: metricas.total,          icon: <ListChecks size={20} />,   iconColor: 'text-gray-500'         },
    { label: 'Pendientes',      value: metricas.pendientes,     icon: <Clock size={20} />,         iconColor: 'text-blue-500'         },
    { label: 'Atrasadas',       value: metricas.atrasadas,      icon: <AlertTriangle size={20} />, iconColor: 'text-red-500'          },
    { label: 'Completadas hoy', value: metricas.completadasHoy, icon: <CheckCircle size={20} />,   iconColor: 'text-neon-green-light' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">CRM · Actividades</h1>
          <p className="text-gray-500 text-sm">Gestiona y programa todas las actividades del equipo.</p>
        </div>
        <button
          onClick={() => { setActividadEditar(undefined); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-neon-green-light text-mouse-gray px-6 py-3 rounded-xl font-black shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 transition-all hover:cursor-pointer"
        >
          <Plus size={20} />
          Nueva Actividad
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {METRICAS_CONFIG.map((m) => (
          <div
            key={m.label}
            className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-400 uppercase">{m.label}</p>
            <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{m.value}</p>
            <div className={`mt-3 flex items-center gap-1 ${m.iconColor}`}>
              {m.icon}
              <span className="text-xs font-medium">actividades</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">
          <ListaActividades
            actividades={actividades}
            onEditar={handleEditar}
            onCompletar={completarActividad}
            onEliminar={eliminarActividad}
          />
        </div>

        {/* Panel de alertas */}
        <div>
          <div className="bg-white dark:bg-mouse-gray p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-800 dark:text-white">Atrasadas</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  atrasadas.length > 0
                    ? 'bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-neon-green-light/10 text-neon-green-light'
                }`}
              >
                {atrasadas.length} {atrasadas.length === 1 ? 'alerta' : 'alertas'}
              </span>
            </div>

            <div className="space-y-3">
              {atrasadas.length === 0 ? (
                <div className="flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-mouse-gray-dark border border-transparent">
                  <div className="p-2 rounded-xl bg-neon-green-light/10 text-neon-green-light shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Todo al día</p>
                    <span className="text-xs text-gray-500">Sin actividades vencidas</span>
                  </div>
                </div>
              ) : (
                atrasadas.map((a) => {
                  const dias = Math.floor((Date.now() - new Date(a.fecha).getTime()) / 86_400_000);
                  return (
                    <div
                      key={a.id}
                      className="flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-mouse-gray-dark border border-transparent hover:border-red-300/50 transition-all"
                    >
                      <div className="p-2 rounded-xl bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400 shrink-0">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{a.descripcion}</p>
                        <span className="text-xs text-gray-500">
                          Atrasada {dias} {dias === 1 ? 'día' : 'días'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      <ModalActividad
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        actividad={actividadEditar}
      />
    </div>
  );
};

export default ActividadesPage;
