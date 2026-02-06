package com.evido.api.document.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BulkUploadFailedItem {
    private String filename;
    private String reason;
}
