package com.evido.api.document.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "문서 업로드 요청")
public record UploadDocumentRequest(

        @Schema(
                description = "문서 제목",
                example = "회의록"
        )
        String title,

        @Schema(
                description = "업로드할 파일",
                type = "string",
                format = "binary"
        )
        MultipartFile file
) {}