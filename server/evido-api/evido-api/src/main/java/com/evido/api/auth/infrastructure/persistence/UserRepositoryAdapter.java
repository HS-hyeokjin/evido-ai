package com.evido.api.auth.infrastructure.persistence;

import com.evido.api.auth.domain.User;
import com.evido.api.auth.application.port.out.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository repository;

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email)
                .map(this::toDomain);
    }

    @Override
    public Optional<User> findById(String id) {
        return repository.findById(id)
                .map(this::toDomain);
    }

    @Override
    public User save(User user) {

        UserEntity entity = toEntity(user);

        UserEntity saved = repository.save(entity);

        return toDomain(saved);
    }

    private User toDomain(UserEntity entity) {
        return new User(
                entity.getId(),
                entity.getEmail(),
                entity.getName(),
                entity.getProvider(),
                entity.getRole(),
                entity.getCreatedAt(),
                entity.getLastLoginAt()
        );
    }

    private UserEntity toEntity(User user) {
        return new UserEntity(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getProvider(),
                user.getRole(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}