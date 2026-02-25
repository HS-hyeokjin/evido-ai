package com.evido.api.document.api.dto.request;

import jakarta.validation.constraints.Min;

public record ListDocumentsRequest(
        String q,
        @Min(0)
        Integer page,
        @Min(1)
        Integer size,
        String sort
) {
    public int pageOrDefault() {
        return page == null ? 0 : page;
    }

    public int sizeOrDefault() {
        return size == null ? 10 : size;
    }

    public String sortOrDefault() {
        return (sort == null || sort.isBlank())
                ? "createdAt,desc"
                : sort;
    }
}