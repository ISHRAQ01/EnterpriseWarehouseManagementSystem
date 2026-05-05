package com.project.wms.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Service
public class BarcodeService {

    public String generateBarcodeBase64(String data, int width, int height) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(data, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate barcode", e);
        }
    }

    public String generateOrderBarcode(String orderNumber) {
        return generateBarcodeBase64(orderNumber, 200, 200);
    }

    public String generateProductBarcode(String sku) {
        return generateBarcodeBase64(sku, 200, 200);
    }
}