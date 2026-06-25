package com.evido.api.usersetting.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.common.response.CommonResponse;
import com.evido.api.usersetting.api.dto.request.UserSettingsUpdateRequest;
import com.evido.api.usersetting.api.dto.response.UserSettingsResponse;
import com.evido.api.usersetting.application.service.UserSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "UserSettings", description = "사용자 설정 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me/settings")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;
    private final CurrentUserProvider currentUserProvider;

    @Operation(summary = "내 사용자 설정 조회")
    @GetMapping
    public CommonResponse<UserSettingsResponse> getMySettings(
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        UserSettingsResponse response = userSettingsService.getMySettings(userId);

        return CommonResponse.success("사용자 설정을 조회했습니다.", response);
    }

    @Operation(summary = "내 사용자 설정 수정")
    @PutMapping
    public CommonResponse<UserSettingsResponse> updateMySettings(
            @Parameter(hidden = true)
            Authentication authentication,
            @Valid @RequestBody UserSettingsUpdateRequest request
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        UserSettingsResponse response = userSettingsService.updateMySettings(
                userId,
                request
        );

        return CommonResponse.success("사용자 설정을 수정했습니다.", response);
    }
}