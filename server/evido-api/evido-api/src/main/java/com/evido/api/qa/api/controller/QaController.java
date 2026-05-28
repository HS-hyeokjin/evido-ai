package com.evido.api.qa.api.controller;

import com.evido.api.common.response.CommonResponse;
import com.evido.api.qa.api.dto.request.AskRequest;
import com.evido.api.qa.api.dto.response.AskResponse;
import com.evido.api.qa.api.mapper.AskResponseMapper;
import com.evido.api.qa.application.port.in.QaUseCase;
import com.evido.api.qa.application.port.in.command.AskCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Tag(name = "QA", description = "문서 기반 질문/답변 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/qa")
public class QaController {

    private final QaUseCase qaUseCase;

    @Operation(summary = "질문하기")
    @PostMapping("/answer")
    public Mono<CommonResponse<AskResponse>> answer(
            @Valid @RequestBody AskRequest request
    ) {
        AskCommand command = AskCommand.from(request);

        return qaUseCase.answer(command)
                .map(AskResponseMapper::from)
                .map(response -> CommonResponse.success(
                        "질문 처리가 완료되었습니다.",
                        response
                ));
    }
}