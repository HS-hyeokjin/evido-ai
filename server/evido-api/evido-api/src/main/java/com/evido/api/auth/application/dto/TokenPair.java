package com.evido.api.auth.application.dto;

public record TokenPair(
        String access,
        String refresh
) {}