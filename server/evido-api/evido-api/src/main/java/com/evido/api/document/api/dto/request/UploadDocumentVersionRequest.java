package com.evido.api.document.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "문서 새 버전 업로드 요청")
public record UploadDocumentVersionRequest(

        @Schema(description = "문서 ID", example = "10")
        Long documentId,

        @Schema(
                description = "업로드할 새 버전 파일",
                type = "string",
                format = "binary"
        )
        MultipartFile file
) {}