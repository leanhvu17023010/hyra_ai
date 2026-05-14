package com.hyra_ai.backend.dto.request;

import com.hyra_ai.backend.validator.EmailConstraint;
import com.hyra_ai.backend.validator.PasswordConstraint;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    @PasswordConstraint
    String password;

    @EmailConstraint
    String email;

    String userName;
    Boolean isActive;

    String role;
}
