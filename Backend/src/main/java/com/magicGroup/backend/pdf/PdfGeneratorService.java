package com.magicGroup.backend.pdf;

import com.magicGroup.backend.model.ventas.*;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.*;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.*;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    private static final float PAGE_WIDTH = 210;
    private static final float MARGIN = 10;
    private static final float LINE_HEIGHT = 12;

    public byte[] generateTicketPdf(Pedido pedido, String tipo, Integer folioSourceId, String resolvedRuc,
            String resolvedRazon) throws IOException {
        int baseLines = 24;

        PDType1Font fontNormalPre = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

        float pageUsableWidth = PAGE_WIDTH - 2 * MARGIN;
        float descX = MARGIN + 28;
        float unitColWidth = 50;
        float amountColWidth = 50;
        // reduce small gaps between columns (was +8)
        float colGap = 4;
        float descColWidth = pageUsableWidth - (28 + unitColWidth + amountColWidth + colGap);

        var itemsForHeight = pedido.getDetallePedidos() == null
                ? java.util.Collections.<DetallePedido>emptyList()
                : pedido.getDetallePedidos();

        int descLinesCount = 0;
        for (DetallePedido it : itemsForHeight) {
            String rawDesc = it.getProducto() != null ? it.getProducto().getNomProd() : "";
            String cleanDesc = rawDesc.replaceAll("\\(.*?\\)", "").trim();
            java.util.List<String> lines = splitTextToLines(fontNormalPre, cleanDesc, 9, descColWidth);
            descLinesCount += Math.max(1, lines.size());
        }

        float height = MARGIN * 2 + (baseLines * LINE_HEIGHT) + (descLinesCount * LINE_HEIGHT);

        PDRectangle rect = new PDRectangle(PAGE_WIDTH, height);

        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(rect);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {

                PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font fontNormal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                // Header: center company info + title + folio + fecha/hora
                float y = height - MARGIN - 6;

                // Company name (centered)
                String company = "NOMBRE DE LA EMPRESA S.A.C.";
                float w = getTextWidth(fontBold, company, 12);
                float x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontBold, 12);
                cs.newLineAtOffset(x, y);
                cs.showText(company);
                cs.endText();
                y -= LINE_HEIGHT;

                // RUC
                String rucLine = "RUC: 12345678901";
                w = getTextWidth(fontNormal, rucLine, 8);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontNormal, 8);
                cs.newLineAtOffset(x, y);
                cs.showText(rucLine);
                cs.endText();
                y -= LINE_HEIGHT;

                // Address / phone
                String addr = "Av. Principal 123 - Lima (Tel: 999-999-999)";
                w = getTextWidth(fontNormal, addr, 8);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.newLineAtOffset(x, y);
                cs.showText(addr);
                cs.endText();
                // small extra gap between phone and next
                y -= LINE_HEIGHT * 0.8f;

                // Title (centered)
                String title = "factura".equalsIgnoreCase(tipo) ? "FACTURA ELECTRÓNICA" : "BOLETA DE VENTA ELECTRÓNICA";
                w = getTextWidth(fontBold, title, 10);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontBold, 10);
                cs.newLineAtOffset(x, y);
                cs.showText(title);
                cs.endText();
                y -= LINE_HEIGHT;

                // Folio under title (centered)
                int folioId = folioSourceId != null ? folioSourceId
                        : (pedido != null && pedido.getIdPed() != null ? pedido.getIdPed() : 0);
                String folio = ("boleta".equalsIgnoreCase(tipo) ? "B001-" : "F001-") + String.format("%08d", folioId);
                w = getTextWidth(fontBold, folio, 10);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontBold, 10);
                cs.newLineAtOffset(x, y);
                cs.showText(folio);
                cs.endText();
                y -= LINE_HEIGHT * 0.8f;

                // Fecha / Hora (centered)
                DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                String fecha = pedido.getFecha() != null ? pedido.getFecha().format(df) : "";
                String hora = pedido.getHora() != null ? pedido.getHora().toString() : "";
                String fechaLine = "Fecha de Emisión: " + fecha + "    Hora: " + hora;
                w = getTextWidth(fontNormal, fechaLine, 8);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontNormal, 8);
                cs.newLineAtOffset(x, y);
                cs.showText(fechaLine);
                cs.endText();
                // small extra vertical gap before client info
                y -= LINE_HEIGHT * 1.2f;

                cs.beginText();
                cs.setFont(fontBold, 9);
                cs.newLineAtOffset(MARGIN, y);
                if (pedido.getCliente() != null) {
                    String nombre = pedido.getCliente().getNomCli() == null ? "" : pedido.getCliente().getNomCli();
                    String apellido = pedido.getCliente().getApeCli() == null ? "" : pedido.getCliente().getApeCli();
                    String clienteNombre = (nombre + " " + apellido).trim();
                    String codCli = pedido.getCliente().getCodCli() == null ? "" : pedido.getCliente().getCodCli();

                    if ("factura".equalsIgnoreCase(tipo)) {
                        String razon = (resolvedRazon != null && !resolvedRazon.isBlank()) ? resolvedRazon
                                : (clienteNombre.isEmpty() ? codCli : clienteNombre);
                        cs.showText("RAZÓN SOCIAL: " + razon);
                        cs.newLineAtOffset(0, -LINE_HEIGHT);
                        String ruc = (resolvedRuc != null && !resolvedRuc.isBlank()) ? resolvedRuc
                                : (codCli.matches("\\d{11}") ? codCli : "");
                        cs.showText("RUC: " + ruc);
                        cs.newLineAtOffset(0, -LINE_HEIGHT);
                    } else {
                        String clienteLabel = clienteNombre.isEmpty() ? codCli : clienteNombre;
                        cs.showText("CLIENTE: " + clienteLabel);
                        cs.newLineAtOffset(0, -LINE_HEIGHT);
                        String dni = codCli.matches("\\d{8}") ? codCli : "00000000";
                        cs.showText("DNI: " + dni);
                        cs.newLineAtOffset(0, -LINE_HEIGHT);
                    }

                    String dir = pedido.getDireccion() != null && pedido.getDireccion().getDireccion() != null
                            && !pedido.getDireccion().getDireccion().isBlank()
                                    ? pedido.getDireccion().getDireccion()
                                    : "Av. Perú 458, Lima, Lima";
                    cs.showText("Dirección: " + dir);
                    cs.newLineAtOffset(0, -LINE_HEIGHT);
                }
                cs.endText();

                // Start the table slightly further down so it doesn't overlap client info
                float currentY = height - MARGIN - (LINE_HEIGHT * 10.2f);
                float leftX = MARGIN;
                float rightX = PAGE_WIDTH - MARGIN;

                DecimalFormat dfmt = new DecimalFormat("0.00");

                // Table header: CANT | DESCRIPCION | P. UNIT | IMPORTE
                cs.beginText();
                // Table header: use absolute positions so columns align
                cs.setFont(fontBold, 9);
                // CANT
                cs.beginText();
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("CANT");
                cs.endText();
                // DESCRIPCION
                cs.beginText();
                cs.newLineAtOffset(descX, currentY);
                cs.showText("DESCRIPCION");
                cs.endText();
                // P. UNIT (right align to unit column)
                String punitHeader = "P. UNIT";
                float punitW = getTextWidth(fontBold, punitHeader, 9);
                float unitXcalc = rightX - amountColWidth - colGap;
                cs.beginText();
                cs.newLineAtOffset(unitXcalc - punitW, currentY);
                cs.showText(punitHeader);
                cs.endText();
                // IMPORTE
                String impHeader = "IMPORTE";
                float impW = getTextWidth(fontBold, impHeader, 9);
                cs.beginText();
                cs.newLineAtOffset(rightX - impW, currentY);
                cs.showText(impHeader);
                cs.endText();

                currentY -= LINE_HEIGHT;

                cs.setFont(fontNormal, 9);

                var items = pedido.getDetallePedidos() == null
                        ? java.util.Collections.<DetallePedido>emptyList()
                        : pedido.getDetallePedidos();

                float amountX = rightX;
                float unitX = amountX - amountColWidth - colGap; // column start for unit price

                for (DetallePedido it : items) {
                    String rawDesc = it.getProducto() != null ? it.getProducto().getNomProd() : "";
                    String cleanDesc = rawDesc.replaceAll("\\(.*?\\)", "").trim();
                    java.util.List<String> descLines = splitTextToLines(fontNormal, cleanDesc, 9, descColWidth);
                    if (descLines.isEmpty())
                        descLines = java.util.Collections.singletonList("");

                    String qtyText = String.valueOf(it.getCantidad());
                    BigDecimal subtotal = it.getSubtotal() == null ? BigDecimal.ZERO : it.getSubtotal();
                    BigDecimal unit = BigDecimal.ZERO;
                    try {
                        unit = subtotal.divide(BigDecimal.valueOf(it.getCantidad()), 2, RoundingMode.HALF_UP);
                    } catch (Exception e) {
                        unit = BigDecimal.ZERO;
                    }
                    String unitText = dfmt.format(unit);
                    String amountText = dfmt.format(subtotal);

                    // Quantity
                    cs.beginText();
                    cs.newLineAtOffset(leftX, currentY);
                    cs.showText(qtyText);
                    cs.endText();

                    // Description lines
                    for (int i = 0; i < descLines.size(); i++) {
                        String line = descLines.get(i);
                        cs.beginText();
                        cs.newLineAtOffset(descX, currentY - (i * LINE_HEIGHT));
                        cs.showText(line);
                        cs.endText();
                    }

                    // Unit price (on first line)
                    float unitWidth = getTextWidth(fontNormal, unitText, 9);
                    float amountWidth = getTextWidth(fontNormal, amountText, 9);

                    cs.beginText();
                    cs.newLineAtOffset(unitX - unitWidth, currentY);
                    cs.showText(unitText);
                    cs.endText();

                    cs.beginText();
                    cs.newLineAtOffset(amountX - amountWidth, currentY);
                    cs.showText(amountText);
                    cs.endText();

                    currentY -= LINE_HEIGHT * Math.max(1, descLines.size());
                }

                BigDecimal total = pedido.getTotal() == null ? BigDecimal.ZERO : pedido.getTotal();
                BigDecimal opGravada = total.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
                BigDecimal igv = total.subtract(opGravada).setScale(2, RoundingMode.HALF_UP);

                currentY -= LINE_HEIGHT / 2;

                cs.beginText();
                cs.setFont(fontBold, 9);
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("OP. GRAVADA:");
                cs.endText();

                String opVal = dfmt.format(opGravada);
                float opWidth = getTextWidth(fontBold, opVal, 9);

                cs.beginText();
                cs.newLineAtOffset(rightX - opWidth, currentY);
                cs.showText(opVal);
                cs.endText();

                currentY -= LINE_HEIGHT;

                cs.beginText();
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("IGV (18%):");
                cs.endText();

                String igvVal = dfmt.format(igv);
                float igvWidth = getTextWidth(fontBold, igvVal, 9);

                cs.beginText();
                cs.newLineAtOffset(rightX - igvWidth, currentY);
                cs.showText(igvVal);
                cs.endText();

                currentY -= LINE_HEIGHT;

                cs.beginText();
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("TOTAL:");
                cs.endText();

                String totalVal = dfmt.format(total);
                float totalWidth = getTextWidth(fontBold, totalVal, 9);

                cs.beginText();
                cs.newLineAtOffset(rightX - totalWidth, currentY);
                cs.showText(totalVal);
                cs.endText();

                currentY -= LINE_HEIGHT * 1.2f;

                cs.beginText();
                cs.setFont(fontNormal, 8);
                String[] parts = totalVal.split("\\.");
                int integerPart;

                try {
                    integerPart = Integer.parseInt(parts[0]);
                } catch (Exception e) {
                    integerPart = 0;
                }

                String words = numberToWords(integerPart);
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("SON: " + words.toUpperCase() + " CON " +
                        (parts.length > 1 ? parts[1] : "00") + "/100 SOLES");
                cs.endText();

                cs.beginText();
                cs.newLineAtOffset(leftX, currentY - LINE_HEIGHT * 1.2f);
                cs.showText("Gracias por su compra.");
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }

    private float getTextWidth(PDType1Font font, String text, int fontSize) throws IOException {
        float width = 0;

        for (int i = 0; i < text.length(); i++) {
            String character = text.substring(i, i + 1);

            byte[] encoded = font.encode(character);
            int code = encoded[0] & 0xFF;

            width += font.getWidth(code);
        }

        return (width / 1000f) * fontSize;
    }

    private java.util.List<String> splitTextToLines(PDType1Font font, String text, int fontSize, float maxWidth)
            throws IOException {
        java.util.List<String> lines = new java.util.ArrayList<>();
        if (text == null || text.isBlank()) {
            return lines;
        }

        String[] words = text.split("\\s+");
        StringBuilder current = new StringBuilder();

        for (String w : words) {
            String trial = current.length() == 0 ? w : current + " " + w;
            float wWidth = getTextWidth(new PDType1Font(Standard14Fonts.FontName.HELVETICA), trial, fontSize);
            if (wWidth <= maxWidth) {
                if (current.length() > 0)
                    current.append(' ');
                current.append(w);
            } else {
                if (current.length() > 0)
                    lines.add(current.toString());
                // if single word is longer than max, we truncate it
                if (getTextWidth(font, w, fontSize) > maxWidth) {
                    String truncated = truncate(w, Math.max(10, (int) (maxWidth / (fontSize * 0.6))));
                    lines.add(truncated);
                    current = new StringBuilder();
                } else {
                    current = new StringBuilder(w);
                }
            }
        }

        if (current.length() > 0)
            lines.add(current.toString());

        return lines;
    }

    private String truncate(String s, int max) {
        if (s == null)
            return "";
        return s.length() <= max ? s : s.substring(0, max - 3) + "...";
    }

    private String numberToWords(int number) {
        if (number == 0)
            return "cero";

        String[] unidades = {
                "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
                "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete",
                "dieciocho", "diecinueve"
        };

        String[] decenas = {
                "", "", "veinte", "treinta", "cuarenta", "cincuenta",
                "sesenta", "setenta", "ochenta", "noventa"
        };

        StringBuilder words = new StringBuilder();

        if (number >= 1000000) {
            int m = number / 1_000_000;
            words.append(numberToWords(m)).append(" millón").append(m > 1 ? "es" : "");
            number %= 1_000_000;
            if (number > 0)
                words.append(" ");
        }

        if (number >= 1000) {
            int miles = number / 1000;
            if (miles == 1)
                words.append("mil");
            else
                words.append(numberToWords(miles)).append(" mil");
            number %= 1000;
            if (number > 0)
                words.append(" ");
        }

        if (number >= 100) {
            int c = number / 100;
            switch (c) {
                case 1 -> words.append(number % 100 == 0 ? "cien" : "ciento");
                case 2 -> words.append("doscientos");
                case 3 -> words.append("trescientos");
                case 4 -> words.append("cuatrocientos");
                case 5 -> words.append("quinientos");
                case 6 -> words.append("seiscientos");
                case 7 -> words.append("setecientos");
                case 8 -> words.append("ochocientos");
                case 9 -> words.append("novecientos");
            }
            number %= 100;
            if (number > 0)
                words.append(" ");
        }

        if (number >= 20) {
            int d = number / 10;
            words.append(decenas[d]);
            int u = number % 10;
            if (u > 0)
                words.append(" y ").append(unidades[u]);
        } else if (number > 0) {
            words.append(unidades[number]);
        }

        return words.toString();
    }

    public byte[] generateTicketPdf(Venta venta, java.util.List<DetalleVenta> detalles, String resolvedRuc,
            String resolvedRazon, String codigoDocumento, Integer folioSourceId) throws IOException {
        int baseLines = 24;

        PDType1Font fontNormalPre = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

        float pageUsableWidth = PAGE_WIDTH - 2 * MARGIN;
        float descX = MARGIN + 28;
        float unitColWidth = 50;
        float amountColWidth = 50;
        float colGap = 4;
        float descColWidth = pageUsableWidth - (28 + unitColWidth + amountColWidth + colGap);

        var itemsForHeight = detalles == null ? java.util.Collections.<DetalleVenta>emptyList() : detalles;
        int descLinesCount = 0;
        for (DetalleVenta it : itemsForHeight) {
            String rawDesc = it.getNomProd() != null ? it.getNomProd()
                    : (it.getProducto() != null ? it.getProducto().getNomProd() : "");
            String cleanDesc = rawDesc.replaceAll("\\(.*?\\)", "").trim();
            java.util.List<String> lines = splitTextToLines(fontNormalPre, cleanDesc, 9, descColWidth);
            descLinesCount += Math.max(1, lines.size());
        }

        float height = MARGIN * 2 + (baseLines * LINE_HEIGHT) + (descLinesCount * LINE_HEIGHT);

        PDRectangle rect = new PDRectangle(PAGE_WIDTH, height);

        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(rect);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font fontNormal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                // Header: company info + document title (centered)
                float y = height - MARGIN - 6;

                String company = "TAMBITO";
                float w = getTextWidth(fontBold, company, 12);
                float x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontBold, 12);
                cs.newLineAtOffset(x, y);
                cs.showText(company);
                cs.endText();
                y -= LINE_HEIGHT;

                String rucLine = "RUC: 12345678901";
                w = getTextWidth(fontNormal, rucLine, 8);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontNormal, 8);
                cs.newLineAtOffset(x, y);
                cs.showText(rucLine);
                cs.endText();
                y -= LINE_HEIGHT;

                String addr = "Av. Peru 458 - Lima (Tel: 984-587-485)";
                w = getTextWidth(fontNormal, addr, 8);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.newLineAtOffset(x, y);
                cs.showText(addr);
                cs.endText();
                // small extra gap between phone and next (slightly larger so title has a bit
                // more top margin)
                y -= LINE_HEIGHT * 1.1f;

                if (venta == null) {
                    throw new IllegalArgumentException("venta no puede ser null");
                }

                String serie = (codigoDocumento != null && !codigoDocumento.isBlank()) ? codigoDocumento
                        : (venta != null && venta.getTipo() != null && "boleta".equalsIgnoreCase(venta.getTipo().name())
                                ? "B001"
                                : "F001");
                int folioId = folioSourceId != null ? folioSourceId
                        : (venta != null && venta.getIdVenta() != null ? venta.getIdVenta() : 0);
                String folio = serie + "-" + String.format("%08d", folioId);

                String title = (venta.getTipo() != null && "factura".equalsIgnoreCase(venta.getTipo().name()))
                        ? "FACTURA ELECTRÓNICA"
                        : "BOLETA DE VENTA ELECTRÓNICA";

                w = getTextWidth(fontBold, title, 10);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontBold, 10);
                cs.newLineAtOffset(x, y);
                cs.showText(title);
                cs.endText();
                y -= LINE_HEIGHT;

                w = getTextWidth(fontBold, folio, 10);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontBold, 10);
                cs.newLineAtOffset(x, y);
                cs.showText(folio);
                cs.endText();
                // small bottom margin after folio
                y -= LINE_HEIGHT * 1.1f;

                DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                String fecha = venta.getFecha() != null ? venta.getFecha().format(df) : "";
                String hora = venta.getHora() != null ? venta.getHora().toString() : "";
                String fechaLine = "Fecha de Emisión: " + fecha + "    Hora: " + hora;
                w = getTextWidth(fontNormal, fechaLine, 8);
                x = (PAGE_WIDTH - w) / 2f;
                cs.beginText();
                cs.setFont(fontNormal, 8);
                cs.newLineAtOffset(x, y);
                cs.showText(fechaLine);
                cs.endText();
                // small extra vertical gap before client info
                y -= LINE_HEIGHT * 1.2f;

                cs.beginText();
                cs.setFont(fontBold, 9);
                cs.newLineAtOffset(MARGIN, y);
                if (venta.getCliente() != null) {
                    String nombre = venta.getCliente().getNomCli() == null ? "" : venta.getCliente().getNomCli();
                    String apellido = venta.getCliente().getApeCli() == null ? "" : venta.getCliente().getApeCli();
                    String clienteNombre = (nombre + " " + apellido).trim();
                    String codCli = venta.getCliente().getCodCli() == null ? "" : venta.getCliente().getCodCli();

                    if (venta.getTipo() != null && "factura".equalsIgnoreCase(venta.getTipo().name())) {
                        String razon = (resolvedRazon != null && !resolvedRazon.isBlank()) ? resolvedRazon
                                : (clienteNombre.isEmpty() ? codCli : clienteNombre);
                        cs.showText("RAZÓN SOCIAL: " + razon);
                        cs.newLineAtOffset(0, -LINE_HEIGHT);
                        String ruc = (resolvedRuc != null && !resolvedRuc.isBlank()) ? resolvedRuc
                                : (codCli.matches("\\d{11}") ? codCli : "");
                        cs.showText("RUC: " + ruc);
                        cs.newLineAtOffset(0, -LINE_HEIGHT);
                    } else {
                        String clienteLabel = clienteNombre.isEmpty() ? codCli : clienteNombre;
                        cs.showText("CLIENTE: " + clienteLabel);
                        cs.newLineAtOffset(0, -LINE_HEIGHT);
                        String dni = codCli.matches("\\d{8}") ? codCli : "00000000";
                        cs.showText("DNI: " + dni);
                        cs.newLineAtOffset(0, -LINE_HEIGHT);
                    }

                    String dir = (venta.getPedido() != null && venta.getPedido().getDireccion() != null
                            && venta.getPedido().getDireccion().getDireccion() != null
                            && !venta.getPedido().getDireccion().getDireccion().isBlank())
                                    ? venta.getPedido().getDireccion().getDireccion()
                                    : "Av. Perú 458, Lima, Lima";
                    cs.showText("Dirección: " + dir);
                    // slightly increased bottom margin after Dirección
                    cs.newLineAtOffset(0, -LINE_HEIGHT * 1.1f);
                }

                cs.endText();

                // Start the table slightly further down so it doesn't overlap client info
                float currentY = height - MARGIN - (LINE_HEIGHT * 10.2f);
                float leftX = MARGIN;
                float rightX = PAGE_WIDTH - MARGIN;

                DecimalFormat dfmt = new DecimalFormat("0.00");

                // Table header: CANT | DESCRIPCION | P. UNIT | IMPORTE (absolute positions)
                cs.setFont(fontBold, 9);
                // CANT
                cs.beginText();
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("CANT");
                cs.endText();
                // DESCRIPCION
                cs.beginText();
                cs.newLineAtOffset(descX, currentY);
                cs.showText("DESCRIPCION");
                cs.endText();
                // P. UNIT
                String punitHeaderV = "P. UNIT";
                float punitWV = getTextWidth(fontBold, punitHeaderV, 9);
                float unitXcalcV = rightX - amountColWidth - colGap;
                cs.beginText();
                cs.newLineAtOffset(unitXcalcV - punitWV, currentY);
                cs.showText(punitHeaderV);
                cs.endText();
                // IMPORTE
                String impHeaderV = "IMPORTE";
                float impWV = getTextWidth(fontBold, impHeaderV, 9);
                cs.beginText();
                cs.newLineAtOffset(rightX - impWV, currentY);
                cs.showText(impHeaderV);
                cs.endText();

                currentY -= LINE_HEIGHT;

                cs.setFont(fontNormal, 9);

                for (DetalleVenta it : (detalles == null ? java.util.Collections.<DetalleVenta>emptyList()
                        : detalles)) {
                    String rawDesc = it.getNomProd() != null ? it.getNomProd()
                            : (it.getProducto() != null ? it.getProducto().getNomProd() : "");
                    String cleanDesc = rawDesc.replaceAll("\\(.*?\\)", "").trim();
                    java.util.List<String> descLines = splitTextToLines(fontNormal, cleanDesc, 9, descColWidth);
                    if (descLines.isEmpty())
                        descLines = java.util.Collections.singletonList("");

                    String qtyText = String.valueOf(it.getCantidad());
                    BigDecimal subtotal = it.getSubtotal() == null ? BigDecimal.ZERO : it.getSubtotal();
                    BigDecimal unit = BigDecimal.ZERO;
                    try {
                        unit = subtotal.divide(BigDecimal.valueOf(it.getCantidad()), 2, RoundingMode.HALF_UP);
                    } catch (Exception e) {
                        unit = BigDecimal.ZERO;
                    }
                    String unitText = dfmt.format(unit);
                    String amountText = dfmt.format(subtotal);

                    // Quantity
                    cs.beginText();
                    cs.newLineAtOffset(leftX, currentY);
                    cs.showText(qtyText);
                    cs.endText();

                    // Description
                    for (int i = 0; i < descLines.size(); i++) {
                        cs.beginText();
                        cs.newLineAtOffset(descX, currentY - (i * LINE_HEIGHT));
                        cs.showText(descLines.get(i));
                        cs.endText();
                    }

                    float amountX = rightX;
                    float unitX = amountX - amountColWidth - colGap;

                    float unitWidth = getTextWidth(fontNormal, unitText, 9);
                    float amountWidth = getTextWidth(fontNormal, amountText, 9);

                    cs.beginText();
                    cs.newLineAtOffset(unitX - unitWidth, currentY);
                    cs.showText(unitText);
                    cs.endText();

                    cs.beginText();
                    cs.newLineAtOffset(amountX - amountWidth, currentY);
                    cs.showText(amountText);
                    cs.endText();

                    currentY -= LINE_HEIGHT * Math.max(1, descLines.size());
                }

                BigDecimal total = venta.getTotal() == null ? BigDecimal.ZERO : venta.getTotal();
                BigDecimal opGravada = total.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
                BigDecimal igv = total.subtract(opGravada).setScale(2, RoundingMode.HALF_UP);

                currentY -= LINE_HEIGHT / 2;

                cs.beginText();
                cs.setFont(fontBold, 9);
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("OP. GRAVADA:");
                cs.endText();

                String opVal = dfmt.format(opGravada);
                float opWidth = getTextWidth(fontBold, opVal, 9);
                cs.beginText();
                cs.newLineAtOffset(rightX - opWidth, currentY);
                cs.showText(opVal);
                cs.endText();

                currentY -= LINE_HEIGHT;

                cs.beginText();
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("IGV (18%):");
                cs.endText();

                String igvVal = dfmt.format(igv);
                float igvWidth = getTextWidth(fontBold, igvVal, 9);
                cs.beginText();
                cs.newLineAtOffset(rightX - igvWidth, currentY);
                cs.showText(igvVal);
                cs.endText();

                currentY -= LINE_HEIGHT;

                cs.beginText();
                cs.newLineAtOffset(leftX, currentY);
                cs.showText("TOTAL:");
                cs.endText();

                String totalVal = dfmt.format(total);
                float totalWidth = getTextWidth(fontBold, totalVal, 9);
                cs.beginText();
                cs.newLineAtOffset(rightX - totalWidth, currentY);
                cs.showText(totalVal);
                cs.endText();

                currentY -= LINE_HEIGHT * 1.2f;

                cs.beginText();
                cs.setFont(fontNormal, 8);
                String[] parts = totalVal.split("\\.");
                int integerPart = 0;
                try {
                    integerPart = Integer.parseInt(parts[0]);
                } catch (NumberFormatException e) {
                    integerPart = 0;
                }
                String words = numberToWords(integerPart);
                cs.newLineAtOffset(leftX, currentY);
                cs.showText(
                        "SON: " + words.toUpperCase() + " CON " + (parts.length > 1 ? parts[1] : "00") + "/100 SOLES");
                cs.endText();

                cs.beginText();
                cs.newLineAtOffset(leftX, currentY - LINE_HEIGHT * 1.2f);
                cs.showText("Gracias por su compra.");
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }
}
