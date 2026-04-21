package com.evido.api.qa.api.controller;

import com.evido.api.qa.api.dto.request.AskRequest;
import com.evido.api.qa.api.dto.response.AskResponse;
import com.evido.api.qa.api.mapper.AskResponseMapper;
import com.evido.api.qa.application.port.in.QaUseCase;
import com.evido.api.qa.application.port.in.command.AskCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(
            summary = "질문하기",
            description = "워크스페이스 문서를 기반으로 질문에 대한 답변을 생성합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "질문 처리 성공",
                    content = @Content(schema = @Schema(implementation = AskResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "워크스페이스 또는 문서를 찾을 수 없음")
    })
    @PostMapping("/answer")
    public Mono<AskResponse> answer(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "질문 요청 정보",
                    required = true
            )
            @Valid @RequestBody AskRequest request
    ) {
        AskCommand command = AskCommand.from(request);
        return qaUseCase.answer(command)
                .map(AskResponseMapper::from);
    }
}