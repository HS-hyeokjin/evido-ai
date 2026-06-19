package com.evido.api.auth.application.service;

import com.evido.api.auth.application.dto.TokenPair;
import com.evido.api.auth.application.port.in.RefreshTokenUseCase;
import com.evido.api.auth.application.port.out.RefreshTokenRepositoryPort;
import com.evido.api.auth.application.port.out.TokenProviderPort;
import com.evido.api.auth.application.port.out.UserRepositoryPort;
import com.evido.api.auth.domain.TokenPayload;
import com.evido.api.auth.domain.User;
import com.evido.api.common.exception.BusinessException;
import com.evido.api.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshTokenService implements RefreshTokenUseCase {

    private static final String TOKEN_TYPE_REFRESH = "REFRESH";
    private static final long REFRESH_TOKEN_TTL_SECONDS = 604800L;

    private final TokenProviderPort tokenProvider;
    private final RefreshTokenRepositoryPort refreshRepo;
    private final UserRepositoryPort userRepository;

    @Override
    public TokenPair refresh(String refreshToken) {

        if (!tokenProvider.validate(refreshToken)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "refresh token 검증에 실패했습니다.");
        }

        TokenPayload payload = tokenProvider.parse(refreshToken);

        if (!TOKEN_TYPE_REFRESH.equals(payload.type())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "refresh token 형식이 올바르지 않습니다.");
        }

        String userId = payload.subject();
        String saved = refreshRepo.findByUserId(userId);

        if (saved == null || !saved.equals(refreshToken)) {
            refreshRepo.delete(userId);
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "refresh token 재사용이 감지되었습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        String newAccess = tokenProvider.createAccessToken(user.getId(), user.getRole());
        String newRefresh = tokenProvider.createRefreshToken(user.getId(), user.getRole());

        refreshRepo.save(user.getId(), newRefresh, REFRESH_TOKEN_TTL_SECONDS);

        return new TokenPair(newAccess, newRefresh);
    }
}
