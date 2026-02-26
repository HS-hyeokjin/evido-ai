package com.evido.api.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rag")
public record RagProperties(
        String baseUrl,
        int timeoutSeconds
) {}
