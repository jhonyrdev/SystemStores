import api from "@/utils/axiomInstance";

export async function listarCategorias() {
  try {
    const res = await api.get("/api/categorias");
    return res.data; 
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw new Error("Error al obtener categorías");
  }
}
