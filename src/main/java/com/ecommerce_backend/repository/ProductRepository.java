package com.ecommerce_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce_backend.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>{

}
