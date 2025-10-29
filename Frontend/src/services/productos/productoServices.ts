import type { Producto, ProductoFormData } from "@/types/product";

const BASE_URL = "http://localhost:8080/api/productos";

// Listar todos los productos
export async function listarProductos(): Promise<Producto[]> {
  const res = await fetch(BASE_URL, { method: "GET" });
  if (!res.ok) throw new Error("Error al cargar productos");
  return await res.json();
}

// Registrar nuevo producto
export async function registrarProducto(data: ProductoFormData) {
  const formData = new FormData();
  formData.append("nomProd", data.nomProd);
  formData.append("categoria", data.categoria);
  formData.append("subcategoria", data.subcategoria); 
  formData.append("precioProd", data.precioProd.toString());
  formData.append("cantProd", data.cantProd.toString());

  if (data.marca) formData.append("marca", data.marca); 
  if (data.unidad) formData.append("unidad", data.unidad);
  if (data.imagen) formData.append("imagen", data.imagen); 

  const res = await fetch(BASE_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al registrar producto");
  }

  return await res.json();
}

// Actualizar producto existente
export async function actualizarProducto(id: number, data: ProductoFormData) {
  const formData = new FormData();
  formData.append("nomProd", data.nomProd);
  formData.append("categoria", data.categoria);
  formData.append("precioProd", data.precioProd.toString());
  formData.append("cantProd", data.cantProd.toString());
  formData.append("subcategoria", data.subcategoria); 

  if (data.marca) formData.append("marca", data.marca);
  if (data.unidad) formData.append("unidad", data.unidad);
  if (data.imagen) formData.append("imagen", data.imagen);
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al actualizar producto");
  }

  return await res.json();
}

// Eliminar producto
export async function eliminarProducto(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al eliminar producto");
  }

  return await res.json();
}
