package com.project.wms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sku;

    @Column(nullable = false)
    private String name;

    private String description;
    private String barcode;
    private String qrCode;

    @Column(nullable = false)
    private Integer quantity;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bin_id")
    private Bin bin;

    public Product(String sku, String name, Integer quantity) {
        this.sku = sku;
        this.name = name;
        this.quantity = quantity;
    }

    // Expose bin code in JSON without the full Bin object
    public String getBinCode() {
        return bin != null ? bin.getBinCode() : null;
    }
}