import { useState, useEffect, useCallback, useMemo } from "react";
import { useCarrito } from "@/context/carritoContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import PagoModal from "@/components/client/pagoModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listarDireccionesCliente } from "@/services/cliente/direccionService";
import { registrarPedido } from "@/services/ventas/pedidoService";
import type { Direccion } from "@/types/direccion";
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
  const [direccionSeleccionada, setDireccionSeleccionada] = useState("");
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(false);
  const [metodoPago, setMetodoPago] = useState<number>(1);
  const [openPagoModal, setOpenPagoModal] = useState(false);
  const [tipoComprobante, setTipoComprobante] = useState<"boleta" | "factura">("boleta");
  const [detallesConfirmados, setDetallesConfirmados] = useState(false);
  const [pedidoRegistrado, setPedidoRegistrado] = useState<PedidoResponse | null>(null);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cargarDirecciones = useCallback(async () => {
    if (!usuario || !usuario.idCliente) {
      toast.error("Debes iniciar sesión para continuar");
      return;
    }

    try {
      setCargandoDirecciones(true);
      const dirs = await listarDireccionesCliente(usuario.idCliente);

      if (!Array.isArray(dirs)) {
        toast.error("Error: Formato de respuesta inválido");
        return;
      }

      setDirecciones(dirs);

      const dirEnUso = dirs.find((d) => d.enUso);
      if (dirEnUso) {
        setDireccionSeleccionada(dirEnUso.id.toString());
      } else if (dirs.length > 0) {
        setDireccionSeleccionada(dirs[0].id.toString());
      }
    } catch (error) {
      toast.error("Error al cargar direcciones", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      setDirecciones([]);
    } finally {
      setCargandoDirecciones(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (metodoEnvio === "envio") {
      if (!usuario || !usuario.idCliente) {
        toast.error("Debes iniciar sesión");
        return;
      }
      cargarDirecciones();
    } else {
      setDirecciones([]);
      setDireccionSeleccionada("");
    }
  }, [metodoEnvio, usuario, cargarDirecciones]);

  const handleConfirmarDetalles = async () => {
    if (metodoEnvio === "envio" && !direccionSeleccionada) {
      toast.warning("Selecciona una dirección para el envío.");
      return;
    }

    if (items.length === 0) {
      toast.warning("Tu carrito está vacío.");
      return;
    }

    if (!usuario?.idCliente) {
      toast.error("Error: Usuario no válido");
      return;
    }

    try {
      const pedidoData: PedidoRequest = {
        id_cli: usuario.idCliente,
        tipo_entrega: metodoEnvio,
        id_dir: metodoEnvio === "envio" ? parseInt(direccionSeleccionada) : undefined,
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
      setDetallesConfirmados(true);

      toast.success("Pedido registrado", {
        description: `Pedido #${response.id_ped} - Estado: ${response.estado}`,
      });
    } catch (error) {
      toast.error("Error al registrar el pedido", {
        description: error instanceof Error ? error.message : "Intenta nuevamente",
      });
    }
  };

  const handleConfirmarPedido = () => {
    if (!usuario) {
      toast.error("Debes iniciar sesión para continuar.");
      return;
    }

    if (items.length === 0) {
      toast.warning("Tu carrito está vacío.");
      return;
    }

    if (!pedidoRegistrado) {
      toast.error("Debes confirmar los detalles primero.");
      return;
    }

    setOpenPagoModal(true);
  };

  const handlePagoResultado = (exito: boolean, ventaId?: number) => {
    setOpenPagoModal(false);
    if (exito) {
      toast.success(`Pago realizado`, {
        description: `Venta #${ventaId} - ${tipoComprobante.toUpperCase()}`,
      });
      clearCarrito();
    } else {
      toast.error("El pago ha fallado. Intenta nuevamente.");
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
                      onValueChange={(val) => setMetodoEnvio(val as "envio" | "recojo")}
                      className="space-y-3 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="envio" id="envio" />
                        <Label htmlFor="envio">Delivery (30 min aprox.)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recojo" id="recojo" />
                        <Label htmlFor="recojo">Recojo en tienda</Label>
                      </div>
                    </RadioGroup>

                    {metodoEnvio === "envio" && (
                      <div className="mt-3">
                        <Label>Selecciona dirección</Label>

                        <Select
                          value={direccionSeleccionada}
                          onValueChange={setDireccionSeleccionada}
                          disabled={cargandoDirecciones || direcciones.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                cargandoDirecciones
                                  ? "Cargando direcciones..."
                                  : direcciones.length === 0
                                  ? "No tienes direcciones registradas"
                                  : "Elige una dirección"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {direcciones.length > 0 ? (
                              direcciones.map((dir) => (
                                <SelectItem key={dir.id} value={dir.id.toString()}>
                                  {dir.texto}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="ninguna" disabled>
                                No hay direcciones
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>

                        {direcciones.length === 0 && !cargandoDirecciones && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Agrega una dirección desde tu perfil
                            </p>
                            <Button variant="outline" size="sm" onClick={cargarDirecciones}>
                              Recargar direcciones
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <Label className="font-semibold">Método de pago</Label>
                    <RadioGroup
                      value={metodoPago.toString()}
                      onValueChange={(val) => setMetodoPago(parseInt(val))}
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
                  {metodoEnvio === "envio" && (
                    <p>
                      <strong>Dirección:</strong>{" "}
                      {direcciones.find((d) => d.id.toString() === direccionSeleccionada)?.texto ||
                        "No especificada"}
                    </p>
                  )}
                  <p>
                    <strong>Método de pago:</strong> {getMetodoPagoTexto(metodoPago)}
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
                      <li key={item.id} className="flex justify-between border-b pb-2 text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full mt-4 bg-secundario text-black font-bold"
                    onClick={handleConfirmarPedido}
                    disabled={!detallesConfirmados}
                  >
                    {detallesConfirmados
                      ? metodoPago === 1
                        ? "Confirmar pedido"
                        : "Proceder al pago"
                      : "Confirma los detalles primero"}
                  </Button>
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
          idMetodo={metodoPago}
          totalVenta={total}
          detallesVenta={items}
          onResultado={handlePagoResultado}
        />
      )}
    </div>
  );
};

export default Checkout;
