package com.evido.api.qa.application.port.in;

import com.evido.api.qa.application.dto.AskResult;
import com.evido.api.qa.application.dto.ConversationContext;
import com.evido.api.qa.application.port.in.command.AskCommand;
import reactor.core.publisher.Mono;

public interface QaUseCase {

    default Mono<AskResult> answer(AskCommand command) {
        return answer(command, ConversationContext.empty());
    }

    Mono<AskResult> answer(AskCommand command, ConversationContext context);
}