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
