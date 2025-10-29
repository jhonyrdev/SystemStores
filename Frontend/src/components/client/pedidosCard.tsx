import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, XCircle } from "lucide-react";

// Definición de la interfaz Pedido
interface Pedido {
  id: string;
  fecha: string;
  total: number;
  estado: "Nuevo" | "Entregado" | "Rechazado";
}

const PedidosCard = () => {
  const [verHistorial, setVerHistorial] = useState(false);

  // Simulación de pedidos activos y finalizados
  const pedidosActivos: Pedido[] = [
    { id: "P-010", fecha: "2025-10-12", total: 75.0, estado: "Nuevo" },
    { id: "P-009", fecha: "2025-10-10", total: 120.0, estado: "Nuevo" },
  ];

  const historialPedidos: Pedido[] = [
    { id: "P-008", fecha: "2025-10-05", total: 55.0, estado: "Entregado" },
    { id: "P-007", fecha: "2025-10-03", total: 80.0, estado: "Rechazado" },
  ];

  const cancelarPedido = (id: string) => {
    // Aquí va la lógica para cancelar/rechazar el pedido (ej. llamada a API)
    alert(`Pedido ${id} cancelado`);
  };

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto p-4 border rounded shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {verHistorial ? "Historial de pedidos" : "Pedidos en proceso"}
        </h2>

        <Button
          variant="default"
          size="sm"
          onClick={() => setVerHistorial(!verHistorial)}
          className="flex items-center gap-1"
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
          historialPedidos.map((pedido) => (
      <div
        key={pedido.id}
        className="border p-3 rounded bg-gray-50 space-y-1"
      >
        <p className="text-sm text-gray-800">
          <strong>ID Pedido:</strong> {pedido.id}
        </p>
        <p className="text-sm text-gray-800">
          <strong>Fecha:</strong> {pedido.fecha}
        </p>
        <p className="text-sm text-gray-800">
          <strong>Total:</strong> ${pedido.total.toFixed(2)}
        </p>
        <p className="text-sm text-gray-800">
          <strong>Estado:</strong> {pedido.estado}
        </p>

        {/* Texto de ver detalles */}
        <p className="text-sm text-blue-600 cursor-pointer hover:underline">
          Ver detalles
        </p>
      </div>
    ))
        )
      ) : pedidosActivos.length === 0 ? (
        <p className="text-sm text-gray-500">No tienes pedidos activos.</p>
      ) : (
        pedidosActivos.map((pedido) => (
          <div
            key={pedido.id}
            className="border p-3 rounded bg-white space-y-2"
          >
            <div className="space-y-1">
              <p className="text-sm text-gray-800">
                <strong>ID Pedido:</strong> {pedido.id}
              </p>
              <p className="text-sm text-gray-800">
                <strong>Fecha:</strong> {pedido.fecha}
              </p>
              <p className="text-sm text-gray-800">
                <strong>Total:</strong> ${pedido.total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-800">
                <strong>Estado:</strong> {pedido.estado}
              </p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => cancelarPedido(pedido.id)}
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
