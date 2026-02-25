package com.evido.api.auth.infrastructure;

import com.evido.api.auth.application.port.out.TokenProviderPort;
import com.evido.api.auth.application.port.out.UserRepositoryPort;
import com.evido.api.auth.infrastructure.persistence.UserJpaRepository;
import com.evido.api.auth.infrastructure.persistence.UserRepositoryAdapter;
import com.evido.api.auth.infrastructure.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthInfrastructureConfig {

    @Bean
    public TokenProviderPort tokenProvider(
            @Value("${jwt.secret}") String secretKey
    ) {
        return new JwtTokenProvider(secretKey);
    }

    @Bean
    public UserRepositoryPort userRepositoryPort(UserJpaRepository jpaRepository) {
        return new UserRepositoryAdapter(jpaRepository);
    }
}