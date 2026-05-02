package com.project.wms.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "warehouses")

public class Warehouse {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String warehouseCode;
    
    @Column(nullable = false)
    private String name;
    
    private String address;
    
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL)
    private List<Zone> zones;
    
    // Constructors
    public Warehouse() {}
    
    public Warehouse(String warehouseCode, String name, String address) {
        this.warehouseCode = warehouseCode;
        this.name = name;
        this.address = address;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public List<Zone> getZones() { return zones; }
    public void setZones(List<Zone> zones) { this.zones = zones; }
}