import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrarVenta } from "@/services/ventas/ventaService";
import { cancelarPedido } from "@/services/ventas/pedidoService";
import type {
  VentaRequest,
  PedidoResponse,
  DetalleVenta,
} from "@/types/ventas";
import type { CarritoItem } from "@/context/carritoCore";
import PaymentFormModals from "@/components/client/paymentFormModals";
import { toast } from "sonner";

interface PagoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoComprobante: "boleta" | "factura";
  setTipoComprobante: React.Dispatch<
    React.SetStateAction<"boleta" | "factura">
  >;
  pedidoRegistrado: PedidoResponse;
  totalVenta: number;
  detallesVenta: CarritoItem[];
  onResultado: (exito: boolean, ventaId?: number) => void;
}

const PagoModal = ({
  open,
  onOpenChange,
  tipoComprobante,
  setTipoComprobante,
  pedidoRegistrado,
  totalVenta,
  detallesVenta,
  onResultado,
}: PagoModalProps) => {
  const usuario = useMemo(() => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      if (!usuarioStr) return null;
      return JSON.parse(usuarioStr);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }, []);

  const [pagoRealizado, setPagoRealizado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [ventaId, setVentaId] = useState<number | null>(null);
  const [codigoComprobante, setCodigoComprobante] = useState("");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<number | null>(
    null
  );
  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [metodoValidado, setMetodoValidado] = useState(false);
  const navigate = useNavigate();

  const generarCodigoComprobante = (): string => {
    const prefijo = tipoComprobante === "boleta" ? "B001" : "F001";
    const numero = Math.floor(Math.random() * 9000) + 1000;
    return `${prefijo}-${numero}`;
  };

  const handleSimularPago = async () => {
    if (!usuario?.idCliente) {
      toast.error("Error: Usuario no válido");
      return;
    }

    if (metodoSeleccionado === null) {
      toast.warning("Selecciona un método de pago");
      return;
    }

    if (tipoComprobante === "factura" && (!ruc || !razonSocial)) {
      toast.warning("Debes ingresar RUC y Razón Social");
      return;
    }

    if (tipoComprobante === "factura" && ruc.length !== 11) {
      toast.warning("El RUC debe tener 11 dígitos");
      return;
    }

    setProcesando(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const exito = Math.random() < 0.7;

      if (exito) {
        const codigo = generarCodigoComprobante();
        setCodigoComprobante(codigo);

        const detalles: DetalleVenta[] = detallesVenta.map((item) => ({
          id_prod: item.id,
          nom_prod: item.name,
          cantidad: item.quantity,
          precio_unit: item.price,
          subtotal: item.price * item.quantity,
        }));

        const ventaData: VentaRequest = {
          id_cli: usuario.idCliente,
          id_ped: pedidoRegistrado.id_ped,
          id_metodo: metodoSeleccionado ?? 1,
          total: totalVenta,
          tipo: tipoComprobante,
          codigo: codigo,
          ruc_cliente: tipoComprobante === "factura" ? ruc : undefined,
          razon_social_cliente:
            tipoComprobante === "factura" ? razonSocial : undefined,
          detalles: detalles,
        };

        const response = await registrarVenta(ventaData);

        setPagoRealizado(true);
        setVentaId(response.id_venta);
        setMensaje("Pago realizado exitosamente");
        setProcesando(false);
        setMetodoValidado(false);
      } else {
        setMensaje("Pago rechazado");
        toast.error("El pago no pudo ser procesado");
        setProcesando(false);
      }
    } catch (error) {
      console.error("Error al procesar pago:", error);
      toast.error("Error al registrar la venta", {
        description:
          error instanceof Error ? error.message : "Intenta nuevamente",
      });
      setMensaje("Error en el sistema");
      setProcesando(false);
    }
  };

  const handleCerrar = async () => {
    if (!pagoRealizado) {
      try {
        if (pedidoRegistrado?.id_ped) {
          await cancelarPedido(pedidoRegistrado.id_ped);
        }
      } catch (err) {
        console.warn("Error cancelando pedido al cerrar modal:", err);
      }
      onResultado(false);
      // reset and close
      setPagoRealizado(false);
      setProcesando(false);
      setMensaje("");
      setRuc("");
      setRazonSocial("");
      setVentaId(null);
      setCodigoComprobante("");
      setMetodoValidado(false);
      onOpenChange(false);
      return;
    }
    try {
      onResultado(true, ventaId ?? undefined);
    } catch (err) {
      console.warn("Error notifying parent about successful payment:", err);
    }

    setPagoRealizado(false);
    setProcesando(false);
    setMensaje("");
    setRuc("");
    setRazonSocial("");
    setVentaId(null);
    setCodigoComprobante("");
    setMetodoValidado(false);
    onOpenChange(false);

    try {
      navigate("/cuenta/pedido");
    } catch (error) {
      console.warn("Navigate failed, falling back to full redirect:", error);
      window.location.href = "/cuenta";
    }
  };

  const handleTipoComprobanteChange = (value: string) => {
    if (value === "boleta" || value === "factura") {
      setTipoComprobante(value);
      setRuc("");
      setRazonSocial("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Simulador de pago online</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {!pagoRealizado &&
              !procesando &&
              "Elige el tipo de comprobante y simula el pago"}
            {procesando && "Procesando pago..."}
            {pagoRealizado && mensaje}
          </p>
        </DialogHeader>

        {!pagoRealizado && !procesando && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-900">
                Pedido #{pedidoRegistrado.id_ped}
              </p>
              <p className="text-blue-700">Total: S/ {totalVenta.toFixed(2)}</p>
              <p className="text-blue-600 text-xs mt-1">
                {pedidoRegistrado.fecha} {pedidoRegistrado.hora}
              </p>
            </div>

            <div>
              <Label className="font-semibold">Tipo de comprobante</Label>
              <RadioGroup
                value={tipoComprobante}
                onValueChange={handleTipoComprobanteChange}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="boleta" id="boleta" />
                  <label htmlFor="boleta">Boleta</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="factura" id="factura" />
                  <label htmlFor="factura">Factura</label>
                </div>
              </RadioGroup>
            </div>

            <div className="mt-4">
              <Label className="font-semibold">Método de pago</Label>
              <RadioGroup
                value={metodoSeleccionado?.toString() || ""}
                onValueChange={(val) => {
                  setMetodoSeleccionado(parseInt(val));
                  setMetodoValidado(false);
                  setOpenPaymentForm(true);
                }}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="yape-modal" />
                  <Label htmlFor="yape-modal">Yape</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="plin-modal" />
                  <Label htmlFor="plin-modal">Plin</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="tarjeta-modal" />
                  <Label htmlFor="tarjeta-modal">Tarjeta</Label>
                </div>
              </RadioGroup>
            </div>

            {tipoComprobante === "factura" && (
              <div className="space-y-3 border-t pt-3">
                <div>
                  <Label>RUC *</Label>
                  <Input
                    value={ruc}
                    onChange={(e) =>
                      setRuc(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    placeholder="Ej: 20123456789"
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Debe tener 11 dígitos
                  </p>
                </div>
                <div>
                  <Label>Razón Social *</Label>
                  <Input
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    placeholder="Ej: Mi Empresa SAC"
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSimularPago}
              disabled={!metodoValidado || procesando}
            >
              Realizar Pago
            </Button>

            <Button variant="outline" className="w-full" onClick={handleCerrar}>
              Cancelar
            </Button>
          </div>
        )}

        {procesando && !pagoRealizado && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Procesando tu pago...
            </p>
          </div>
        )}

        {pagoRealizado && (
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-semibold text-green-900">Pago exitoso</p>
              <p className="text-sm text-green-700 mt-2">Venta #{ventaId}</p>
            </div>

            <div className="space-y-2 text-sm border-t pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedido:</span>
                <span className="font-medium">#{pedidoRegistrado.id_ped}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comprobante:</span>
                <span className="font-medium">
                  {tipoComprobante.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Código:</span>
                <span className="font-medium">{codigoComprobante}</span>
              </div>
              {tipoComprobante === "factura" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RUC:</span>
                    <span className="font-medium">{ruc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razón Social:</span>
                    <span className="font-medium">{razonSocial}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t">
                <span>Total:</span>
                <span>S/ {totalVenta.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full" onClick={handleCerrar}>
              Cerrar
            </Button>
          </div>
        )}
        <PaymentFormModals
          metodoPago={metodoSeleccionado}
          open={openPaymentForm}
          onOpenChange={setOpenPaymentForm}
          onConfirm={() => {
            // mark as validated and close payment form
            setMetodoValidado(true);
            setOpenPaymentForm(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PagoModal;
