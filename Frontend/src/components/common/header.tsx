import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useCarrito from "@/hooks/useCarrito";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@components/ui/separator";
import { toast } from "sonner";
import { Menu, ShoppingBag, User, Search } from "lucide-react";
import Modal from "@components/common/Modal";
import DynamicForm from "@components/common/dynamicForm";
import { loginFields, registerFields } from "@/constants/authFields";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CarritoAside from "../landing/carritoAside";
import UserAuth from "@/hooks/userAuth";
import DropdownCateg from "./DropdownCateg";
import MobileCategorias from "@components/landing/menuCat";
import { listarCategorias } from "@/services/productos/categoriaServices";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [formResetCounter, setFormResetCounter] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const location = useLocation();
  const isClientPanel = location.pathname.startsWith("/cuenta");

  useEffect(() => {
    const handleCloseModal = () => {
      setModalOpen(false);
    };

    window.addEventListener("closeForgotPasswordModal", handleCloseModal);

    return () => {
      window.removeEventListener("closeForgotPasswordModal", handleCloseModal);
    };
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await listarCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías", error);
      }
    };

    fetchCategorias();
  }, []);

  const [isCarritoOpen, setIsCarritoOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const { items } = useCarrito();
  const handleClick = () => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      navigate("/cuenta");
    } else {
      setIsLoginView(true);
      setFormError(null);
      setFormSuccess(null);
      setFormResetCounter((c) => c + 1);
      setModalOpen(true);
    }
  };

  const { login, register, isBlocked, blockedUntil } = UserAuth({
    onSuccess: () => {
      setFormError(null);
    },
    onError: (msg) => {
      const text = msg || "Ocurrió un error";
      const lowered = text.toLowerCase();
      if (lowered.includes("bloque") || lowered.includes("demasiad")) {
        setFormError(text);
        return;
      }
      if (isLoginView) {
        if (
          lowered.includes("no encontr") ||
          lowered.includes("not found") ||
          lowered.includes("no existe") ||
          lowered.includes("no se")
        ) {
          setFormError(
            "Las credenciales ingresadas no existen. Regístrate ahora."
          );
        } else {
          setFormError("Credenciales inválidas.");
        }
        setTimeout(() => {
          setFormError(null);
          setFormResetCounter((c) => c + 1);
        }, 2200);
      } else {
        setFormError("Datos faltante");
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (isLoginView && isBlocked) {
        const remainingMs = blockedUntil
          ? Math.max(0, blockedUntil - Date.now())
          : 0;

        const mins = Math.ceil(remainingMs / 60000);
        setFormError(
          `Formulario de login bloqueado temporalmente. Inténtalo en ${mins} minuto(s)`
        );
        return;
      }
      const { name, email, password } = data;
      if (isLoginView) {
        try {
          await login(email, password);
          // login successful -> close modal (no toast)
          setFormError(null);
          setModalOpen(false);
        } catch {
          // try to intelligently decide if email exists
          try {
            const { correoExiste } = await import(
              "@/services/auth/userServices"
            );
            const exists = await correoExiste(email);
            if (!exists) {
              setFormError(
                "Las credenciales ingresadas no existen. Regístrate ahora."
              );
            } else {
              setFormError("Credenciales inválidas.");
            }
            // clear and reset inputs shortly after
            setTimeout(() => {
              setFormError(null);
              setFormResetCounter((c) => c + 1);
            }, 2200);
          } catch {
            setFormError("Credenciales inválidas.");
          }
          return;
        }
      } else {
        await register(name, email, password);
        setFormSuccess("Registro exitoso");
        setTimeout(() => {
          setFormSuccess(null);
          setFormResetCounter((c) => c + 1);
          setModalOpen(false);
        }, 2200);
      }
    } catch {
      /* empty */
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
        description={
          isLoginView ? "Accede a tu cuenta" : "Regístrate para comenzar"
        }
      >
        <DynamicForm
          fields={(isLoginView ? loginFields : registerFields).map((f) => ({
            ...f,
            disabled: (isLoginView && isBlocked) || !!f.disabled,
          }))}
          submitLabel={isLoginView ? "Iniciar Sesión" : "Registrarse"}
          onSubmit={handleSubmit}
          resetTrigger={formResetCounter}
          formError={formError}
          formSuccess={formSuccess}
          formErrorPosition={isLoginView ? "top" : "bottom"}
          showPasswordStrength={!isLoginView}
          onGoogleLogin={handleGoogleLogin}
          onOutlookLogin={handleOutlookLogin}
          showSocialButtons={true}
          showForgotPassword={isLoginView}
        />

        {/* Cambiar entre login y registro */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          {isLoginView ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => {
                  setIsLoginView(false);
                  setFormError(null);
                  setFormSuccess(null);
                  setFormResetCounter((c) => c + 1);
                }}
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => {
                  setIsLoginView(true);
                  setFormError(null);
                  setFormSuccess(null);
                  setFormResetCounter((c) => c + 1);
                }}
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </Modal>

      <header className="w-full">
        {/* Barra superior */}
        <div className="bg-principal-oscuro text-white px-5 py-1">
          <div className="container-bootstrap flex justify-center items-center text-sm">
            <span>¡Sobrín@ entregamos tu pedido en 30 minutos!</span>
          </div>
        </div>

        {/* Navbar principal */}
        <nav className="bg-white shadow-sm py-3">
          <div className="container-bootstrap mx-auto flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              {/* Imagen para pantallas grandes */}
              <img
                src="/img/logo/logoPrincipal.webp"
                alt="Tambito+"
                className="hidden sm:block h-8 w-auto"
              />

              {/* Imagen para pantallas pequeñas */}
              <img
                src="/img/logo/logoMobilePrincipal.webp"
                alt="Tambito+"
                className="block sm:hidden h-8 w-auto"
              />
            </Link>

            {/* Menú Desktop (solo en panel cliente) */}
            {isClientPanel && (
              <ul className="hidden md:flex items-center space-x-6">
                <li>
                  {/* Aquí quitamos el botón y mostramos el dropdown fijo */}
                  <div className="relative">
                    <DropdownCateg categorias={categorias} />
                  </div>
                </li>
              </ul>
            )}

            {/* Iconos */}
            <div className="flex items-center gap-4">
              {/* Buscar */}
              <button className="hidden lg:flex text-primary hover:text-primary/80">
                <Search className="h-5 w-5" />
              </button>

              {/* Usuario */}
              <button
                onClick={handleClick}
                className="hidden md:flex text-primary hover:text-primary/80 cursor-pointer"
              >
                <User className="h-5 w-5" />
              </button>

              <Separator
                orientation="vertical"
                className="hidden lg:flex h-5 bg-gray-300"
              />

              {/* Carrito */}
              <button
                onClick={() => setIsCarritoOpen(true)}
                className="relative text-primary hover:text-primary/80 cursor-pointer"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
                    {items.length}
                  </span>
                )}
              </button>

              {/* Componente carrito aside */}
              <CarritoAside
                isOpen={isCarritoOpen}
                onOpenChange={setIsCarritoOpen}
              />

              {/* Menú móvil */}
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-primary"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-screen h-screen py-[2em] px-[2em]"
                >
                  <DialogTitle>
                    <VisuallyHidden>Menú principal</VisuallyHidden>
                  </DialogTitle>
                  <div className="flex flex-col gap-4 mt-4">
                    <h2 className="font-semibold text-lg text-primary">Menú</h2>
                    <Separator />

                    <MobileCategorias
                      categorias={categorias}
                      onSelect={() => setMenuOpen(false)}
                    />

                    <button
                      onClick={() => {
                        handleClick();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                      <User className="h-5 w-5" />
                      <span>Mi Cuenta</span>
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
