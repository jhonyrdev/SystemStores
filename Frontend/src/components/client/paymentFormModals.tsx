import { useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentFormModalsProps {
  metodoPago: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const PaymentFormModals = ({
  metodoPago,
  open,
  onOpenChange,
  onConfirm,
}: PaymentFormModalsProps) => {
  const [phoneYape, setPhoneYape] = useState("");
  const [yapeSuccess, setYapeSuccess] = useState(false);
  const [phonePlin, setPhonePlin] = useState("");
  const [plinSuccess, setPlinSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [tarjetaSuccess, setTarjetaSuccess] = useState(false);



  const handleYapeValidate = () => {
    if (!phoneYape.trim()) {
      alert("Por favor ingresa un número de teléfono");
      return;
    }
    if (phoneYape.length !== 9) {
      alert("El número debe tener 9 dígitos");
      return;
    }
    // Simular validación exitosa
    console.log("Yape payment validated:", { phone: phoneYape });
    setYapeSuccess(true);
  };

  const handlePlinValidate = () => {
    if (!phonePlin.trim()) {
      alert("Por favor ingresa un número de teléfono");
      return;
    }
    if (phonePlin.length !== 9) {
      alert("El número debe tener 9 dígitos");
      return;
    }
    console.log("Plin payment validated:", { phone: phonePlin });
    setPlinSuccess(true);
  };

  const handleTarjetaValidate = () => {
    if (!cardNumber.trim() || !cardHolder.trim() || !expiryDate.trim() || !cvv.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      alert("El número de tarjeta debe tener 16 dígitos");
      return;
    }
    if (cvv.length !== 3) {
      alert("El CVV debe tener 3 dígitos");
      return;
    }
    console.log("Card payment validated:", {
      cardNumber: cardNumber.slice(-4),
      cardHolder,
      expiryDate,
    });
    setTarjetaSuccess(true);
  };

  const handleClose = () => {
    setPhoneYape("");
    setYapeSuccess(false);
    setPhonePlin("");
    setPlinSuccess(false);
    setCardNumber("");
    setCardHolder("");
    setExpiryDate("");
    setCvv("");
    setTarjetaSuccess(false);
    onOpenChange(false);
  };

  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      setExpiryDate(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setExpiryDate(digits);
    }
  };

  const handleCvvChange = (value: string) => {
    setCvv(value.replace(/\D/g, "").slice(0, 3));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {metodoPago === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Pagar con Yape</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Ingresa tu número de teléfono asociado a tu cuenta Yape
              </p>
            </DialogHeader>
            <div className="space-y-4">
              {!yapeSuccess ? (
                <>
                  <Card className="bg-linear-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">📱</div>
                        <div>
                          <p className="text-sm text-muted-foreground">Método de pago</p>
                          <p className="font-semibold text-lg">Yape</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="rounded-lg border bg-white p-4 flex flex-col items-center gap-3">
                    <img
                      src="/img/qr/qrandy.jpg"
                      alt="QR Yape"
                      className="w-40 h-40 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Escanea el código QR o ingresa tu número asociado a Yape
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yape-phone">Número de teléfono *</Label>
                    <Input
                      id="yape-phone"
                      placeholder="Ej: 987654321"
                      value={phoneYape}
                      onChange={(e) => setPhoneYape(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      maxLength={9}
                    />
                    <p className="text-xs text-muted-foreground">Ingresa tu número de 9 dígitos</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-900">ℹ️ Recibirás una notificación en tu app Yape para confirmar el pago</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handleYapeValidate}
                    >
                      Validar
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleClose}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h3 className="text-xl font-semibold">Pago exitoso</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Tu pago con Yape ha sido validado correctamente.
                  </p>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onConfirm();
                      handleClose();
                    }}
                  >
                    Cerrar
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {metodoPago === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Pagar con Plin</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Ingresa tu número de teléfono asociado a tu cuenta Plin
              </p>
            </DialogHeader>
            <div className="space-y-4">
              {!plinSuccess ? (
                <>
                  <Card className="bg-linear-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">💜</div>
                        <div>
                          <p className="text-sm text-muted-foreground">Método de pago</p>
                          <p className="font-semibold text-lg">Plin</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="rounded-lg border bg-white p-4 flex flex-col items-center gap-3">
                    <img
                      src="/img/qr/qrplin.jpg"
                      alt="QR Plin"
                      className="w-40 h-40 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Escanea el código QR o ingresa tu número asociado a Plin
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plin-phone">Número de teléfono *</Label>
                    <Input
                      id="plin-phone"
                      placeholder="Ej: 987654321"
                      value={phonePlin}
                      onChange={(e) => setPhonePlin(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      maxLength={9}
                    />
                    <p className="text-xs text-muted-foreground">Ingresa tu número de 9 dígitos</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-900">ℹ️ Recibirás una notificación en tu app Plin para confirmar el pago</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={handlePlinValidate}
                    >
                      Validar
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleClose}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h3 className="text-xl font-semibold">Pago exitoso</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Tu pago con Plin ha sido validado correctamente.
                  </p>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onConfirm();
                      handleClose();
                    }}
                  >
                    Cerrar
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {metodoPago === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Pagar con Tarjeta</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Ingresa los datos de tu tarjeta de débito o crédito
              </p>
            </DialogHeader>
            <div className="space-y-4">
              {!tarjetaSuccess ? (
                <>
                  <Card className="bg-linear-to-r from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">💳</div>
                        <div>
                          <p className="text-sm text-muted-foreground">Método de pago</p>
                          <p className="font-semibold text-lg">Tarjeta</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="card-number">Número de tarjeta *</Label>
                    <Input
                      id="card-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      maxLength={19}
                    />
                    <p className="text-xs text-muted-foreground">16 dígitos sin espacios</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-holder">Titular de la tarjeta *</Label>
                    <Input
                      id="card-holder"
                      placeholder="Ej: JUAN PEREZ"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry-date">Vencimiento (MM/AA) *</Label>
                      <Input
                        id="expiry-date"
                        placeholder="12/25"
                        value={expiryDate}
                        onChange={(e) => handleExpiryDateChange(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        placeholder="000"
                        value={cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        maxLength={3}
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-900">ℹ️ Tu información es segura y encriptada</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                      onClick={handleTarjetaValidate}
                    >
                      Validar
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleClose}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h3 className="text-xl font-semibold">Pago exitoso</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Tu pago con Tarjeta ha sido validado correctamente.
                  </p>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onConfirm();
                      handleClose();
                    }}
                  >
                    Cerrar
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFormModals;
