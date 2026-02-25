package com.evido.api.auth.application.port.in;

import com.evido.api.auth.application.dto.TokenPair;

public interface RefreshTokenUseCase {

    TokenPair refresh(String refreshToken);

}