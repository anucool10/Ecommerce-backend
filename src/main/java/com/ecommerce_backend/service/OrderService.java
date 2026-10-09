package com.ecommerce_backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce_backend.dto.OrderItemRequest;
import com.ecommerce_backend.dto.OrderRequest;
import com.ecommerce_backend.model.Order;
import com.ecommerce_backend.model.OrderItem;
import com.ecommerce_backend.model.Product;
import com.ecommerce_backend.model.User;
import com.ecommerce_backend.repository.OrderRepository;
import com.ecommerce_backend.repository.ProductRepository;
import com.ecommerce_backend.repository.UserRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;
    
    @Transactional
    public Order placeOrder(OrderRequest request) {        
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));
               
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
               
        for (OrderItemRequest itemReq : request.getItems()) {
                        
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));
           
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
           
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product); 
            
          
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice()); 
            
            orderItems.add(orderItem);
            
            BigDecimal itemTotal = BigDecimal.valueOf(product.getPrice()).multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);
        }
        
       
        order.setOrderItems(orderItems);
        order.setTotalPrice(totalPrice);
        
        
        return orderRepository.save(order);
    }
}