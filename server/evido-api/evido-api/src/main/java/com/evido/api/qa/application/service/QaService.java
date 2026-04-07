package com.evido.api.qa.application.service;

import com.evido.api.qa.application.port.in.command.AskCommand;
import com.evido.api.qa.application.dto.AskResult;
import com.evido.api.qa.application.port.in.QaUseCase;
import com.evido.api.qa.infrastructure.rag.port.RagPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class QaService implements QaUseCase {

    private final RagPort ragPort;

    @Override
    public Mono<AskResult> answer(AskCommand command) {
        return ragPort.answer(command)
                .map(AskResult::from);
    }
}
