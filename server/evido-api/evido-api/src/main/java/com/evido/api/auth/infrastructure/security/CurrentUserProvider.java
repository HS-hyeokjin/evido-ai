package com.evido.api.auth.infrastructure.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public String getUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof String s) {
            return s;
        }

        throw new IllegalStateException("Unsupported principal type: " + principal.getClass());
    }

    public String getRole(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        return authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse(null);
    }
}