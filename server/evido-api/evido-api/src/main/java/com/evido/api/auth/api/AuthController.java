package com.evido.api.auth.api;

import com.evido.api.auth.api.dto.SessionResponse;
import com.evido.api.auth.application.port.in.IssueTokenUseCase;
import com.evido.api.auth.application.port.in.RefreshTokenUseCase;
import com.evido.api.auth.application.port.in.LogoutUseCase;
import com.evido.api.auth.application.dto.TokenPair;
import com.evido.api.auth.infrastructure.cookie.AuthCookieManager;
import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final CurrentUserProvider currentUserProvider;
    private final IssueTokenUseCase issueTokenUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final AuthCookieManager cookieManager;

    @GetMapping("/session")
    public SessionResponse session(Authentication authentication) {

        String userId = currentUserProvider.getUserId(authentication);

        if (userId == null) {
            return new SessionResponse(false, null, null);
        }

        String role = currentUserProvider.getRole(authentication);

        return new SessionResponse(true, userId, role);
    }

    @PostMapping("/guest/token")
    public ResponseEntity<Void> issueGuestToken(HttpServletResponse response) {

        TokenPair pair = issueTokenUseCase.issueGuest();

        response.addCookie(cookieManager.createAccessToken(pair.access()));
        response.addCookie(cookieManager.createRefreshToken(pair.refresh()));

        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(
            @CookieValue("REFRESH_TOKEN") String refreshToken,
            HttpServletResponse response
    ) {
        TokenPair pair = refreshTokenUseCase.refresh(refreshToken);

        response.addCookie(cookieManager.createAccessToken(pair.access()));
        response.addCookie(cookieManager.createRefreshToken(pair.refresh()));

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            Authentication authentication,
            HttpServletResponse response
    ) {
        if (authentication != null) {
            String userId = (String) authentication.getPrincipal();
            logoutUseCase.logout(userId);
        }

        response.addCookie(cookieManager.deleteAccessToken());
        response.addCookie(cookieManager.deleteRefreshToken());

        return ResponseEntity.ok().build();
    }
}