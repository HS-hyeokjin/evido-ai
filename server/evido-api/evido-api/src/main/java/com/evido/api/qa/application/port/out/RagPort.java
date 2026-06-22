package com.evido.api.qa.application.port.out;

import com.evido.api.qa.application.dto.ConversationContext;
import com.evido.api.qa.application.port.in.command.AskCommand;
import com.evido.api.qa.infrastructure.rag.dto.RagAnswerResponse;
import com.evido.api.qa.infrastructure.rag.dto.RagStreamEvent;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RagPort {

    Mono<RagAnswerResponse> answer(AskCommand command, ConversationContext context);

    Flux<RagStreamEvent> answerStream(AskCommand command, ConversationContext context);
}