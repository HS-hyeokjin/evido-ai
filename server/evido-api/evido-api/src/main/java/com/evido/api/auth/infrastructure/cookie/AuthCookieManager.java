package com.evido.api.auth.infrastructure.cookie;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieManager {

    private static final String ACCESS = "ACCESS_TOKEN";
    private static final String REFRESH = "REFRESH_TOKEN";

    public ResponseCookie createAccessToken(String token) {
        return ResponseCookie.from(ACCESS, token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")     // 🔥 핵심
                .path("/")
                .maxAge(900)
                .build();
    }

    public ResponseCookie createRefreshToken(String token) {
        return ResponseCookie.from(REFRESH, token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")     // 🔥 핵심
                .path("/")
                .maxAge(604800)
                .build();
    }

    public ResponseCookie deleteAccessToken() {
        return ResponseCookie.from(ACCESS, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();
    }

    public ResponseCookie deleteRefreshToken() {
        return ResponseCookie.from(REFRESH, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();
    }
}