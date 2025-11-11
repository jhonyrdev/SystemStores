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
