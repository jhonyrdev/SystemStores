import type { Cliente } from "@/types/cliente";
import api from "@/utils/axiomInstance";

interface ClienteAPI {
  idCliente: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  estado: "activo" | "inactivo";
  fechaRegistro?: string;
  usuario?: string;
  rol?: string;
}

export async function listarClientes(): Promise<Cliente[]> {
  try {
    const res = await api.get<ClienteAPI[]>("/api/clientes");
    return res.data.map((cliente) => ({
      ...cliente,
      estado: cliente.estado === "activo" ? "Activo" : "Inactivo",
      gastoTotal: "S/. 0.00", // se actualiza luego si se solicita gastos
    }));
  } catch (error: unknown) {
    console.error("Error al cargar clientes:", error);
    throw new Error("Error al cargar clientes");
  }
}

interface ClienteGastoAPI {
  idCliente: number;
  nombre: string;
  apellido: string;
  correo: string;
  estado: string;
  gastoTotal: number; // viene como número (BigDecimal serializado)
}

export async function listarGastosClientes(): Promise<Record<number, number>> {
  try {
    const res = await api.get<ClienteGastoAPI[]>("/api/clientes/gastos");
    const map: Record<number, number> = {};
    res.data.forEach(c => { map[c.idCliente] = Number(c.gastoTotal); });
    return map;
  } catch (error: unknown) {
    console.error("Error al cargar gastos de clientes:", error);
    return {}; // fallback
  }
}

export async function getClienteLogueado(): Promise<Cliente> {
  try {
    const res = await api.get<Cliente>("/api/usuarios/me", { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("No hay sesión activa:", error);
    throw new Error("No hay sesión activa");
  }
}

export async function actualizarCliente(cliente: Cliente): Promise<Cliente> {
  try {
    const res = await api.put<{ cliente: Cliente }>(
      `/api/clientes/${cliente.idCliente}`,
      {
        nomCli: cliente.nombre,
        apeCli: cliente.apellido,
        correoCli: cliente.correo,
        telCli: cliente.telefono,
      },
      { withCredentials: true }
    );

    return res.data.cliente || cliente;
  } catch (error: unknown) {
    console.error("Error al actualizar cliente:", error);
    throw new Error("Error al actualizar cliente");
  }
}
