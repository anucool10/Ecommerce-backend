package com.ecommerce_backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce_backend.model.User;
import com.ecommerce_backend.repository.UserRepository;

@Service
public class UserService {
	@Autowired
	private UserRepository userRepository;
	
	public List<User>getAllUsers(){
		return userRepository.findAll();		
		
	}
	public User createUser(User user) {
		return userRepository.save(user);
	}

	public User getUserById(Long id) {
		return userRepository.findById(id).orElse(null);
	}
	public void deleteUserById(Long id) {
		userRepository.findById(id).orElse(null);
		userRepository.deleteById(id);
		
	}

}
