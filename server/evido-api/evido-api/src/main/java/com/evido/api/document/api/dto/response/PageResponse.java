package com.evido.api.document.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "페이지 응답")
public record PageResponse<T>(

        @Schema(description = "조회된 데이터 목록")
        List<T> content,

        @Schema(description = "현재 페이지 번호", example = "0")
        int number,

        @Schema(description = "페이지 크기", example = "10")
        int size,

        @Schema(description = "전체 데이터 수", example = "37")
        long totalElements,

        @Schema(description = "전체 페이지 수", example = "4")
        int totalPages
) {}