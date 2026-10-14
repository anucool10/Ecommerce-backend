package com.ecommerce_backend.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {
	
	@Value("${stripe.secret.key}")
	private String stripeApiKey;
	
	@PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }


	public PaymentIntent createPaymentIntent(BigDecimal amount) throws StripeException {
		long amountInCents= amount.multiply(new BigDecimal(100)).longValue();
		PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
		        .setAmount(amountInCents)
		        .setCurrency("gbp")
		        .addPaymentMethodType("card")
		        .build();
		return PaymentIntent.create(params);
	}

}
