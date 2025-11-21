import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@components/ui/button";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useEffect, useState } from "react";
import type { Cliente } from "@/types/cliente";

interface Props {
  onSelect: () => void;
}

const ClientSliderbar: React.FC<Props> = ({ onSelect }) => {
  const navigate = useNavigate();
  // using SweetAlert2 for confirmation instead of local ConfirmModal here

  const [usuario, setUsuario] = useState<Cliente | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const user = JSON.parse(storedUser) as Cliente;
      setUsuario(user);
    }
  }, []);

  useEffect(() => {
    const handleUserLogin = () => {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        setUsuario(JSON.parse(storedUser) as Cliente);
      }
    };

    window.addEventListener("userLoggedIn", handleUserLogin);
    return () => window.removeEventListener("userLoggedIn", handleUserLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate("/");
  };

  const handleLogoutClick = () => {
    Swal.fire({
      title: "¿Deseas cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#30d6b8ff",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
        Swal.fire({
          title: "Hecho",
          text: "Sesión finalizada.",
          icon: "success",
        });
      }
    });
  };

  const nombreCompleto = usuario?.nombre
    ? `${usuario.nombre} ${usuario.apellido || ""}`
    : "Nombre del Cliente";

  return (
    <div className="p-4 text-left">
      <img
        src="/ico/avatar.webp"
        alt="Avatar"
        loading="lazy"
        className="rounded-full mb-3 mx-auto w-20 h-20 object-cover"
      />
      <h5 className="text-lg font-bold text-center text-principal">
        {nombreCompleto}
      </h5>

      <nav className="mt-6 flex flex-col space-y-2">
        <NavLink
          to="/cuenta"
          end
          className={({ isActive }) =>
            `w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? "bg-secundario-claro1 text-principal"
                : "hover:text-[#5e0956] hover:font-bold"
            }`
          }
          onClick={onSelect}
        >
          Mi Perfil
        </NavLink>

        <NavLink
          to="/cuenta/direccion"
          className={({ isActive }) =>
            `w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? "bg-secundario-claro1 text-principal"
                : "hover:text-[#5e0956] hover:font-bold"
            }`
          }
          onClick={onSelect}
        >
          Mis Direcciones
        </NavLink>

        <NavLink
          to="/cuenta/pedido"
          className={({ isActive }) =>
            `w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? "bg-secundario-claro1 text-principal"
                : "hover:text-[#5e0956] hover:font-bold"
            }`
          }
          onClick={onSelect}
        >
          Mis Pedidos
        </NavLink>

        <NavLink
          to="/cuenta/gestor"
          className={({ isActive }) =>
            `w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? "bg-secundario-claro1 text-principal"
                : "hover:text-[#5e0956] hover:font-bold"
            }`
          }
          onClick={onSelect}
        >
          Cambiar Contraseña
        </NavLink>

        <Button
          className="text-left text-red-800  bg-transparent hover:text-[#5e0956] hover:font-bold hover:bg-transparent px-3 w-full"
          onClick={() => {
            onSelect();
            handleLogoutClick();
          }}
        >
          Cerrar Sesión
        </Button>
      </nav>
    </div>
  );
};

export default ClientSliderbar;
