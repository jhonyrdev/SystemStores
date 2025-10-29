import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { loginUsuario, registrarUsuario } from "@/services/auth/userServices";

interface UserAuthOptions {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const UserAuth = ({ onSuccess, onError }: UserAuthOptions = {}) => {
  const navigate = useNavigate();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await loginUsuario(email, password);
        const userResponse = await fetch('http://localhost:8080/api/usuarios/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!userResponse.ok) {
          throw new Error('No se pudieron obtener los datos del usuario');
        }
        const userData = await userResponse.json();
        localStorage.setItem("usuario", JSON.stringify(userData));
        window.dispatchEvent(new Event("userLoggedIn"));
        navigate("/cuenta");
        onSuccess?.();
        return userData;
      } catch (error: any) {
        let message = "Error inesperado";

        if (error?.status === 403) {
          message = "Usuario no permitido";
        } else if (error?.status === 401) {
          message = "Credenciales incorrectas";
        } else if (error?.message === "Failed to fetch") {
          message = "No se pudo conectar con el servidor";
        } else if (error?.message?.includes("datos del usuario")) {
          message = "Error al cargar los datos del usuario";
        }

        onError?.(message);
        throw error;
      }
    },
    [navigate, onSuccess, onError]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const user = await registrarUsuario(name, email, password);
        onSuccess?.();
        return user;
      } catch (error: any) {
        let message = "Ocurrió un error en el registro";
        if (error?.message === "Failed to fetch") {
          message = "No se pudo conectar con el servidor";
        }
        onError?.(message);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return { login, register };
};

export default UserAuth;