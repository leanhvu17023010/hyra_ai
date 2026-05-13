package com.hyra_ai.backend.constant;

import com.hyra_ai.backend.entity.Role;

public class PredefinedRole {
    public static final Role USER_ROLE =
            Role.builder().name("USER").description("User role").build();
    public static final Role ADMIN_ROLE =
            Role.builder().name("ADMIN").description("Admin role").build();

    private PredefinedRole() {}
}
