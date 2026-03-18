package com.evido.api.auth.api;

import com.evido.api.auth.application.port.in.IssueTokenUseCase;
import com.evido.api.auth.application.dto.TokenPair;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;

@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final IssueTokenUseCase issueTokenUseCase;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        TokenPair tokenPair = issueTokenUseCase.issueOAuthUser(
                email,
                name,
                "GOOGLE"
        );

        addCookie(response, "ACCESS_TOKEN", tokenPair.access(), 60 * 15);
        addCookie(response, "REFRESH_TOKEN", tokenPair.refresh(), 60 * 60 * 24 * 7);

        response.sendRedirect("https://evido-web.vercel.app/");
    }

    private void addCookie(HttpServletResponse response,
                           String name,
                           String value,
                           int maxAge) {

        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);

        response.addCookie(cookie);
    }
}