package com.hyra_ai.backend.configuration;

import java.time.LocalDate;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.hyra_ai.backend.constant.PredefinedRole;
import com.hyra_ai.backend.entity.Role;
import com.hyra_ai.backend.entity.User;
import com.hyra_ai.backend.repository.RoleRepository;
import com.hyra_ai.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_EMAIL = "admin@hyra.com";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin";

    private static Role ensureRole(RoleRepository roleRepository, String name, String description) {
        return roleRepository
                .findById(name)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(name)
                        .description(description)
                        .build()));
    }

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driverClassName",
            havingValue = "com.mysql.cj.jdbc.Driver")
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("Initializing  application.....");
        return args -> {
            ensureRole(roleRepository, PredefinedRole.CUSTOMER_ROLE.getName(), PredefinedRole.CUSTOMER_ROLE.getDescription());
            ensureRole(roleRepository, PredefinedRole.STAFF_ROLE.getName(), PredefinedRole.STAFF_ROLE.getDescription());
            ensureRole(roleRepository, PredefinedRole.CS_ROLE.getName(), PredefinedRole.CS_ROLE.getDescription());
            Role adminRole = ensureRole(
                    roleRepository, PredefinedRole.ADMIN_ROLE.getName(), PredefinedRole.ADMIN_ROLE.getDescription());

            if (userRepository.findByEmail(ADMIN_EMAIL).isEmpty()) {
                User user = User.builder()
                        .email(ADMIN_EMAIL)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .role(adminRole)
                        .isActive(true)
                        .createAt(LocalDate.now())
                        .build();

                userRepository.save(user);
                log.warn("admin user has been created with default password: admin, please change it");
            }
            log.info("Application initialized completed ....");
        };
    }
}
