import { useState, useEffect } from "react";
import api from "@/services/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Eye, XCircle } from "lucide-react";
import {
  obtenerPedidosPorCliente,
  cancelarPedido,
  actualizarEstadoPedido,
} from "@/services/ventas/pedidoService";

// Definición de la interfaz Pedido
interface Pedido {
  idPed: number;
  fecha: string;
  total: number;
  estado: "Nuevo" | "Realizado" | "Rechazado";
}

interface Usuario {
  idCliente?: number;
  idCli?: number;
}

const PedidosCard = () => {
  const [verHistorial, setVerHistorial] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPedidoId, setCurrentPedidoId] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pedidosActivos, setPedidosActivos] = useState<Pedido[]>([]);
  const [historialPedidos, setHistorialPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [histFilter, setHistFilter] = useState<
    "todos" | "Realizado" | "Rechazado"
  >("todos");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("usuario");
        if (!storedUser) {
          setError("Usuario no autenticado");
          setLoading(false);
          return;
        }

        const usuario: Usuario = JSON.parse(storedUser);
        const clienteId = usuario.idCliente || usuario.idCli;

        if (!clienteId) {
          setError("No se encontró el ID del cliente");
          setLoading(false);
          return;
        }
        const pedidos = await obtenerPedidosPorCliente(clienteId);
        const normalizePedido = (p: unknown): Pedido => {
          const obj = p as Record<string, unknown>;
          const idPed = (obj["idPed"] ??
            obj["id_ped"] ??
            obj["id_pedido"] ??
            obj["id"]) as number | undefined;
          const totalRaw = obj["total"];
          const totalNum =
            typeof totalRaw === "string"
              ? Number(totalRaw)
              : (totalRaw as number | undefined);
          const fechaStr = (obj["fecha"] ?? obj["fechaPedido"]) as
            | string
            | undefined;
          const estadoStr =
            (obj["estado"] as "Nuevo" | "Realizado" | "Rechazado") ?? "Nuevo";

          return {
            idPed: idPed ?? 0,
            fecha:
              typeof fechaStr === "string" ? fechaStr : String(fechaStr ?? ""),
            total: Number.isFinite(totalNum ?? NaN) ? (totalNum as number) : 0,
            estado: estadoStr,
          };
        };

        const pedidosNormalizados: Pedido[] = pedidos.map(normalizePedido);

        const activos = pedidosNormalizados.filter((p) => p.estado === "Nuevo");

        const historial = pedidosNormalizados.filter(
          (p) => p.estado === "Realizado" || p.estado === "Rechazado"
        );

        setPedidosActivos(activos);
        setHistorialPedidos(historial);
        setError(null);
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
        setError("Error al cargar los pedidos. Por favor intenta de nuevo.");
        setPedidosActivos([]);
        setHistorialPedidos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  const getPaymentStatusMap = (): Record<number, string> => {
    try {
      const raw = localStorage.getItem("pedidosPagoStatus");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const getPaymentStatusFor = (id: number, estadoPedido: string) => {
    const map = getPaymentStatusMap();
    if (map[id]) return map[id];
    // fallback rules
    if (estadoPedido === "Realizado") return "pagado";
    if (estadoPedido === "Rechazado") return "devuelto";
    return "pendiente";
  };

  const markPaymentStatus = (id: number, status: string) => {
    try {
      const raw = localStorage.getItem("pedidosPagoStatus");
      const map = raw ? JSON.parse(raw) : {};
      map[id] = status;
      localStorage.setItem("pedidosPagoStatus", JSON.stringify(map));
    } catch {
      /* ignore */
    }
  };

  const handleCancelarPedido = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      return;
    }
    try {
      await cancelarPedido(id);

      // mark payment status as returned (devuelto) locally
      markPaymentStatus(id, "devuelto");

      setPedidosActivos((prev) => prev.filter((p) => p.idPed !== id));
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        const usuario: Usuario = JSON.parse(storedUser);
        const clienteId = usuario.idCliente || usuario.idCli;
        if (clienteId) {
          const pedidos = await obtenerPedidosPorCliente(clienteId);
          const normalizePedido = (p: unknown): Pedido => {
            const obj = p as Record<string, unknown>;
            const idPed = (obj["idPed"] ??
              obj["id_ped"] ??
              obj["id_pedido"] ??
              obj["id"]) as number | undefined;
            const totalRaw = obj["total"];
            const totalNum =
              typeof totalRaw === "string"
                ? Number(totalRaw)
                : (totalRaw as number | undefined);
            const fechaStr = (obj["fecha"] ?? obj["fechaPedido"]) as
              | string
              | undefined;
            const estadoStr =
              (obj["estado"] as "Nuevo" | "Realizado" | "Rechazado") ?? "Nuevo";

            return {
              idPed: idPed ?? 0,
              fecha:
                typeof fechaStr === "string"
                  ? fechaStr
                  : String(fechaStr ?? ""),
              total: Number.isFinite(totalNum ?? NaN)
                ? (totalNum as number)
                : 0,
              estado: estadoStr,
            };
          };

          const pedidosNormalizados: Pedido[] = pedidos.map(normalizePedido);
          const activos = pedidosNormalizados.filter(
            (p) => p.estado === "Nuevo"
          );

          const historial = pedidosNormalizados.filter(
            (p) => p.estado === "Realizado" || p.estado === "Rechazado"
          );

          setPedidosActivos(activos);
          setHistorialPedidos(historial);
        }
      }

      alert("Pedido cancelado correctamente");
    } catch (err) {
      console.error("Error al cancelar pedido:", err);
      alert("Error al cancelar el pedido. Por favor intenta de nuevo.");
    }
  };

  const handleMarcarEntregado = async (id: number) => {
    try {
      // update on backend to Realizado
      await actualizarEstadoPedido(id, "Realizado");
      // refresh list
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        const usuario: Usuario = JSON.parse(storedUser);
        const clienteId = usuario.idCliente || usuario.idCli;
        if (clienteId) {
          const pedidos = await obtenerPedidosPorCliente(clienteId);
          const normalizePedido = (p: unknown): Pedido => {
            const obj = p as Record<string, unknown>;
            const idPed = (obj["idPed"] ??
              obj["id_ped"] ??
              obj["id_pedido"] ??
              obj["id"]) as number | undefined;
            const totalRaw = obj["total"];
            const totalNum =
              typeof totalRaw === "string"
                ? Number(totalRaw)
                : (totalRaw as number | undefined);
            const fechaStr = (obj["fecha"] ?? obj["fechaPedido"]) as
              | string
              | undefined;
            const estadoStr =
              (obj["estado"] as "Nuevo" | "Realizado" | "Rechazado") ?? "Nuevo";

            return {
              idPed: idPed ?? 0,
              fecha:
                typeof fechaStr === "string"
                  ? fechaStr
                  : String(fechaStr ?? ""),
              total: Number.isFinite(totalNum ?? NaN)
                ? (totalNum as number)
                : 0,
              estado: estadoStr,
            };
          };

          const pedidosNormalizados: Pedido[] = pedidos.map(normalizePedido);
          const activos = pedidosNormalizados.filter(
            (p) => p.estado === "Nuevo"
          );
          setPedidosActivos(activos);
        }
      }
    } catch (err) {
      console.error("Error marcando pedido como entregado:", err);
      alert("No se pudo marcar como entregado");
    }
  };

  const openPdf = async (id: number) => {
    try {
      setPdfLoading(true);
      // request as blob so we can embed regardless of server X-Frame-Options
      const resp = await api.get(`/api/pedidos/${id}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      // revoke previous
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
      setCurrentPedidoId(id);
      setPdfOpen(true);
    } catch (err) {
      console.error("Error fetching PDF:", err);
      alert(
        "No se pudo cargar el comprobante. Revisa tu sesión o inténtalo más tarde."
      );
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl lg:max-w-4xl mx-auto p-4 border rounded shadow">
        <p className="text-center text-gray-500">Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl lg:max-w-4xl mx-auto p-4 border rounded shadow">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto p-4 border rounded shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {verHistorial ? "Historial de pedidos" : "Pedidos en proceso"}
        </h2>

        <Button
          size="sm"
          onClick={() => setVerHistorial(!verHistorial)}
          className="flex items-center gap-1 bg-secundario text-black"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden md:inline">
            {verHistorial ? "Volver a pedidos" : "Ver historial"}
          </span>
        </Button>
      </div>

      {verHistorial ? (
        historialPedidos.length === 0 ? (
          <p className="text-sm text-gray-500">No hay historial de pedidos.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Filtrar:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={histFilter}
                  onChange={(e) => {
                    setHistFilter(
                      e.target.value as "todos" | "Realizado" | "Rechazado"
                    );
                    setCurrentPage(1);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="Realizado">Realizados</option>
                  <option value="Rechazado">Rechazados</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Mostrando {pageSize} por página
              </div>
            </div>

            <table className="min-w-full border border-gray-200 bg-white text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left border-b">ID Pedido</th>
                  <th className="px-4 py-2 text-left border-b">Fecha</th>
                  <th className="px-4 py-2 text-left border-b">Total (S/)</th>
                  <th className="px-4 py-2 text-left border-b">Estado</th>
                  <th className="px-4 py-2 text-left border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = historialPedidos.filter((p) => {
                    if (histFilter === "todos") return true;
                    return p.estado === histFilter;
                  });
                  const totalPages = Math.max(
                    1,
                    Math.ceil(filtered.length / pageSize)
                  );
                  const safePage = Math.min(currentPage, totalPages);
                  const start = (safePage - 1) * pageSize;
                  const pageItems = filtered.slice(start, start + pageSize);

                  return pageItems.map((pedido) => (
                    <tr key={pedido.idPed} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{pedido.idPed}</td>
                      <td className="px-4 py-2 border-b">{pedido.fecha}</td>
                      <td className="px-4 py-2 border-b">
                        S/ {pedido.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border-b">{pedido.estado}</td>
                      <td className="px-4 py-2 border-b">
                        <span
                          className="text-blue-600 cursor-pointer hover:underline"
                          onClick={() => openPdf(pedido.idPed)}
                        >
                          Ver detalles
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            {/* Pagination controls */}
            {(() => {
              const filtered = historialPedidos.filter((p) => {
                if (histFilter === "todos") return true;
                return p.estado === histFilter;
              });
              const totalPages = Math.max(
                1,
                Math.ceil(filtered.length / pageSize)
              );
              if (totalPages <= 1) return null;

              const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

              return (
                <div className="flex items-center gap-2 justify-end mt-3">
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 bg-secundario text-black"
                  >
                    Anterior
                  </Button>
                  {pages.map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                        p === currentPage
                          ? "bg-secundario text-black"
                          : "bg-white border"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <Button
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 bg-secundario text-black"
                  >
                    Siguiente
                  </Button>
                </div>
              );
            })()}
          </div>
        )
      ) : pedidosActivos.length === 0 ? (
        <p className="text-sm text-gray-500">No tienes pedidos activos.</p>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {pedidosActivos.map((pedido) => (
            <div
              key={pedido.idPed}
              className="border p-3 rounded bg-secundario-claro space-y-2"
            >
              <div className="space-y-1">
                <p className="text-sm text-gray-800">
                  <strong>ID Pedido:</strong> {pedido.idPed}
                </p>
                <p className="text-sm text-gray-800">
                  <strong>Fecha:</strong> {pedido.fecha}
                </p>
                <p className="text-sm text-gray-800">
                  <strong>Total:</strong> S/ {pedido.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-800">
                  <strong>Estado:</strong> {pedido.estado}
                </p>
                <p className="text-sm text-gray-800">
                  <strong>Pago:</strong>{" "}
                  {(() => {
                    const pago = getPaymentStatusFor(
                      pedido.idPed,
                      pedido.estado
                    );
                    const color =
                      pago === "pagado"
                        ? "text-green-700"
                        : pago === "devuelto" || pago === "cancelado"
                        ? "text-red-600"
                        : "text-yellow-700";
                    return (
                      <span className={`${color} font-semibold`}>{pago}</span>
                    );
                  })()}
                </p>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelarPedido(pedido.idPed)}
                className="flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Cancelar pedido
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleMarcarEntregado(pedido.idPed)}
                className="flex items-center gap-1"
              >
                Entregado
              </Button>
            </div>
          ))}
        </div>
      )}
      {pdfOpen && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 h-3/4 rounded shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">
                  Comprobante - {currentPedidoId}{" "}
                  {pdfLoading && (
                    <span className="text-xs text-gray-500">(Cargando...)</span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Abrir en nueva pestaña
                </a>
                <button
                  className="text-sm text-red-600 px-3"
                  onClick={() => {
                    setPdfOpen(false);
                    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                    setPdfUrl(null);
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="p-2 h-full">
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosCard;
