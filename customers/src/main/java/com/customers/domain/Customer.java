package com.customers.domain;

import lombok.*;
import javax.persistence.*;
import javax.validation.constraints.*;

@Entity
@Table(name = "CUSTOMERS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {

  @Id
  @Column(name = "DOCUMENT", length = 30, nullable = false, unique = true)
  @NotBlank
  private String document;                 // <— PK (id lógico)

  @Column(name = "FIRST_NAME", length = 80, nullable = false)
  @NotBlank
  private String firstname;

  @Column(name = "LAST_NAME", length = 80, nullable = false)
  @NotBlank
  private String lastname;

  @Column(name = "ADDRESS", length = 150)
  private String address;

  @Column(name = "PHONE", length = 30)
  private String phone;

  @Column(name = "EMAIL", length = 120)
  @Email
  private String email;
}
