package com.evido.api.qa.api;

import com.evido.api.qa.api.dto.request.AskRequest;
import com.evido.api.qa.api.dto.response.AskResponse;
import com.evido.api.qa.application.QaUseCase;
import com.evido.api.qa.application.dto.AskCommand;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/qa")
public class QaController {

    private final QaUseCase qaUseCase;

    @PostMapping("/answer")
    public Mono<AskResponse> answer(@Valid @RequestBody AskRequest req) {
        AskCommand command = AskCommand.from(req);
        return qaUseCase.answer(command)
                .map(AskResponseMapper::from);
    }
}
