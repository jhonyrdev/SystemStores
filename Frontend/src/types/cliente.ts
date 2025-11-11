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

export interface ClienteBackend {
  idCli?: number;
  idCliente?: number;
  nomCli?: string;
  nombre?: string;
  apeCli?: string;
  apellido?: string;
  correoCli?: string;
  correo?: string;
  telCli?: string;
  telefono?: string;
  estado?: string;
  fechaReg?: string;
  fechaRegistro?: string;
  usuario?: string;
  rol?: string;
  credencial?: {
    usuario: string;
    rol: string;
  };
}