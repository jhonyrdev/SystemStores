export interface Cliente {
  idCliente: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  estado?: "Activo" | "Inactivo";
  fechaRegistro?: string;
  gastoTotal?: string;
  usuario?: string;
  rol?: string;
}