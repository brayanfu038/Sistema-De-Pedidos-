package com.customers.api.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerResponse {
  private String document;
  private String firstname;
  private String lastname;
  private String address;
  private String phone;
  private String email;
}
