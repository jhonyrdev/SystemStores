import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import useCarrito from "@/hooks/useCarrito";
import type { CarritoItem } from "@/context/carritoCore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Modal from "@components/common/Modal";
import DynamicForm from "@components/common/dynamicForm";
import { loginFields, registerFields } from "@/constants/authFields";
import { toast } from "sonner";
import UserAuth from "@/hooks/userAuth";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const CarritoAside = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  const { items, removeItem, updateQuantity, clearCarrito, addItem } =
    useCarrito();
  const navigate = useNavigate();
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [pagoStatus, setPagoStatus] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  type PendingEntry = {
    id: number;
    createdAt: number;
    items: CarritoItem[];
    pedido?: unknown;
    pedidoRegistrado?: unknown;
    pagoStatus?: string;
    expiresAt?: number;
    origin?: string;
  };

  const [carritosPendientes, setCarritosPendientes] = useState<
    Array<PendingEntry>
  >([]);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingEntry | null>(
    null
  );

  useEffect(() => {
    const handleCloseModal = () => {
      setModalOpen(false);
    };

    window.addEventListener("closeForgotPasswordModal", handleCloseModal);

    return () => {
      window.removeEventListener("closeForgotPasswordModal", handleCloseModal);
    };
  }, []);

  const { login, register } = UserAuth({
    onSuccess: () => {
      toast.success("Acción Exitosa");
      setModalOpen(false);
      navigate("/checkout");
      onOpenChange(false);
    },
    onError: (msg) =>
      toast.error("Algo salió mal", {
        description: msg,
      }),
  });

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      const { name, email, password } = data;
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch {
      // Error ya manejado en onError
    }
  };

  const handleCheckout = () => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      navigate("/checkout");
      onOpenChange(false);
    } else {
      setModalOpen(true);
    }
  };

  const parseStoredPedido = () => {
    try {
      const stored = localStorage.getItem("pedidoRegistrado");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // support shape { pedido, expiresAt }
      if (parsed && typeof parsed === "object") {
        if (parsed.expiresAt && parsed.pedido) {
          return {
            expiresAt: parsed.expiresAt as number,
            id_ped: parsed.pedido.id_ped as number,
          };
        }
        // legacy: raw pedido object
        if (parsed.id_ped) {
          return { expiresAt: null, id_ped: parsed.id_ped as number };
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem("carritosPendientes");
      const hist = raw ? JSON.parse(raw) : [];
      setCarritosPendientes(Array.isArray(hist) ? hist : []);
    } catch {
      setCarritosPendientes([]);
    }
    const info = parseStoredPedido();
    if (info && info.expiresAt) {
      let status = "pendiente";
      try {
        const raw = localStorage.getItem("pedidosPagoStatus");
        const map = raw ? JSON.parse(raw) : {};
        status = map[info.id_ped] || "pendiente";
      } catch {
        status = "pendiente";
      }

      setPagoStatus(status);
      setPedidoId(info.id_ped ?? null);

      if (status === "pendiente") {
        const left = Math.max(0, info.expiresAt - Date.now());
        if (left > 0) {
          setExpiresAt(info.expiresAt);
          setTimeLeft(left);
        } else {
          setExpiresAt(null);
          setTimeLeft(null);
        }
      } else {
        setExpiresAt(null);
        setTimeLeft(null);
      }
    } else {
      setExpiresAt(null);
      setTimeLeft(null);
      setPagoStatus(null);
      setPedidoId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!expiresAt) return;
    if (pagoStatus && pagoStatus !== "pendiente") return;
    const id = setInterval(() => {
      const left = expiresAt - Date.now();
      if (left <= 0) {
        clearInterval(id);
        setTimeLeft(0);
        setExpiresAt(null);
        (async () => {
          try {
            const stored = localStorage.getItem("pedidoRegistrado");
            if (stored) {
              const parsed = JSON.parse(stored);
              const pid = parsed?.pedido?.id_ped ?? parsed?.id_ped;
              if (pid) {
                try {
                  const { actualizarEstadoPedido } = await import(
                    "@/services/ventas/pedidoService"
                  );
                  await actualizarEstadoPedido(pid, "Rechazado");

                  try {
                    const { default: setPedidoPagoStatus } = await import(
                      "@/utils/pedidoPagoStatus"
                    );
                    await setPedidoPagoStatus(pid, "vencido");
                    setPagoStatus("vencido");
                    try {
                      clearCarrito();
                    } catch {
                      /* ignore */
                    }
                    setPedidoId(null);
                  } catch {
                    /* ignore */
                  }
                } catch (err) {
                  console.warn(
                    "No se pudo actualizar estado en servidor:",
                    err
                  );
                }
              }
            }
          } catch {
            // ignore parse errors
          }
          try {
            localStorage.removeItem("pedidoRegistrado");
          } catch {
            /* ignore */
          }
          await Swal.fire({
            icon: "info",
            title: "Tiempo de pago vencido",
            text: "El tiempo para completar el pago ha expirado. El pedido se ha cancelado.",
          });
        })();
      } else {
        setTimeLeft(left);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, pagoStatus, clearCarrito]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
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
          isLoginView
            ? "Accede a tu cuenta para continuar"
            : "Regístrate para comprar"
        }
      >
        <DynamicForm
          fields={isLoginView ? loginFields : registerFields}
          submitLabel={isLoginView ? "Iniciar Sesión" : "Registrarse"}
          onSubmit={handleSubmit}
          showPasswordStrength={!isLoginView}
          onGoogleLogin={handleGoogleLogin}
          onOutlookLogin={handleOutlookLogin}
          showSocialButtons={true}
          showForgotPassword={isLoginView}
        />

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

      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full max-w-md p-6 flex flex-col bg-principal"
        >
          <SheetTitle>
            <VisuallyHidden>Mi Carrito</VisuallyHidden>
          </SheetTitle>

          {timeLeft && timeLeft > 0 && pagoStatus === "pendiente" && (
            <div className="mb-3 p-2 rounded bg-yellow-50 text-yellow-800 text-sm">
              Tiempo para completar el pago:{" "}
              <strong>{formatTime(timeLeft)}</strong>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-secundario font-bold">Mi Carrito</h2>
            <span className="text-sm text-secundario">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto bg-white rounded-xl">
            <div className="py-4 px-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    Tu carrito está vacío.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ¡Agrega productos para empezar!
                  </p>

                  {carritosPendientes.length > 0 && (
                    <div className="mt-4 text-left">
                      <h4 className="text-sm font-medium mb-2">
                        Historial de carritos pendientes de pago
                      </h4>
                      <ul className="space-y-2">
                        {carritosPendientes.map((c) => (
                          <li
                            key={c.id}
                            className="border p-2 rounded flex justify-between items-center"
                          >
                            <div className="text-sm">
                              <div>
                                <strong>Creado:</strong>{" "}
                                {new Date(c.createdAt).toLocaleString()}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {c.items.length} productos
                              </div>
                            </div>
                            <div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPending(c);
                                  setPendingModalOpen(true);
                                }}
                                className="bg-secundario text-black"
                              >
                                Ver
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            S/ {item.price.toFixed(2)} c/u
                          </p>
                        </div>
                        {!pedidoId && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded border hover:bg-gray-100 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded border hover:bg-gray-100 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold">
                          S/ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <>
              <div className="mt-6 border-t pt-4 flex justify-between items-center text-white">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-bold text-lg">S/ {total.toFixed(2)}</span>
              </div>

              <Button
                className="bg-secundario mt-4 text-black font-bold hover:bg-secundario/90"
                onClick={handleCheckout}
              >
                Finalizar compra
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Pending cart details modal */}
      {pendingModalOpen && selectedPending && (
        <Modal
          open={pendingModalOpen}
          onOpenChange={(v) => {
            if (!v) {
              setPendingModalOpen(false);
              setSelectedPending(null);
            }
          }}
          title={`Carrito guardado - ${new Date(
            selectedPending.createdAt
          ).toLocaleString()}`}
          description={`Contiene ${selectedPending.items.length} productos`}
        >
          <div className="space-y-3">
            <ul className="divide-y">
              {selectedPending.items.map((it: CarritoItem, idx: number) => (
                <li key={idx} className="py-2 flex justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {it.quantity} x S/ {it.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold">
                    S/ {(it.quantity * it.price).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={async () => {
                  const res = await Swal.fire({
                    title: "Restaurar carrito?",
                    text: "Esto reemplazará tu carrito activo actual.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, restaurar",
                    cancelButtonText: "Cancelar",
                  });
                  if (res.isConfirmed) {
                    try {
                      // restore into in-memory cart: clear then add each item so context updates immediately
                      try {
                        clearCarrito();
                      } catch {
                        /* ignore */
                      }

                      try {
                        for (const it of selectedPending.items) {
                          // addItem merges quantities if item already exists
                          addItem({
                            id: it.id,
                            name: it.name,
                            price: it.price,
                            quantity: it.quantity,
                            image: it.image,
                          });
                        }
                      } catch (e) {
                        // fallback: write to localStorage if context update fails
                        console.error("Error adding items to context:", e);
                        localStorage.setItem(
                          "carrito",
                          JSON.stringify(selectedPending.items)
                        );
                      }

                      // If the saved pending entry includes an associated pedido or pedidoRegistrado,
                      // restore it so the checkout flow uses the existing pedido instead of creating a new one.
                      try {
                        const getPidFromObj = (obj: unknown): number | null => {
                          if (!obj || typeof obj !== "object") return null;
                          const rec = obj as Record<string, unknown>;
                          const pedido = rec["pedido"];
                          if (pedido && typeof pedido === "object") {
                            const p = pedido as Record<string, unknown>;
                            const id = p["id_ped"] ?? p["id"];
                            if (typeof id === "number") return id;
                            if (typeof id === "string" && !isNaN(Number(id)))
                              return Number(id);
                          }
                          const direct = rec["id_ped"] ?? rec["id"];
                          if (typeof direct === "number") return direct;
                          if (
                            typeof direct === "string" &&
                            !isNaN(Number(direct))
                          )
                            return Number(direct);
                          return null;
                        };

                        if (selectedPending.pedidoRegistrado) {
                          localStorage.setItem(
                            "pedidoRegistrado",
                            JSON.stringify(selectedPending.pedidoRegistrado)
                          );
                          const pid = getPidFromObj(
                            selectedPending.pedidoRegistrado
                          );
                          if (pid) {
                            const { default: setPedidoPagoStatus } =
                              await import("@/utils/pedidoPagoStatus");
                            const maybeStatus =
                              selectedPending.pagoStatus || "pendiente";
                            await setPedidoPagoStatus(pid, maybeStatus);
                          }
                        } else if (selectedPending.pedido) {
                          const payload = { pedido: selectedPending.pedido };
                          localStorage.setItem(
                            "pedidoRegistrado",
                            JSON.stringify(payload)
                          );
                          const pid = getPidFromObj(selectedPending.pedido);
                          if (pid) {
                            const { default: setPedidoPagoStatus } =
                              await import("@/utils/pedidoPagoStatus");
                            const maybeStatus =
                              selectedPending.pagoStatus || "pendiente";
                            await setPedidoPagoStatus(pid, maybeStatus);
                          }
                        }
                      } catch (e) {
                        console.warn(
                          "No se pudo restaurar pedidoRegistrado:",
                          e
                        );
                      }

                      // remove from history
                      const raw = localStorage.getItem("carritosPendientes");
                      const hist = raw
                        ? (JSON.parse(raw) as PendingEntry[])
                        : [];
                      const updated = (hist || []).filter(
                        (h: PendingEntry) => h.id !== selectedPending.id
                      );
                      localStorage.setItem(
                        "carritosPendientes",
                        JSON.stringify(updated)
                      );
                      setCarritosPendientes(updated);

                      toast.success("Carrito restaurado");
                      setPendingModalOpen(false);
                      setSelectedPending(null);
                    } catch (e) {
                      console.error(e);
                      toast.error("No se pudo restaurar el carrito");
                    }
                  }
                }}
                className="bg-secundario text-black"
              >
                Restaurar carrito
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setPendingModalOpen(false);
                  setSelectedPending(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default CarritoAside;
