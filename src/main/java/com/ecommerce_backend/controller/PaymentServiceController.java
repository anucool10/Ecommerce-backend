package com.ecommerce_backend.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce_backend.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

@RestController 
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentServiceController {
	@Autowired
	private PaymentService paymentService;
	

	public PaymentServiceController() {
		// TODO Auto-generated constructor stub
	}
	
	@PostMapping("/create-intent")
    public Map<String, String> createPaymentIntent(@RequestBody Map<String, BigDecimal> request) throws StripeException {
        BigDecimal amount = request.get("amount");
        
        PaymentIntent paymentIntent = paymentService.createPaymentIntent(amount);
        
        
        return Map.of("clientSecret", paymentIntent.getClientSecret());
    }

}
