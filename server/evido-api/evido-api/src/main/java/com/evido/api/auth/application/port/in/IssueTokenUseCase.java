package com.evido.api.auth.application.port.in;

import com.evido.api.auth.application.dto.TokenPair;

public interface IssueTokenUseCase {

    TokenPair issueGuest();

    TokenPair issueOAuthUser(String email, String name, String provider);

}