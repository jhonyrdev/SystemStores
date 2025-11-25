import { Bell, Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface TopHeaderProps {
  scrollContainerRef: React.RefObject<HTMLElement | null> | null;
}

const TopHeader: React.FC<TopHeaderProps> = ({ scrollContainerRef }) => {
  const [themeOpen, setThemeOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    let last = container.scrollTop;

    const onScroll = () => {
      const cur = container.scrollTop;
      if (cur > last && cur > 20) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      last = cur;
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAutenticado");
    window.location.href = "/";
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

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="w-full bg-white border-b shadow-sm">
        <div className="max-w-[100%] w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col sm:flex-row items-center sm:justify-between py-3 mx-auto gap-2">
          <div className="flex items-center gap-3 lg:hidden">
            <img
              src="/ico/avatar.webp"
              alt="Admin User"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="block">
              <p className="text-sm font-semibold text-gray-800">
                Admin | Mario R.
              </p>
              <button
                className="text-xs text-gray-600 bg-transparent hover:text-[#f2c32f] hover:bg-transparent"
                onClick={handleLogoutClick}
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="relative flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <button
              aria-label="Notificaciones"
              className="relative p-2 rounded-md hover:bg-gray-100"
              onClick={() => {}}
            >
              <Bell size={18} />
              {/*<span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] px-1 rounded-full">
                3
              </span>*/}
            </button>

            {/* Theme selector */}
            <div>
              <button
                className="flex items-center gap-2 px-2 py-1 border rounded-md hover:bg-gray-100"
                onClick={() => setThemeOpen((s) => !s)}
                aria-haspopup="true"
                aria-expanded={themeOpen}
              >
                <Sun size={16} />
                <ChevronDown className="hidden sm:inline" size={14} />
              </button>

              <div
                className={`absolute mt-2 w-44 bg-white border shadow-lg rounded-md p-2 text-sm transition-all duration-150 transform origin-top z-50 left-1/2 -translate-x-1/2 sm:right-0 sm:left-auto sm:-translate-x-0 ${
                  themeOpen
                    ? "opacity-100 translate-y-0 lg:translate-x-6"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
                style={{ minWidth: 176 }}
              >
                <button className="w-full text-left flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded">
                  <Sun size={16} />
                  Claro
                </button>
                <button className="w-full text-left flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded">
                  <Moon size={16} />
                  Oscuro
                </button>
                <button className="w-full text-left flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded">
                  <Monitor size={16} />
                  Sistema
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
