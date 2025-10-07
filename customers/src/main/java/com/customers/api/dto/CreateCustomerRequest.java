package com.customers.api.dto;

import lombok.*;
import javax.validation.constraints.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCustomerRequest {
  @NotBlank private String document;
  @NotBlank private String firstname;
  @NotBlank private String lastname;
  private String address;
  private String phone;
  @Email private String email;
}
