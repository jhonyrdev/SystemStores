import { useState, useEffect } from "react";
import DynamicForm from "../common/dynamicForm";
import type { FieldConfig } from "../common/dynamicForm";
import type { Cliente } from "@/types/cliente";
import { getClienteLogueado, actualizarCliente } from "@/services/cliente/clienteService";

const ProfileCard = () => {
  const [editMode, setEditMode] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapBackendToCliente = (data: any): Cliente => ({
    idCliente: data.idCliente,
    nombre: data.nomCli,
    apellido: data.apeCli,
    correo: data.correoCli,
    telefono: data.telCli,
    estado: data.estado,
    fechaRegistro: data.fechaRegistro,
    gastoTotal: data.gastoTotal,
    usuario: data.usuario,
    rol: data.rol,
  });

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
      alert("Perfil actualizado correctamente ✅");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("No se pudo guardar el perfil");
    }
  };

  // 🔹 Cancelar edición
  const handleCancel = () => setEditMode(false);

  // 🔹 Modo visualización
  const renderViewMode = () => (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {cliente ? (
        fields.map(({ name, label }) => (
          <div
            key={name}
            className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0"
          >
            <span className="font-semibold">{label}:</span>
            <span className="break-words truncate sm:truncate max-w-full">
              {cliente[name as keyof Cliente] || "—"}
            </span>
          </div>
        ))
      ) : (
        <p className="text-gray-500">Cargando perfil...</p>
      )}

      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        className="text-center text-sm text-gray-500 cursor-pointer hover:underline"
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
