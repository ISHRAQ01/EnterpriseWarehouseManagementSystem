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

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductBySku(String sku) {
        List<Product> list = productRepository.findBySku(sku);
        if (list.isEmpty()) throw new RuntimeException("Product not found: " + sku);
        return list.get(0);
    }

    public List<Product> getAllBySku(String sku) {
        return productRepository.findBySku(sku);
    }

    // New method with aisleId
    @Transactional
    public Product receiveProduct(String sku, String name, String barcode,
                                  String binCode, Long aisleId, int quantity) {
        List<Product> existingList;
        if (aisleId != null) {
            existingList = productRepository.findBySkuAndBinCodeAndAisle(sku, binCode, aisleId);
        } else {
            existingList = productRepository.findBySkuAndBinCode(sku, binCode);
        }

        if (existingList != null && !existingList.isEmpty()) {
            Product p = existingList.get(0);
            p.setQuantity(p.getQuantity() + quantity);
            return productRepository.save(p);
        }

        Bin bin;
        if (aisleId != null) {
            bin = binRepository.findByBinCodeAndAisleId(binCode, aisleId)
                    .orElseThrow(() -> new RuntimeException("Bin not found in selected aisle"));
        } else {
            List<Bin> bins = binRepository.findByBinCode(binCode);
            if (bins.isEmpty()) throw new RuntimeException("Bin not found: " + binCode);
            bin = bins.get(0);
        }

        Product product = new Product(sku, name, quantity);
        product.setBarcode(barcode);
        product.setBin(bin);
        return productRepository.save(product);
    }

    // Old method without aisleId (for backward compatibility)
    @Transactional
    public Product receiveProduct(String sku, String name, String barcode,
                                  String binCode, int quantity) {
        return receiveProduct(sku, name, barcode, binCode, null, quantity);
    }
    @Deprecated
    @Transactional
    public Product updateInventory(String sku, int quantityChange) {
        List<Product> list = productRepository.findBySku(sku);
        if (list.isEmpty()) throw new RuntimeException("Product not found: " + sku);
        Product product = list.get(0);  // ⚠️ ALWAYS picks first — dangerous with duplicate SKUs!
        int newQuantity = product.getQuantity() + quantityChange;
        if (newQuantity < 0) throw new RuntimeException("Insufficient inventory");
        product.setQuantity(newQuantity);
        return productRepository.save(product);
    }

    public Product getProductBySkuAndWarehouse(String sku, Long warehouseId) {
        List<Product> list = productRepository.findBySku(sku);
        for (Product p : list) {
            if (p.getBin() != null &&
                    p.getBin().getAisle() != null &&
                    p.getBin().getAisle().getZone() != null &&
                    p.getBin().getAisle().getZone().getWarehouse() != null &&
                    p.getBin().getAisle().getZone().getWarehouse().getId().equals(warehouseId)) {
                return p;
            }
        }
        throw new RuntimeException("Product not found in warehouse: " + sku);
    }

    @Transactional
    public Product updateInventoryByWarehouse(String sku, int quantityChange, Long warehouseId) {
        List<Product> list = productRepository.findBySku(sku);
        if (list.isEmpty()) throw new RuntimeException("Product not found: " + sku);

        Product targetProduct = list.get(0);  // Fallback if no warehouseId provided
        if (warehouseId != null) {
            for (Product p : list) {
                try {
                    if (p.getBin() != null &&
                            p.getBin().getAisle() != null &&
                            p.getBin().getAisle().getZone() != null &&
                            p.getBin().getAisle().getZone().getWarehouse() != null &&
                            p.getBin().getAisle().getZone().getWarehouse().getId().equals(warehouseId)) {
                        targetProduct = p;
                        break;
                    }
                } catch (Exception ignored) {}
            }
        }
        int newQuantity = targetProduct.getQuantity() + quantityChange;
        if (newQuantity < 0) throw new RuntimeException("Insufficient inventory");
        targetProduct.setQuantity(newQuantity);
        return productRepository.save(targetProduct);
    }
}