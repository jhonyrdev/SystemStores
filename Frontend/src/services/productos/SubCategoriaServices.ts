const BASE_URL = "http://localhost:8080/api/subcategorias";

// Obtiene subcategorías por ID de categoría
export async function listarSubcategoriasPorCategoria(idCat: number) {
  const res = await fetch(`${BASE_URL}/por-categoria/${idCat}`);
  if (!res.ok) throw new Error(`Error al obtener subcategorías de la categoría ${idCat}`);
  return await res.json();
}
