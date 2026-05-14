package com.project.wms.controller;

import com.project.wms.model.Product;
import com.project.wms.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import com.project.wms.repository.ProductRepository;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = inventoryService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{sku}")
    public ResponseEntity<Product> getProduct(@PathVariable String sku) {
        Product product = inventoryService.getProductBySku(sku);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/receive")
    public ResponseEntity<Product> receiveProductGet(
            @RequestParam String sku,
            @RequestParam String name,
            @RequestParam String barcode,
            @RequestParam String binCode,
            @RequestParam(required = false) Long aisleId,
            @RequestParam int quantity) {
        Product product = inventoryService.receiveProduct(sku, name, barcode, binCode, aisleId, quantity);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/shipment/receive/{sku}")
    @Transactional
    public ResponseEntity<Product> receiveShipment(
            @PathVariable String sku,
            @RequestParam int quantity,
            @RequestParam(required = false) Long warehouseId) {
        Product updated = inventoryService.updateInventoryByWarehouse(sku, quantity, warehouseId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{sku}/details")
    public ResponseEntity<Product> getProductDetails(@PathVariable String sku) {
        Product product = inventoryService.getProductBySku(sku);
        return ResponseEntity.ok(product);
    }

    @PostMapping("/receive")
    public ResponseEntity<Product> receiveProductPost(
            @RequestParam String sku,
            @RequestParam String name,
            @RequestParam String barcode,
            @RequestParam String binCode,
            @RequestParam(required = false) Long aisleId,
            @RequestParam int quantity) {
        Product product = inventoryService.receiveProduct(sku, name, barcode, binCode, aisleId, quantity);
        return ResponseEntity.ok(product);
    }


    @GetMapping("/{sku}/quantity")
    public ResponseEntity<Product> updateInventoryGet(
            @PathVariable String sku,
            @RequestParam int quantityChange,
            @RequestParam(required = false) Long warehouseId) {
        Product updated = inventoryService.updateInventoryByWarehouse(sku, quantityChange, warehouseId);
        return ResponseEntity.ok(updated);
    }


    @PutMapping("/{sku}/quantity")
    public ResponseEntity<Product> updateInventoryPut(
            @PathVariable String sku,
            @RequestParam int quantityChange,
            @RequestParam(required = false) Long warehouseId) {
        Product updated = inventoryService.updateInventoryByWarehouse(sku, quantityChange, warehouseId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/all/{sku}")
    public ResponseEntity<List<Product>> getAllProductsBySku(@PathVariable String sku) {
        List<Product> products = inventoryService.getAllBySku(sku);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/with-warehouse")
    public ResponseEntity<List<Map<String, Object>>> getProductsWithWarehouse() {
        List<Product> products = inventoryService.getAllProducts();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Product p : products) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("sku", p.getSku());
            map.put("name", p.getName());
            map.put("quantity", p.getQuantity());
            map.put("location", p.getLocation());
            map.put("binCode", p.getBinCode());
            map.put("barcode", p.getBarcode());
            try {
                map.put("warehouseId", p.getBin().getAisle().getZone().getWarehouse().getId());
                map.put("warehouseName", p.getBin().getAisle().getZone().getWarehouse().getName());
            } catch (Exception e) {
                map.put("warehouseId", null);
                map.put("warehouseName", "Unknown");
            }
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}