package com.evido.api.auth.infrastructure.cookie;

import jakarta.servlet.http.Cookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieManager {

    private static final String ACCESS = "ACCESS_TOKEN";
    private static final String REFRESH = "REFRESH_TOKEN";

    public Cookie createAccessToken(String token) {
        Cookie cookie = new Cookie(ACCESS, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(900);
        return cookie;
    }

    public Cookie createRefreshToken(String token) {
        Cookie cookie = new Cookie(REFRESH, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(604800);
        return cookie;
    }

    public Cookie deleteAccessToken() {
        Cookie cookie = new Cookie(ACCESS, null);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }

    public Cookie deleteRefreshToken() {
        Cookie cookie = new Cookie(REFRESH, null);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }
}