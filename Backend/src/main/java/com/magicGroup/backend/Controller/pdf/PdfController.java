package com.magicGroup.backend.Controller.pdf;

import com.magicGroup.backend.pdf.PdfGeneratorService;
import com.magicGroup.backend.repository.ventasRepository.*;
import com.magicGroup.backend.model.ventas.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.Optional;


@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PdfController {

    private final PdfGeneratorService pdfGeneratorService;
    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final FacturaRepository facturaRepository;
    private final BoletaRepository boletaRepository;

    @GetMapping("/api/pedidos/{id}/pdf")
    public ResponseEntity<byte[]> getPedidoPdf(@PathVariable Integer id,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String ruc,
            @RequestParam(required = false) String razon) {

        try {
            String resolvedRuc = (ruc != null && !ruc.isBlank()) ? ruc : null;
            String resolvedRazon = (razon != null && !razon.isBlank()) ? razon : null;

            Optional<Venta> ventaOpt = ventaRepository.findByPedido_IdPed(id);
            if (ventaOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            Venta venta = ventaOpt.get();

            Integer folioSourceId = venta.getIdVenta();
            String resolvedTipo = venta.getTipo() != null ? venta.getTipo().name().toLowerCase()
                    : (tipo == null ? "boleta" : tipo);

            java.util.List<com.magicGroup.backend.model.ventas.DetalleVenta> detalleVentas = detalleVentaRepository
                    .findByVenta_IdVenta(venta.getIdVenta());

            String resolvedRucLocal = resolvedRuc;
            String resolvedRazonLocal = resolvedRazon;
            String codigoDocumento = null;

            if ("factura".equalsIgnoreCase(resolvedTipo)) {
                Optional<Factura> fOpt = facturaRepository.findById(venta.getIdVenta());
                if (fOpt.isPresent()) {
                    Factura f = fOpt.get();
                    codigoDocumento = f.getCodigoFactura();
                    if ((resolvedRucLocal == null || resolvedRucLocal.isBlank()) && f.getRucCliente() != null
                            && !f.getRucCliente().isBlank()) {
                        resolvedRucLocal = f.getRucCliente();
                    }
                    if ((resolvedRazonLocal == null || resolvedRazonLocal.isBlank())
                            && f.getRazonSocialCliente() != null
                            && !f.getRazonSocialCliente().isBlank()) {
                        resolvedRazonLocal = f.getRazonSocialCliente();
                    }
                }
            } else {
                Optional<Boleta> bOpt = boletaRepository.findById(venta.getIdVenta());
                if (bOpt.isPresent()) {
                    codigoDocumento = bOpt.get().getCodigoBoleta();
                }
            }

            if (resolvedRucLocal == null || resolvedRucLocal.isBlank()) {
                String codCli = venta.getCliente() != null ? venta.getCliente().getCodCli() : null;
                if (codCli != null && codCli.matches("\\d{11}"))
                    resolvedRucLocal = codCli;
            }
            if (resolvedRazonLocal == null || resolvedRazonLocal.isBlank()) {
                if (venta.getCliente() != null) {
                    String nombre = venta.getCliente().getNomCli() == null ? "" : venta.getCliente().getNomCli();
                    String apellido = venta.getCliente().getApeCli() == null ? "" : venta.getCliente().getApeCli();
                    String clienteNombre = (nombre + " " + apellido).trim();
                    if (!clienteNombre.isEmpty())
                        resolvedRazonLocal = clienteNombre;
                }
            }

            byte[] pdf = pdfGeneratorService.generateTicketPdf(venta, detalleVentas, resolvedRucLocal,
                    resolvedRazonLocal, codigoDocumento, folioSourceId);

            String filename = (codigoDocumento != null ? codigoDocumento
                    : ("boleta".equalsIgnoreCase(resolvedTipo) ? "boleta_" : "factura_"))
                    + folioSourceId + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
