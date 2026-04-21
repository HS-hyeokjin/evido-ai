package com.evido.api.document.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "문서 텍스트 내용 조회 요청")
public record DocumentContentRequest(

        @Schema(
                description = "조회할 문서 버전 ID",
                example = "2",
                nullable = true
        )
        Long versionId
) {}