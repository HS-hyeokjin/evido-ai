package com.evido.api.document.api.dto.response;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        int number,
        int size,
        long totalElements,
        int totalPages
) {}