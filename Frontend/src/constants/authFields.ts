import { type FieldConfig } from "@components/common/dynamicForm";

export const loginFields: FieldConfig[] = [
  {
    name: "email",
    label: "Correo o Usuario",
    type: "text",
    placeholder: "email@ejemplo.com o tu_usuario",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "contraseña",
    required: true,
  },
];

export const registerFields: FieldConfig[] = [
  {
    name: "name",
    label: "nombre",
    type: "text",
    placeholder: "Tu nombre",
    required: true,
  },
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "email@ejemplo.com",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "contraseña",
    required: true,
  },
];

export const getProductoFields = (
  categorias: { nombre: string }[],
  subcategorias: { nombre: string; idCat?: number }[],
  isLoadingCategorias: boolean,
  isLoadingSubcategorias: boolean,
  categoriaSeleccionada?: string,
  isEditing?: boolean
): FieldConfig[] => [
  {
    name: "nomProd",
    label: "Nombre del producto",
    type: "text",
    placeholder: "Ingrese nombre del producto",
    required: true,
  },
  {
    name: "marca",
    label: "Marca",
    type: "text",
    placeholder: "Ingrese la marca",
  },
  {
    name: "unidad",
    label: "Unidad",
    type: "text",
    placeholder: "Ej: kg, unidad, caja...",
  },
  {
    name: "categoria",
    label: "Categoría",
    type: "select",
    options: categorias.map((c) => ({ label: c.nombre, value: c.nombre })),
    placeholder: isLoadingCategorias
      ? "Cargando categorías..."
      : categorias.length === 0
      ? "No hay categorías disponibles"
      : "Seleccione una categoría",
    required: true,
    disabled: isLoadingCategorias || categorias.length === 0,
  },
  {
    name: "subcategoria",
    label: "Subcategoría",
    type: "select",
    options: subcategorias.map((s) => ({ label: s.nombre, value: s.nombre })),
    placeholder: !categoriaSeleccionada
      ? "Seleccione una categoría primero"
      : isLoadingSubcategorias
      ? "Cargando subcategorías..."
      : subcategorias.length === 0
      ? "No hay subcategorías disponibles"
      : "Seleccione una subcategoría",
    required: true,
    disabled: !categoriaSeleccionada || isLoadingSubcategorias,
  },
  {
    name: "precioProd",
    label: "Precio",
    type: "number",
    placeholder: "Ingrese precio",
    required: true,
  },
  {
    name: "cantProd",
    label: "Stock",
    type: "number",
    placeholder: "Ingrese cantidad (mínimo 5)",
    required: true,
  },
  {
    name: "imagen",
    label: "Imagen del producto",
    type: "file",
    required: !isEditing,
  },
];