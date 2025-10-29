const BASE_URL = "http://localhost:8080/api/usuarios";

interface LoginResponse {
  message: string;
}
interface RegisterResponse {
  message: string;
}

export async function loginUsuario(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/loginCliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identificador: email, clave: password }),
    credentials: "include",
  });

  if (!res.ok) throw new Error(`Error en login: ${res.status}`);

  return await res.json() as LoginResponse;
}

export async function getLoggedUser() {
  const res = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No hay usuario logueado");
  }

  return await res.json();
}

export async function logoutUsuario() {
  await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function registrarUsuario(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: name,
      correo: email,
      clave: password,
    }),
  });

  if (!res.ok) throw new Error(`Error en el registro: ${res.status}`);

  return await res.json() as RegisterResponse;
}