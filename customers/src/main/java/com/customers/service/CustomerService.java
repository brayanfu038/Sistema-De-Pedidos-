package com.customers.service;

import com.customers.api.dto.CreateCustomerRequest;
import com.customers.api.dto.CustomerResponse;

public interface CustomerService {
    boolean createCustomer(CreateCustomerRequest req);
    CustomerResponse findByDocument(String document);
}
