"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo, View } from 'react-big-calendar';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withDragAndDrop = require('react-big-calendar/lib/addons/dragAndDrop').default;
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { useActividadesStore } from '@/store/actividadesStore';
import type { ActividadData } from '@/data/models';
import { ActividadModel, TIPO_LABEL } from '@/data/models';
import { useVendedoresStore } from '@/store/vendedoresStore';
import { ModalActividad } from './actividades/ModalActividad';
import AgendaDia from './actividades/AgendaDia';

// ─── Types ────────────────────────────────────────────────────
type CalEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: ActividadData;
};

type DnDArgs = { event: CalEvent; start: string | Date; end: string | Date; isAllDay: boolean };

// ─── Localizer ────────────────────────────────────────────────
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// ─── DnD-enhanced Calendar ────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DnDCalendar = withDragAndDrop(Calendar) as React.ComponentType<any>;

// ─── Event style by status ────────────────────────────────────
const getEventStyle = (a: ActividadData): React.CSSProperties => {
  if (a.estado === 'completado')
    return { backgroundColor: '#6b7280', border: 'none', borderRadius: '6px', opacity: 0.65, color: '#fff' };
  if (new ActividadModel(a).esAtrasada())
    return { backgroundColor: '#f87171', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700 };
  return { backgroundColor: '#4ade80', border: 'none', borderRadius: '6px', color: '#13131f', fontWeight: 700 };
};

// ─── Messages ─────────────────────────────────────────────────
const RBC_MESSAGES = {
  next: 'Siguiente', previous: 'Anterior', today: 'Hoy',
  month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
  date: 'Fecha', time: 'Hora', event: 'Actividad',
  noEventsInRange: 'Sin actividades en este rango',
  showMore: (n: number) => `+ ${n} más`,
};

type FiltroEstado = 'todos' | 'pendiente' | 'atrasada' | 'completado';
const FILTRO_LABELS: Record<FiltroEstado, string> = {
  todos: 'Todos', pendiente: 'Pendientes', atrasada: 'Atrasadas', completado: 'Completados',
};

// ─── Component ────────────────────────────────────────────────
const CalendarioCRM = () => {
  const actividades        = useActividadesStore((s) => s.actividades);
  const reagendarActividad = useActividadesStore((s) => s.reagendarActividad);
  const vendedores         = useVendedoresStore((s) => s.vendedores);

  // Nav & view
  const fetchCalendario    = useActividadesStore((s) => s.fetchCalendario);
  const loading            = useActividadesStore((s) => s.loading);
  const error              = useActividadesStore((s) => s.error);
  const clearError         = useActividadesStore((s) => s.clearError);
  const [view, setView]               = useState<View>('month');
  const [date, setDate]               = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filters
  const [filtroEstado,   setFiltroEstado]   = useState<FiltroEstado>('todos');
  const [filtroVendedor, setFiltroVendedor] = useState('todos');

  // Modal
  const [modalOpen,     setModalOpen]     = useState(false);
  const [actividadEdit, setActividadEdit] = useState<ActividadData | undefined>();
  const [initialFecha,  setInitialFecha]  = useState<string | undefined>();

  // Filtered activities
  const actividadesFiltradas = useMemo(() =>
    actividades.filter((a) => {
      if (filtroVendedor !== 'todos' && a.vendedorId !== filtroVendedor) return false;
      const m = new ActividadModel(a);
      if (filtroEstado === 'pendiente')  return a.estado === 'pendiente' && !m.esAtrasada();
      if (filtroEstado === 'atrasada')   return m.esAtrasada();
      if (filtroEstado === 'completado') return a.estado === 'completado';
      return true;
    }),
    [actividades, filtroEstado, filtroVendedor]
  );

  // RBC events — enforce 1-hour minimum so events are visible in week/day views
  const events = useMemo<CalEvent[]>(() =>
    actividadesFiltradas.map((a) => {
      const start  = new Date(a.fecha);
      const rawEnd = a.fechaFin ? new Date(a.fechaFin) : null;
      const end    = rawEnd && rawEnd > start ? rawEnd : new Date(start.getTime() + 60 * 60 * 1000);
      return { title: `${TIPO_LABEL[a.tipo]}: ${a.descripcion.slice(0, 40)}`, start, end, resource: a };
    }),
    [actividadesFiltradas]
  );

  // Scroll RBC day/week view to ~1 hour before now so current work hours are visible
  const scrollToTime = useMemo(() => {
    const t = new Date();
    t.setHours(Math.max(t.getHours() - 1, 0), 0, 0, 0);
    return t;
  }, []);

  // ── Handlers ───────────────────────────────────────────────
  const openModal = useCallback((opts: { actividad?: ActividadData; fecha?: string }) => {
    setActividadEdit(opts.actividad);
    setInitialFecha(opts.fecha);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setActividadEdit(undefined);
    setInitialFecha(undefined);
  }, []);

  const handleSelectSlot = useCallback((slot: SlotInfo) => {
    const d = new Date(slot.start);
    setSelectedDate(d);
    openModal({ fecha: d.toISOString() });
  }, [openModal]);

  const handleSelectEvent = useCallback((event: CalEvent) => {
    setSelectedDate(new Date(event.start));
    openModal({ actividad: event.resource });
  }, [openModal]);

  useEffect(() => {
    void fetchCalendario(filtroVendedor === 'todos' ? undefined : filtroVendedor);
  }, [fetchCalendario, filtroVendedor]);

  const handleEventDrop = useCallback(({ event, start, end }: DnDArgs) => {
    reagendarActividad(
      event.resource.id,
      new Date(start).toISOString(),
      new Date(end).toISOString(),
    );
  }, [reagendarActividad]);

  const handleEventResize = useCallback(({ event, start, end }: DnDArgs) => {
    reagendarActividad(
      event.resource.id,
      new Date(start).toISOString(),
      new Date(end).toISOString(),
    );
  }, [reagendarActividad]);

  const eventPropGetter = useCallback(
    (event: CalEvent) => ({ style: getEventStyle(event.resource) }),
    []
  );

  return (
    <div className="flex flex-col gap-5">
      {loading && <p className="text-sm text-gray-500">Cargando calendario...</p>}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{error}</p>
          <button className="mt-2 font-semibold underline" onClick={clearError}>Cerrar</button>
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Calendario de Actividades</h2>
          <p className="text-sm text-gray-500">{actividades.length} actividades registradas</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Estado filter pills */}
          {(Object.keys(FILTRO_LABELS) as FiltroEstado[]).map((f) => {
            let pillClass = 'bg-gray-100 dark:bg-mouse-gray-dark text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700';
            if (filtroEstado === f) {
              if (f === 'atrasada')        pillClass = 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
              else if (f === 'completado') pillClass = 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
              else                         pillClass = 'bg-neon-green-light/10 text-neon-green-light border border-neon-green-light/30';
            }
            return (
              <button
                key={f}
                onClick={() => setFiltroEstado(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:cursor-pointer ${pillClass}`}
              >
                {FILTRO_LABELS[f]}
              </button>
            );
          })}

          {/* Vendedor select */}
          <select
            value={filtroVendedor}
            onChange={(e) => setFiltroVendedor(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-mouse-gray-dark text-gray-700 dark:text-gray-300 border border-transparent focus:outline-none focus:border-neon-green-light"
          >
            <option value="todos">Todos los vendedores</option>
            {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>

          {/* New activity */}
          <button
            onClick={() => openModal({ fecha: new Date().toISOString() })}
            className="inline-flex items-center gap-1.5 bg-neon-green-light text-mouse-gray px-4 py-2 rounded-xl text-sm font-black shadow hover:opacity-90 transition-opacity hover:cursor-pointer"
          >
            <Plus size={15} />
            Nueva
          </button>
        </div>
      </div>

      {/* ── COLOR LEGEND ─────────────────────────────────────── */}
      <div className="flex items-center gap-6 px-1">
        {[
          { color: 'bg-neon-green-light', label: 'Pendiente'  },
          { color: 'bg-red-400',          label: 'Atrasada'   },
          { color: 'bg-gray-400',         label: 'Completada' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
        <span className="text-xs text-gray-400 ml-auto italic hidden md:block">
          Arrastra un evento para reagendar · Clic en un espacio para crear
        </span>
      </div>

      {/* ── MAIN PANEL ───────────────────────────────────────── */}
      <div className="flex gap-5 items-start">

        {/* Calendar */}
        <div
          className="flex-1 bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm overflow-hidden"
          style={{ minHeight: '720px' }}
        >
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            date={date}
            onView={(v: View) => setView(v)}
            onNavigate={(d: Date) => setDate(d)}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '680px' }}
            culture="es"
            messages={RBC_MESSAGES}
            eventPropGetter={eventPropGetter}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            selectable
            resizable
            draggableAccessor={() => true}
            scrollToTime={scrollToTime}
            popup
          />
        </div>

        {/* Day panel */}
        <div className="w-72 flex-shrink-0 bg-white dark:bg-mouse-gray rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">Agenda del día</p>
              <h3 className="font-black text-gray-900 dark:text-white capitalize leading-tight">
                {selectedDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>
            <button
              onClick={() => openModal({ fecha: selectedDate.toISOString() })}
              className="p-2 rounded-xl bg-neon-green-light/10 text-neon-green-light hover:bg-neon-green-light/20 transition-all hover:cursor-pointer flex-shrink-0"
              title="Agregar actividad en este día"
            >
              <Plus size={15} />
            </button>
          </div>

          <AgendaDia
            fecha={selectedDate}
            onCrear={(fechaISO) => openModal({ fecha: fechaISO })}
            onEditar={(a) => openModal({ actividad: a })}
          />
        </div>
      </div>

      {/* ── MODAL ────────────────────────────────────────────── */}
      <ModalActividad
        isOpen={modalOpen}
        onClose={handleCloseModal}
        actividad={actividadEdit}
        initialFecha={initialFecha}
      />
    </div>
  );
};

export default CalendarioCRM;