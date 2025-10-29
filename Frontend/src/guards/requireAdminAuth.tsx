import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PromptModal from "@components/common/PromptModal";
import { verifyAdminPassword } from "@/services/auth/adminService";

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

const RequireAdminAuth: React.FC<RequireAdminAuthProps> = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAutenticado") === "true";
    if (isAuthenticated) {
      setAllowed(true);
    } else {
      setModalOpen(true);
    }
  }, []);

  const handleConfirm = async (password: string) => {
    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        sessionStorage.setItem("adminAutenticado", "true");
        setAllowed(true);
        setModalOpen(false);
      } else {
        toast.error("Contraseña incorrecta");
      }
    } catch {
      toast.error("Error de conexión");
      navigate("/");
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (!allowed) {
    return (
      <PromptModal
        open={modalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    );
  }

  return <>{children}</>;
};

export default RequireAdminAuth;
