package com.evido.api.document.application.dto;

import java.util.List;

public record PageResult<T>(
        List<T> content,
        int number,
        int size,
        long totalElements,
        int totalPages
) {}
