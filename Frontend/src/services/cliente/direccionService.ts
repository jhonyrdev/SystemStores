import type { Direccion } from "@/types/direccion";

const BASE_URL = "http://localhost:8080/api/direcciones";

interface DireccionAPI {
  id_dir: number;
  direccion: string;
  tipo: string;
  en_uso: number; 
}

export async function listarDireccionesCliente(idCliente: number): Promise<Direccion[]> {
  const res = await fetch(`${BASE_URL}/cliente/${idCliente}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al cargar direcciones");

  const data: DireccionAPI[] = await res.json();
  
  return data.map((d) => ({
    id: d.id_dir,
    texto: d.direccion,
    tipo: d.tipo,
    enUso: d.en_uso === 1,
  }));
}

export async function crearDireccion(idCliente: number, direccion: string, tipo: string): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idCliente, direccion, tipo }),
  });

  if (!res.ok) throw new Error("Error al crear la dirección");
}

export async function editarDireccion(id: number, direccion: string, tipo: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ direccion, tipo }),
  });

  if (!res.ok) throw new Error("Error al actualizar la dirección");
}

export async function eliminarDireccion(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "No se pudo eliminar la dirección");
  }
}
