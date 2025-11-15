// PEDIDO
export interface DetallePedido {
  id_prod: number;
  cantidad: number;
  precio_unit: number;
  subtotal: number;
}

export interface PedidoRequest {
  id_cli: number;
  tipo_entrega: "envio" | "recojo";
  id_dir?: number;
  total: number;
  detalles: DetallePedido[];
}

export interface PedidoResponse {
  id_ped: number;
  fecha: string;
  hora: string;
  total: number;
  estado: "Nuevo" | "Realizado" | "Rechazado";
}

// Pedido tal como lo devuelve el backend
export interface DetallePedidoBackend {
  id?: number;
  idProd?: number;
  id_prod?: number;
  cantidad: number;
  precioUnit?: number;
  precio_unit?: number;
  subtotal: number;
}

export interface DireccionBackend {
  idDir?: number;
  id?: number;
  [key: string]: unknown;
}

export interface Pedido {
  idPed: number;
  cliente: Record<string, unknown>;
  direccion?: DireccionBackend | null;
  fecha: string;
  hora: string;
  tipoEntrega: "envio" | "recojo";
  estado: "Nuevo" | "Realizado" | "Rechazado";
  total: number | string;
  detallePedidos: DetallePedidoBackend[];
}

export interface ActionResponse {
  mensaje?: string;
  id_ped?: number;
  estado?: string;
}

// VENTA
export interface DetalleVenta {
  id_prod: number;
  nom_prod: string;
  cantidad: number;
  precio_unit: number;
  subtotal: number;
}

export interface VentaRequest {
  id_cli: number;
  id_ped?: number;
  id_metodo: number;
  total: number;
  tipo: "boleta" | "factura";
  codigo: string;
  ruc_cliente?: string;
  razon_social_cliente?: string;
  detalles: DetalleVenta[];
}

export interface VentaResponse {
  id_venta: number;
  fecha: string;
  hora: string;
  total: number;
  tipo: "boleta" | "factura";
}
