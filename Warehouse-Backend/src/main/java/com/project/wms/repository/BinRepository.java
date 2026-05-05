package com.project.wms.repository;

import com.project.wms.model.Bin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BinRepository extends JpaRepository<Bin, Long> {
    Optional<Bin> findByBinCode(String binCode);
}