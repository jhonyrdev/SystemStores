import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, FileText, XCircle } from "lucide-react";

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
            <table className="min-w-full border  border-gray-200 divide-y divide-gray-200">
              <thead className="bg-secundario-claro">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    ID Pedido
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historialPedidos.map((pedido) => (
                  <tr
                    key={pedido.id}
                    className="bg-white hover:bg-gray-100"
                  >
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {pedido.id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {pedido.fecha}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      ${pedido.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {pedido.estado}
                    </td>
                    <td className="px-4 py-2 text-sm text-blue-600 cursor-pointer hover:underline flex justify-center">
                      <FileText className="w-5 h-5" />
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
            key={pedido.id}
            className="border p-3 rounded bg-secundario-claro space-y-2"
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
