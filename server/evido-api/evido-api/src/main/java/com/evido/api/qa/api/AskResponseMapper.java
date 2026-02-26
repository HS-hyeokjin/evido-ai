package com.evido.api.qa.api;

import com.evido.api.qa.api.dto.response.AskResponse;
import com.evido.api.qa.application.dto.AskResult;

import java.util.List;

final class AskResponseMapper {
    private AskResponseMapper() {}

    static AskResponse from(AskResult result) {
        List<AskResponse.Evidence> evs = result.evidences() == null ? List.of() :
                result.evidences().stream()
                        .map(e -> new AskResponse.Evidence(
                                e.chunkId(),
                                e.score(),
                                e.chunkIndex(),
                                e.contentHead()
                        ))
                        .toList();

        return new AskResponse(result.queryText(), result.answer(), evs);
    }
}
