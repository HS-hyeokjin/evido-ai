package com.evido.api.document.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "문서 다운로드 요청")
public record DownloadDocumentRequest(

        @Schema(
                description = "조회할 문서 버전 ID",
                example = "2",
                nullable = true
        )
        Long versionId
) {}