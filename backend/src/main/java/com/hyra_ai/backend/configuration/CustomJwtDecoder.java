package com.hyra_ai.backend.configuration;

import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.hyra_ai.backend.service.AuthenticationService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey;

    @Autowired
    private AuthenticationService authenticationService;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {
        if (token == null || token.trim().isEmpty()) {
            log.warn("Attempted to decode null or empty token");
            throw new JwtException("Token is null or empty");
        }

        Jwt jwt;
        try {
            if (Objects.isNull(nimbusJwtDecoder)) {
                SecretKeySpec secretKeySpec = new SecretKeySpec(getSignerKeyBytes(), "HS512");
                nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                        .macAlgorithm(MacAlgorithm.HS512)
                        .build();
            }
            jwt = nimbusJwtDecoder.decode(token);
        } catch (Exception e) {
            log.warn("Token signature/expiration verification failed: {}", e.getMessage());
            throw new JwtException("Token invalid: " + e.getMessage());
        }

        try {
            String jti = jwt.getId();
            String email = jwt.getSubject();
            authenticationService.validateTokenStatus(jti, email);
        } catch (Exception e) {
            log.warn("Token validation failed in database check: {}", e.getMessage());
            throw new JwtException("Token validation failed: " + e.getMessage());
        }

        return jwt;
    }

    private byte[] getSignerKeyBytes() {
        String sanitized = (signerKey == null) ? "" : signerKey.replaceAll("\\s", "");  // xóa khoảng trắng
        return sanitized.getBytes();
    }
}

