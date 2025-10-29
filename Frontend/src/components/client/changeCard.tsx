import { useState } from "react";
import DynamicForm from "@components/common/dynamicForm";
import type { FieldConfig } from "@components/common/dynamicForm";

type PasswordData = {
  nuevaContrasena: string;
  repetirContrasena: string;
};

const ChangeCard = () => {
  const [editMode, setEditMode] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    nuevaContrasena: "",
    repetirContrasena: "",
  });

  const fields: FieldConfig[] = [
    {
      name: "nuevaContrasena",
      label: "Nueva contraseña",
      type: "password",
    },
    {
      name: "repetirContrasena",
      label: "Repetir contraseña",
      type: "password",
    },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    if (data.nuevaContrasena !== data.repetirContrasena) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Aquí iría lógica para enviar la contraseña (por ejemplo, a una API)
    setPasswordData(data as PasswordData);
    setEditMode(false);
    alert("Contraseña actualizada correctamente.");
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const renderViewMode = () => (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setEditMode(true)}
      >
        Editar contraseña
      </button>
    </div>
  );

  return editMode ? (
    <div className="max-w-2xl mx-auto p-4 border rounded shadow space-y-4">
      <DynamicForm
        title="Cambiar Contraseña"
        fields={fields}
        initialValues={passwordData}
        onSubmit={handleSubmit}
        submitLabel="Guardar"
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

export default ChangeCard;
