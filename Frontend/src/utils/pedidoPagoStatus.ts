import { actualizarEstadoPedido } from "@/services/ventas/pedidoService";

const terminalStatuses = new Set([
  "cancelado",
  "vencido",
  "fallido",
  "devuelto",
  "rechazado",
]);

/**
 * Update local `pedidosPagoStatus` map and, for terminal negative statuses,
 * also update the backend pedido estado to 'Rechazado'.
 */
export async function setPedidoPagoStatus(
  id: number,
  status: string
): Promise<void> {
  try {
    const raw = localStorage.getItem("pedidosPagoStatus");
    const map = raw ? JSON.parse(raw) : {};
    map[id] = status;
    localStorage.setItem("pedidosPagoStatus", JSON.stringify(map));
  } catch {
    // ignore localStorage errors
  }

  // If this is a terminal negative status, ensure backend pedido is marked Rechazado
  try {
    if (terminalStatuses.has(status)) {
      // best-effort: don't throw if server call fails
      await actualizarEstadoPedido(id, "Rechazado");
    }
  } catch (e) {
    // swallow errors but log for debugging
    // eslint-disable-next-line no-console
    console.warn("Failed to update pedido estado to Rechazado:", e);
  }
}

export function getPedidoPagoStatusMap(): Record<number, string> {
  try {
    const raw = localStorage.getItem("pedidosPagoStatus");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getPedidoPagoStatus(id: number, estadoPedido: string) {
  const map = getPedidoPagoStatusMap();
  if (map[id]) return map[id];
  if (estadoPedido === "Realizado") return "pagado";
  if (estadoPedido === "Rechazado") return "devuelto";
  return "pendiente";
}

export default setPedidoPagoStatus;
