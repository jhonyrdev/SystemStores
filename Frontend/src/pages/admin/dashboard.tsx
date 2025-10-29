import BarrasChart from "@/components/admin/Charts/barrasChart";;
import LinesChart from "@/components/admin/Charts/linesChart";
import MetricCards from "@/components/admin/metricCards";

const Dashboard = () => {
  return (
    <>
      <div className="grid gap-4 pb-20">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Resumen Ejecutivo
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Vista general del desempeño actual del sistema.
          </p>
        </div>
        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCards
            title="Ventas Diarias"
            value="S/. 1,250"
            change="+10%"
            direction="up"
          />
          <MetricCards
            title="Producto menos vendido"
            value="Pizza"
            change="-5%"
            direction="down"
          />
          <MetricCards
            title="Producto Más Vendido"
            value="Empanada"
            change="+20%"
            direction="up"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LinesChart
            title="Ventas Diarias"
            data={[
              { day: "Lunes", ventas: 800 },
              { day: "Martes", ventas: 600 },
              { day: "Miércoles", ventas: 1500 },
              { day: "Jueves", ventas: 1200 },
              { day: "Viernes", ventas: 2000 },
              { day: "Sábado", ventas: 1700 },
              { day: "Domingo", ventas: 2200 },
            ]}
            xKey="day"
          />
          <BarrasChart
            title="Productos Más Vendidos"
            data={[
              { producto: "Camisetas", cantidad: 120 },
              { producto: "Pantalones", cantidad: 100 },
              { producto: "Zapatos", cantidad: 80 },
              { producto: "Gorras", cantidad: 60 },
              { producto: "Sudaderas", cantidad: 40 },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
