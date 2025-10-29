export async function verifyAdminPassword(password: string): Promise<boolean> {
  const res = await fetch("http://localhost:8080/api/usuarios/admin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  return res.ok;
}