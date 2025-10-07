package com.customers.api;

import com.customers.api.dto.*;
import com.customers.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("") // <--- antes era "/customer"
@RequiredArgsConstructor
public class CustomerController {

  private final CustomerService service;

  @PostMapping("/createcustomer")
  public ResponseEntity<CreateCustomerResponse> create(@Valid @RequestBody CreateCustomerRequest req){
    boolean ok = service.createCustomer(req);
    return ResponseEntity.status(ok ? HttpStatus.CREATED : HttpStatus.CONFLICT)
        .body(CreateCustomerResponse.builder().createCustomerValid(ok).build());
  }

  @GetMapping("/findcustomerbyid/{id}")
  public ResponseEntity<CustomerResponse> findById(@PathVariable String id){
    return ResponseEntity.ok(service.findByDocument(id));
  }
}

