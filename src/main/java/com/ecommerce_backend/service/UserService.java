package com.ecommerce_backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce_backend.model.User;
import com.ecommerce_backend.repository.EcommerceRepository;

@Service
public class UserService {
	@Autowired
	private EcommerceRepository ecommerceRepository;
	
	public List<User>getAllUsers(){
		return ecommerceRepository.findAll();		
		
	}
	public User createUser(User user) {
		return ecommerceRepository.save(user);
	}

	public User getUserById(Long id) {
		return ecommerceRepository.findById(id).orElse(null);
	}
	public void deleteUserById(Long id) {
		ecommerceRepository.findById(id).orElse(null);
		ecommerceRepository.deleteById(id);
		
	}

}
