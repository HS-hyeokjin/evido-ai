package com.evido.api.auth.infrastructure.redis;

import com.evido.api.auth.application.port.out.RefreshTokenRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RefreshTokenRedisAdapter implements RefreshTokenRepositoryPort {

    private final StringRedisTemplate redisTemplate;
    private static final String PREFIX = "refresh:";

    @Override
    public void save(String userId, String refreshToken, long ttlSeconds) {
        redisTemplate.opsForValue().set(
                PREFIX + userId,
                refreshToken,
                Duration.ofSeconds(ttlSeconds)
        );
    }

    @Override
    public String findByUserId(String userId) {
        return redisTemplate.opsForValue().get(PREFIX + userId);
    }

    @Override
    public void delete(String userId) {
        redisTemplate.delete(PREFIX + userId);
    }
}