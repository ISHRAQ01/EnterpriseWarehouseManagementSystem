package com.project.wms.controller;

import com.project.wms.model.Product;
import com.project.wms.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.project.wms.repository.ProductRepository;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private ProductRepository productRepository;
    // GET all products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = inventoryService.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    // GET product by SKU
    @GetMapping("/{sku}")
    public ResponseEntity<Product> getProduct(@PathVariable String sku) {
        Product product = inventoryService.getProductBySku(sku);
        return ResponseEntity.ok(product);
    }
    
    // GET receive product (for browser testing)
    @GetMapping("/receive")
    public ResponseEntity<Product> receiveProductGet(
            @RequestParam String sku,
            @RequestParam String name,
            @RequestParam String barcode,
            @RequestParam String binCode,
            @RequestParam int quantity) {
        Product product = inventoryService.receiveProduct(sku, name, barcode, binCode, quantity);
        return ResponseEntity.ok(product);
    }
    // ========== DELETE PRODUCT ==========
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    // Receive shipment and update product quantity
    @GetMapping("/shipment/receive/{sku}")
    @Transactional
    public ResponseEntity<Product> receiveShipment(
            @PathVariable String sku,
            @RequestParam int quantity) {
        Product updated = inventoryService.updateInventory(sku, quantity);
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/{sku}/details")
    public ResponseEntity<Product> getProductDetails(@PathVariable String sku) {
        Product product = inventoryService.getProductBySku(sku);
        return ResponseEntity.ok(product);
    }
    // POST receive product
    @PostMapping("/receive")
    public ResponseEntity<Product> receiveProductPost(
            @RequestParam String sku,
            @RequestParam String name,
            @RequestParam String barcode,
            @RequestParam String binCode,
            @RequestParam int quantity) {
        Product product = inventoryService.receiveProduct(sku, name, barcode, binCode, quantity);
        return ResponseEntity.ok(product);
    }
    
    // GET update inventory (for browser testing)
    @GetMapping("/{sku}/quantity")
    public ResponseEntity<Product> updateInventoryGet(
            @PathVariable String sku,
            @RequestParam int quantityChange) {
        Product updated = inventoryService.updateInventory(sku, quantityChange);
        return ResponseEntity.ok(updated);
    }
    
    // PUT update inventory
    @PutMapping("/{sku}/quantity")
    public ResponseEntity<Product> updateInventoryPut(
            @PathVariable String sku,
            @RequestParam int quantityChange) {
        Product updated = inventoryService.updateInventory(sku, quantityChange);
        return ResponseEntity.ok(updated);
    }
}