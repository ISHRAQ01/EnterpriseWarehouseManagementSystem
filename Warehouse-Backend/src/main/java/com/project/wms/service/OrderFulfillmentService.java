package com.project.wms.service;

import com.project.wms.model.Order;
import com.project.wms.model.OrderStatus;
import com.project.wms.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class OrderFulfillmentService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    // Update order status with validation
    @Transactional
    public Order updateOrderStatus(String orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        
        validateStatusTransition(order.getStatus(), newStatus);
        
        order.setStatus(newStatus);
        order.setLastUpdated(LocalDateTime.now());
        return orderRepository.save(order);
    }
    
    // Validate order status transitions
    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return; // Same status is okay
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
    
    // Create new order
    @Transactional
    public Order createOrder(String orderNumber) {
        Order order = new Order(orderNumber);
        return orderRepository.save(order);
    }
    
    // Get order by order number
    public Order getOrder(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
    }
}