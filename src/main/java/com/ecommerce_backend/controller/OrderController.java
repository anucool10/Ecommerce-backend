package com.ecommerce_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce_backend.dto.OrderRequest;
import com.ecommerce_backend.model.Order;
import com.ecommerce_backend.repository.OrderRepository;
import com.ecommerce_backend.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Order savedOrder = orderService.placeOrder(orderRequest);
            return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll(); 
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status.toUpperCase());
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
}