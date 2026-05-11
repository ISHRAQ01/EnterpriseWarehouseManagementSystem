package com.project.wms.controller;

import com.project.wms.model.*;
import com.project.wms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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
    @GetMapping("/{id}")
    @Transactional (readOnly = true)
    public ResponseEntity<Warehouse> getWarehouseDetail(@PathVariable Long id) {
        Warehouse wh = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        // Force initialization of lazy collections
        wh.getZones().forEach(z -> {
            z.getAisles().forEach(a -> a.getBins().size());
            z.getAisles().size();
        });
        return ResponseEntity.ok(wh);
    }

    @GetMapping("/create")
    @Transactional
    public ResponseEntity<Warehouse> createWarehouse(
            @RequestParam String code,
            @RequestParam String name,
            @RequestParam String address) {
        Warehouse w = new Warehouse(code, name, address);
        w = warehouseRepository.save(w);
        return ResponseEntity.ok(w);
    }
    @GetMapping("/{id}/create-default-zones")
    @Transactional
    public ResponseEntity<?> createDefaultZones(@PathVariable Long id) {
        Warehouse wh = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        if (wh.getZones() != null && !wh.getZones().isEmpty()) {
            return ResponseEntity.badRequest().body("Zones already exist");
        }

        String[][] defaults = {
                {"ZONE-STORE", "STORAGE"},
                {"ZONE-PICK", "PICKING"},
                {"ZONE-SHIP", "SHIPPING"},
                {"ZONE-RECV", "RECEIVING"}
        };
        for (String[] z : defaults) {
            Zone zone = new Zone(z[0], z[1]);
            zone.setWarehouse(wh);
            zoneRepository.save(zone);
        }
        return ResponseEntity.ok().build();
    }

    // ========== ZONE ==========

    @GetMapping("/zone/all")
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

    @GetMapping("/aisle/all")
    public List<Aisle> getAllAisles() {
        return aisleRepository.findAll();
    }

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

    @GetMapping("/bin/all")
    public List<Bin> getAllBins() {
        return binRepository.findAll();
    }

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