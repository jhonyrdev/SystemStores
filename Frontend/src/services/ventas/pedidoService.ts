import type { PedidoRequest, PedidoResponse } from '@/types/ventas';

const API_URL = 'http://localhost:8080/api/pedidos';

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    // adjuntar el body crudo para facilitar debug
    const message = text || response.statusText || 'Error en la solicitud al servidor';
    throw new Error(message);
  }

  try {
    // intentar parsear el texto a JSON
    return JSON.parse(text) as T;
  } catch (err) {
    // incluir el body crudo en el error para identificar contenido inválido
    const safe = text.length > 1000 ? text.slice(0, 1000) + '... (truncated)' : text;
    throw new SyntaxError(`Error parseando JSON de ${response.url}: ${err instanceof Error ? err.message : err} - body: ${safe}`);
  }
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
