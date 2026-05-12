package com.project.wms.controller;
import java.util.*;
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

    @Autowired
    private ProductRepository productRepository;

    // ========== WAREHOUSE ==========

    @GetMapping
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Warehouse> getWarehouseDetail(@PathVariable Long id) {
        Warehouse wh = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        // Force initialization and set bin usage
        wh.getZones().forEach(z -> {
            z.getAisles().forEach(a -> {
                a.getBins().forEach(b -> {
                    int used = productRepository.sumQuantityByBinId(b.getId());
                    b.setUsed(used);
                });
                a.getBins().size();
            });
            z.getAisles().size();
        });

        return ResponseEntity.ok(wh);
    }

    // ========== UPDATE WAREHOUSE ==========
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Warehouse> updateWarehouse(
            @PathVariable Long id,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String address) {
        Warehouse wh = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        if (code != null) wh.setWarehouseCode(code);
        if (name != null) wh.setName(name);
        if (address != null) wh.setAddress(address);
        return ResponseEntity.ok(warehouseRepository.save(wh));
    }

    // ========== DELETE WAREHOUSE ==========
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteWarehouse(@PathVariable Long id) {
        warehouseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ========== DELETE ZONE ==========
    @DeleteMapping("/zone/{id}")
    @Transactional
    public ResponseEntity<?> deleteZone(@PathVariable Long id) {
        zoneRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ========== DELETE AISLE ==========
    @DeleteMapping("/aisle/{id}")
    @Transactional
    public ResponseEntity<?> deleteAisle(@PathVariable Long id) {
        aisleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ========== DELETE BIN ==========
    @DeleteMapping("/bin/{id}")
    @Transactional
    public ResponseEntity<?> deleteBin(@PathVariable Long id) {
        binRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ========== UPDATE BIN ==========
    @PutMapping("/bin/{id}")
    @Transactional
    public ResponseEntity<Bin> updateBin(
            @PathVariable Long id,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) Double capacity) {
        Bin bin = binRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bin not found"));
        if (code != null) bin.setBinCode(code);
        if (capacity != null) bin.setCapacity(capacity);
        return ResponseEntity.ok(binRepository.save(bin));
    }

    // Get aisles with available bins (WITH REAL USAGE)
    @GetMapping("/aisles-with-bins")
    public List<Map<String, Object>> getAislesWithBins() {
        List<Aisle> aisles = aisleRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Aisle aisle : aisles) {
            Map<String, Object> aisleData = new HashMap<>();
            aisleData.put("id", aisle.getId());
            aisleData.put("code", aisle.getAisleCode());
            aisleData.put("zoneName", aisle.getZone() != null ? aisle.getZone().getZoneCode() : "N/A");
            aisleData.put("warehouseName", aisle.getZone() != null && aisle.getZone().getWarehouse() != null
                    ? aisle.getZone().getWarehouse().getName() : "N/A");

            List<Map<String, Object>> bins = new ArrayList<>();
            for (Bin bin : aisle.getBins()) {
                Map<String, Object> binData = new HashMap<>();
                binData.put("id", bin.getId());
                binData.put("code", bin.getBinCode());
                binData.put("capacity", bin.getCapacity() != null ? bin.getCapacity() : 100.0);

                // Calculate REAL used capacity from products in this bin
                int used = productRepository.sumQuantityByBinId(bin.getId());
                binData.put("used", used);
                binData.put("free", (bin.getCapacity() != null ? bin.getCapacity() : 100.0) - used);

                bins.add(binData);
            }
            aisleData.put("bins", bins);
            result.add(aisleData);
        }
        return result;
    }

    @GetMapping("/{id}/occupancy")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getOccupancy(@PathVariable Long id) {
        Warehouse wh = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        long usedBins = productRepository.countDistinctBinByWarehouseId(id);
        long totalBins = wh.getZones().stream()
                .flatMap(z -> z.getAisles().stream())
                .flatMap(a -> a.getBins().stream())
                .count();

        Map<String, Object> result = new HashMap<>();
        result.put("usedBins", usedBins);
        result.put("totalBins", totalBins);
        result.put("percent", totalBins > 0 ? Math.round((usedBins * 100.0) / totalBins) : 0);
        return ResponseEntity.ok(result);
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