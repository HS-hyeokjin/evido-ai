package com.evido.api.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "세션 조회 응답")
public record SessionResponse(

        @Schema(description = "로그인 여부", example = "true")
        boolean authenticated,

        @Schema(description = "사용자 ID", example = "user123")
        String userId,

        @Schema(description = "사용자 권한", example = "ROLE_USER")
        String role
) {}