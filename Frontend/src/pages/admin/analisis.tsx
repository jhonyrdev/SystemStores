import MetricCards from "@components/admin/metricCards";
import LinesChart from "@components/admin/Charts/linesChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ventasData = [
  { month: "Ene", ventas: 4000 },
  { month: "Feb", ventas: 3200 },
  { month: "Mar", ventas: 5000 },
  { month: "Abr", ventas: 4700 },
  { month: "May", ventas: 6000 },
  { month: "Jun", ventas: 5500 },
];

const productosData = [
  { producto: "Empanada de Pollo", cantidad: 350 },
];

const Analisis = () => {
  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-semibold">Análisis de la Tienda</h1>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCards title="Ventas Totales" value="S/. 25,450" change="+12%" direction="up" />
        <MetricCards title="Pedidos Realizados" value="1,230" change="+8%" direction="up" />
        <MetricCards title="Clientes Activos" value="567" change="+5%" direction="up" />
      </div>

      {/* Productos más populares */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="text-left py-2">Producto</th>
                <th className="text-right py-2">Ventas</th>
                <th className="text-right py-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {productosData.map((p) => (
                <tr key={p.producto} className="border-b last:border-0">
                  <td className="py-2">{p.producto}</td>
                  <td className="text-right py-2">{p.cantidad}</td>
                  <td className="text-right py-2">
                    S/. {(p.cantidad * 10).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <LinesChart title="Tendencias de Ventas por Mes" data={ventasData} xKey="month" />
      </div>
    </div>
  );
};

export default Analisis;
