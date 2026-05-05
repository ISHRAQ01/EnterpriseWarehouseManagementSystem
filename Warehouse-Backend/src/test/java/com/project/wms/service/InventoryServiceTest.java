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
        // Arrange
        Product product = new Product();
        product.setSku("SKU123");
        product.setQuantity(100);
        
        when(productRepository.findBySku("SKU123")).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        // Act
        Product updated = inventoryService.updateInventory("SKU123", 10);
        
        // Assert
        assertEquals(110, updated.getQuantity());
        verify(productRepository, times(1)).save(product);
    }
    
    @Test
    void testUpdateInventory_InsufficientStock() {
        // Arrange
        Product product = new Product();
        product.setSku("SKU123");
        product.setQuantity(5);
        
        when(productRepository.findBySku("SKU123")).thenReturn(Optional.of(product));
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            inventoryService.updateInventory("SKU123", -10);
        });
        
        assertEquals("Insufficient inventory for SKU: SKU123", exception.getMessage());
    }
    
    @Test
    void testUpdateInventory_ProductNotFound() {
        // Arrange
        when(productRepository.findBySku("INVALID")).thenReturn(Optional.empty());
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            inventoryService.updateInventory("INVALID", 10);
        });
        
        assertEquals("Product not found: INVALID", exception.getMessage());
    }
    
    @Test
    void testReceiveProduct_Success() {
        // Arrange
        Bin bin = new Bin();
        bin.setBinCode("BIN-001");
        
        when(binRepository.findByBinCode("BIN-001")).thenReturn(Optional.of(bin));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);
        
        // Act
        Product product = inventoryService.receiveProduct("SKU001", "Widget", "123456", "BIN-001", 100);
        
        // Assert
        assertEquals("SKU001", product.getSku());
        assertEquals("Widget", product.getName());
        assertEquals(100, product.getQuantity());
        assertNotNull(product.getBin());
    }
    
    @Test
    void testGetProductBySku_Success() {
        // Arrange
        Product product = new Product();
        product.setSku("SKU123");
        
        when(productRepository.findBySku("SKU123")).thenReturn(Optional.of(product));
        
        // Act
        Product found = inventoryService.getProductBySku("SKU123");
        
        // Assert
        assertEquals("SKU123", found.getSku());
    }
}