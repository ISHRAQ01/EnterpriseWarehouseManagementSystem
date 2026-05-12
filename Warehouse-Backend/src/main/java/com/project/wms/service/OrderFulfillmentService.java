package com.project.wms.service;

import com.project.wms.model.Order;
import com.project.wms.model.OrderStatus;
import com.project.wms.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import com.project.wms.model.Product;
import com.project.wms.model.Bin;

@Service
public class OrderFulfillmentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BarcodeService barcodeService;

    @Autowired
    private InventoryService inventoryService;

    // GET ALL ORDERS with barcode
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        for (Order o : orders) {
            o.setBarcodeImage(barcodeService.generateOrderBarcode(o.getOrderNumber()));
        }
        return orders;
    }

    // Update order status with validation AND auto-update inventory
    @Transactional
    public Order updateOrderStatus(String orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order.setLastUpdated(LocalDateTime.now());
        // AUTO-DEDUCT INVENTORY WHEN SHIPPED
        if (newStatus == OrderStatus.SHIPPED) {
            String[] parts = order.getOrderNumber().split("\\|");
            if (parts.length >= 3) {
                String sku = parts[1].replace("SKU:", "");
                int qty = Integer.parseInt(parts[2].replace("QTY:", ""));

                try {
                    // Decrease inventory (negative quantity)
                    inventoryService.updateInventory(sku, -qty);
                    System.out.println("Deducted " + qty + " from " + sku);
                } catch (Exception e) {
                    System.err.println("Failed to deduct inventory: " + e.getMessage());
                }
            }
        }
        // AUTO-UPDATE INVENTORY WHEN RECEIVED
        if (newStatus == OrderStatus.RECEIVED) {
            String[] parts = order.getOrderNumber().split("\\|");
            if (parts.length >= 3) {
                String sku = parts[1].replace("SKU:", "");
                int totalQty = Integer.parseInt(parts[2].replace("QTY:", ""));

                try {
                    // Find any existing product with this SKU to get its bin
                    Product existingProduct = inventoryService.getProductBySku(sku);
                    String binCode = existingProduct.getBinCode();

                    // Use receiveProduct which properly merges by SKU+Bin
                    inventoryService.receiveProduct(sku, existingProduct.getName(),
                            "SHIP-" + System.currentTimeMillis(), binCode, totalQty);

                } catch (Exception e) {
                    System.err.println("Failed to update inventory: " + e.getMessage());
                }
            }
        }

        order = orderRepository.save(order);
        order.setBarcodeImage(barcodeService.generateOrderBarcode(order.getOrderNumber()));
        return order;
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return;
        }

        switch (current) {
            case PENDING:
                if (next == OrderStatus.PICKING || next == OrderStatus.PACKED || next == OrderStatus.PROCESSING) {
                    return;
                }
                break;
            case PROCESSING:
                if (next == OrderStatus.RECEIVED) {
                    return;
                }
                break;
            case PICKING:
                if (next == OrderStatus.PACKED) {
                    return;
                }
                break;
            case PACKED:
                if (next == OrderStatus.SHIPPED) {
                    return;
                }
                break;
            case SHIPPED:
            case RECEIVED:
                throw new IllegalStateException("Cannot change status of " + current + " order");
        }
        throw new IllegalStateException("Cannot transition from " + current + " to " + next);
    }

    // Create new order with barcode
    @Transactional
    public Order createOrder(String orderNumber) {
        Order order = new Order(orderNumber);
        order = orderRepository.save(order);
        order.setBarcodeImage(barcodeService.generateOrderBarcode(orderNumber));
        return order;
    }

    // Get order by order number with barcode
    public Order getOrder(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        order.setBarcodeImage(barcodeService.generateOrderBarcode(orderNumber));
        return order;
    }
}