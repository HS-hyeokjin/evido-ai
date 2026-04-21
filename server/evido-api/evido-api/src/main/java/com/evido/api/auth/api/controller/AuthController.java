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
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(
            summary = "세션 조회",
            description = "현재 로그인 상태와 사용자 정보를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "세션 조회 성공",
                    content = @Content(schema = @Schema(implementation = SessionResponse.class))
            )
    })
    @GetMapping("/session")
    public SessionResponse session(
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        if (userId == null) {
            return new SessionResponse(false, null, null);
        }

        String role = currentUserProvider.getRole(authentication);

        return new SessionResponse(true, userId, role);
    }

    @Operation(
            summary = "게스트 토큰 발급",
            description = "비회원 사용자를 위한 게스트 액세스 토큰과 리프레시 토큰을 발급합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "게스트 토큰 발급 성공")
    })
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

    @Operation(
            summary = "토큰 재발급",
            description = "리프레시 토큰으로 새로운 액세스 토큰과 리프레시 토큰을 발급합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 리프레시 토큰")
    })
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

    @Operation(
            summary = "로그아웃",
            description = "현재 로그인 사용자를 로그아웃하고 인증 쿠키를 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그아웃 성공")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        if (authentication != null) {
            String userId = (String) authentication.getPrincipal();
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