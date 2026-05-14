package com.project.wms.service;

import com.project.wms.model.Product;
import com.project.wms.model.Bin;
import com.project.wms.repository.ProductRepository;
import com.project.wms.repository.BinRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class InventoryServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BinRepository binRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void testUpdateInventory_Success() {
        Product product = new Product();
        product.setSku("SKU123");
        product.setQuantity(100);

        List<Product> productList = Arrays.asList(product);
        when(productRepository.findBySku("SKU123")).thenReturn(productList);
        when(productRepository.save(any(Product.class))).thenReturn(product);

        Product updated = inventoryService.updateInventory("SKU123", 10);

        assertEquals(110, updated.getQuantity());
        verify(productRepository, times(1)).save(product);
    }

    @Test
    void testUpdateInventory_InsufficientStock() {
        Product product = new Product();
        product.setSku("SKU123");
        product.setQuantity(5);

        List<Product> productList = Arrays.asList(product);
        when(productRepository.findBySku("SKU123")).thenReturn(productList);

        assertThrows(RuntimeException.class, () -> {
            inventoryService.updateInventory("SKU123", -10);
        });
    }

    @Test
    void testUpdateInventory_ProductNotFound() {
        when(productRepository.findBySku("INVALID")).thenReturn(new ArrayList<>());

        assertThrows(RuntimeException.class, () -> {
            inventoryService.updateInventory("INVALID", 10);
        });
    }

    @Test
    void testReceiveProduct_Success() {
        Bin bin = new Bin();
        bin.setBinCode("BIN-001");

        List<Bin> binList = Arrays.asList(bin);
        when(binRepository.findByBinCode("BIN-001")).thenReturn(binList);
        when(productRepository.findBySkuAndBinCode(anyString(), anyString())).thenReturn(new ArrayList<>());
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);

        Product product = inventoryService.receiveProduct("SKU001", "Widget", "123456", "BIN-001", null, 100);

        assertEquals("SKU001", product.getSku());
        assertEquals("Widget", product.getName());
        assertEquals(100, product.getQuantity());
        assertNotNull(product.getBin());
    }

    @Test
    void testGetProductBySku_Success() {
        Product product = new Product();
        product.setSku("SKU123");

        List<Product> productList = Arrays.asList(product);
        when(productRepository.findBySku("SKU123")).thenReturn(productList);

        Product found = inventoryService.getProductBySku("SKU123");
        assertEquals("SKU123", found.getSku());
    }
}