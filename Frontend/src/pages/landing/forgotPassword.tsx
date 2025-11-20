import { useState } from "react";
import { solicitarRecuperacionContrasena } from "@/services/auth/userServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setIsLoading(true);

    try {
      const response = await solicitarRecuperacionContrasena(email);
      setMessage(response.message);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar recuperación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar instrucciones"}
            </Button>
            <Link to="/auth/login" className="text-sm text-blue-600 hover:text-blue-800 text-center w-full">
              Volver al inicio de sesión
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
