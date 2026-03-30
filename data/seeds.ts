import type { Lead, EstadoLead } from '@/store/leadsStore';
import type { Vendedor } from '@/store/vendedoresStore';
import type { ActividadData, TipoActividadCRM, EstadoActividad, PrioridadActividad } from './models';

// ─── Abstract base ────────────────────────────────────────────
// Establece el contrato que toda clase semilla debe cumplir.
abstract class EntitySeed<T> {
  abstract toPlain(): T;
}

// ─── Lead ─────────────────────────────────────────────────────

const LEAD_NOMBRES: string[] = [
  'Juan Pablo Vargas',    'María Alejandra Ramos',  'Carlos Andrés Mendoza', 'Laura Sofía Jiménez',
  'Diego Armando Castro', 'Valentina Zapata',        'Andrés Felipe Moreno',  'Camila Andrea Torres',
  'Luis Eduardo Herrera', 'Patricia Isabel Gómez',   'Sebastián Ortiz',       'Natalia Fernández',
  'Ricardo Adolfo Silva', 'Ana Lucía Pardo',          'Felipe Augusto Ríos',   'Diana Marcela Reyes',
  'Alejandro Cárdenas',   'Isabella Romero',          'Germán Esteban Vélez',  'Paola Andrea Salazar',
  'Mauricio León',        'Ximena Cristina Mora',     'Hernán David Suárez',   'Lorena Beatriz Cruz',
  'Rodrigo Escobar',      'Claudia Patricia Niño',    'Bryan Steven Gutiérrez','Sandra Milena Aguilar',
  'Jonathan Montoya',     'Lina María Ospina',
];

const LEAD_ESTADOS: EstadoLead[] = [
  // 8 nuevos
  'nuevo', 'nuevo', 'nuevo', 'nuevo', 'nuevo', 'nuevo', 'nuevo', 'nuevo',
  // 10 contactados
  'contactado', 'contactado', 'contactado', 'contactado', 'contactado',
  'contactado', 'contactado', 'contactado', 'contactado', 'contactado',
  // 8 interesados
  'interesado', 'interesado', 'interesado', 'interesado',
  'interesado', 'interesado', 'interesado', 'interesado',
  // 4 cerrados
  'cerrado', 'cerrado', 'cerrado', 'cerrado',
];

const PREFIJOS_TEL = ['300', '310', '311', '312', '313', '314', '315', '316', '317', '318'];
const DAY_MS = 86_400_000;

class LeadSeed extends EntitySeed<Lead> {
  private readonly data: Lead;

  constructor(index: number) {
    super();

    const estado: EstadoLead = LEAD_ESTADOS[index];
    const daysAgo = (index % 14) + 1;
    const createdAt = new Date(Date.now() - daysAgo * DAY_MS).toISOString();

    // Cada tercer lead activo no tiene seguimiento reciente → dispara alerta
    const sinSeguimiento = estado !== 'cerrado' && index % 3 === 0;
    const ultimaActividad = sinSeguimiento
      ? undefined
      : new Date(Date.now() - Math.floor(daysAgo * 0.3) * DAY_MS).toISOString();

    const tel = `+57 ${PREFIJOS_TEL[index % PREFIJOS_TEL.length]} ${
      String(200 + (index * 31) % 800).padStart(3, '0')
    } ${String(1000 + (index * 147) % 9000).padStart(4, '0')}`;

    this.data = {
      id: `seed-lead-${String(index + 1).padStart(3, '0')}`,
      nombre: LEAD_NOMBRES[index],
      telefono: tel,
      email: index % 2 === 0
        ? `${LEAD_NOMBRES[index].split(' ')[0].toLowerCase()}${index + 1}@correo.com`
        : undefined,
      estado,
      createdAt,
      ultimaActividad,
    };
  }

  toPlain(): Lead {
    return { ...this.data };
  }

  static generate(count: number): Lead[] {
    return Array.from({ length: count }, (_, i) => new LeadSeed(i).toPlain());
  }
}

// ─── Vendedor ─────────────────────────────────────────────────

const VENDEDOR_DATA: Array<{ nombre: string; ventas: number; meta: number }> = [
  { nombre: 'Carlos Ruiz',           ventas: 45_000, meta: 50_000 },
  { nombre: 'Ana Milena Gómez',      ventas: 38_000, meta: 40_000 },
  { nombre: 'Luis Fernando Torres',  ventas: 52_000, meta: 50_000 },
  { nombre: 'María Fernanda López',  ventas: 29_000, meta: 40_000 },
  { nombre: 'Diego Martínez',        ventas: 61_000, meta: 60_000 },
  { nombre: 'Valentina Herrera',     ventas: 15_000, meta: 30_000 },
  { nombre: 'Andrés Castro',         ventas: 48_000, meta: 45_000 },
  { nombre: 'Laura Camila Pérez',    ventas: 33_000, meta: 35_000 },
  { nombre: 'Jorge Eduardo Sánchez', ventas: 71_000, meta: 65_000 },
  { nombre: 'Daniela Moreno',        ventas: 42_000, meta: 50_000 },
];

class VendedorSeed extends EntitySeed<Vendedor> {
  private readonly data: Vendedor;

  constructor(index: number) {
    super();
    const d = VENDEDOR_DATA[index];
    this.data = {
      id: index + 1,
      nombre: d.nombre,
      avatar: d.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      ventas: d.ventas,
      meta: d.meta,
    };
  }

  toPlain(): Vendedor {
    return { ...this.data };
  }

  static generate(count: number): Vendedor[] {
    return Array.from({ length: count }, (_, i) => new VendedorSeed(i).toPlain());
  }
}

// ─── Actividad ────────────────────────────────────────────────

const ACT_TIPOS: TipoActividadCRM[]     = ['llamada', 'nota', 'mensaje', 'seguimiento', 'tarea'];
const ACT_PRIORIDADES: PrioridadActividad[] = ['alta', 'media', 'baja'];

const ACT_DESCRIPCIONES: string[] = [
  'Llamar para confirmar interés en el producto',
  'Enviar catálogo de productos por WhatsApp',
  'Agendar reunión de presentación',
  'Seguimiento a propuesta enviada la semana pasada',
  'Verificar si recibió la cotización por correo',
  'Demostración del producto en oficina del cliente',
  'Revisión de contrato con el equipo legal',
  'Recordar vencimiento de oferta especial',
  'Presentar nueva línea de productos premium',
  'Cierre de negociación y firma de contrato',
  'Llamada de bienvenida post-compra',
  'Nota de seguimiento: cliente dudoso en precio',
  'Enviar brochure actualizado',
  'Agendar segunda reunión de negociación',
  'Confirmar asistencia a demo programada',
  'Seguimiento 48h post-demo',
  'Propuesta personalizada para empresa mediana',
  'Tarea: actualizar datos de contacto en CRM',
  'Verificar referencias del lead',
  'Llamada de reactivación a lead frío',
];

// Lead IDs are deterministic — LeadSeed uses prefix seed-lead-001..030
const SEED_LEAD_IDS = Array.from(
  { length: 30 },
  (_, i) => `seed-lead-${String(i + 1).padStart(3, '0')}`
);

class ActividadSeed extends EntitySeed<ActividadData> {
  private readonly data: ActividadData;

  constructor(index: number) {
    super();
    const tipo      = ACT_TIPOS[index % ACT_TIPOS.length];
    const prioridad = ACT_PRIORIDADES[index % ACT_PRIORIDADES.length];
    const desc      = ACT_DESCRIPCIONES[index % ACT_DESCRIPCIONES.length];

    // Distribution:
    //  0-5  → past, estado=pendiente  (atrasadas)
    //  6-9  → past, estado=completado
    // 10-14 → today / tomorrow        (upcoming)
    // 15-19 → future 3-7 days ahead
    let fecha  = new Date();
    const estado: EstadoActividad = index < 10 && index >= 6 ? 'completado' : 'pendiente';

    if (index < 6) {
      fecha.setDate(fecha.getDate() - (index + 2));
    } else if (index < 10) {
      fecha.setDate(fecha.getDate() - (index - 5));
    } else if (index < 15) {
      fecha.setDate(fecha.getDate() + (index - 10));
    } else {
      fecha.setDate(fecha.getDate() + (index - 12));
    }

    fecha.setHours(9 + (index % 8), 0, 0, 0);

    this.data = {
      id:          `seed-act-${String(index + 1).padStart(3, '0')}`,
      tipo,
      descripcion: desc,
      fecha:       fecha.toISOString(),
      leadId:      SEED_LEAD_IDS[index % SEED_LEAD_IDS.length],
      estado,
      prioridad,
      createdAt:   new Date(fecha.getTime() - DAY_MS).toISOString(),
    };
  }

  toPlain(): ActividadData {
    return { ...this.data };
  }

  static generate(count: number): ActividadData[] {
    return Array.from({ length: count }, (_, i) => new ActividadSeed(i).toPlain());
  }
}

// ─── Exports ──────────────────────────────────────────────────
export { LeadSeed, VendedorSeed, ActividadSeed };
export const leadSeeds       = LeadSeed.generate(30);
export const vendedorSeeds   = VendedorSeed.generate(10);
export const actividadSeeds  = ActividadSeed.generate(20);
