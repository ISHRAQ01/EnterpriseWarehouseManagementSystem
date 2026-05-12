package com.project.wms.repository;

import com.project.wms.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);

    @Query("SELECT COUNT(DISTINCT p.bin.id) FROM Product p WHERE p.bin.aisle.zone.warehouse.id = :warehouseId")
    long countDistinctBinByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Product p WHERE p.bin.id = :binId")
    int sumQuantityByBinId(@Param("binId") Long binId);
    @Query("SELECT p FROM Product p WHERE p.sku = :sku AND p.bin.binCode = :binCode")
    Optional<Product> findBySkuAndBinCode(@Param("sku") String sku, @Param("binCode") String binCode);
}