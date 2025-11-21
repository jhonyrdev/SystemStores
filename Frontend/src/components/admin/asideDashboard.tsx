import { Home, Box, ShoppingCart, Users, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Props {
  onSelect: () => void;
}

const menuItems = [
  {
    label: "Gestión",
    icon: <Box size={20} />,
    links: [
      { to: "/admin/gestion/productos", label: "Productos" },
      { to: "/admin/gestion/categorias", label: "Categorías" },
    ],
  },
  {
    label: "Usuarios",
    icon: <Users size={20} />,
    links: [{ to: "/admin/usuarios/clientes", label: "Clientes" }],
  },
  {
    label: "Ventas",
    icon: <ShoppingCart size={20} />,
    links: [
      { to: "/admin/ventas/pedidos", label: "Pedidos" },
      { to: "/admin/ventas/analisis", label: "Análisis" },
    ],
  },
];

const AsideDashboard: React.FC<Props> = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeMenu, setActiveMenu] = useState<MenuLabel | null>(null);

  const navigate = useNavigate();
  // we'll use SweetAlert2 here for logout confirmation

  const handleLogout = () => {
    sessionStorage.removeItem("adminAutenticado");
    navigate("/");
  };

  const handleLogoutClick = () => {
    Swal.fire({
      title: "¿Deseas cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#30d68eff",
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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MENU_LABELS = ["Gestión", "Usuarios", "Ventas", "Sistema"] as const;
  type MenuLabel = (typeof MENU_LABELS)[number]; // 'Gestión' | 'Usuarios' | 'Ventas' | 'Sistema'

  const toggleMenu = (label: MenuLabel) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  // === LARGE SCREEN >1024px
  if (windowWidth > 1023) {
    return (
      <aside className="flex flex-col justify-between w-64 h-screen bg-principal border-r border-gray-200 px-6 py-8">
        <nav className="space-y-4">
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>

          {/* Inicio */}
          <Link
            to="/admin"
            className="flex items-center gap-3 text-white hover:text-[#f2c32f] hover:font-bold font-medium rounded-md p-2"
          >
            <Home size={20} />
            Inicio
          </Link>

          {/* Menú principal */}
          {menuItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label as MenuLabel)}
                className="w-full flex items-center justify-between text-white hover:text-[#f2c32f] hover:font-bold font-medium rounded-md p-2"
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    activeMenu === item.label ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeMenu === item.label && (
                <div className="ml-8 mt-2 flex flex-col gap-2">
                  {item.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-sm text-white hover:text-[#f2c32f]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Usuario */}
        <div className="flex items-center gap-3 mt-10 cursor-pointer">
          <img
            src="/ico/avatar.webp"
            alt="Admin User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-white">Admin | Mario R.</p>
            <Button
              className="text-xs text-gray-200 bg-transparent hover:text-[#f2c32f] hover:bg-transparent"
              onClick={handleLogoutClick}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // === MEDIUM SCREEN 1023px to 426px
  if (windowWidth <= 1023 && windowWidth > 425) {
    return (
      <aside className="flex flex-col justify-between w-20 h-screen bg-white border-r border-gray-200 py-8">
        <nav className="flex flex-col items-center gap-6">
          <Link to="/admin">
            <Home size={24} className="text-gray-600 hover:text-blue-600" />
          </Link>
          {menuItems.map((item) => (
            <div key={item.label} className="relative group">
              <button onClick={() => toggleMenu(item.label as MenuLabel)}>
                {item.icon}
              </button>

              {/* Popover menú */}
              {activeMenu === item.label && (
                <div className="absolute left-full top-0 ml-2 w-48 bg-white shadow-lg border p-3 z-50 rounded-md">
                  {item.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block text-sm text-gray-700 hover:text-blue-600 py-1"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    );
  }

  // === SMALL SCREEN <= 425px
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      <Link to="/admin">
        <Home size={24} className="text-gray-600 hover:text-blue-600" />
      </Link>

      {menuItems.map((item) => (
        <div key={item.label} className="relative">
          <button onClick={() => toggleMenu(item.label as MenuLabel)}>
            {item.icon}
          </button>

          {/* Floating menu above icon */}
          {activeMenu === item.label && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white shadow-lg border rounded-md p-2 w-40 z-50">
              {item.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center text-sm text-gray-700 hover:text-blue-600 py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AsideDashboard;
