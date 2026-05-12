package com.project.wms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "bins")
public class Bin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String binCode;

    private Double capacity;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aisle_id")
    private Aisle aisle;

    @Transient
    private int used;

    public Bin(String binCode, Double capacity) {
        this.binCode = binCode;
        this.capacity = capacity;
    }

    public int getUsed() { return used; }
    public void setUsed(int used) { this.used = used; }
}