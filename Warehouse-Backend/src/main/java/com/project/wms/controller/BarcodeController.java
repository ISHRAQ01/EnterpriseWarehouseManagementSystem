package com.project.wms.controller;

import com.project.wms.service.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/barcode")
public class BarcodeController {

    @Autowired
    private BarcodeService barcodeService;

    @GetMapping("/product")
    public String getProductBarcode(@RequestParam String sku) {
        return barcodeService.generateProductBarcode(sku);
    }
}