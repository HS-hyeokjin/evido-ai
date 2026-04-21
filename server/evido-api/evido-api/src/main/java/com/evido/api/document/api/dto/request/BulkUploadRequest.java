package com.evido.api.document.api.dto.request;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Schema(description = "문서 일괄 업로드 요청")
public record BulkUploadRequest(

        @Schema(description = "업로드 문서 제목 앞에 붙일 접두어", example = "프로젝트A")
        String titlePrefix,

        @ArraySchema(
                arraySchema = @Schema(description = "업로드할 파일 목록"),
                schema = @Schema(type = "string", format = "binary")
        )
        List<MultipartFile> files
) {}