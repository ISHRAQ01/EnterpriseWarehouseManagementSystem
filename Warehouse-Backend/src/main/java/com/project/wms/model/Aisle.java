package com.project.wms.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data

@Entity
@Table(name = "aisles")
public class Aisle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String aisleCode;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @OneToMany(mappedBy = "aisle", cascade = CascadeType.ALL)
    private List<Bin> bins;

    public Aisle() {}

    public Aisle(String aisleCode) {
        this.aisleCode = aisleCode;
    }


}