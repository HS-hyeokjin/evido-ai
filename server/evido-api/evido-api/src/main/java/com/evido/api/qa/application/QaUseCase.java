package com.evido.api.qa.application;

import com.evido.api.qa.application.dto.AskCommand;
import com.evido.api.qa.application.dto.AskResult;
import reactor.core.publisher.Mono;

public interface QaUseCase {
    Mono<AskResult> answer(AskCommand command);
}
