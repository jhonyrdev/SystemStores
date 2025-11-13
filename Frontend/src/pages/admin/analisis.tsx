import React from "react";
import MetricCards from "@components/admin/metricCards";
import LinesChart from "@components/admin/Charts/linesChart";
import BarrasChart from "@components/admin/Charts/barrasChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { obtenerVentasAnalytics } from "@/services/ventas/ventaService";
import { listarCategorias } from "@/services/productos/categoriaServices";

interface ProductoPopular {
  producto: string;
  cantidad: number;
}

const Analisis: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalVentas, setTotalVentas] = React.useState(0);
  const [totalMonto, setTotalMonto] = React.useState(0);
  const [ticketPromedio, setTicketPromedio] = React.useState(0);
  const [ventasPorMes, setVentasPorMes] = React.useState<{ month: string; ventas: number }[]>([]);
  const [productosPopulares, setProductosPopulares] = React.useState<ProductoPopular[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const analytics = await obtenerVentasAnalytics();
        setTotalVentas(analytics.totalVentas);
        // totalMonto y ticketPromedio pueden venir como BigDecimal serializado; forzamos a número
        setTotalMonto(Number(analytics.totalMonto));
        setTicketPromedio(Number(analytics.ticketPromedio));
        setVentasPorMes(analytics.ventasPorMes.map(v => ({ month: v.month, ventas: Number(v.ventas) })));

        // Placeholder productos populares: usando categorías como proxy si aún no hay detalle de ventas por producto
        // En futuro cambiar por endpoint real top productos.
        const categorias = await listarCategorias();
        // Suponemos estructura mínima { id: number; nombre: string }
        type CategoriaLite = { id?: number; nombre: string };
        const simulados: ProductoPopular[] = (categorias as CategoriaLite[]).slice(0,5).map((c, idx) => ({
          producto: c.nombre,
          cantidad: (idx + 1) * 10
        }));
        setProductosPopulares(simulados);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al cargar análisis';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <p className="p-4">Cargando análisis...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-semibold">Análisis de la Tienda</h1>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCards title="Ventas Totales" value={totalVentas.toString()} change="" direction="up" />
        <MetricCards title="Ingresos" value={`S/. ${totalMonto.toLocaleString(undefined,{minimumFractionDigits:2})}`} change="" direction="up" />
        <MetricCards title="Ticket Promedio" value={`S/. ${ticketPromedio.toLocaleString(undefined,{minimumFractionDigits:2})}`} change="" direction="up" />
        <MetricCards title="Meses Activos" value={ventasPorMes.length.toString()} change="" direction="up" />
      </div>

      {/* Productos más populares (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Populares (prototipo)</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="text-left py-2">Producto</th>
                <th className="text-right py-2">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {productosPopulares.map((p) => (
                <tr key={p.producto} className="border-b last:border-0">
                  <td className="py-2">{p.producto}</td>
                  <td className="text-right py-2">{p.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LinesChart title="Ingresos por Mes" data={ventasPorMes} xKey="month" />
        <BarrasChart title="Productos Populares (demo)" data={productosPopulares.map(p => ({ producto: p.producto, cantidad: p.cantidad }))} />
      </div>
    </div>
  );
};

export default Analisis;
