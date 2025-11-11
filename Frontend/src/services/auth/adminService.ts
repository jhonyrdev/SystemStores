import api from "@/utils/axiomInstance";

interface VerifyAdminRequest {
  password: string;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const payload: VerifyAdminRequest = { password }; 
  try {
    await api.post("/api/usuarios/admin/verify", payload);
    return true;
  } catch (error: unknown) {
    console.error("Error al verificar contraseña de admin:", error);
    return false;
  }
}
