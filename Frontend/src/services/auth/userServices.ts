import api from "@/utils/axiomInstance";

interface LoginResponse {
  message: string;
}
interface RegisterResponse {
  message: string;
}

interface User {
  id: number;
  nombre: string;
  correo: string;
}

export async function loginUsuario(email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await api.post<LoginResponse>(
      "/api/usuarios/loginCliente",
      { identificador: email, clave: password },
      { withCredentials: true }
    );
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error en login:", error.message);
      throw new Error(error.message || "Error en login");
    }
    throw new Error("Error en login");
  }
}

export async function getLoggedUser(): Promise<User> {
  try {
    const res = await api.get<User>("/api/usuarios/me", { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("No hay usuario logueado:", error);
    throw new Error("No hay usuario logueado");
  }
}

export async function logoutUsuario(): Promise<void> {
  try {
    await api.post("/api/usuarios/logout", undefined, { withCredentials: true });
  } catch (error: unknown) {
    console.error("Error al cerrar sesión:", error);
    throw new Error("Error al cerrar sesión");
  }
}

export async function registrarUsuario(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  try {
    const res = await api.post<RegisterResponse>(
      "/api/usuarios/register",
      { nombre: name, correo: email, clave: password }
    );
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error en el registro:", error.message);
      throw new Error(error.message || "Error en el registro");
    }
    throw new Error("Error en el registro");
  }
}