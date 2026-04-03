package com.evido.api.conversation.api.dto.response;

import java.util.List;

public record SendMessageResponse(
        List<MessageResponse> messages
) {}