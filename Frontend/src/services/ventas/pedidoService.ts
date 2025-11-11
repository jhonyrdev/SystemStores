import type { PedidoRequest, PedidoResponse } from '@/types/ventas';

const API_URL = 'http://localhost:8080/api/pedidos';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Error en la solicitud al servidor');
  }
  return response.json() as Promise<T>;
}

export async function registrarPedido(
  pedido: PedidoRequest
): Promise<PedidoResponse> {
  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(pedido),
  });

  return handleResponse<PedidoResponse>(response);
}

export async function obtenerPedidosPorCliente(clienteId: number): Promise<any[]> {
  const response = await fetch(`${API_URL}/cliente/${clienteId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return handleResponse<any[]>(response);
}

export async function obtenerTodosPedidos(): Promise<any[]> {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return handleResponse<any[]>(response);
}

export async function obtenerPedidoPorId(id: number): Promise<any> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  return handleResponse<any>(response);
}
