import type { VentaRequest, VentaResponse } from '@/types/ventas';

interface VentasAnalytics {
  totalVentas: number;
  totalMonto: number; // puede venir como número si backend serializa BigDecimal
  ticketPromedio: number;
  ventasPorMes: { month: string; ventas: number }[];
}
import api from '@/utils/axiomInstance';

export async function registrarVenta(
  venta: VentaRequest
): Promise<VentaResponse> {
  try {
    const res = await api.post<VentaResponse>('/api/ventas/registrar', venta, {
      withCredentials: true,
    });
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al registrar venta:', error.message);
      throw new Error(error.message || 'Error en la solicitud al servidor');
    }
    throw new Error('Error en la solicitud al servidor');
  }
}

export async function obtenerVentasAnalytics(): Promise<VentasAnalytics> {
  const res = await api.get<VentasAnalytics>('/api/ventas/analytics', { withCredentials: true });
  return res.data;
}
