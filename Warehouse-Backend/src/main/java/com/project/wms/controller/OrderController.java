package com.project.wms.controller;

import com.project.wms.model.Order;
import com.project.wms.model.OrderStatus;
import com.project.wms.service.OrderFulfillmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderFulfillmentService orderService;

    // GET all orders
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // GET order by order number
    @GetMapping("/{orderNumber}")
    public ResponseEntity<Order> getOrder(@PathVariable String orderNumber) {
        Order order = orderService.getOrder(orderNumber);
        return ResponseEntity.ok(order);
    }

    // GET create order
    @GetMapping("/create")
    public ResponseEntity<?> createOrderGet(@RequestParam String orderNumber) {
        try {
            Order order = orderService.createOrder(orderNumber);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST create order
    @PostMapping("/create")
    public ResponseEntity<?> createOrderPost(@RequestParam String orderNumber) {
        try {
            Order order = orderService.createOrder(orderNumber);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET update status
    @GetMapping("/{orderNumber}/status")
    public ResponseEntity<Order> updateOrderStatusGet(
            @PathVariable String orderNumber,
            @RequestParam String newStatus) {
        OrderStatus status = OrderStatus.valueOf(newStatus.toUpperCase());
        Order order = orderService.updateOrderStatus(orderNumber, status);
        return ResponseEntity.ok(order);
    }
}