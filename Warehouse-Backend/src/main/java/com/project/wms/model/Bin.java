package com.project.wms.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
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
    @ManyToOne
    @JoinColumn(name = "aisle_id")
    private Aisle aisle;

    public Bin() {}

    public Bin(String binCode, Double capacity) {
        this.binCode = binCode;
        this.capacity = capacity;
    }


}