import type { Cliente } from "@/types/cliente";

const BASE_URL = "http://localhost:8080/api/clientes";

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
  const res = await fetch(BASE_URL, { method: "GET" });
  if (!res.ok) throw new Error("Error al cargar clientes");
  const data: ClienteAPI[] = await res.json();
  
  return data.map((cliente) => ({
    ...cliente,
    estado: cliente.estado === "activo" ? "Activo" : "Inactivo",
    gastoTotal: "S/. 0.00", 
  }));
}

export async function getClienteLogueado(): Promise<Cliente> {
  const res = await fetch("http://localhost:8080/api/usuarios/me", {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("No hay sesión activa");
  return await res.json();
}

export async function actualizarCliente(cliente: Cliente): Promise<Cliente> {
  const res = await fetch(`${BASE_URL}/${cliente.idCliente}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      nomCli: cliente.nombre,
      apeCli: cliente.apellido,
      correoCli: cliente.correo,
      telCli: cliente.telefono,
    }),
  });

  if (!res.ok) throw new Error("Error al actualizar cliente");
  const data = await res.json();
  return data.cliente || cliente;
}