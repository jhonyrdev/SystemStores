import { useState, useCallback } from "react";

interface ConfirmOptions {
  confirmLabel?: string;
  cancelLabel?: string;
}

export const useConfirmModal = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});
  const [confirmLabel, setConfirmLabel] = useState("Sí");
  const [cancelLabel, setCancelLabel] = useState("Cancelar");

  const confirm = useCallback(
    (
      msg: string,
      onConfirmAction: () => void,
      options?: ConfirmOptions
    ) => {
      setMessage(msg);
      setOnConfirm(() => onConfirmAction);
      setConfirmLabel(options?.confirmLabel || "Sí");
      setCancelLabel(options?.cancelLabel || "Cancelar");
      setOpen(true);
    },
    []
  );

  const modalProps = {
    open,
    onOpenChange: setOpen,
    message,
    onConfirm,
    confirmLabel,
    cancelLabel,
  };

  return { confirm, modalProps };
};
