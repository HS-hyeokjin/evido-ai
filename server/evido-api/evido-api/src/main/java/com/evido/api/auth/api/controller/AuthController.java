package com.evido.api.auth.api.controller;

import com.evido.api.auth.api.dto.SessionResponse;
import com.evido.api.auth.application.dto.TokenPair;
import com.evido.api.auth.application.port.in.IssueTokenUseCase;
import com.evido.api.auth.application.port.in.LogoutUseCase;
import com.evido.api.auth.application.port.in.RefreshTokenUseCase;
import com.evido.api.auth.infrastructure.cookie.AuthCookieManager;
import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "Auth", description = "인증 및 세션 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final CurrentUserProvider currentUserProvider;
    private final IssueTokenUseCase issueTokenUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final AuthCookieManager cookieManager;

    @Operation(summary = "세션 조회")
    @GetMapping("/session")
    public SessionResponse session(
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getNullableUserId(authentication);

        if (userId == null) {
            return new SessionResponse(false, null, null);
        }

        String role = currentUserProvider.getRole(authentication);

        return new SessionResponse(true, userId, role);
    }

    @Operation(summary = "게스트 토큰 발급")
    @PostMapping("/guest/token")
    public ResponseEntity<Void> issueGuestToken() {
        TokenPair pair = issueTokenUseCase.issueGuest();

        ResponseCookie access = cookieManager.createAccessToken(pair.access());
        ResponseCookie refresh = cookieManager.createRefreshToken(pair.refresh());

        return ResponseEntity.ok()
                .header("Set-Cookie", access.toString())
                .header("Set-Cookie", refresh.toString())
                .build();
    }

    @Operation(summary = "토큰 재발급")
    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(
            @Parameter(description = "리프레시 토큰 쿠키", hidden = true)
            @CookieValue("REFRESH_TOKEN") String refreshToken
    ) {
        TokenPair pair = refreshTokenUseCase.refresh(refreshToken);

        ResponseCookie access = cookieManager.createAccessToken(pair.access());
        ResponseCookie refresh = cookieManager.createRefreshToken(pair.refresh());

        return ResponseEntity.ok()
                .header("Set-Cookie", access.toString())
                .header("Set-Cookie", refresh.toString())
                .build();
    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getNullableUserId(authentication);

        if (userId != null) {
            logoutUseCase.logout(userId);
        }

        ResponseCookie deleteAccess = cookieManager.deleteAccessToken();
        ResponseCookie deleteRefresh = cookieManager.deleteRefreshToken();

        return ResponseEntity.ok()
                .header("Set-Cookie", deleteAccess.toString())
                .header("Set-Cookie", deleteRefresh.toString())
                .build();
    }
}