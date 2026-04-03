package com.evido.api.conversation.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MessageRequest(
        @NotBlank String content
) {}
