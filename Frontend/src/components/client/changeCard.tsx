import { useState } from "react";
import { toast } from "sonner";
import DynamicForm from "@components/common/dynamicForm";
import type { FieldConfig } from "@components/common/dynamicForm";

type PasswordData = {
  claveActual: string;
  nuevaContrasena: string;
  repetirContrasena: string;
};

const ChangeCard = () => {
  const [editMode, setEditMode] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    claveActual: "",
    nuevaContrasena: "",
    repetirContrasena: "",
  });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const fields: FieldConfig[] = [
    {
      name: "claveActual",
      label: "Contraseña actual",
      type: "password",
    },
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

  const validar = (data: PasswordData): Record<string,string> => {
    const e: Record<string,string> = {};
    if (!data.claveActual) e.claveActual = "Requerido";
    if (!data.nuevaContrasena) e.nuevaContrasena = "Requerido";
    if (!data.repetirContrasena) e.repetirContrasena = "Requerido";
    if (data.nuevaContrasena && data.nuevaContrasena.length < 8) e.nuevaContrasena = "Mínimo 8 caracteres";
    if (data.nuevaContrasena && !/[A-Za-z]/.test(data.nuevaContrasena)) e.nuevaContrasena = "Debe incluir letras";
    if (data.nuevaContrasena && !/[0-9]/.test(data.nuevaContrasena)) e.nuevaContrasena = (e.nuevaContrasena ? e.nuevaContrasena + ' y números' : 'Debe incluir números');
    if (data.nuevaContrasena === data.claveActual) e.nuevaContrasena = "Debe ser diferente a la actual";
    if (data.nuevaContrasena !== data.repetirContrasena) e.repetirContrasena = "No coincide";
    return e;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    setServerError(null); setSuccess(null);
    const payload = data as PasswordData;
    const v = validar(payload);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    try {
      setLoading(true);
      const { cambiarClaveUsuario } = await import("@/services/auth/userServices");
      await cambiarClaveUsuario(payload.claveActual, payload.nuevaContrasena, payload.repetirContrasena);
      setSuccess("Contraseña actualizada correctamente.");
      toast.success("Contraseña actualizada");
      setPasswordData({ claveActual: "", nuevaContrasena: "", repetirContrasena: "" });
      // Mantener el modo edición un momento para que se vea el mensaje; opcional: cerrar luego
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cambiar la contraseña";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const renderViewMode = () => (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <button
        className="px-4 py-2 bg-secundario-claro1 text-black rounded hover:font-semibold"
        onClick={() => setEditMode(true)}
      >
        Editar contraseña
      </button>
    </div>
  );

  return editMode ? (
    <div className="max-w-2xl mx-auto p-4 border rounded shadow space-y-4">
      {serverError && <div className="text-red-600 text-sm">{serverError}</div>}
      {success && (
        <div className="text-green-600 text-sm flex justify-between items-center">
          <span>{success}</span>
          <button
            type="button"
            className="text-xs underline"
            onClick={() => { setSuccess(null); setEditMode(false); }}
          >
            Cerrar
          </button>
        </div>
      )}
      <DynamicForm
        title="Cambiar Contraseña"
        fields={fields.map(f => ({...f, error: errors[f.name], disabled: loading}))}
        initialValues={passwordData}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Guardando..." : "Guardar"}
      />
      <p
        className="text-center text-sm text-[#5e0956] hover:font-semibold cursor-pointer"
        onClick={handleCancel}
      >
        Volver...
      </p>
    </div>
  ) : (
    <>
      {success && (
        <div className="max-w-6xl mx-auto p-2 text-green-600 text-sm">{success}</div>
      )}
      {renderViewMode()}
    </>
  );
};

export default ChangeCard;
