package com.evido.api.qa.application.dto;

import com.evido.api.qa.domain.QueryIntent;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QueryRouteResult {
    private QueryIntent primaryIntent;

    private boolean needsRetrieval;
    private boolean needsHistory;
    private boolean needsDocumentFilter;
    private boolean needsMetadataLookup;
    private boolean needsAction;

    private double confidence;
    private String rewrittenQuery;
    private String reason;
}