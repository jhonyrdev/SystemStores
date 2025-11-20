import { useState, useEffect, useMemo } from "react";
import { useCarrito } from "@/context/carritoContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Swal from "sweetalert2";
import PagoModal from "@/components/client/pagoModal";
import PaymentFormModals from "@/components/client/paymentFormModals";
import { listarDireccionesCliente } from "@/services/cliente/direccionService";
import type { Direccion } from "@/types/direccion";
import { registrarPedido } from "@/services/ventas/pedidoService";
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
  }, [usuario]);

  const [metodoEnvio, setMetodoEnvio] = useState<"envio" | "recojo">("envio");
  const [direccionSeleccionada, setDireccionSeleccionada] = useState("");
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(false);
  const [metodoPago, setMetodoPago] = useState<number | null>(1);
  const [openPagoModal, setOpenPagoModal] = useState(false);
  const [openPaymentForm, setOpenPaymentForm] = useState(false);
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
    // cargar direcciones del cliente si aplica
    const cargarDirecciones = async () => {
      try {
        setCargandoDirecciones(true);
        if (usuario?.idCliente) {
          const data = await listarDireccionesCliente(usuario.idCliente);
          setDirecciones(data as Direccion[]);
        }
      } catch (err) {
        /* ignore */
      } finally {
        setCargandoDirecciones(false);
      }
    };

    void cargarDirecciones();
    // No se cargan direcciones automáticamente: envío es gratuito y no requiere asignar dirección
    // Restaurar pedido pendiente (si el usuario recargó la página o cerró la pestaña)
    try {
      const stored = localStorage.getItem("pedidoRegistrado");
      if (stored) {
        const parsed = JSON.parse(stored);
        // support { pedido, expiresAt } shape
        if (parsed && parsed.pedido) {
          const expiresAt = parsed.expiresAt as number | undefined;
          if (!expiresAt || expiresAt > Date.now()) {
            setPedidoRegistrado(parsed.pedido as PedidoResponse);
            // mark detalles confirmed so UI shows summary
            setDetallesConfirmados(true);
          } else {
            // expired
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
    // No requerimos dirección para el envío (gratuito)

    if (items.length === 0) {
      toast.warning("Tu carrito está vacío.");
      return;
    }

    if (!usuario?.idCliente) {
      toast.error("Error: Usuario no válido");
      return;
    }
    setDetallesConfirmados(true);
    toast.success("Detalles confirmados. Puedes seguir añadiendo productos.");
  };

  const handleConfirmarPedido = async () => {
    if (!usuario) {
      toast.error("Debes iniciar sesión para continuar.");
      return;
    }

    if (items.length === 0) {
      toast.warning("Tu carrito está vacío.");
      return;
    }

    if (!detallesConfirmados) {
      toast.error("Debes confirmar los detalles primero.");
      return;
    }

    // If an order was already created, just open the payment modal.
    if (pedidoRegistrado) {
      setOpenPagoModal(true);
      return;
    }

    if (creatingPedido) return;

    setCreatingPedido(true);
    try {
      const pedidoData: PedidoRequest = {
        id_cli: usuario.idCliente,
        tipo_entrega: metodoEnvio,
        id_dir: undefined,
        total: total,
        detalles: items.map((item) => ({
          id_prod: item.id,
          cantidad: item.quantity,
          precio_unit: item.price,
          subtotal: item.price * item.quantity,
        })),
      };

      const response = await registrarPedido(pedidoData);
      setPedidoRegistrado(response);
      try {
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
        const payload = { pedido: response, expiresAt };
        localStorage.setItem("pedidoRegistrado", JSON.stringify(payload));

        // mark payment status as 'pendiente' for this pedido
        try {
          const mapRaw = localStorage.getItem("pedidosPagoStatus");
          const map = mapRaw ? JSON.parse(mapRaw) : {};
          map[response.id_ped] = "pendiente";
          localStorage.setItem("pedidosPagoStatus", JSON.stringify(map));
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

  const handlePagoResultado = (exito: boolean, ventaId?: number) => {
    void ventaId;
    setCreatingPedido(false);
    setOpenPagoModal(false);
    if (exito) {
      void Swal.fire({
        icon: "success",
        title: "Pago realizado",
        timer: 1500,
        showConfirmButton: false,
      });
      clearCarrito();
      // mark pedido as paid in local map then remove stored pending pedido
      try {
        const stored = localStorage.getItem("pedidoRegistrado");
        const parsed = stored ? JSON.parse(stored) : null;
        const pid = parsed?.pedido?.id_ped ?? parsed?.id_ped;
        if (pid) {
          const mapRaw = localStorage.getItem("pedidosPagoStatus");
          const map = mapRaw ? JSON.parse(mapRaw) : {};
          map[pid] = "pagado";
          localStorage.setItem("pedidosPagoStatus", JSON.stringify(map));
        }
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
    } else {
      // mark as cancelled and remove stored pending pedido
      try {
        const stored = localStorage.getItem("pedidoRegistrado");
        const parsed = stored ? JSON.parse(stored) : null;
        const pid = parsed?.pedido?.id_ped ?? parsed?.id_ped;
        if (pid) {
          const mapRaw = localStorage.getItem("pedidosPagoStatus");
          const map = mapRaw ? JSON.parse(mapRaw) : {};
          map[pid] = "cancelado";
          localStorage.setItem("pedidosPagoStatus", JSON.stringify(map));
        }
      } catch {
        /* ignore */
      }
      try {
        localStorage.removeItem("pedidoRegistrado");
      } catch {
        /* ignore */
      }
      setPedidoRegistrado(null);
      void Swal.fire({
        icon: "error",
        title: "Pago fallido",
        text: "El pago ha fallado o fue cancelado.",
      });
    }
  };

  const getMetodoPagoTexto = (id: number): string => {
    switch (id) {
      case 1:
        return "Yape";
      case 2:
        return "Plin";
      case 3:
        return "Tarjeta";
      default:
        return "Yape";
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

                    {/* Envío gratuito: no se solicita dirección */}
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <Label className="font-semibold">Método de pago</Label>
                    <RadioGroup
                      value={metodoPago?.toString() || ""}
                      onValueChange={(val) => {
                        setMetodoPago(parseInt(val));
                        setOpenPaymentForm(true);
                      }}
                      className="space-y-3 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="yape" />
                        <Label htmlFor="yape">Yape</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="plin" />
                        <Label htmlFor="plin">Plin</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="tarjeta" />
                        <Label htmlFor="tarjeta">Tarjeta</Label>
                      </div>
                    </RadioGroup>
                  </div>

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
                  <p>
                    <strong>Método de pago:</strong>{" "}
                    {getMetodoPagoTexto(metodoPago ?? 1)}
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
                          : metodoPago === 1
                          ? "Confirmar pedido"
                          : "Proceder al pago"
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
                          } catch (err) {
                            const msg =
                              err instanceof Error ? err.message : String(err);
                            // show SweetAlert2 error with optional details
                            await Swal.fire({
                              icon: "error",
                              title: "No se pudo eliminar el pedido",
                              text: msg || undefined,
                            });
                          }
                        }}
                      >
                        Cancelar compra
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
          idMetodo={metodoPago ?? 1}
          totalVenta={total}
          detallesVenta={items}
          onResultado={handlePagoResultado}
        />
      )}

      <PaymentFormModals
        metodoPago={metodoPago}
        open={openPaymentForm}
        onOpenChange={setOpenPaymentForm}
        onConfirm={() => setOpenPaymentForm(false)}
      />
    </div>
  );
};

export default Checkout;
