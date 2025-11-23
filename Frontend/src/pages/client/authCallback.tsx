import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mapBackendToCliente } from "@/utils/clienteMapper";
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

        if (!data.cliente) throw new Error("No se recibieron datos del cliente");

        const clienteMapeado = mapBackendToCliente(data.cliente);
        localStorage.setItem("usuario", JSON.stringify(clienteMapeado));
        navigate("/cuenta");
      } catch (err: unknown) {
        console.error("Error al iniciar sesión:", err);
        navigate("/");
      }
    };

    loginGoogle();
  }, [navigate]);

  return null;
};

export default AuthCallback;
