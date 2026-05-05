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
        // Check if SKU already exists
        Optional<Product> existing = productRepository.findBySku(sku);
        if (existing.isPresent()) {
            Product p = existing.get();
            p.setQuantity(p.getQuantity() + quantity);
            return productRepository.save(p);
        }

        // Find or create Bin
        Bin bin = binRepository.findByBinCode(binCode)
                .orElseGet(() -> {
                    // Auto-create Aisle for this bin
                    Aisle aisle = aisleRepository.findByAisleCode("AUTO-AISLE")
                            .orElseGet(() -> {
                                // Auto-create Zone for this aisle
                                Zone zone = zoneRepository.findByZoneCode("AUTO-ZONE")
                                        .orElseGet(() -> {
                                            // Auto-create Warehouse for this zone
                                            Warehouse wh = warehouseRepository.findByWarehouseCode("AUTO-WH")
                                                    .orElseGet(() -> {
                                                        Warehouse newWh = new Warehouse("AUTO-WH", "Auto Warehouse", "Auto-generated");
                                                        return warehouseRepository.save(newWh);
                                                    });
                                            Zone newZone = new Zone("AUTO-ZONE", "STORAGE");
                                            newZone.setWarehouse(wh);
                                            return zoneRepository.save(newZone);
                                        });
                                Aisle newAisle = new Aisle("AUTO-AISLE");
                                newAisle.setZone(zone);
                                return aisleRepository.save(newAisle);
                            });
                    Bin newBin = new Bin(binCode, 100.0);
                    newBin.setAisle(aisle);
                    return binRepository.save(newBin);
                });

        Product product = new Product(sku, name, quantity);
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