import { useState, useEffect, useMemo } from "react";
import useCarrito from "@/hooks/useCarrito";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Swal from "sweetalert2";
import PagoModal from "@/components/client/pagoModal";
import { registrarPedido } from "@/services/ventas/pedidoService";
import { setPedidoPagoStatus } from "@/utils/pedidoPagoStatus";
import type { PedidoRequest, PedidoResponse } from "@/types/ventas";

const Checkout = () => {
  const { items, clearCarrito } = useCarrito();

  const usuario = useMemo(() => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      if (!usuarioStr) return null;
      return JSON.parse(usuarioStr);
    } catch {
      return null;
    }
  }, []);

  const [metodoEnvio, setMetodoEnvio] = useState<"envio" | "recojo">("envio");

  const [openPagoModal, setOpenPagoModal] = useState(false);
  const [tipoComprobante, setTipoComprobante] = useState<"boleta" | "factura">(
    "boleta"
  );
  const [detallesConfirmados, setDetallesConfirmados] = useState(false);
  const [pedidoRegistrado, setPedidoRegistrado] =
    useState<PedidoResponse | null>(null);
  const [creatingPedido, setCreatingPedido] = useState(false);

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pedidoRegistrado");
      if (stored) {
        const parsed = JSON.parse(stored);
        // support { pedido, expiresAt } shape
        if (parsed && parsed.pedido) {
          const expiresAt = parsed.expiresAt as number | undefined;
          if (!expiresAt || expiresAt > Date.now()) {
            setPedidoRegistrado(parsed.pedido as PedidoResponse);
            setDetallesConfirmados(true);
          } else {
            try {
              localStorage.removeItem("pedidoRegistrado");
            } catch {
              /* ignore */
            }
          }
        } else if (parsed && parsed.id_ped) {
          setPedidoRegistrado(parsed as PedidoResponse);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleConfirmarDetalles = async () => {
    setDetallesConfirmados(true);
  };

  const handleConfirmarPedido = async () => {
    if (!usuario) {
      const res = await Swal.fire({
        icon: "warning",
        title: "Debes iniciar sesión para continuar",
        showCancelButton: true,
        confirmButtonText: "Ir a Login",
        cancelButtonText: "Cerrar",
      });
      if (res.isConfirmed) {
        window.location.href = "/login";
      }
      return;
    }

    if (pedidoRegistrado) {
      setOpenPagoModal(true);
      return;
    }

    if (detallesConfirmados && !pedidoRegistrado) {
      const choice = await Swal.fire({
        icon: "question",
        title: "¿Estás seguro?",
        text: "Al proceder no podrás integrar más productos",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Confirmar",
        denyButtonText: "Ir a catálogo",
      });

      if (choice.isDenied) {
        window.location.href = "/categoria";
        return;
      }

      if (!choice.isConfirmed) {
        // user cancelled or closed the dialog
        return;
      }
    }

    if (creatingPedido) return;

    setCreatingPedido(true);
    try {
      // Validar ids numéricos antes de mapear detalles
      const invalid = items.find((item) => Number.isNaN(Number(item.id)));
      if (invalid) {
        await Swal.fire({
          icon: "error",
          title: "Producto con id inválido",
          text: `El producto "${invalid.name}" no tiene un id numérico válido.`,
        });
        setCreatingPedido(false);
        return;
      }

      const pedidoData: PedidoRequest = {
        id_cli: usuario.idCliente,
        tipo_entrega: metodoEnvio,
        id_dir: undefined,
        total: total,
        detalles: items.map((item) => ({
          id_prod: Number(item.id),
          cantidad: item.quantity,
          precio_unit: item.price,
          subtotal: item.price * item.quantity,
        })),
      };

      const response = await registrarPedido(pedidoData);
      setPedidoRegistrado(response);
      try {
        const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes
        // Para cambiar a 10 minutos descomenta la siguiente línea:
        // const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        // Para cambiar a 20 minutos descomenta la siguiente línea:
        // const expiresAt = Date.now() + 20 * 60 * 1000; // 20 minutes
        const payload = { pedido: response, expiresAt };
        localStorage.setItem("pedidoRegistrado", JSON.stringify(payload));

        try {
          await setPedidoPagoStatus(response.id_ped, "pendiente");
        } catch {
          /* ignore */
        }
      } catch {
        // ignore storage errors
      }
      setOpenPagoModal(true);
    } catch (error) {
      toast.error("Error al registrar el pedido", {
        description:
          error instanceof Error ? error.message : "Intenta nuevamente",
      });
    } finally {
      setCreatingPedido(false);
    }
  };

  const handlePagoResultado = async (exito: boolean, ventaId?: number) => {
    void ventaId;
    setCreatingPedido(false);
    setOpenPagoModal(false);
    if (exito) {
      clearCarrito();
      try {
        const stored = localStorage.getItem("pedidoRegistrado");
        const parsed = stored ? JSON.parse(stored) : null;
        const pid = parsed?.pedido?.id_ped ?? parsed?.id_ped;
        if (pid) {
          try {
            await setPedidoPagoStatus(pid, "pagado");
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }
      // cleanup any transient flags
      try {
        localStorage.removeItem("ultimoPagoStatus");
      } catch {
        /* ignore */
      }

      setPedidoRegistrado(null);
      try {
        localStorage.removeItem("pedidoRegistrado");
      } catch {
        /* ignore */
      }
      setDetallesConfirmados(false);
      // Intentionally no Swal or redirect here; modal is the authoritative confirmation.
    } else {
      try {
        const stored = localStorage.getItem("pedidoRegistrado");
        const parsed = stored ? JSON.parse(stored) : null;
        const pid = parsed?.pedido?.id_ped ?? parsed?.id_ped;

        // First check a short-lived flag set by the pago modal (give it priority)
        let estado: string | undefined = undefined;
        try {
          const ultimo = localStorage.getItem("ultimoPagoStatus");
          if (ultimo && pid) {
            const up = JSON.parse(ultimo);
            if (up?.pid === pid && up?.status) {
              estado = up.status;
            }
          }
        } catch {
          /* ignore */
        }

        // If no transient flag, read the persistent map
        if (!estado) {
          try {
            const mapRaw = localStorage.getItem("pedidosPagoStatus");
            const map = mapRaw ? JSON.parse(mapRaw) : {};
            estado = pid ? map[pid] : undefined;
          } catch {
            estado = undefined;
          }
        }

        if (estado === "cancelado" || estado === "rechazado" || !estado) {
          clearCarrito();
          setPedidoRegistrado(null);
          try {
            localStorage.removeItem("pedidoRegistrado");
          } catch {
            /* ignore */
          }
          if (pid) {
            try {
              await setPedidoPagoStatus(pid, "cancelado");
            } catch {
              /* ignore */
            }
          }
          try {
            localStorage.removeItem("ultimoPagoStatus");
          } catch {
            /* ignore */
          }
          setDetallesConfirmados(false);
          await Swal.fire({
            icon: "info",
            title: "Pago cancelado",
            text: "Has cancelado el pago. El carrito fue limpiado.",
          });
        } else if (estado === "fallido") {
          // Payment failed after several attempts — keep carrito intact for review
          try {
            localStorage.removeItem("ultimoPagoStatus");
          } catch {
            /* ignore */
          }
          await Swal.fire({
            icon: "error",
            title: "Pago fallido",
            text: "El pago falló varias veces. El pedido quedó en estado 'fallido'.",
          });
        } else {
          // Fallback: clear carrito
          clearCarrito();
          setPedidoRegistrado(null);
          try {
            localStorage.removeItem("pedidoRegistrado");
          } catch {
            /* ignore */
          }
          setDetallesConfirmados(false);
          await Swal.fire({
            icon: "info",
            title: "Pago cancelado",
            text: "El carrito fue limpiado.",
          });
        }
      } catch (err) {
        console.warn("Error procesando resultado de pago:", err);
        // Ensure we at least clear the carrito to keep UX consistent
        clearCarrito();
        setPedidoRegistrado(null);
        setDetallesConfirmados(false);
        try {
          localStorage.removeItem("pedidoRegistrado");
        } catch {
          /* ignore */
        }
        void Swal.fire({
          icon: "info",
          title: "Pago cancelado",
          text: "El carrito fue limpiado.",
        });
      }
    }
  };

  if (!usuario) {
    return (
      <div className="container-bootstrap py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-lg mb-4">Debes iniciar sesión para continuar</p>
            <Button onClick={() => (window.location.href = "/login")}>
              Ir a Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-bootstrap py-10">
      <h1 className="text-2xl font-bold mb-6 text-primary">Finalizar compra</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles de pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!detallesConfirmados ? (
                <>
                  <div>
                    <Label className="font-semibold">Método de envío</Label>
                    <RadioGroup
                      value={metodoEnvio}
                      onValueChange={(val) =>
                        setMetodoEnvio(val as "envio" | "recojo")
                      }
                      className="space-y-3 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="envio" id="envio" />
                        <Label htmlFor="envio">Delivery (Gratuito)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recojo" id="recojo" />
                        <Label htmlFor="recojo">Recojo en tienda</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator className="my-4" />
                  <Button
                    className="w-full bg-secundario text-black font-bold mt-4"
                    onClick={handleConfirmarDetalles}
                    disabled={items.length === 0}
                  >
                    Confirmar pedido
                  </Button>
                </>
              ) : (
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Método de envío:</strong>{" "}
                    {metodoEnvio === "envio" ? "Delivery" : "Recojo en tienda"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de compra</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No tienes productos en el carrito.
                </p>
              ) : (
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between border-b pb-2 text-sm"
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>
                          S/ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 mt-4 bg-secundario text-black font-bold"
                      onClick={handleConfirmarPedido}
                      disabled={!detallesConfirmados || creatingPedido}
                    >
                      {detallesConfirmados
                        ? pedidoRegistrado
                          ? "Proceder al pago"
                          : "Confirmar pedido"
                        : "Confirma los detalles primero"}
                    </Button>
                    {pedidoRegistrado && (
                      <Button
                        className="mt-4 bg-red-600 text-white font-bold"
                        onClick={async () => {
                          try {
                            const { eliminarPedido } = await import(
                              "@/services/ventas/pedidoService"
                            );
                            await eliminarPedido(pedidoRegistrado.id_ped);
                            await Swal.fire({
                              icon: "success",
                              title: "Pedido eliminado",
                              timer: 1500,
                              showConfirmButton: false,
                            });
                            clearCarrito();
                            setPedidoRegistrado(null);
                            try {
                              localStorage.removeItem("pedidoRegistrado");
                            } catch {
                              /* ignore */
                            }
                            setDetallesConfirmados(false);
                            setOpenPagoModal(false);
                            // redirect to home after cancelling the order
                            window.location.href = "/";
                          } catch (err) {
                            const msg =
                              err instanceof Error ? err.message : String(err);
                            await Swal.fire({
                              icon: "error",
                              title: "No se pudo eliminar el pedido",
                              text: msg || undefined,
                            });
                          }
                        }}
                      >
                        Eliminar Pedido
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {pedidoRegistrado && (
        <PagoModal
          open={openPagoModal}
          onOpenChange={setOpenPagoModal}
          tipoComprobante={tipoComprobante}
          setTipoComprobante={setTipoComprobante}
          pedidoRegistrado={pedidoRegistrado}
          totalVenta={total}
          detallesVenta={items}
          onResultado={handlePagoResultado}
        />
      )}
    </div>
  );
};

export default Checkout;
