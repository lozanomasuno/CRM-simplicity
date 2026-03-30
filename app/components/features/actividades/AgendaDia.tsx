"use client";
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Pencil } from 'lucide-react';
import type { ActividadData } from '@/data/models';
import { ActividadModel, TIPO_LABEL } from '@/data/models';
import { useActividadesStore } from '@/store/actividadesStore';

// ─── Constants ────────────────────────────────────────────────
const START_HOUR = 7;
const END_HOUR   = 22;
const SLOT_H     = 56; // px per hour slot

// ─── Props ────────────────────────────────────────────────────
interface AgendaDiaProps {
  fecha: Date;
  onCrear: (fechaISO: string) => void;
  onEditar: (actividad: ActividadData) => void;
}

// ─── Component ────────────────────────────────────────────────
const AgendaDia = ({ fecha, onCrear, onEditar }: AgendaDiaProps) => {
  const actividades        = useActividadesStore((s) => s.actividades);
  const reagendarActividad = useActividadesStore((s) => s.reagendarActividad);
  const completarActividad = useActividadesStore((s) => s.completarActividad);

  // Hydration-safe current time (updates every minute)
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const isToday = now ? fecha.toDateString() === now.toDateString() : false;
  const nowFrac = now ? now.getHours() + now.getMinutes() / 60 : -1;

  // DnD state
  const [dragId,       setDragId]       = useState<string | null>(null);
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  const nowLineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current time when viewing today
  useEffect(() => {
    if (isToday && nowLineRef.current) {
      nowLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isToday]);

  // Activities that belong to this day
  const actividadesDelDia = useMemo(() => {
    const dayStart = new Date(fecha); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(fecha); dayEnd.setHours(23, 59, 59, 999);
    return actividades.filter((a) => {
      const d = new Date(a.fecha);
      return d >= dayStart && d <= dayEnd;
    });
  }, [actividades, fecha]);

  // ── DnD handlers ──────────────────────────────────────────
  const handleDrop = (hour: number) => {
    if (!dragId) return;
    const act = actividades.find((a) => a.id === dragId);
    if (!act) return;
    const orig  = new Date(act.fecha);
    const newDt = new Date(fecha);
    newDt.setHours(hour, orig.getMinutes(), 0, 0);
    const dur    = act.fechaFin
      ? new Date(act.fechaFin).getTime() - orig.getTime()
      : 60 * 60 * 1000;
    reagendarActividad(act.id, newDt.toISOString(), new Date(newDt.getTime() + dur).toISOString());
    setDragId(null);
    setDragOverHour(null);
  };

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div className="overflow-y-auto" style={{ maxHeight: '640px' }}>
      {hours.map((h) => {
        const slotActs     = actividadesDelDia.filter((a) => new Date(a.fecha).getHours() === h);
        const isDragTarget = dragOverHour === h && !!dragId;
        const isNowHour    = isToday && Math.floor(nowFrac) === h;

        return (
          <div
            key={h}
            role="none"
            className={`relative flex items-start border-b border-gray-100 dark:border-gray-700/40 transition-colors ${
              isDragTarget ? 'bg-neon-green-light/5' : ''
            }`}
            style={{ minHeight: `${SLOT_H}px` }}
            onDragOver={(e) => { e.preventDefault(); setDragOverHour(h); }}
            onDragLeave={(e) => {
              if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverHour(null);
              }
            }}
            onDrop={() => handleDrop(h)}
          >
            {/* ── Hour label ─────────────────────────────── */}
            <span className="w-12 pt-2 flex-shrink-0 text-right pr-3 text-[10px] font-mono text-gray-400 leading-none select-none">
              {String(h).padStart(2, '0')}:00
            </span>

            {/* ── Slot content (click = create) ──────────── */}
            {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
            <div
              role="button"
              tabIndex={0}
              className="flex-1 py-1 pr-2 space-y-1 cursor-pointer"
              onClick={() => {
                const d = new Date(fecha);
                d.setHours(h, 0, 0, 0);
                onCrear(d.toISOString());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const d = new Date(fecha); d.setHours(h, 0, 0, 0); onCrear(d.toISOString());
                }
              }}
            >
              {/* Drop zone ghost indicator */}
              {isDragTarget && (
                <div className="h-7 rounded-lg border-2 border-dashed border-neon-green-light/40 flex items-center justify-center">
                  <span className="text-[9px] text-neon-green-light">
                    Mover a las {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              )}

              {/* Activity cards */}
              {slotActs.map((a) => {
                const atrasada = new ActividadModel(a).esAtrasada();
                let cardCls: string;
                if (a.estado === 'completado') {
                  cardCls = 'bg-gray-100 dark:bg-gray-700/40 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600';
                } else if (atrasada) {
                  cardCls = 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-400';
                } else {
                  cardCls = 'bg-neon-green-light/10 text-gray-800 dark:text-gray-100 border-neon-green-light';
                }

                return (
                  // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
                  <div
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    draggable
                    onDragStart={(e) => { e.stopPropagation(); setDragId(a.id); }}
                    onDragEnd={() => { setDragId(null); setDragOverHour(null); }}
                    onClick={(e) => { e.stopPropagation(); onEditar(a); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onEditar(a); } }}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border-l-2 cursor-grab active:cursor-grabbing select-none transition-all ${
                      dragId === a.id ? 'opacity-30' : ''
                    } ${a.estado === 'completado' ? 'line-through' : ''} ${cardCls}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate leading-tight">
                        <span className="opacity-50 text-[9px] uppercase font-bold mr-1">
                          {TIPO_LABEL[a.tipo]}
                        </span>
                        {a.descripcion}
                      </span>
                      {/* Action buttons — stop propagation to parent click */}
                      <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditar(a)}
                          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                          title="Editar"
                        >
                          <Pencil size={9} />
                        </button>
                        {a.estado === 'pendiente' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); completarActividad(a.id); }}
                            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                            title="Completar"
                          >
                            <CheckCircle2 size={9} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[9px] opacity-50 mt-0.5 leading-none">
                      {new Date(a.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ── Current-time indicator ─────────────────── */}
            {isNowHour && (
              <div
                ref={nowLineRef}
                className="absolute left-0 right-0 pointer-events-none z-10"
                style={{ top: `${(nowFrac - h) * SLOT_H}px` }}
              >
                <div className="flex items-center">
                  <span className="text-[8px] text-neon-green-light font-mono w-12 text-right pr-2 flex-shrink-0 leading-none">
                    {now?.getHours().toString().padStart(2, '0')}:
                    {now?.getMinutes().toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1 h-[1px] bg-neon-green-light" />
                  <div className="w-2 h-2 rounded-full bg-neon-green-light flex-shrink-0 -ml-1" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AgendaDia;
