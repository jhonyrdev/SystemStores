import React from "react";
import MetricCards from "@components/admin/metricCards";
import LinesChart from "@components/admin/Charts/linesChart";
import BarrasChart from "@components/admin/Charts/barrasChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  obtenerVentasAnalytics,
  obtenerTopProductos,
  obtenerTopCategorias,
} from "@/services/ventas/ventaService";

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
  const [ventasPorMes, setVentasPorMes] = React.useState<
    { month: string; ventas: number }[]
  >([]);
  const [productosPopulares, setProductosPopulares] = React.useState<
    ProductoPopular[]
  >([]);
  const [categoriasPopulares, setCategoriasPopulares] = React.useState<
    ProductoPopular[]
  >([]);
  const [clientesPopulares, setClientesPopulares] = React.useState<
    ProductoPopular[]
  >([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const analytics = await obtenerVentasAnalytics();
        setTotalVentas(analytics.totalVentas);
        setTotalMonto(Number(analytics.totalMonto));
        setTicketPromedio(Number(analytics.ticketPromedio));
        setVentasPorMes(
          analytics.ventasPorMes.map((v) => ({
            month: v.month,
            ventas: Number(v.ventas),
          }))
        );

        const [topProd, topCat] = await Promise.all([
          obtenerTopProductos(),
          obtenerTopCategorias(),
        ]);

        const productosSorted = topProd.map((p) => ({
          producto: p.producto,
          cantidad: Number(p.cantidad),
        }));
        const categoriasSorted = topCat.map((c) => ({
          producto: c.categoria,
          cantidad: Number(c.cantidad),
        }));

        try {
          const { obtenerTopClientes } = await import(
            "@/services/ventas/ventaService"
          );
          const topClientes = await obtenerTopClientes();
          const clientesSorted = topClientes.map((c) => ({
            producto: c.cliente,
            cantidad: Number(c.cantidad),
          }));
          setClientesPopulares(clientesSorted.slice(0, 5));
        } catch (e) {
          console.warn("No se pudo cargar top clientes:", e);
          setClientesPopulares([]);
        }

        setProductosPopulares(productosSorted.slice(0, 5));
        setCategoriasPopulares(categoriasSorted.slice(0, 5));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al cargar análisis";
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
        <MetricCards
          title="Ventas Totales"
          value={totalVentas.toString()}
          change=""
          direction="up"
        />
        <MetricCards
          title="Ingresos"
          value={`S/. ${totalMonto.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          change=""
          direction="up"
        />
        <MetricCards
          title="Ticket Promedio"
          value={`S/. ${ticketPromedio.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          change=""
          direction="up"
        />
        <MetricCards
          title="Meses Activos"
          value={ventasPorMes.length.toString()}
          change=""
          direction="up"
        />
      </div>

      {/* Productos y Categorías más populares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-right py-2">Cantidad</th>
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

        <Card>
          <CardHeader>
            <CardTitle>Categorías Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left py-2">Categoría</th>
                  <th className="text-right py-2">Unidades vendidas</th>
                </tr>
              </thead>
              <tbody>
                {categoriasPopulares.map((c) => (
                  <tr key={c.producto} className="border-b last:border-0">
                    <td className="py-2">{c.producto}</td>
                    <td className="text-right py-2">{c.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LinesChart title="Ingresos por Mes" data={ventasPorMes} xKey="month" />
        <BarrasChart
          title="Clientes Más Activos"
          data={clientesPopulares.map((c) => ({
            producto: c.producto,
            cantidad: c.cantidad,
          }))}
        />
      </div>
    </div>
  );
};

export default Analisis;
