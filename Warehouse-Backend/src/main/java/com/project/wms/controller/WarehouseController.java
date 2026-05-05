package com.project.wms.controller;

import com.project.wms.model.*;
import com.project.wms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private AisleRepository aisleRepository;

    @Autowired
    private BinRepository binRepository;

    // ========== WAREHOUSE ==========

    @GetMapping
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @GetMapping("/create")
    public ResponseEntity<Warehouse> createWarehouse(
            @RequestParam String code,
            @RequestParam String name,
            @RequestParam String address) {
        Warehouse w = new Warehouse(code, name, address);
        return ResponseEntity.ok(warehouseRepository.save(w));
    }

    // ========== ZONE ==========

    @GetMapping("/zones")
    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }

    @GetMapping("/zone/create")
    public ResponseEntity<Zone> createZone(
            @RequestParam String code,
            @RequestParam String type,
            @RequestParam Long warehouseId) {
        Warehouse wh = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        Zone zone = new Zone(code, type);
        zone.setWarehouse(wh);
        return ResponseEntity.ok(zoneRepository.save(zone));
    }

    // ========== AISLE ==========

    @GetMapping("/aisle/create")
    public ResponseEntity<Aisle> createAisle(
            @RequestParam String code,
            @RequestParam Long zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Zone not found"));
        Aisle aisle = new Aisle(code);
        aisle.setZone(zone);
        return ResponseEntity.ok(aisleRepository.save(aisle));
    }

    // ========== BIN ==========

    @GetMapping("/bin/create")
    public ResponseEntity<Bin> createBin(
            @RequestParam String code,
            @RequestParam Double capacity,
            @RequestParam Long aisleId) {
        Aisle aisle = aisleRepository.findById(aisleId)
                .orElseThrow(() -> new RuntimeException("Aisle not found"));
        Bin bin = new Bin(code, capacity);
        bin.setAisle(aisle);
        return ResponseEntity.ok(binRepository.save(bin));
    }
}