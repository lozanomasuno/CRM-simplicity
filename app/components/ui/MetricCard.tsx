
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string | number;
  description?: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, trend, description, icon }: MetricCardProps) => {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{trend}</p>
            <p className="mt-2 text-sm text-green-500">{description}</p>
            <p className="mt-2 text-sm text-green-500">{icon}</p>            
        </div>
    )
}


export default MetricCard;