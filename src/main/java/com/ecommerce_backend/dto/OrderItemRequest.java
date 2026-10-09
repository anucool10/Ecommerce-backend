package com.ecommerce_backend.dto;

public class OrderItemRequest {
	private Long productId;
    private Integer quantity;
    
	public OrderItemRequest() {
		// TODO Auto-generated constructor stub
	}
	public OrderItemRequest(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    // Getters and Setters
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

}
