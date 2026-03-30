// src/data/mockData.ts

export const INITIAL_DATA = {
  vendedores: [
    { id: 1, nombre: "Carlos García", avatar: "CG", ventas: 45000, meta: 40000 },
    { id: 2, nombre: "María López", avatar: "ML", ventas: 38000, meta: 40000 },
    { id: 3, nombre: "Juan Rodríguez", avatar: "JR", ventas: 52000, meta: 40000 },
  ],
  metricas: {
    ventasTotales: "$135,000",
    crecimiento: "+12.5%",
    citasHoy: 8,
    tasaCierre: "64%"
  },
  alertas: [
    { id: 1, tipo: 'urgente', mensaje: 'Meta mensual alcanzada por Juan R.', tiempo: 'Hace 5 min' },
    { id: 2, tipo: 'info', mensaje: 'Nueva cita programada para las 4:00 PM', tiempo: 'Hace 20 min' },
    { id: 3, tipo: 'warning', mensaje: 'Vendedor María L. está al 95% de su meta', tiempo: 'Hace 1 hora' },
  ],
  historialGrafico: [
    { mes: 'Ene', ventas: 4000 },
    { mes: 'Feb', ventas: 3000 },
    { mes: 'Mar', ventas: 5000 },
    { mes: 'Abr', ventas: 4500 },
    { mes: 'May', ventas: 6000 },
    { mes: 'Jun', ventas: 8500 },
  ]
};