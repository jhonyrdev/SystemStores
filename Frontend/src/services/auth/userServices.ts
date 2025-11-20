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

interface CambiarClaveResponse { message: string }

export async function cambiarClaveUsuario(
  claveActual: string,
  nuevaClave: string,
  repetirClave: string
): Promise<CambiarClaveResponse> {
  try {
    const res = await api.post<CambiarClaveResponse>(
      "/api/usuarios/cambiar-clave",
      { claveActual, nuevaClave, repetirClave },
      { withCredentials: true }
    );
    return res.data;
  } catch (error: unknown) {
        type AxiosLikeError = Error & { response?: { data?: { error?: string } } };
    const e = error as AxiosLikeError;
    if (e.response?.data?.error) {
      throw new Error(e.response.data.error);
    }
    if (e instanceof Error) {
      throw new Error(e.message || 'Error al cambiar la contraseña');
    }
    throw new Error('Error al cambiar la contraseña');
  }
}

// Solicitar recuperación de contraseña
export async function solicitarRecuperacionContrasena(email: string): Promise<{ message: string }> {
  try {
    const res = await api.post<{ message: string }>(
      "/api/usuarios/forgot-password",
      { email }
    );
    return res.data;
  } catch (error: unknown) {
    type AxiosLikeError = Error & { response?: { data?: { error?: string } } };
    const e = error as AxiosLikeError;
    if (e.response?.data?.error) {
      throw new Error(e.response.data.error);
    }
    if (e instanceof Error) {
      throw new Error(e.message || 'Error al solicitar recuperación de contraseña');
    }
    throw new Error('Error al solicitar recuperación de contraseña');
  }
}

// Restablecer contraseña con token
export async function restablecerContrasena(token: string, nuevaContrasena: string): Promise<{ message: string }> {
  try {
    const res = await api.post<{ message: string }>(
      "/api/usuarios/reset-password",
      { token, nuevaContrasena }
    );
    return res.data;
  } catch (error: unknown) {
    type AxiosLikeError = Error & { response?: { data?: { error?: string } } };
    const e = error as AxiosLikeError;
    if (e.response?.data?.error) {
      throw new Error(e.response.data.error);
    }
    if (e instanceof Error) {
      throw new Error(e.message || 'Error al restablecer contraseña');
    }
    throw new Error('Error al restablecer contraseña');
  }
}