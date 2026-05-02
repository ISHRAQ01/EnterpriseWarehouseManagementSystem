package com.project.wms.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.List;
@Data
@Entity
@Table(name = "zones")
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String zoneCode;

    private String zoneType;

    @JsonIgnore          // ← ADD THIS LINE
    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @OneToMany(mappedBy = "zone", cascade = CascadeType.ALL)
    private List<Aisle> aisles;

    public Zone() {}

    public Zone(String zoneCode, String zoneType) {
        this.zoneCode = zoneCode;
        this.zoneType = zoneType;
    }
}