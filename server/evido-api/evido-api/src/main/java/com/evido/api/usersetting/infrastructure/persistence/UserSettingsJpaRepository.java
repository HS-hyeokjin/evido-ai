package com.evido.api.usersetting.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSettingsJpaRepository extends JpaRepository<UserSettingsEntity, Long> {

    Optional<UserSettingsEntity> findByUserId(String userId);
}