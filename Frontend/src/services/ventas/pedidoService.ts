import type { PedidoRequest, PedidoResponse } from '@/types/ventas';
import api from '@/utils/axiomInstance';

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

export async function obtenerPedidosPorCliente(clienteId: number): Promise<any[]> {
  const response = await fetch(`${API_URL}/cliente/${clienteId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return handleResponse<any[]>(response);
}

export async function cancelarPedido(idPedido: number): Promise<any> {
  const response = await fetch(`${API_URL}/cancelar/${idPedido}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return handleResponse<any>(response);
}

export async function obtenerTodosPedidos(): Promise<any[]> {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return handleResponse<any[]>(response);
}

export async function actualizarEstadoPedido(idPedido: number, estado: string): Promise<any> {
  const response = await fetch(`${API_URL}/actualizar-estado/${idPedido}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ estado }),
  });

  return handleResponse<any>(response);
}
