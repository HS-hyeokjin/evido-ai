package com.evido.api.auth.application.port.out;

import com.evido.api.auth.domain.Role;
import com.evido.api.auth.domain.TokenPayload;

public interface TokenProviderPort {

    String createGuestToken(String guestUuid);

    String createAccessToken(String userId, Role role);

    String createRefreshToken(String userId, Role role);

    boolean validate(String token);

    TokenPayload parse(String token);
}
