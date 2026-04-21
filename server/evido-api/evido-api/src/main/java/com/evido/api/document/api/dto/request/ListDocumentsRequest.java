package com.evido.api.document.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;

@Schema(description = "문서 목록 조회 요청")
public record ListDocumentsRequest(

        @Schema(
                description = "문서 제목 검색어",
                example = "회의"
        )
        String q,

        @Schema(
                description = "페이지 번호",
                example = "0",
                defaultValue = "0"
        )
        @Min(value = 0, message = "page는 0 이상이어야 합니다.")
        Integer page,

        @Schema(
                description = "페이지 크기",
                example = "10",
                defaultValue = "10"
        )
        @Min(value = 1, message = "size는 1 이상이어야 합니다.")
        Integer size,

        @Schema(
                description = "정렬 조건",
                example = "createdAt,desc",
                defaultValue = "createdAt,desc"
        )
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