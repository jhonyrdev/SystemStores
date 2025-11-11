import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, XCircle } from "lucide-react";
import { obtenerPedidosPorCliente } from "@/services/ventas/pedidoService";
import { getClienteLogueado } from "@/services/cliente/clienteService";

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
        
        // Obtener datos del usuario del localStorage
        const storedUser = localStorage.getItem("usuario");
        let clienteId: number | undefined;

        if (storedUser) {
          try {
            const usuario: Usuario = JSON.parse(storedUser);
            clienteId = usuario.idCliente || usuario.idCli;
          } catch (e) {
            // localStorage corrupto: limpiarlo y tratar de obtener datos desde el backend
            console.warn("localStorage.usuario inválido, se obtendrá desde el servidor:", e);
            localStorage.removeItem("usuario");
          }
        }

        if (!clienteId) {
          // Intentar obtener el usuario logueado desde el backend
          try {
            const usuarioBackend: any = await getClienteLogueado();
            // algunos endpoints devuelven idCliente o idCli, adaptamos
            clienteId = usuarioBackend.idCliente || usuarioBackend.idCli || usuarioBackend.idCli;
            // Guardar en localStorage para próximas veces
            try {
              localStorage.setItem("usuario", JSON.stringify(usuarioBackend));
            } catch (err) {
              console.warn("No se pudo guardar usuario en localStorage:", err);
            }
          } catch (err) {
            setError("Usuario no autenticado");
            setLoading(false);
            return;
          }
        }
        
  const pedidos = await obtenerPedidosPorCliente(clienteId as number);
        
        // Separar pedidos activos de historial
        const activos = pedidos.filter(p => p.estado === "Nuevo" || p.estado === "Realizado");
        const historial = pedidos.filter(p => p.estado === "Rechazado" || p.estado === "Realizado");
        
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

  const cancelarPedido = (id: number) => {
    // Aquí va la lógica para cancelar/rechazar el pedido (ej. llamada a API)
    alert(`Pedido ${id} cancelado`);
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
              key={pedido.idPed}
              className="border p-3 rounded bg-gray-50 space-y-1"
            >
              <p className="text-sm text-gray-800">
                <strong>ID Pedido:</strong> #{pedido.idPed}
              </p>
              <p className="text-sm text-gray-800">
                <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString('es-ES')}
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
            key={pedido.idPed}
            className="border p-3 rounded bg-white space-y-2"
          >
            <div className="space-y-1">
              <p className="text-sm text-gray-800">
                <strong>ID Pedido:</strong> #{pedido.idPed}
              </p>
              <p className="text-sm text-gray-800">
                <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString('es-ES')}
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
              onClick={() => cancelarPedido(pedido.idPed)}
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
