import React, { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import Modal from "@components/common/Modal";
import DynamicForm from "@/components/common/dynamicForm";
import { toast } from "sonner";
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

interface FormProductoProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Producto;
  onSuccess: () => void;
}

const FormProducto: React.FC<FormProductoProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
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

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setIsLoadingCategorias(true);
        const data = await listarCategorias();
        setCategorias(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error("Error al cargar categorías", { description: err.message });
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error al cargar subcategorías:", err);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    const stockMinimo =
      categoriaSeleccionada.toLowerCase() === "comidas" ? 2 : 5;

    if (Number(data.cantProd) < stockMinimo) {
      toast.error("Stock inválido", {
        description: `El stock debe ser mayor o igual a ${stockMinimo}`,
      });
      return;
    }

    if (!data.categoria) {
      toast.error("Categoría requerida", {
        description: "Por favor seleccione una categoría",
      });
      return;
    }

    if (!data.categoria || !data.subcategoria) {
      toast.error("Campos requeridos", {
        description: "Seleccione categoría y subcategoría",
      });
      return;
    }

    if (!data.precioProd || Number(data.precioProd) <= 0) {
      toast.error("Precio inválido", {
        description: "El precio debe ser mayor a 0",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const productoData: ProductoFormData = {
        nomProd: data.nomProd,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        precioProd: Number(data.precioProd),
        cantProd: Number(data.cantProd),
        marca: data.marca || "",
        unidad: data.unidad || "",
        imagen: data.imagen || null,
      };

      if (productToEdit?.idProd) {
        await actualizarProducto(productToEdit.idProd, productoData);
        toast.success("Producto actualizado", {
          description: `${data.nomProd} se actualizó correctamente`,
          
        });
      } else {
        await registrarProducto(productoData);
        toast.success("Producto registrado", {
          description: `${data.nomProd} se registró correctamente`,
        });
      }

      onSuccess();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = (name: string, value: any) => {
    if (name === "categoria") {
      setCategoriaSeleccionada(value);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <DialogTitle>
        {productToEdit ? "Actualizar Producto" : "Registrar Producto"}
      </DialogTitle>
      <DialogDescription>
        {productToEdit
          ? "Modifica los datos del producto y guarda los cambios."
          : "Llena el formulario para registrar un nuevo producto."}
      </DialogDescription>
      <div className="p-0 sm:p-4">
        <h2 className="text-xl font-semibold mb-4">
          {productToEdit ? "Actualizar Producto" : "Registrar Producto"}
        </h2>
        {productToEdit?.imgProd && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
            <img
              src={`http://localhost:8080/uploads/productos/${productToEdit.imgProd}`}
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
