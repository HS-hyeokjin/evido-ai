package com.evido.api.auth.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.evido.api.auth.application.port.in.RefreshTokenUseCase;
import com.evido.api.auth.application.dto.TokenPair;
import com.evido.api.auth.application.port.out.RefreshTokenRepositoryPort;
import com.evido.api.auth.domain.TokenPayload;
import com.evido.api.auth.application.port.out.TokenProviderPort;


@Service
@RequiredArgsConstructor
public class RefreshTokenService implements RefreshTokenUseCase {

    private final TokenProviderPort tokenProvider;
    private final RefreshTokenRepositoryPort refreshRepo;

    @Override
    public TokenPair refresh(String refreshToken) {

        if (!tokenProvider.validate(refreshToken)) {
            throw new RuntimeException("refresh token 검증 실패");
        }

        TokenPayload payload = tokenProvider.parse(refreshToken);
        String userId = payload.subject();

        String saved = refreshRepo.findByUserId(userId);

        if (saved == null || !saved.equals(refreshToken)) {
            refreshRepo.delete(userId);
            throw new RuntimeException("Refresh token 재사용 감지");
        }

        String newAccess = tokenProvider.createAccessToken(userId, payload.role());
        String newRefresh = tokenProvider.createRefreshToken(userId);

        refreshRepo.save(userId, newRefresh, 604800);

        return new TokenPair(newAccess, newRefresh);
    }
}