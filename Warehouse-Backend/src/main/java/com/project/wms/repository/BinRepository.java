package com.project.wms.repository;

import com.project.wms.model.Bin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface BinRepository extends JpaRepository<Bin, Long> {
    List<Bin> findByBinCode(String binCode);
    Optional<Bin> findFirstByBinCode(String binCode);

    @Query("SELECT b FROM Bin b WHERE b.binCode = :binCode AND b.aisle.id = :aisleId")
    Optional<Bin> findByBinCodeAndAisleId(@Param("binCode") String binCode, @Param("aisleId") Long aisleId);
}