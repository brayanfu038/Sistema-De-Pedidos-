package com.customers.api.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCustomerResponse {
  private boolean createCustomerValid;
}
