package com.evido.api.document.application.dto;

public record StoredFile(
        String storageProvider,
        String storageKey,
        String originalName,
        String contentType,
        long sizeBytes
) {}