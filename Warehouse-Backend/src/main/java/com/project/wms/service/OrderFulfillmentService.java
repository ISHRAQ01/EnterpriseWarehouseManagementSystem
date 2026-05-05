package com.project.wms.service;

import com.project.wms.model.Order;
import com.project.wms.model.OrderStatus;
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

    // GET ALL ORDERS with barcode
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        for (Order o : orders) {
            o.setBarcodeImage(barcodeService.generateOrderBarcode(o.getOrderNumber()));
        }
        return orders;
    }

    // Update order status with validation
    @Transactional
    public Order updateOrderStatus(String orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order.setLastUpdated(LocalDateTime.now());
        order = orderRepository.save(order);
        order.setBarcodeImage(barcodeService.generateOrderBarcode(order.getOrderNumber()));
        return order;
    }

    // Validate order status transitions
    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return;
        }

        switch (current) {
            case PENDING:
                if (next != OrderStatus.PICKING && next != OrderStatus.PACKED) {
                    throw new IllegalStateException("Cannot transition from " + current + " to " + next);
                }
                break;
            case PICKING:
                if (next != OrderStatus.PACKED) {
                    throw new IllegalStateException("Cannot transition from " + current + " to " + next);
                }
                break;
            case PACKED:
                if (next != OrderStatus.SHIPPED) {
                    throw new IllegalStateException("Cannot transition from " + current + " to " + next);
                }
                break;
            case SHIPPED:
                throw new IllegalStateException("Cannot change status of shipped order");
            default:
                throw new IllegalStateException("Invalid status: " + current);
        }
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