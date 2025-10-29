import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

  const [categorias, setCategorias] = useState([]);

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
  const handleClick = () => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      navigate("/cuenta");
    } else {
      setModalOpen(true);
    }
  };

  const { login, register } = UserAuth({
    onSuccess: () => {
      toast.success("Acción Exitosa");
      setModalOpen(false);
    },
    onError: (msg) =>
      toast.error("Algo salió mal", {
        description: msg,
      }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const { name, email, password } = data;
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch { /* empty */ }
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
          fields={isLoginView ? loginFields : registerFields}
          submitLabel={isLoginView ? "Iniciar Sesión" : "Registrarse"}
          onSubmit={handleSubmit}
          showPasswordStrength={!isLoginView}
        />

        {/* Cambiar entre login y registro */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          {isLoginView ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setIsLoginView(false)}
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setIsLoginView(true)}
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

            {/* Menú Desktop */}
            <ul className="hidden md:flex items-center space-x-6">
              <li>
                {/* Aquí quitamos el botón y mostramos el dropdown fijo */}
                <div className="relative">
                  <DropdownCateg categorias={categorias} />
                </div>
              </li>
            </ul>

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
                className="text-primary hover:text-primary/80 cursor-pointer"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="h-5 w-5" />
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
