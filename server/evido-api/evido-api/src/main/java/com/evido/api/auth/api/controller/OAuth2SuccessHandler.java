package com.evido.api.auth.api.controller;

import com.evido.api.auth.application.dto.TokenPair;
import com.evido.api.auth.application.port.in.IssueTokenUseCase;
import com.evido.api.auth.infrastructure.cookie.AuthCookieManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;

@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final IssueTokenUseCase issueTokenUseCase;
    private final AuthCookieManager cookieManager;

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

        ResponseCookie access = cookieManager.createAccessToken(tokenPair.access());
        ResponseCookie refresh = cookieManager.createRefreshToken(tokenPair.refresh());

        response.addHeader(HttpHeaders.SET_COOKIE, access.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refresh.toString());

        response.sendRedirect("https://evido.site/");
    }
}