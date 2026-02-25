package com.evido.api.document.application.dto;

public record DocumentFileMetaResult(
        String filename,
        String contentType,
        boolean inline
) {}