package com.evido.api.auth.infrastructure.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    private static final String ANONYMOUS_USER = "anonymousUser";

    public String getUserId(Authentication authentication) {
        validateAuthentication(authentication);

        Object principal = authentication.getPrincipal();

        if (principal instanceof String userId) {
            validateUserId(userId);
            return userId;
        }

        throw new IllegalStateException(
                "지원하지 않는 principal 형식입니다: " + principal.getClass().getName()
        );
    }

    public String getRole(Authentication authentication) {
        validateAuthentication(authentication);

        return authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElseThrow(() -> new IllegalStateException("사용자 권한 정보가 없습니다."));
    }

    private void validateAuthentication(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }

        if (!authentication.isAuthenticated()) {
            throw new IllegalStateException("인증되지 않은 사용자입니다.");
        }

        if (authentication instanceof AnonymousAuthenticationToken) {
            throw new IllegalStateException("익명 사용자는 접근할 수 없습니다.");
        }

        if (authentication.getPrincipal() == null) {
            throw new IllegalStateException("인증 principal 정보가 없습니다.");
        }
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalStateException("사용자 ID가 비어 있습니다.");
        }

        if (ANONYMOUS_USER.equals(userId)) {
            throw new IllegalStateException("익명 사용자는 접근할 수 없습니다.");
        }
    }
}