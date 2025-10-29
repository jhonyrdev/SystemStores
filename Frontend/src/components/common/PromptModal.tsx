import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useState } from "react";

interface PromptModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  description?: string;
}

const PromptModal: React.FC<PromptModalProps> = ({
  open,
  onCancel,
  onConfirm,
  title = "Verificación requerida",
  description = "Ingresa la contraseña de administrador",
}) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onConfirm(password);
    setPassword(""); // Limpiar al cerrar
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptModal;
