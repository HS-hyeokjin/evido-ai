package com.evido.api.qa.application.port.in;

import com.evido.api.qa.application.port.in.command.AskCommand;
import com.evido.api.qa.application.dto.AskResult;
import reactor.core.publisher.Mono;

public interface QaUseCase {
    Mono<AskResult> answer(AskCommand command);
}
