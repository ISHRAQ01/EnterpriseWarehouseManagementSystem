package com.project.wms.service;

import com.project.wms.model.Order;
import com.project.wms.model.OrderStatus;
import com.project.wms.model.Product;
import com.project.wms.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
            deductAllItems(order.getOrderNumber(), -1); // negative = deduct
        }

        // Auto-update inventory when RECEIVED (for shipments)
        if (newStatus == OrderStatus.RECEIVED) {
            deductAllItems(order.getOrderNumber(), 1); // positive = add
        }

        order = orderRepository.save(order);
        order.setBarcodeImage(barcodeService.generateOrderBarcode(order.getOrderNumber()));
        return order;
    }

    /**
     * Process all items in an order (main + extra)
     * @param multiplier -1 for deduction (SHIPPED), +1 for addition (RECEIVED)
     */
    private void deductAllItems(String orderNumber, int multiplier) {
        String[] parts = orderNumber.split("\\|");
        List<OrderItem> allItems = new ArrayList<>();

        // Parse main item
        OrderItem mainItem = new OrderItem();
        for (String part : parts) {
            if (part.startsWith("SKU:")) mainItem.sku = part.replace("SKU:", "");
            if (part.startsWith("QTY:")) mainItem.qty = part.replace("QTY:", "");
            if (part.startsWith("WH:")) mainItem.warehouseId = part.replace("WH:", "");
        }
        if (mainItem.sku != null && mainItem.qty != null) {
            allItems.add(mainItem);
        }

        // Parse EXTRA items
        for (String part : parts) {
            if (part.startsWith("EXTRA:")) {
                // Format: EXTRA:SKU:M1:QTY:32:PRICE:2:WH:2
                String extraStr = part.replace("EXTRA:", "");
                String[] extraParts = extraStr.split(":");
                OrderItem extraItem = new OrderItem();
                for (int i = 0; i < extraParts.length; i++) {
                    if (extraParts[i].equals("SKU") && i + 1 < extraParts.length) extraItem.sku = extraParts[i + 1];
                    if (extraParts[i].equals("QTY") && i + 1 < extraParts.length) extraItem.qty = extraParts[i + 1];
                    if (extraParts[i].equals("WH") && i + 1 < extraParts.length) extraItem.warehouseId = extraParts[i + 1];
                }
                if (extraItem.sku != null && extraItem.qty != null) {
                    allItems.add(extraItem);
                }
            }
        }

        // Process all items
        for (OrderItem item : allItems) {
            try {
                int qty = Integer.parseInt(item.qty);
                Long warehouseId = null;
                if (item.warehouseId != null && !item.warehouseId.isEmpty()) {
                    try {
                        warehouseId = Long.parseLong(item.warehouseId);
                    } catch (NumberFormatException ignored) {}
                }
                int quantityChange = qty * multiplier; // negative = deduct, positive = add
                inventoryService.updateInventoryByWarehouse(item.sku, quantityChange, warehouseId);
            } catch (Exception e) {
                System.err.println("Warning: Could not process item " + item.sku + " - " + e.getMessage());
            }
        }
    }

    // Inner class for parsing order items
    private static class OrderItem {
        String sku;
        String qty;
        String warehouseId;
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
        if (orderNumber.startsWith("ORD-")) {
            String[] parts = orderNumber.split("\\|");

            // ✅ Validate ALL items (main + extra)
            List<String> errors = new ArrayList<>();

            // Check main item
            String mainSku = null;
            int mainQty = 0;
            for (String part : parts) {
                if (part.startsWith("SKU:")) mainSku = part.replace("SKU:", "");
                if (part.startsWith("QTY:")) mainQty = Integer.parseInt(part.replace("QTY:", ""));
            }
            if (mainSku != null) {
                try {
                    Product product = inventoryService.getProductBySku(mainSku);
                    if (product.getQuantity() < mainQty) {
                        errors.add(mainSku + ": Insufficient stock (Available: " + product.getQuantity() + ", Requested: " + mainQty + ")");
                    }
                } catch (Exception e) {
                    errors.add("Product not found: " + mainSku);
                }
            }

            // Check EXTRA items
            for (String part : parts) {
                if (part.startsWith("EXTRA:")) {
                    String extraStr = part.replace("EXTRA:", "");
                    String[] extraParts = extraStr.split(":");
                    String extraSku = null;
                    int extraQty = 0;
                    for (int i = 0; i < extraParts.length; i++) {
                        if (extraParts[i].equals("SKU") && i + 1 < extraParts.length) extraSku = extraParts[i + 1];
                        if (extraParts[i].equals("QTY") && i + 1 < extraParts.length) extraQty = Integer.parseInt(extraParts[i + 1]);
                    }
                    if (extraSku != null) {
                        try {
                            Product product = inventoryService.getProductBySku(extraSku);
                            if (product.getQuantity() < extraQty) {
                                errors.add(extraSku + ": Insufficient stock (Available: " + product.getQuantity() + ", Requested: " + extraQty + ")");
                            }
                        } catch (Exception e) {
                            errors.add("Product not found: " + extraSku);
                        }
                    }
                }
            }

            if (!errors.isEmpty()) {
                throw new RuntimeException(String.join("; ", errors));
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