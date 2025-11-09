import type { Cliente, ClienteBackend } from "@/types/cliente";

export const mapBackendToCliente = (data: ClienteBackend): Cliente => ({
  idCliente: data.idCli || data.idCliente || 0,
  nombre: data.nomCli || data.nombre || "",
  apellido: data.apeCli || data.apellido || "",
  correo: data.correoCli || data.correo || "",
  telefono: data.telCli || data.telefono || "",
  estado: (data.estado as "Activo" | "Inactivo") || "Activo",
  fechaRegistro: data.fechaReg || data.fechaRegistro || "",
  usuario: data.credencial?.usuario || data.usuario || undefined,
  rol: data.credencial?.rol || data.rol || undefined,
});