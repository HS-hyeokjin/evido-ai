package com.evido.api.auth.application.port.out;

public interface RefreshTokenRepositoryPort {

    void save(String userId, String refreshToken, long ttlSeconds);

    String findByUserId(String userId);

    void delete(String userId);

}