import type {
  PedidoRequest,
  PedidoResponse,
  Pedido,
  ActionResponse,
} from "@/types/ventas";
import api from "@/utils/axiomInstance";

export async function registrarPedido(
  pedido: PedidoRequest
): Promise<PedidoResponse> {
  try {
    const res = await api.post<PedidoResponse>(
      "/api/pedidos/registrar",
      pedido,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error al registrar pedido:", error.message);
      throw new Error(error.message || "Error en la solicitud al servidor");
    }
    throw new Error("Error en la solicitud al servidor");
  }
}

export async function obtenerPedidosPorCliente(
  clienteId: number
): Promise<Pedido[]> {
  try {
    const res = await api.get<Pedido[]>(`/api/pedidos/cliente/${clienteId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener pedidos por cliente:", error);
    throw error;
  }
}

export async function cancelarPedido(
  idPedido: number
): Promise<ActionResponse> {
  try {
    const res = await api.put<ActionResponse>(
      `/api/pedidos/cancelar/${idPedido}`,
      null,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: unknown) {
    console.error("Error al cancelar pedido:", error);
    throw error;
  }
}

export async function obtenerTodosPedidos(): Promise<Pedido[]> {
  try {
    const res = await api.get<Pedido[]>("/api/pedidos/todos", {
      withCredentials: true,
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener todos los pedidos:", error);
    throw error;
  }
}

export async function actualizarEstadoPedido(
  idPedido: number,
  estado: string
): Promise<ActionResponse> {
  try {
    const res = await api.put<ActionResponse>(
      `/api/pedidos/actualizar-estado/${idPedido}`,
      { estado },
      { withCredentials: true }
    );
    return res.data;
  } catch (error: unknown) {
    console.error("Error al actualizar estado del pedido:", error);
    throw error;
  }
}