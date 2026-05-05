package com.project.wms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@Table(name = "warehouses")
@NoArgsConstructor
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
    public Warehouse(String warehouseCode, String name, String address) {
        this.warehouseCode = warehouseCode;
        this.name = name;
        this.address = address;
    }

}