package com.evido.api.auth.infrastructure.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRedisRepository {

    private final StringRedisTemplate redisTemplate;

    private static final String PREFIX = "refresh:";

    public void save(String userId, String refreshToken, long ttlSeconds) {
        redisTemplate.opsForValue().set(
                PREFIX + userId,
                refreshToken,
                Duration.ofSeconds(ttlSeconds)
        );
    }

    public String findByUserId(String userId) {
        return redisTemplate.opsForValue().get(PREFIX + userId);
    }

    public void delete(String userId) {
        redisTemplate.delete(PREFIX + userId);
    }
}