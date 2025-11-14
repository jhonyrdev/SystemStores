import type { PedidoRequest, PedidoResponse } from '@/types/ventas';
import api from '@/utils/axiomInstance';

// Base endpoint segment (axios baseURL no incluye "/api")
const PEDIDOS_BASE = '/api/pedidos';

export async function registrarPedido(
  pedido: PedidoRequest
): Promise<PedidoResponse> {
  try {
    const res = await api.post<PedidoResponse>('/api/pedidos/registrar', pedido, {
      withCredentials: true,
    });
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al registrar pedido:', error.message);
      throw new Error(error.message || 'Error en la solicitud al servidor');
    }
    throw new Error('Error en la solicitud al servidor');
  }
}

// El backend devuelve una lista con atributos similares a PedidoResponse más estado (ya incluido)
export async function obtenerPedidosPorCliente(clienteId: number): Promise<PedidoResponse[]> {
  const res = await api.get<PedidoResponse[]>(`${PEDIDOS_BASE}/cliente/${clienteId}`, { withCredentials: true });
  return res.data;
}

export async function cancelarPedido(idPedido: number): Promise<PedidoResponse> {
  const res = await api.put<PedidoResponse>(`${PEDIDOS_BASE}/cancelar/${idPedido}`, undefined, { withCredentials: true });
  return res.data;
}

export async function obtenerTodosPedidos(): Promise<PedidoResponse[]> {
  const res = await api.get<PedidoResponse[]>(`${PEDIDOS_BASE}/todos`, { withCredentials: true });
  return res.data;
}

export async function actualizarEstadoPedido(idPedido: number, estado: string): Promise<PedidoResponse> {
  const res = await api.put<PedidoResponse>(`${PEDIDOS_BASE}/actualizar-estado/${idPedido}`, { estado }, { withCredentials: true });
  return res.data;
}

export interface DetallePedidoItem {
  idDetalle: number;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  producto: {
    idProd?: number;
    nomProd?: string;
  };
}

export async function obtenerDetallesPedido(idPedido: number): Promise<DetallePedidoItem[]> {
  const res = await api.get<DetallePedidoItem[]>(`${PEDIDOS_BASE}/${idPedido}/detalles`, { withCredentials: true });
  return res.data;
}

// El helper fetch + handleResponse quedó obsoleto al migrar todo a axios; se puede eliminar si estaba más abajo.
