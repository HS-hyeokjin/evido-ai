package com.evido.api.auth.domain;

public record TokenPayload(
        String subject,
        String type,
        Role role
) {}