import { useState, useEffect } from "react";
import DynamicForm from "../common/dynamicForm";
import { mapBackendToCliente } from "@/utils/clienteMapper";
import type { FieldConfig } from "../common/dynamicForm";
import type { Cliente } from "@/types/cliente";
import {
  getClienteLogueado,
  actualizarCliente,
} from "@/services/cliente/clienteService";

const ProfileCard = () => {
  const [editMode, setEditMode] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const storedUser = localStorage.getItem("usuario");
        if (storedUser) {
          setCliente(JSON.parse(storedUser) as Cliente);
          return;
        }

        const userData = await getClienteLogueado();
        const clienteMapeado = mapBackendToCliente(userData);
        localStorage.setItem("usuario", JSON.stringify(clienteMapeado));
        setCliente(clienteMapeado);
      } catch (error) {
        console.warn("No se pudo cargar el perfil:", error);
      }
    };

    cargarCliente();
  }, []);

  const fields: FieldConfig[] = [
    { name: "nombre", label: "Nombre", type: "text" },
    { name: "apellido", label: "Apellido", type: "text" },
    { name: "correo", label: "Correo", type: "email" },
    { name: "telefono", label: "Teléfono", type: "text" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    if (!cliente) return;

    const actualizado = { ...cliente, ...data } as Cliente;

    try {
      const result = await actualizarCliente(actualizado);
      const clienteActualizado = mapBackendToCliente(result);

      setCliente(clienteActualizado);
      localStorage.setItem("usuario", JSON.stringify(clienteActualizado));
      setEditMode(false);
      alert("Perfil actualizado correctamente");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("No se pudo guardar el perfil");
    }
  };

  const handleCancel = () => setEditMode(false);

  const renderViewMode = () => (
    <div className="max-w-3xl p-6 rounded shadow-md space-y-4 bg-[#fcf6e3ff]">
      {cliente ? (
        <div className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-base sm:text-lg md:text-xl w-32">
              Nombre:
            </span>
            <span className="text-sm sm:text-base md:text-lg">
              {cliente.nombre || "—"}
            </span>
          </div>

          {/* Apellido */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-base sm:text-lg md:text-xl w-32">
              Apellido:
            </span>
            <span className="text-sm sm:text-base md:text-lg">
              {cliente.apellido || "—"}
            </span>
          </div>

          {/* Correo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-base sm:text-lg md:text-xl w-32">
              Correo:
            </span>
            <span className="text-sm sm:text-base md:text-lg">
              {cliente.correo || "—"}
            </span>
          </div>

          {/* Teléfono */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-base sm:text-lg md:text-xl w-32">
              Teléfono:
            </span>
            <span className="text-sm sm:text-base md:text-lg">
              {cliente.telefono || "—"}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Cargando perfil...</p>
      )}

      <button
        className="mt-6 px-4 py-2 bg-principal-oscuro text-white rounded hover:text-[#f2c32f] text-sm sm:text-base md:text-lg"
        onClick={() => setEditMode(true)}
      >
        Editar
      </button>
    </div>
  );

  return editMode && cliente ? (
    <div className="max-w-2xl mx-auto p-4 border rounded shadow space-y-4">
      <DynamicForm
        title="Editar Perfil"
        fields={fields}
        initialValues={cliente}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
      <p
        className="text-center text-sm text-[#5e0956] hover:font-semibold cursor-pointer"
        onClick={handleCancel}
      >
        Volver...
      </p>
    </div>
  ) : (
    renderViewMode()
  );
};

export default ProfileCard;
