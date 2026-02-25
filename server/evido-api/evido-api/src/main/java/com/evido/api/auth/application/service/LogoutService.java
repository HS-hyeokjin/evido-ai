package com.evido.api.auth.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.evido.api.auth.application.port.in.LogoutUseCase;
import com.evido.api.auth.application.port.out.RefreshTokenRepositoryPort;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutUseCase {

    private final RefreshTokenRepositoryPort refreshRepo;

    @Override
    public void logout(String userId) {
        refreshRepo.delete(userId);
    }
}