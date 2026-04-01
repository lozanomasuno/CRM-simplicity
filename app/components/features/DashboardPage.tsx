"use client";
import React, { useEffect } from 'react';
import {
  Users, CheckCircle2, AlertTriangle, TrendingUp,
  CalendarClock, Target, UserX, Activity, Bell,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { GraficoVentas } from './GraficoVentas';
import TablaVendedores from './TablaVendedores';
import { useLeadsStore } from '@/store/leadsStore';
import { useVendedoresStore } from '@/store/vendedoresStore';
import { useActividadesStore } from '@/store/actividadesStore';
import { vendedorSeeds } from '@/data/seeds';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Small stat card ──────────────────────────────────────────
const KpiCard = ({
  label, value, sub, icon, accent = false, warn = false,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent?: boolean; warn?: boolean;
}) => {
  let borderCls = 'border-gray-100 dark:border-gray-700';
  if (warn)   borderCls = 'border-red-300 dark:border-red-700';
  else if (accent) borderCls = 'border-neon-green-light/40';

  let iconCls = 'bg-gray-100 dark:bg-mouse-gray-dark text-gray-500';
  if (warn)   iconCls = 'bg-red-100 dark:bg-red-900/20 text-red-500';
  else if (accent) iconCls = 'bg-neon-green-light/10 text-neon-green-light';

  return (
    <div className={`bg-white dark:bg-mouse-gray rounded-2xl border p-5 shadow-sm flex items-start gap-4 ${borderCls}`}>
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconCls}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-1">{label}</p>
        <p className={`text-2xl font-black leading-none ${warn ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Estado pill ──────────────────────────────────────────────
const ALERT_ICON_CLS: Record<string, string> = {
  urgente: 'bg-red-100 dark:bg-red-900/30 text-red-500',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500',
  info:    'bg-neon-green-light/10 text-neon-green-light',
};

const ESTADO_COLOR: Record<string, string> = {
  nuevo:      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  contactado: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  interesado: 'bg-neon-green-light/10 text-neon-green-light',
  cerrado:    'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};
const ESTADO_LABEL: Record<string, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', interesado: 'Interesado', cerrado: 'Cerrado',
};

// ─── Component ────────────────────────────────────────────────
const DashboardPage = () => {
  const seedLeads       = useLeadsStore((s) => s.seedIfEmpty);
  const seedActividades = useActividadesStore((s) => s.seedIfEmpty);
  const leadsLoading    = useLeadsStore((s) => s.loading);
  const leadsError      = useLeadsStore((s) => s.error);
  const actLoading      = useActividadesStore((s) => s.loading);
  const actError        = useActividadesStore((s) => s.error);
  const clearLeadsError = useLeadsStore((s) => s.clearError);
  const clearActError   = useActividadesStore((s) => s.clearError);
  const seedVendedores  = useVendedoresStore((s) => s.seedIfEmpty);

  useEffect(() => {
    void seedLeads();
    seedVendedores(vendedorSeeds);
    void seedActividades();
  }, [seedLeads, seedVendedores, seedActividades]);

  const m = useDashboard();

  // Chart data: activity trend this week
  const barData = m.graficoSemana;

  // Conversion funnel data for GraficoVentas (mes-based from weekly activity)
  const graficoData = m.graficoSemana.map((d) => ({
    mes: d.dia,
    ventas: d.completadas * 1000 + d.pendientes * 400, // representational value
  }));

  return (
    <div className="space-y-6">
      {(leadsLoading || actLoading) && (
        <p className="text-sm text-gray-500">Cargando datos del dashboard...</p>
      )}
      {leadsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{leadsError}</p>
          <button className="mt-2 font-semibold underline" onClick={clearLeadsError}>Cerrar</button>
        </div>
      )}
      {actError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{actError}</p>
          <button className="mt-2 font-semibold underline" onClick={clearActError}>Cerrar</button>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Panel de Control</h1>
        <p className="text-gray-500 text-sm">Métricas calculadas en tiempo real desde el estado global.</p>
      </div>

      {/* ── KPI Row 1: Leads ───────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Leads</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Leads"    value={m.totalLeads}       sub="Registrados"           icon={<Users size={18}/>} />
          <KpiCard label="Nuevos hoy"     value={m.leadsHoy}         sub="Ingresados hoy"        icon={<Users size={18}/>} accent={m.leadsHoy > 0} />
          <KpiCard label="Esta semana"    value={m.leadsRecientes}   sub="Últimos 7 días"        icon={<TrendingUp size={18}/>} />
          <KpiCard label="Sin seguim."    value={m.sinSeguimiento}   sub="+3 días sin contacto"  icon={<UserX size={18}/>} warn={m.sinSeguimiento > 0} />
        </div>
      </div>

      {/* ── KPI Row 2: Actividades ─────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Actividades</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total"       value={m.totalActividades} sub="En el sistema"           icon={<Activity size={18}/>} />
          <KpiCard label="Completadas" value={m.completadas}      sub={`${m.pendientes} pendientes`} icon={<CheckCircle2 size={18}/>} accent />
          <KpiCard label="Vencidas"    value={m.vencidas}         sub="Sin completar a tiempo"  icon={<AlertTriangle size={18}/>} warn={m.vencidas > 0} />
          <KpiCard label="Hoy"         value={m.actHoy}           sub="Programadas para hoy"    icon={<CalendarClock size={18}/>} accent={m.actHoy > 0} />
        </div>
      </div>

      {/* ── KPI Row 3: Ventas ──────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ventas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="Ingresos totales" value={`$${m.totalVentas.toLocaleString()}`} sub="Suma del equipo" icon={<TrendingUp size={18}/>} accent />
          <KpiCard label="Tasa de cierre"   value={`${m.conversion}%`} sub="Leads → cerrado"    icon={<Target size={18}/>} warn={m.conversion < 20 && m.totalLeads >= 5} />
          <KpiCard label="Vendedores"       value={m.vendedoresConMeta.length} sub="Activos"     icon={<Users size={18}/>} />
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: activity bar chart + team table */}
        <div className="lg:col-span-2 space-y-6">

          {/* Weekly activity bar chart */}
          <div className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-base font-black text-gray-800 dark:text-white mb-1">Actividad — últimos 7 días</h3>
            <p className="text-xs text-gray-400 mb-4">Completadas (verde) vs Pendientes (gris)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barGap={2} barCategoryGap="30%">
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="completadas" name="Completadas" fill="#4ade80" radius={[4,4,0,0]} />
                <Bar dataKey="pendientes"  name="Pendientes"  fill="#374151" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leads por estado funnel */}
          <div className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-base font-black text-gray-800 dark:text-white mb-4">Pipeline de Leads</h3>
            <div className="space-y-3">
              {(Object.entries(m.leadsPorEstado) as [string, number][]).map(([estado, qty]) => {
                const pct = m.totalLeads > 0 ? Math.round((qty / m.totalLeads) * 100) : 0;
                return (
                  <div key={estado} className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-24 text-center flex-shrink-0 ${ESTADO_COLOR[estado]}`}>
                      {ESTADO_LABEL[estado]}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-green-light transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-500 w-8 text-right">{qty}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team table */}
          <TablaVendedores vendedoresData={m.vendedoresConMeta} />
        </div>

        {/* Right: alerts + leads without follow-up */}
        <div className="space-y-5">

          {/* Alerts panel */}
          <div className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-gray-800 dark:text-white">Alertas</h3>
              <span className="bg-neon-green-light/10 text-neon-green-light px-2.5 py-0.5 rounded-full text-xs font-bold">
                {m.alertas.length} activas
              </span>
            </div>
            {m.alertas.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin alertas activas 🎉</p>
            ) : (
              <div className="space-y-3">
                {m.alertas.map((a) => (
                  <div key={a.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-mouse-gray-dark border border-transparent hover:border-neon-green-light/20 transition-all">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 self-start ${ALERT_ICON_CLS[a.tipo]}`}>
                      {a.tipo === 'info' ? <Bell size={14} /> : <AlertTriangle size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">{a.mensaje}</p>
                      {a.detalle && <p className="text-xs text-gray-400 mt-0.5 truncate">{a.detalle}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leads sin seguimiento */}
          {m.sinSeguimientoLeads.length > 0 && (
            <div className="bg-white dark:bg-mouse-gray rounded-2xl border border-red-200 dark:border-red-800/40 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-black text-gray-800 dark:text-white">Requieren atención</h3>
                <span className="bg-red-100 dark:bg-red-900/20 text-red-500 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Sin contacto 3d+
                </span>
              </div>
              <div className="space-y-2">
                {m.sinSeguimientoLeads.map((l) => (
                  <div key={l.id} className="flex items-center gap-2.5 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      {l.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{l.nombre}</p>
                      <p className={`text-[10px] ${ESTADO_COLOR[l.estado]} font-bold`}>
                        {ESTADO_LABEL[l.estado]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion gauge */}
          <div className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 dark:text-white mb-3">Tasa de Conversión</h3>
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-black ${m.conversion < 20 && m.totalLeads >= 5 ? 'text-red-500' : 'text-neon-green-light'}`}>
                {m.conversion}%
              </span>
              <span className="text-xs text-gray-400 mb-1">leads → cerrados</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${m.conversion < 20 ? 'bg-red-400' : 'bg-neon-green-light'}`}
                style={{ width: `${Math.min(m.conversion, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {m.leadsPorEstado.cerrado} de {m.totalLeads} leads cerrados
            </p>
          </div>

          {/* Tendencia (uses recharts GraficoVentas) */}
          <GraficoVentas data={graficoData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
