import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCarrito } from "@/context/carritoContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "@components/common/Modal";
import DynamicForm from "@components/common/dynamicForm";
import { loginFields, registerFields } from "@/constants/authFields";
import { toast } from "sonner";
import UserAuth from "@/hooks/userAuth";
import { Trash2 } from "lucide-react";

const CarritoAside = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (o: boolean) => void }) => {
  const { items, removeItem, updateQuantity } = useCarrito();
  const navigate = useNavigate();
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [modalOpen, setModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  const { login, register } = UserAuth({
    onSuccess: () => {
      toast.success("Acción Exitosa");
      setModalOpen(false);
      navigate("/checkout");
      onOpenChange(false);
    },
    onError: (msg) =>
      toast.error("Algo salió mal", {
        description: msg,
      }),
  });

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      const { name, email, password } = data;
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch { 
      // Error ya manejado en onError
    }
  };

  const handleCheckout = () => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      navigate("/checkout");
      onOpenChange(false);
    } else {
      setModalOpen(true);
    }
  };

  const handleGoogleLogin = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
      const scope =
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
  
      const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}` +
        `&access_type=offline` +
        `&include_granted_scopes=true` +
        `&prompt=consent`;
  
      window.location.href = googleAuthUrl;
    };
  
    const handleOutlookLogin = () => {
      toast.info("Inicio de sesión con Outlook", {
        description: "Esta funcionalidad estará disponible próximamente",
      });
    };

  return (
    <>
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isLoginView ? "Iniciar Sesión" : "Crear Cuenta"}
        description={isLoginView ? "Accede a tu cuenta para continuar" : "Regístrate para comprar"}
      >
        <DynamicForm
          fields={isLoginView ? loginFields : registerFields}
          submitLabel={isLoginView ? "Iniciar Sesión" : "Registrarse"}
          onSubmit={handleSubmit}
          showPasswordStrength={!isLoginView}
          onGoogleLogin={handleGoogleLogin}
          onOutlookLogin={handleOutlookLogin}
          showSocialButtons={true}
        />

        <div className="text-center mt-4 text-sm text-muted-foreground">
          {isLoginView ? (
            <>
              ¿No tienes cuenta?{" "}
              <button className="text-primary font-medium hover:underline" onClick={() => setIsLoginView(false)}>
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button className="text-primary font-medium hover:underline" onClick={() => setIsLoginView(true)}>
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </Modal>

      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-md p-6 flex flex-col bg-principal">
          <SheetTitle>
            <VisuallyHidden>Mi Carrito</VisuallyHidden>
          </SheetTitle>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-secundario font-bold">Mi Carrito</h2>
            <span className="text-sm text-secundario">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto bg-white rounded-xl">
            <div className="py-4 px-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">Tu carrito está vacío.</p>
                  <p className="text-sm text-muted-foreground">¡Agrega productos para empezar!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            S/ {item.price.toFixed(2)} c/u
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded border hover:bg-gray-100 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded border hover:bg-gray-100 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold">
                          S/ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <>
              <div className="mt-6 border-t pt-4 flex justify-between items-center text-white">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-bold text-lg">S/ {total.toFixed(2)}</span>
              </div>

              <Button 
                className="bg-secundario mt-4 text-black font-bold hover:bg-secundario/90" 
                onClick={handleCheckout}
              >
                Finalizar compra
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CarritoAside;