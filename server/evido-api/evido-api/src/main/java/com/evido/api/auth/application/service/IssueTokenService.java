package com.evido.api.auth.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.evido.api.auth.application.port.in.IssueTokenUseCase;
import com.evido.api.auth.application.dto.TokenPair;
import com.evido.api.auth.domain.User;
import com.evido.api.auth.application.port.out.TokenProviderPort;
import com.evido.api.auth.application.port.out.UserRepositoryPort;
import com.evido.api.auth.application.port.out.RefreshTokenRepositoryPort;

@Service
@RequiredArgsConstructor
public class IssueTokenService implements IssueTokenUseCase {

    private final UserRepositoryPort userRepository;
    private final TokenProviderPort tokenProvider;
    private final RefreshTokenRepositoryPort refreshRepo;

    @Override
    public TokenPair issueGuest() {

        User guest = User.createGuest();

        guest = userRepository.save(guest);

        return generateTokenPair(guest);
    }

    @Override
    public TokenPair issueOAuthUser(String email, String name, String provider) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = userRepository.save(User.createOAuthUser(email, name, provider));
        } else if (user.isGuest()) {
            user.upgradeToUser(email, name, provider);
        }

        user.updateLastLogin();

        return generateTokenPair(user);
    }

    private TokenPair generateTokenPair(User user) {

        String access = tokenProvider.createAccessToken(
                user.getId(),
                user.getRole()
        );

        String refresh = tokenProvider.createRefreshToken(
                user.getId(),
                user.getRole()
        );

        refreshRepo.save(user.getId(), refresh, 604800);

        return new TokenPair(access, refresh);
    }
}