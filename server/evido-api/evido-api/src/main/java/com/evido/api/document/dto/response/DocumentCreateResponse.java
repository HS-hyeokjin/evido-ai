package com.evido.api.document.dto.response;

import lombok.*;

@Getter
@AllArgsConstructor
public class DocumentCreateResponse {
    private Long documentId;
    private Long versionId;
    private Long fileId;
    private String title;
    private String status;
}
