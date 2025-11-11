import api from "@/utils/axiomInstance";

export async function listarSubcategoriasPorCategoria(idCat: number) {
  const res = await api.get(`/api/subcategorias/por-categoria/${idCat}`);
  return res.data;
}
