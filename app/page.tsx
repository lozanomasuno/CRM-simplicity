import DashboardLayout from "./components/layout/DashboardLayout";
import MetricCard from "./components/ui/MetricCard";
import TablaVendedores from "./components/features/TablaVendedores";
import CalendarioCRM from "./components/features/CalendarioCRM";

export default function Home() {
  return (
      <DashboardLayout>
        <MetricCard />
        <TablaVendedores />
        <CalendarioCRM />
      </DashboardLayout>
  );
}

