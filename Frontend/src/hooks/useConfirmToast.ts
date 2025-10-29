import { toast } from "sonner";

export const useConfirmToast = () => {
  const confirm = (message: string, onConfirm: () => void) => {
    toast(message, {
      action: {
        label: "Sí, continuar",
        onClick: () => {
          onConfirm();
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  return { confirm };
};
