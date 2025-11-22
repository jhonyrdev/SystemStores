import React, { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import Modal from "@components/common/Modal";
import DynamicForm from "@/components/common/dynamicForm";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { listarCategorias } from "@/services/productos/categoriaServices";
import { listarSubcategoriasPorCategoria } from "@/services/productos/SubCategoriaServices";
import {
  registrarProducto,
  actualizarProducto,
} from "@/services/productos/productoServices";
import type {
  SubCategoria,
  Producto,
  Categoria,
  ProductoFormData,
} from "@/types/product";
import { getProductoFields } from "@/constants/authFields";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { baseURL } from "@/services/api/axiosInstance";

interface FormProductoProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Producto;
  onSuccess: () => void;
  hideHeader?: boolean;
}

const FormProducto: React.FC<FormProductoProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
  hideHeader = false,
}) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<
    SubCategoria[]
  >([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("");
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);
  const [isLoadingSubcategorias, setIsLoadingSubcategorias] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setIsLoadingCategorias(true);
        const data = await listarCategorias();
        setCategorias(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        Swal.fire({
          icon: "error",
          title: "Error al cargar categorías",
          text: message,
        });
      } finally {
        setIsLoadingCategorias(false);
      }
    };
    if (isOpen) fetchCategorias();
  }, [isOpen]);

  // Cargar subcategorías
  useEffect(() => {
    const fetchSubcategoriasPorCategoria = async () => {
      if (!categoriaSeleccionada) {
        setFilteredSubcategorias([]);
        return;
      }
      const categoria = categorias.find(
        (c) => c.nombre === categoriaSeleccionada
      );
      if (!categoria?.idCat) {
        setFilteredSubcategorias([]);
        return;
      }
      try {
        setIsLoadingSubcategorias(true);
        const data = await listarSubcategoriasPorCategoria(categoria.idCat);
        setFilteredSubcategorias(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error al cargar subcategorías:", message);
      } finally {
        setIsLoadingSubcategorias(false);
      }
    };

    if (isOpen) fetchSubcategoriasPorCategoria();
  }, [isOpen, categoriaSeleccionada, categorias]);

  useEffect(() => {
    if (productToEdit?.categoria) {
      setCategoriaSeleccionada(productToEdit.categoria);
    } else {
      setCategoriaSeleccionada("");
    }
  }, [productToEdit]);

  const isEditing = Boolean(productToEdit?.idProd);

  const fields = React.useMemo(
    () =>
      getProductoFields(
        categorias,
        filteredSubcategorias,
        isLoadingCategorias,
        isLoadingSubcategorias,
        categoriaSeleccionada,
        isEditing
      ),
    [
      categorias,
      filteredSubcategorias,
      isLoadingCategorias,
      isLoadingSubcategorias,
      categoriaSeleccionada,
      isEditing,
    ]
  );

  const initialValues = React.useMemo(
    () => ({
      nomProd: productToEdit?.nombre || "",
      categoria: productToEdit?.categoria || "",
      subcategoria: productToEdit?.subcategoria || "",
      precioProd: productToEdit?.precio
        ? parseFloat(productToEdit.precio.replace("S/.", "").trim())
        : "",

      cantProd: productToEdit?.stock || "",
      marca: productToEdit?.marca || "",
      unidad: productToEdit?.unidad || "",
      imagen: null,
    }),
    [productToEdit]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const stockMinimo =
      categoriaSeleccionada.toLowerCase() === "comidas" ? 2 : 5;

    const cantVal = Number(String(data.cantProd ?? ""));
    const categoriaVal = String(data.categoria ?? "");
    const subcategoriaVal = String(data.subcategoria ?? "");
    const precioVal = Number(String(data.precioProd ?? ""));

    if (Number.isNaN(cantVal) || cantVal < stockMinimo) {
      setFormError(`El stock debe ser mayor o igual a ${stockMinimo}`);
      return;
    }

    if (!categoriaVal) {
      setFormError("Por favor seleccione una categoría");
      return;
    }

    if (!categoriaVal || !subcategoriaVal) {
      setFormError("Seleccione categoría y subcategoría");
      return;
    }

    if (Number.isNaN(precioVal) || precioVal <= 0) {
      setFormError("El precio debe ser mayor a 0");
      return;
    }

    try {
      // clear previous form-level validation error when attempting submit
      setFormError(null);
      setIsSubmitting(true);
      const productoData: ProductoFormData = {
        nomProd: String(data.nomProd ?? ""),
        categoria: categoriaVal,
        subcategoria: subcategoriaVal,
        precioProd: precioVal,
        cantProd: cantVal,
        marca: String(data.marca ?? ""),
        unidad: String(data.unidad ?? ""),
        imagen: (data.imagen as File) || null,
      };

      if (productToEdit?.idProd) {
        await actualizarProducto(productToEdit.idProd, productoData);
        Swal.fire({
          icon: "success",
          title: "Producto actualizado",
        });
      } else {
        await registrarProducto(productoData);
        Swal.fire({
          icon: "success",
          title: "Producto registrado",
        });
      }

      onSuccess();
      setFormError(null);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Swal.fire({ icon: "error", title: "Error", text: message });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFieldChange = (name: string, value: unknown) => {
    setFormError(null);
    if (name === "categoria") {
      setCategoriaSeleccionada(String(value ?? ""));
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <DialogTitle
        className={`${hideHeader ? "hidden" : ""} sin-titulo-target`}
      >
        {productToEdit ? "Actualizar Producto" : "Registrar Producto"}
      </DialogTitle>
      <DialogDescription
        className={`${hideHeader ? "hidden" : ""} sin-titulo-desc`}
      >
        {productToEdit
          ? "Modifica los datos del producto y guarda los cambios."
          : "Llena el formulario para registrar un nuevo producto."}
      </DialogDescription>
      <div className="p-0 sm:p-4 max-h-[70vh] overflow-auto">
        {productToEdit?.imgProd && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
            <img
              src={`${baseURL.replace(/\/$/, "")}/uploads/productos/${
                productToEdit.imgProd
              }`}
              alt="Imagen del producto"
              className="w-32 h-32 object-cover rounded-md border"
            />
          </div>
        )}

        <DynamicForm
          fields={fields}
          initialValues={initialValues}
          submitLabel={
            isSubmitting
              ? "Guardando..."
              : productToEdit
              ? "Actualizar"
              : "Registrar"
          }
          onChangeField={handleFieldChange}
          onSubmit={handleSubmit}
          formError={formError}
        />

        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};

export default FormProducto;
