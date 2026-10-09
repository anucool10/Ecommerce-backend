package com.ecommerce_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce_backend.model.Product;
import com.ecommerce_backend.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/product")
@Validated
public class ProductController {
	
	@Autowired
	private ProductService productService;

	public ProductController(ProductService productService) {
		this.productService = productService;
	}
	
	@GetMapping
	public List<Product> getProduct() {
		return productService.getAllProduct();		
	}
	
	@PostMapping("/new")
	public List<Product> createProduct(@Valid @RequestBody List<Product> products) {
		return productService.createMultipleProduct(products);
	}
	
	@DeleteMapping("/{id}/delete")
	public void deleteProduct(@PathVariable Long id) {
		productService.deleteProduct(id);	
	}
	@GetMapping("/{id}")
	public Product getProductById(@PathVariable Long id) {
		 return productService.findProductById(id);
	}
	
			
	
	@PatchMapping("/{id}/edit")
	public Product editProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
		return productService.updateProduct(id, updatedProduct);
	}
}