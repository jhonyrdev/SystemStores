import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "@components/client/clientSidebar"; 

interface ClientLayoutProps {
  children?: React.ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBackClick = () => {
    if (isMobile) {
      setShowSidebar(true);
    } else {
      navigate("/cuenta");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-wull  bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-full bg-[#fffdf5f4] md:w-1/4 border-r pb-50 p-4 shadow-sm">
          <ClientSidebar onSelect={() => isMobile && setShowSidebar(false)} />
        </div>
      )}

      {/* Main content */}
      {(!isMobile || !showSidebar) && (
        <main className="flex-1 p-6 overflow-y-auto bg-white">
          {/* Botón de volver */}
          <div className="mb-4">
            <button
              onClick={handleBackClick}
              className="text-secundario-oscuro text-sm font-medium hover:font-bold"
            >
              ← {isMobile ? "Volver al menú" : "Volver a perfil"}
            </button>
          </div>
          {children}
        </main>
      )}
    </div>
  );
};

export default ClientLayout;