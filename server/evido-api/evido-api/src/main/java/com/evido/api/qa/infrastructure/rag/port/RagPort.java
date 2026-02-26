package com.evido.api.qa.infrastructure.rag.port;

import com.evido.api.qa.application.dto.AskCommand;
import com.evido.api.qa.infrastructure.rag.dto.RagAnswerResponse;
import reactor.core.publisher.Mono;

public interface RagPort {

    Mono<RagAnswerResponse> answer(AskCommand command);
}
