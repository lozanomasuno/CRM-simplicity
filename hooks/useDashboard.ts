import { useMemo } from 'react';
import { useLeadsStore, Lead, EstadoLead } from '@/store/leadsStore';
import { useActividadesStore } from '@/store/actividadesStore';
import { useVendedoresStore } from '@/store/vendedoresStore';
import { ActividadModel } from '@/data/models';
import type { ActividadData } from '@/data/models';

// ─── Pure calculation functions ───────────────────────────────

export function getLeadsPorEstado(leads: Lead[]): Record<EstadoLead, number> {
  return {
    nuevo:      leads.filter((l) => l.estado === 'nuevo').length,
    contactado: leads.filter((l) => l.estado === 'contactado').length,
    interesado: leads.filter((l) => l.estado === 'interesado').length,
    cerrado:    leads.filter((l) => l.estado === 'cerrado').length,
  };
}

export function getLeadsRecientes(leads: Lead[], diasAtras = 7): Lead[] {
  const cutoff = Date.now() - diasAtras * 86_400_000;
  return leads.filter((l) => new Date(l.createdAt).getTime() >= cutoff);
}

export function getLeadsHoy(leads: Lead[]): number {
  const today = new Date().toDateString();
  return leads.filter((l) => new Date(l.createdAt).toDateString() === today).length;
}

export function getActividadesCompletadas(actividades: ActividadData[]): ActividadData[] {
  return actividades.filter((a) => a.estado === 'completado');
}

export function getActividadesVencidas(actividades: ActividadData[]): ActividadData[] {
  return actividades.filter((a) => new ActividadModel(a).esAtrasada());
}

export function getActividadesHoy(actividades: ActividadData[]): ActividadData[] {
  const today = new Date().toDateString();
  return actividades.filter((a) => new Date(a.fecha).toDateString() === today);
}

export function getConversionRate(leads: Lead[]): number {
  if (leads.length === 0) return 0;
  const cerrados = leads.filter((l) => l.estado === 'cerrado').length;
  return Math.round((cerrados / leads.length) * 100);
}

/**
 * Leads that have no timeline activity from leadsStore AND no CRM activity
 * recorded in actividadesStore within `diasLimite` days.
 */
export function getLeadsSinSeguimiento(
  leads: Lead[],
  actividadesCRM: ActividadData[],
  diasLimite = 3
): Lead[] {
  const cutoff = Date.now() - diasLimite * 86_400_000;
  const leadIdsConActividad = new Set(
    actividadesCRM
      .filter((a) => a.leadId && new Date(a.fecha).getTime() >= cutoff)
      .map((a) => a.leadId!)
  );
  return leads
    .filter((l) => l.estado !== 'cerrado')
    .filter((l) => !leadIdsConActividad.has(l.id));
}

export function getActividadesPorVendedor(
  actividades: ActividadData[],
  vendedorId: string
): ActividadData[] {
  return actividades.filter((a) => a.vendedorId === vendedorId);
}

export function getGraficoActividadesSemana(actividades: ActividadData[]): { dia: string; completadas: number; pendientes: number }[] {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const del_dia = actividades.filter((a) => {
      const t = new Date(a.fecha).getTime();
      return t >= d.getTime() && t < next.getTime();
    });
    return {
      dia:         dias[d.getDay()],
      completadas: del_dia.filter((a) => a.estado === 'completado').length,
      pendientes:  del_dia.filter((a) => a.estado === 'pendiente').length,
    };
  });
}

// ─── Alert generation ─────────────────────────────────────────

export interface DashAlert {
  id: string;
  tipo: 'urgente' | 'warning' | 'info';
  mensaje: string;
  detalle?: string;
}

function alertSinSeguimiento(leads: Lead[], actividades: ActividadData[]): DashAlert | null {
  const sin = getLeadsSinSeguimiento(leads, actividades, 3);
  if (sin.length === 0) return null;
  const nombres = sin.slice(0, 2).map((l) => l.nombre).join(', ') + (sin.length > 2 ? '…' : '');
  return {
    id: 'sin-seguimiento', tipo: 'urgente',
    mensaje: `${sin.length} lead${sin.length > 1 ? 's' : ''} sin seguimiento hace +3 días`,
    detalle: nombres,
  };
}

function alertVencidas(actividades: ActividadData[]): DashAlert | null {
  const n = getActividadesVencidas(actividades).length;
  if (n === 0) return null;
  return {
    id: 'vencidas', tipo: 'urgente',
    mensaje: `${n} actividad${n > 1 ? 'es' : ''} vencida${n > 1 ? 's' : ''} sin completar`,
  };
}

function alertConversion(leads: Lead[]): DashAlert | null {
  const c = getConversionRate(leads);
  if (leads.length < 5 || c >= 20) return null;
  return {
    id: 'conversion-baja', tipo: 'warning',
    mensaje: `Tasa de cierre baja: ${c}%`,
    detalle: 'Menos del 20% de leads han cerrado',
  };
}

function alertNuevosHoy(leads: Lead[]): DashAlert | null {
  const n = getLeadsHoy(leads);
  if (n === 0) return null;
  return {
    id: 'nuevos-hoy', tipo: 'info',
    mensaje: `${n} lead${n > 1 ? 's' : ''} nuevo${n > 1 ? 's' : ''} registrado${n > 1 ? 's' : ''} hoy`,
  };
}

function alertActHoy(actividades: ActividadData[]): DashAlert | null {
  const n = getActividadesHoy(actividades).filter((a) => a.estado === 'pendiente').length;
  if (n === 0) return null;
  return {
    id: 'act-hoy', tipo: 'info',
    mensaje: `${n} actividad${n > 1 ? 'es' : ''} programada${n > 1 ? 's' : ''} para hoy`,
  };
}

export function generarAlertas(leads: Lead[], actividades: ActividadData[]): DashAlert[] {
  return [
    alertSinSeguimiento(leads, actividades),
    alertVencidas(actividades),
    alertConversion(leads),
    alertNuevosHoy(leads),
    alertActHoy(actividades),
  ].filter((a): a is DashAlert => a !== null);
}

// ─── Hook ─────────────────────────────────────────────────────

export function useDashboard() {
  const leads       = useLeadsStore((s) => s.leads);
  const actividades = useActividadesStore((s) => s.actividades);
  const vendedores  = useVendedoresStore((s) => s.vendedores);

  return useMemo(() => {
    const leadsPorEstado     = getLeadsPorEstado(leads);
    const leadsRecientes     = getLeadsRecientes(leads, 7);
    const leadsHoy           = getLeadsHoy(leads);
    const conversion         = getConversionRate(leads);
    const sinSeguimiento     = getLeadsSinSeguimiento(leads, actividades, 3);

    const completadas        = getActividadesCompletadas(actividades);
    const vencidas           = getActividadesVencidas(actividades);
    const actHoy             = getActividadesHoy(actividades);
    const graficoSemana      = getGraficoActividadesSemana(actividades);

    const vendedoresConMeta  = vendedores.map((v) => ({
      ...v,
      porcentajeMeta: Math.min(Math.round((v.ventas / v.meta) * 100), 100),
      ventasTotal:    v.ventas,
    }));
    const totalVentas        = vendedores.reduce((s, v) => s + v.ventas, 0);

    const alertas            = generarAlertas(leads, actividades);

    return {
      // KPIs
      totalLeads:          leads.length,
      leadsHoy,
      leadsRecientes:      leadsRecientes.length,
      leadsPorEstado,
      conversion,
      sinSeguimiento:      sinSeguimiento.length,
      sinSeguimientoLeads: sinSeguimiento.slice(0, 5),

      // Activities
      totalActividades:    actividades.length,
      completadas:         completadas.length,
      pendientes:          actividades.filter((a) => a.estado === 'pendiente').length,
      vencidas:            vencidas.length,
      actHoy:              actHoy.length,
      graficoSemana,

      // Sales
      totalVentas,
      vendedoresConMeta,

      // Alerts
      alertas,
    };
  }, [leads, actividades, vendedores]);
}
