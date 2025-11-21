import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { loginUsuario, registrarUsuario } from "@/services/auth/userServices";

interface UserAuthOptions {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const STORAGE_KEY = "auth_block_info";

type BlockInfo = {
  attempts: number;
  blockedUntil: number | null;
};

const DEFAULT_INFO: BlockInfo = { attempts: 0, blockedUntil: null };

const readInfo = (): BlockInfo => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INFO;
    const parsed = JSON.parse(raw) as BlockInfo;
    if (!parsed) return DEFAULT_INFO;
    if (parsed.blockedUntil && parsed.blockedUntil <= Date.now()) {
      return DEFAULT_INFO;
    }
    return parsed;
  } catch {
    return DEFAULT_INFO;
  }
};

const writeInfo = (info: BlockInfo) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    // ignore
  }
};

type ErrorWithStatus = Error & { status?: number };

const getErrorInfo = (err: unknown): { status?: number; message?: string } => {
  if (typeof err === "object" && err !== null) {
    const asAny = err as { status?: number; message?: string };
    return { status: asAny.status, message: asAny.message };
  }
  return {};
};

const UserAuth = ({ onSuccess, onError }: UserAuthOptions = {}) => {
  const navigate = useNavigate();
  const initInfo = readInfo();

  const isBlocked =
    !!initInfo.blockedUntil && initInfo.blockedUntil > Date.now();
  const blockedUntil = initInfo.blockedUntil;

  const login = useCallback(
    async (email: string, password: string) => {
      const currentInfo = readInfo();
      if (currentInfo.blockedUntil && currentInfo.blockedUntil > Date.now()) {
        const remaining = Math.max(0, currentInfo.blockedUntil - Date.now());
        onError?.(
          `Cuenta bloqueada temporalmente. Inténtalo en ${Math.ceil(
            remaining / 60000
          )} minutos.`
        );
        const err = new Error("blocked") as ErrorWithStatus;
        err.status = 429;
        throw err;
      }

      try {
        await loginUsuario(email, password);
        const userResponse = await fetch(
          "http://localhost:8080/api/usuarios/me",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!userResponse.ok) {
          throw new Error("No se pudieron obtener los datos del usuario");
        }
        const userData = await userResponse.json();
        localStorage.setItem("usuario", JSON.stringify(userData));
        window.dispatchEvent(new Event("userLoggedIn"));
        navigate("/cuenta");
        onSuccess?.();
        writeInfo(DEFAULT_INFO);
        return userData;
      } catch (error: unknown) {
        const infoErr = getErrorInfo(error);
        let message = infoErr.message ?? "Error inesperado";

        if (infoErr.status === 403) {
          message = "Usuario no permitido";
        } else if (infoErr.status === 401) {
          message = "Credenciales incorrectas";
        } else if (infoErr.message === "Failed to fetch") {
          message = "No se pudo conectar con el servidor";
        } else if (infoErr.message?.includes("datos del usuario")) {
          message = "Error al cargar los datos del usuario";
        }

        // increment attempts and possibly block
        try {
          const cur = readInfo();
          const now = Date.now();
          const attempts = (cur.attempts || 0) + 1;
          if (attempts >= 3) {
            const blockedUntilTs = now + 3 * 60 * 1000; // 3min
            writeInfo({ attempts: 0, blockedUntil: blockedUntilTs });
            onError?.(
              "Demasiados intentos. La cuenta se ha bloqueado temporalmente por 3minutos."
            );
          } else {
            writeInfo({ attempts, blockedUntil: null });
            onError?.(message);
          }
        } catch {
          onError?.(message);
        }

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
      } catch (error: unknown) {
        const infoErr = getErrorInfo(error);
        let message = infoErr.message ?? "Ocurrió un error en el registro";
        if (infoErr.message === "Failed to fetch") {
          message = "No se pudo conectar con el servidor";
        }
        onError?.(message);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  return { login, register, isBlocked, blockedUntil };
};

export default UserAuth;
