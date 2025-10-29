import type { VentaRequest, VentaResponse } from '@/types/ventas';

const API_URL = 'http://localhost:8080/api/ventas';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Error en la solicitud al servidor');
  }
  return response.json() as Promise<T>;
}


export async function registrarVenta(
  venta: VentaRequest
): Promise<VentaResponse> {
  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(venta),
  });

  return handleResponse<VentaResponse>(response);
}
