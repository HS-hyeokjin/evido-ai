package com.evido.api.conversation.api.dto;

import java.util.List;

public record SendMessageResponse(
        List<MessageResponse> messages
) {}