import api from "@/utils/axiomInstance";
import type { Direccion } from "@/types/direccion";

interface DireccionAPI {
  id_dir: number;
  direccion: string;
  tipo: string;
  en_uso: number;
}

export async function listarDireccionesCliente(
  idCliente: number
): Promise<Direccion[]> {
  try {
    const res = await api.get<DireccionAPI[]>(
      `/api/direcciones/cliente/${idCliente}`,
      {
        withCredentials: true,
      }
    );

    return res.data.map((d) => ({
      id: d.id_dir,
      texto: d.direccion,
      tipo: d.tipo,
      enUso: d.en_uso === 1,
    }));
  } catch (error: unknown) {
    console.error("Error al cargar direcciones:", error);
    throw new Error("Error al cargar direcciones");
  }
}

export async function crearDireccion(
  idCliente: number,
  direccion: string,
  tipo: string
): Promise<void> {
  try {
    await api.post(
      "/api/direcciones",
      { idCliente, direccion, tipo },
      { withCredentials: true }
    );
  } catch (error: unknown) {
    console.error("Error al crear la dirección:", error);
    throw new Error("Error al crear la dirección");
  }
}

export async function editarDireccion(
  id: number,
  direccion: string,
  tipo: string
): Promise<void> {
  try {
    await api.put(
      `/api/direcciones/${id}`,
      { direccion, tipo },
      { withCredentials: true }
    );
  } catch (error: unknown) {
    console.error("Error al actualizar la dirección:", error);
    throw new Error("Error al actualizar la dirección");
  }
}

export async function eliminarDireccion(id: number): Promise<void> {
  try {
    await api.delete(`/api/direcciones/${id}`, { withCredentials: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const response = (error as { response?: { data?: string } }).response;
      const msg = response?.data || "No se pudo eliminar la dirección";
      console.error("Error al eliminar la dirección:", msg);
      throw new Error(msg);
    }

    throw new Error("No se pudo eliminar la dirección");
  }
}
