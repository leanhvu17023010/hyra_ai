package com.hyra_ai.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.hyra_ai.backend.constant.PredefinedRole;
import com.hyra_ai.backend.validator.EmailConstraint;
import com.hyra_ai.backend.validator.PasswordConstraint;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class UserCreationRequest {
    String userName;

    @NotNull(message = "PASSWORD_REQUIRED")
    @PasswordConstraint
    String password;

    @NotBlank(message = "EMAIL_REQUIRED")
    @EmailConstraint
    String email;

    @Builder.Default
    String roleName = PredefinedRole.USER_ROLE.getName();

    @Builder.Default
    boolean isActive = true;
}
