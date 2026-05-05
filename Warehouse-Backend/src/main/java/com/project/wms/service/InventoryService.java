package com.project.wms.service;

import com.project.wms.model.Product;
import com.project.wms.model.Bin;
import com.project.wms.repository.ProductRepository;
import com.project.wms.repository.BinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private BinRepository binRepository;
    
    // Update inventory with race condition prevention
    @Transactional
    public Product updateInventory(String sku, int quantityChange) {
        Product product = productRepository.findBySku(sku)
            .orElseThrow(() -> new RuntimeException("Product not found: " + sku));
        
        int newQuantity = product.getQuantity() + quantityChange;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient inventory for SKU: " + sku);
        }
        
        product.setQuantity(newQuantity);
        return productRepository.save(product);
    }
    
    // Receive new product into warehouse
    @Transactional
    public Product receiveProduct(String sku, String name, String barcode, String binCode, int quantity) {
        Bin bin = binRepository.findByBinCode(binCode)
            .orElseThrow(() -> new RuntimeException("Bin not found: " + binCode));
        
        Product product = new Product();
        product.setSku(sku);
        product.setName(name);
        product.setBarcode(barcode);
        product.setQuantity(quantity);
        product.setBin(bin);
        
        return productRepository.save(product);
    }
    
    // Get product by SKU
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
            .orElseThrow(() -> new RuntimeException("Product not found: " + sku));
    }
    
    // Get all products
    public java.util.List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}