package com.project.wms.repository;

import com.project.wms.model.Aisle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AisleRepository extends JpaRepository<Aisle, Long> {
    Optional<Aisle> findByAisleCode(String aisleCode);
}