"use client";
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts'; 

interface DataPoint {
  mes: string;
  ventas: number;
}

interface GraficoVentasProps {
  data: DataPoint[];
}

export const GraficoVentas: React.FC<GraficoVentasProps> = ({ data }) => {
  // if you want a fallback default dataset, uncomment below:
  // const defaultData: DataPoint[] = [
  //   { mes: 'Ene', ventas: 4000 },
  //   { mes: 'Feb', ventas: 3000 },
  //   { mes: 'Mar', ventas: 5000 },
  //   { mes: 'Abr', ventas: 4500 },
  //   { mes: 'May', ventas: 6000 },
  //   { mes: 'Jun', ventas: 8500 },
  // ];
  // const chartData = data.length ? data : defaultData;

  return (
    <div className="w-full h-[350px] bg-white dark:bg-mouse-gray p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-black text-gray-800 dark:text-white mb-6">Tendencia de Ingresos</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {/* Etiquetas SVG nativas (en minúsculas) */}
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
          
          <XAxis 
            dataKey="mes" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            dy={10}
          />
          
          <YAxis hide={true} />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: 'none', 
              borderRadius: '12px',
              color: '#fff' 
            }}
            itemStyle={{ color: '#39ff14' }}
          />

          <Area 
            type="monotone" 
            dataKey="ventas" 
            stroke="#39ff14" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVentas)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};