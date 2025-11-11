import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mapBackendToCliente } from "@/utils/clienteMapper";
import { toast } from "sonner";
import api from "@/utils/axiomInstance";
import type { Cliente } from "@/types/cliente";

interface GoogleLoginResponse {
  cliente?: Cliente;
}

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasRun = useRef(false); 

  useEffect(() => {
    if (hasRun.current) return; 
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      toast.error("Error", { description: "No se recibió el código de autorización" });
      navigate("/");
      return;
    }

    const loginGoogle = async () => {
      try {
        const { data } = await api.post<GoogleLoginResponse>(
          `/api/usuarios/google-login`,
          { code },
          { withCredentials: true }
        );

        console.log("✅ Respuesta completa del backend:", data);

        if (!data.cliente) throw new Error("No se recibieron datos del cliente");

        const clienteMapeado = mapBackendToCliente(data.cliente);
        localStorage.setItem("usuario", JSON.stringify(clienteMapeado));

        toast.success("¡Bienvenido!", { description: `Hola ${data.cliente.nombre}` });
        navigate("/cuenta");
      } catch (err: unknown) {
        console.error("❌ Error al iniciar sesión:", err);
        toast.error("Error al iniciar sesión", { description: "Hubo un error en el servidor." });
        navigate("/");
      }
    };

    loginGoogle();
  }, [navigate]);

  return null;
};

export default AuthCallback;
