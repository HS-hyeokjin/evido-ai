package com.evido.api.auth.api.dto;

public record SessionResponse(
        boolean authenticated,
        String userId,
        String role
) {}