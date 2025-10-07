package com.customers.service.impl;

import com.customers.api.dto.*;
import com.customers.domain.Customer;
import com.customers.repository.CustomerRepository;
import com.customers.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

  private final CustomerRepository repo;

  @Override
  public boolean createCustomer(CreateCustomerRequest req) {
    if (repo.existsById(req.getDocument())) return false; // ya existe
    Customer c = Customer.builder()
        .document(req.getDocument())
        .firstname(req.getFirstname())
        .lastname(req.getLastname())
        .address(req.getAddress())
        .phone(req.getPhone())
        .email(req.getEmail())
        .build();
    repo.save(c);
    return true;
  }

  @Override
  public CustomerResponse findByDocument(String document) {
    Customer c = repo.findById(document)
        .orElseThrow(() -> new RuntimeException("Customer not found"));
    return CustomerResponse.builder()
        .document(c.getDocument())
        .firstname(c.getFirstname())
        .lastname(c.getLastname())
        .address(c.getAddress())
        .phone(c.getPhone())
        .email(c.getEmail())
        .build();
  }
}
