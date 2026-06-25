package com.evido.api.usersetting.application.service;

import com.evido.api.auth.infrastructure.persistence.UserEntity;
import com.evido.api.auth.infrastructure.persistence.UserJpaRepository;
import com.evido.api.common.exception.BusinessException;
import com.evido.api.common.exception.ErrorCode;
import com.evido.api.usersetting.api.dto.request.UserSettingsUpdateRequest;
import com.evido.api.usersetting.api.dto.response.UserSettingsResponse;
import com.evido.api.usersetting.infrastructure.persistence.UserSettingsEntity;
import com.evido.api.usersetting.infrastructure.persistence.UserSettingsJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserSettingsJpaRepository userSettingsJpaRepository;
    private final UserJpaRepository userJpaRepository;

    @Transactional
    public UserSettingsResponse getMySettings(String userId) {
        UserEntity user = getUserOrThrow(userId);

        UserSettingsEntity settings = userSettingsJpaRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(user));

        return UserSettingsResponse.from(settings, user.getEmail());
    }

    @Transactional
    public UserSettingsResponse updateMySettings(
            String userId,
            UserSettingsUpdateRequest request
    ) {
        UserEntity user = getUserOrThrow(userId);

        UserSettingsEntity settings = userSettingsJpaRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(user));

        settings.update(
                request.displayName().trim(),
                request.theme(),
                request.answerStyle(),
                request.evidenceMode()
        );

        return UserSettingsResponse.from(settings, user.getEmail());
    }

    private UserEntity getUserOrThrow(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        return userJpaRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private UserSettingsEntity createDefaultSettings(UserEntity user) {
        String displayName = resolveDisplayName(user);

        UserSettingsEntity settings = UserSettingsEntity.createDefault(
                user.getId(),
                displayName
        );

        return userSettingsJpaRepository.save(settings);
    }

    private String resolveDisplayName(UserEntity user) {
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            int atIndex = user.getEmail().indexOf("@");

            if (atIndex > 0) {
                return user.getEmail().substring(0, atIndex);
            }

            return user.getEmail();
        }

        return "사용자";
    }
}