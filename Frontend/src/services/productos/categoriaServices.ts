const BASE_URL = "http://localhost:8080/api/categorias";

export async function listarCategorias() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener categorías");
  return await res.json();
}
