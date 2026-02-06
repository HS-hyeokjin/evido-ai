package com.evido.api.document.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class BulkUploadResponse {
    private List<DocumentCreateResponse> success;
    private List<BulkUploadFailedItem> failed;
}
