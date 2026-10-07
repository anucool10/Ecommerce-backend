package com.ecommerce_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce_backend.model.User;
import com.ecommerce_backend.service.UserService;


import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
@Validated
public class UserController {
	@Autowired
	private UserService userService;
	

	public UserController(UserService userService) {
		// TODO Auto-generated constructor stub
		
		this.userService = userService;
	}
	
	@GetMapping
	public List<User> getUser(){
		return userService.getAllUsers();		
		
	}
	@PostMapping("/new")
	public User createUser(@Valid @RequestBody User user ){
		return userService.createUser(user);
		
		
		
	}
	@DeleteMapping("/{id}")
	public void deleteUser(@PathVariable Long id) {
		userService.deleteUserById(id);		
	}
	
	

}
