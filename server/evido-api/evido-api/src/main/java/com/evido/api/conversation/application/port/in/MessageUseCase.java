package com.evido.api.conversation.application.port.in;

import com.evido.api.conversation.api.dto.request.MessageRequest;
import com.evido.api.conversation.api.dto.response.MessageResponse;
import com.evido.api.conversation.api.dto.response.SendMessageResponse;
import reactor.core.publisher.Mono;

import java.util.List;

public interface MessageUseCase {

    Mono<SendMessageResponse> sendMessage(Long conversationId, MessageRequest request);

    List<MessageResponse> getMessages(Long conversationId);
}