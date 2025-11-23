import { useState, useEffect, useCallback } from "react";
import api from "@/services/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Eye, XCircle } from "lucide-react";
import {
  obtenerPedidosPorCliente,
  cancelarPedido,
  actualizarEstadoPedido,
} from "@/services/ventas/pedidoService";
import {
  getPedidoPagoStatus,
  setPedidoPagoStatus,
} from "@/utils/pedidoPagoStatus";

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPedidoDetails, setSelectedPedidoDetails] = useState<{
    pedido: Pedido;
    pago: string;
  } | null>(null);
  const [pedidosActivos, setPedidosActivos] = useState<Pedido[]>([]);
  const [historialPedidos, setHistorialPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [histFilter, setHistFilter] = useState<
    "todos" | "Realizado" | "Rechazado"
  >("todos");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const getPaymentStatusFor = useCallback(
    (id: number, estadoPedido: string) => getPedidoPagoStatus(id, estadoPedido),
    []
  );

  const markPaymentStatus = useCallback(async (id: number, status: string) => {
    try {
      await setPedidoPagoStatus(id, status);
    } catch {
      /* ignore */
    }
  }, []);

  // Extracted loader so it can be called from UI actions to refresh lists
  const cargarPedidos = useCallback(async () => {
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

      // classify pedidos: active = estado Nuevo AND payment status pagado|pendiente
      const activos: Pedido[] = [];
      const historial: Pedido[] = [];

      for (const p of pedidosNormalizados) {
        const pago = getPaymentStatusFor(p.idPed, p.estado);
        // active only when estado is Nuevo and pago is pagado or pendiente
        if (
          p.estado === "Nuevo" &&
          (pago === "pagado" || pago === "pendiente")
        ) {
          activos.push(p);
        } else {
          // everything else goes to history (including Realizado/Rechazado or failed/cancelled statuses)
          historial.push(p);
        }
      }

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
  }, [getPaymentStatusFor]);

  // initial load (cargarPedidos is memoized)
  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const handleCancelarPedido = async (id: number) => {
    try {
      await cancelarPedido(id);
      markPaymentStatus(id, "devuelto");
      await cargarPedidos();
    } catch (err) {
      console.error("Error al cancelar pedido:", err);
      alert("Error al cancelar el pedido. Por favor intenta de nuevo.");
    }
  };

  const handleMarcarEntregado = async (id: number) => {
    try {
      await actualizarEstadoPedido(id, "Realizado");
      await cargarPedidos();
    } catch (err) {
      console.error("Error marcando pedido como entregado:", err);
      alert("No se pudo marcar como entregado");
    }
  };

  const openPdf = async (id: number, estado?: string) => {
    try {
      setPdfLoading(true);
      // request as blob so we can embed regardless of server X-Frame-Options
      // check payment status first; for cancelled/failed/expired pedidos
      // there is no comprobante PDF — show a details modal instead.
      const pago = getPaymentStatusFor(id, estado ?? "Nuevo");
      if (pago !== "pagado" && pago !== "devuelto") {
        // find pedido object to show in modal
        const findPedido =
          pedidosActivos.find((p) => p.idPed === id) ||
          historialPedidos.find((p) => p.idPed === id) ||
          null;
        setSelectedPedidoDetails(
          findPedido ? { pedido: findPedido, pago } : null
        );
        setDetailsOpen(true);
        setPdfLoading(false);
        return;
      }

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
          onClick={async () => {
            const next = !verHistorial;
            setVerHistorial(next);
            if (next) {
              await cargarPedidos();
            }
          }}
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
                          onClick={() => openPdf(pedido.idPed, pedido.estado)}
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

      {detailsOpen && selectedPedidoDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-11/12 md:w-1/2 rounded shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="text-sm font-medium">Detalle del pedido</h3>
              <button
                className="text-sm text-red-600 px-3"
                onClick={() => {
                  setDetailsOpen(false);
                  setSelectedPedidoDetails(null);
                }}
              >
                Cerrar
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div>
                <strong>ID Pedido:</strong> {selectedPedidoDetails.pedido.idPed}
              </div>
              <div>
                <strong>Fecha:</strong> {selectedPedidoDetails.pedido.fecha}
              </div>
              <div>
                <strong>Total:</strong> S/{" "}
                {selectedPedidoDetails.pedido.total.toFixed(2)}
              </div>
              <div>
                <strong>Estado pedido:</strong>{" "}
                {selectedPedidoDetails.pedido.estado}
              </div>
              <div>
                <strong>Estado pago:</strong>{" "}
                <span className="font-semibold text-yellow-700">
                  {selectedPedidoDetails.pago}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                No existe comprobante PDF para pedidos con estado de pago
                "cancelado", "vencido" o "fallido".
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosCard;
