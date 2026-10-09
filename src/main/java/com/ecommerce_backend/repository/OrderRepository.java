	package com.ecommerce_backend.repository;
	
	import org.springframework.data.jpa.repository.JpaRepository;
	import org.springframework.stereotype.Repository;

import com.ecommerce_backend.model.Order;
	
	@Repository
	public interface OrderRepository extends JpaRepository<Order, Long>{	
	}
