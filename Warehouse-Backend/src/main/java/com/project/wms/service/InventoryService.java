package com.project.wms.service;

import com.project.wms.model.Product;
import com.project.wms.model.Bin;
import com.project.wms.model.Aisle;
import com.project.wms.model.Zone;
import com.project.wms.model.Warehouse;
import com.project.wms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BinRepository binRepository;

    @Autowired
    private AisleRepository aisleRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found: " + sku));
    }

    @Transactional
    public Product receiveProduct(String sku, String name, String barcode,
                                  String binCode, int quantity) {
        // Check if SKU already exists in THIS bin
        Optional<Product> existing = productRepository.findBySkuAndBinCode(sku, binCode);
        if (existing.isPresent()) {
            Product p = existing.get();
            Bin bin = p.getBin();
            double capacity = bin.getCapacity() != null ? bin.getCapacity() : 100;
            int newQty = p.getQuantity() + quantity;

            // Cap at bin capacity
            if (newQty > capacity) {
                p.setQuantity((int) capacity);
            } else {
                p.setQuantity(newQty);
            }
            return productRepository.save(p);
        }

        // Find bin - if bin doesn't exist, create it
        Bin bin = binRepository.findByBinCode(binCode)
                .orElseGet(() -> {
                    Bin newBin = new Bin(binCode, 100.0);
                    return binRepository.save(newBin);
                });

        double capacity = bin.getCapacity() != null ? bin.getCapacity() : 100;
        int cappedQty = Math.min(quantity, (int) capacity);

        Product product = new Product(sku, name, cappedQty);
        product.setBarcode(barcode);
        product.setBin(bin);
        return productRepository.save(product);
    }
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
}