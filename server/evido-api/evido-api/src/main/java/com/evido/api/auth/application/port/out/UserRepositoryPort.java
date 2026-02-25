package com.evido.api.auth.application.port.out;
import com.evido.api.auth.domain.User;

import java.util.Optional;

public interface UserRepositoryPort {

    Optional<User> findByEmail(String email);

    User save(User user);

    Optional<User> findById(String id);

}