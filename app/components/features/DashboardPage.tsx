import MetricCard from '@/app/components/ui/MetricCard';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { GraficoVentas } from './GraficoVentas';
import { AlertasCRM } from './AlertasCRM';
import { INITIAL_DATA } from '../../../data/mockData';

const DashboardPage = () => {
  const { metricas } = INITIAL_DATA;

  return (
    <div> 
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Panel de Control</h1>
        <p className="text-gray-500">Resumen operativo basado en datos precargados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Ventas" value={metricas.ventasTotales} trend={metricas.crecimiento} icon={<DollarSign size={20}/>} />
        <MetricCard title="Citas" value={metricas.citasHoy.toString()} description="Para el día de hoy" icon={<Calendar size={20}/>} />
        <MetricCard title="Cierre" value={metricas.tasaCierre} trend="+2%" icon={<TrendingUp size={20}/>} />
        <MetricCard title="Equipo" value={INITIAL_DATA.vendedores.length.toString()} description="Vendedores activos" icon={<Users size={20}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GraficoVentas data={INITIAL_DATA.historialGrafico} /> 
        </div>
        <div>
          <AlertasCRM />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;