package com.project.wms.repository;

import com.project.wms.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.sku = :sku ORDER BY p.id ASC")
    List<Product> findBySku(@Param("sku") String sku);

    Optional<Product> findByBarcode(String barcode);

    @Query("SELECT COUNT(DISTINCT p.bin.id) FROM Product p WHERE p.bin.aisle.zone.warehouse.id = :warehouseId")
    long countDistinctBinByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Product p WHERE p.bin.id = :binId")
    int sumQuantityByBinId(@Param("binId") Long binId);

    @Query("SELECT p FROM Product p WHERE p.sku = :sku AND p.bin.binCode = :binCode")
    List<Product> findBySkuAndBinCode(@Param("sku") String sku, @Param("binCode") String binCode);

    @Query("SELECT p FROM Product p WHERE p.sku = :sku AND p.bin.binCode = :binCode AND p.bin.aisle.id = :aisleId")
    List<Product> findBySkuAndBinCodeAndAisle(@Param("sku") String sku, @Param("binCode") String binCode, @Param("aisleId") Long aisleId);
}