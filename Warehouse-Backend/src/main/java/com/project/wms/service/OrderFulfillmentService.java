package com.project.wms.service;

import com.project.wms.model.Order;
import com.project.wms.model.OrderStatus;
import com.project.wms.model.Product;
import com.project.wms.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderFulfillmentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BarcodeService barcodeService;

    @Autowired
    private InventoryService inventoryService;

    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        for (Order o : orders) {
            o.setBarcodeImage(barcodeService.generateOrderBarcode(o.getOrderNumber()));
        }
        return orders;
    }

    @Transactional
    public Order updateOrderStatus(String orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order.setLastUpdated(LocalDateTime.now());

        // Auto-deduct inventory when SHIPPED
        if (newStatus == OrderStatus.SHIPPED) {
            String[] parts = order.getOrderNumber().split("\\|");
            if (parts.length >= 3) {
                String sku = parts[1].replace("SKU:", "");
                int qty = Integer.parseInt(parts[2].replace("QTY:", ""));
                try {
                    inventoryService.updateInventory(sku, -qty);
                } catch (Exception e) {
                    System.err.println("Warning: Could not deduct inventory - " + e.getMessage());
                }
            }
        }

        // Auto-update inventory when RECEIVED
        if (newStatus == OrderStatus.RECEIVED) {
            String[] parts = order.getOrderNumber().split("\\|");
            if (parts.length >= 3) {
                String sku = parts[1].replace("SKU:", "");
                int qty = Integer.parseInt(parts[2].replace("QTY:", ""));
                try {
                    inventoryService.updateInventory(sku, qty);
                } catch (Exception e) {
                    System.err.println("Warning: Could not update inventory - " + e.getMessage());
                }
            }
        }

        order = orderRepository.save(order);
        order.setBarcodeImage(barcodeService.generateOrderBarcode(order.getOrderNumber()));
        return order;
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == next) return;
        switch (current) {
            case PENDING:
                if (next == OrderStatus.PICKING || next == OrderStatus.PACKED || next == OrderStatus.PROCESSING) return;
                break;
            case PROCESSING:
                if (next == OrderStatus.RECEIVED) return;
                break;
            case PICKING:
                if (next == OrderStatus.PACKED) return;
                break;
            case PACKED:
                if (next == OrderStatus.SHIPPED) return;
                break;
            case SHIPPED:
            case RECEIVED:
                throw new IllegalStateException("Cannot change status of " + current + " order");
        }
        throw new IllegalStateException("Cannot transition from " + current + " to " + next);
    }

    @Transactional
    public Order createOrder(String orderNumber) {
        // Only check stock for OUTBOUND orders (ORD-), not INBOUND shipments (SHP-)
        if (orderNumber.startsWith("ORD-")) {
            String[] parts = orderNumber.split("\\|");
            if (parts.length >= 3) {
                String sku = parts[1].replace("SKU:", "");
                int requestedQty = Integer.parseInt(parts[2].replace("QTY:", ""));
                try {
                    Product product = inventoryService.getProductBySku(sku);
                    if (product.getQuantity() < requestedQty) {
                        throw new RuntimeException(
                                "Insufficient stock! Available: " + product.getQuantity() +
                                        ", Requested: " + requestedQty
                        );
                    }
                } catch (RuntimeException e) {
                    throw e;
                } catch (Exception e) {
                    throw new RuntimeException("Product not found: " + sku);
                }
            }
        }

        Order order = new Order(orderNumber);
        order = orderRepository.save(order);
        order.setBarcodeImage(barcodeService.generateOrderBarcode(orderNumber));
        return order;
    }

    public Order getOrder(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        order.setBarcodeImage(barcodeService.generateOrderBarcode(orderNumber));
        return order;
    }
}