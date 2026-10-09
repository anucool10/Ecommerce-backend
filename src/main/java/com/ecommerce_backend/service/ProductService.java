package com.ecommerce_backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce_backend.model.Product;
import com.ecommerce_backend.repository.ProductRepository;

@Service
public class ProductService {
	@Autowired
	private ProductRepository productRepository;

	public List<Product>getAllProduct(){
		 return productRepository.findAllByOrderByIdAsc();
	}
	public Product findProductById(Long id) {
		return productRepository.findById(id).orElse(null);
	}	
	public Product createProduct(Product product) {
		return productRepository.save(product);
			
	}
	public List<Product>createMultipleProduct(List<Product>products){
		return productRepository.saveAll(products);
		
	}
	public Product updateProduct(Long id, Product updatedProduct) {
		Product existingProduct = productRepository.findById(id)
								.orElseThrow(()-> new RuntimeException("Product not found with id: " + id));
		existingProduct.setName(updatedProduct.getName());
		existingProduct.setPrice(updatedProduct.getPrice());
		existingProduct.setDescription(updatedProduct.getDescription());
		existingProduct.setImageUrl(updatedProduct.getImageUrl());
		existingProduct.setStockQuantity(updatedProduct.getStockQuantity());
		return productRepository.save(existingProduct);
	}
	
	public void deleteProduct(Long id) {
		productRepository.deleteById(id);
	}

}
