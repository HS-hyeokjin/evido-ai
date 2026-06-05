package com.evido.api.auth.infrastructure.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    private static final String ANONYMOUS_USER = "anonymousUser";

    public String getRequiredUserId(Authentication authentication) {
        String userId = getNullableUserId(authentication);

        if (userId == null) {
            throw new IllegalStateException("인증된 사용자만 접근할 수 있습니다.");
        }

        return userId;
    }

    public String getNullableUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        if (!authentication.isAuthenticated()) {
            return null;
        }

        if (authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal == null) {
            return null;
        }

        if (principal instanceof String userId) {
            if (userId.isBlank()) {
                return null;
            }

            if (ANONYMOUS_USER.equals(userId)) {
                return null;
            }

            return userId;
        }

        throw new IllegalStateException(
                "지원하지 않는 principal 형식입니다: " + principal.getClass().getName()
        );
    }

    public String getUserId(Authentication authentication) {
        return getRequiredUserId(authentication);
    }

    public String getRole(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        if (!authentication.isAuthenticated()) {
            return null;
        }

        if (authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        return authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse(null);
    }
}