import BarrasChart from "@/components/admin/Charts/barrasChart";
import LinesChart from "@/components/admin/Charts/linesChart";
import MetricCards from "@/components/admin/metricCards";
import { useEffect, useState } from "react";
import {
  obtenerVentasAnalytics,
  obtenerTopProductos,
} from "@/services/ventas/ventaService";
import type { TopProducto } from "@/services/ventas/ventaService";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMonto, setTotalMonto] = useState<number | null>(null);
  const [ventasPorMes, setVentasPorMes] = useState<
    { month: string; ventas: number }[]
  >([]);
  const [topProductos, setTopProductos] = useState<TopProducto[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const analytics = await obtenerVentasAnalytics();
        const tops = await obtenerTopProductos();

        if (!mounted) return;

        setTotalMonto(Number(analytics.totalMonto || 0));
        setVentasPorMes(analytics.ventasPorMes || []);

        // backend returns top products sorted desc; keep as-is
        setTopProductos(tops || []);
      } catch (e) {
        console.error("Error cargando datos del dashboard", e);
        setError(
          "No se pudieron cargar las métricas. Intenta nuevamente más tarde."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // derived values (kept for future use)

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

        {loading ? (
          <div className="py-8">Cargando métricas...</div>
        ) : error ? (
          <div className="py-8 text-red-600">{error}</div>
        ) : (
          <>
            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCards
                title="Ventas Totales"
                value={
                  totalMonto !== null ? `S/. ${totalMonto.toFixed(2)}` : "-"
                }
                change={""}
                direction={"up"}
              />
              {/* Mostrar producto más vendido (nombre simple) */}
              <MetricCards
                title="Producto Más Vendido"
                value={
                  topProductos && topProductos.length > 0
                    ? topProductos[0].producto.split(/\s+/)[0]
                    : "-"
                }
                change={""}
                direction={"up"}
              />
              {/* Mostrar producto menos vendido (nombre simple) */}
              <MetricCards
                title="Producto Menos Vendido"
                value={
                  topProductos && topProductos.length > 0
                    ? topProductos[topProductos.length - 1].producto.split(
                        /\s+/
                      )[0]
                    : "-"
                }
                change={""}
                direction={"down"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LinesChart
                title="Ventas por Mes"
                data={ventasPorMes}
                xKey="month"
              />

              <BarrasChart
                title="Productos Más Vendidos"
                data={topProductos.map((p) => ({
                  producto: (p.producto || "").split(/\s+/)[0],
                  cantidad: p.cantidad,
                }))}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
