import MetricCard from '@/app/components/ui/MetricCard';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

export function DashboardPage() {
  return (
    <div> 
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Panel de Control</h1>
        <p className="text-gray-500">Bienvenido de vuelta, aquí tienes el resumen de hoy.</p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Ventas Totales" 
          value="$45,200" 
          trend="+15%" 
          description="Respecto al mes pasado"
          icon={<DollarSign size={20} />} 
        />
        <MetricCard 
          title="Vendedores Activos" 
          value="12" 
          description="3 con metas cumplidas hoy"
          icon={<Users size={20} />} 
        />
        <MetricCard 
          title="Citas de Hoy" 
          value="8" 
          trend="En curso"
          description="Próxima: 2:00 PM"
          icon={<Calendar size={20} />} 
        />
        <MetricCard 
          title="Tasa de Cierre" 
          value="64%" 
          trend="+5%"
          description="Optimizado esta semana"
          icon={<TrendingUp size={20} />} 
        />
      </div>

      {/* Área de Visualización */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-mouse-gray p-6 rounded-2xl border border-gray-100 dark:border-gray-700 h-64 flex items-center justify-center border-dashed">
            <span className="text-gray-400 font-medium">Gráfico de Ventas Mensuales (Pendiente)</span>
         </div>
         <div className="bg-white dark:bg-mouse-gray p-6 rounded-2xl border border-gray-100 dark:border-gray-700 h-64 flex items-center justify-center border-dashed">
            <span className="text-gray-400 font-medium">Alertas de CRM (Pendiente)</span>
         </div>
      </div>
      </div>
  );
}

export default DashboardPage;