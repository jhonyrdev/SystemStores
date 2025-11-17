import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, XCircle } from "lucide-react";
import {
  obtenerPedidosPorCliente,
  cancelarPedido,
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
  const [pedidosActivos, setPedidosActivos] = useState<Pedido[]>([]);
  const [historialPedidos, setHistorialPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleCancelarPedido = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      return;
    }

    try {
      await cancelarPedido(id);

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
                {historialPedidos.map((pedido) => (
                  <tr key={pedido.idPed} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{pedido.idPed}</td>
                    <td className="px-4 py-2 border-b">{pedido.fecha}</td>
                    <td className="px-4 py-2 border-b">
                      S/ {pedido.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border-b">{pedido.estado}</td>
                    <td className="px-4 py-2 border-b">
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        Ver detalles
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : pedidosActivos.length === 0 ? (
        <p className="text-sm text-gray-500">No tienes pedidos activos.</p>
      ) : (
        pedidosActivos.map((pedido) => (
          <div
            key={pedido.idPed}
            className="border p-3 rounded bg-white space-y-2"
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
          </div>
        ))
      )}
    </div>
  );
};

export default PedidosCard;
