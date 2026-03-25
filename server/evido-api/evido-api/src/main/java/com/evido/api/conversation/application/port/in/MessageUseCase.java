package com.evido.api.conversation.application.port.in;

import com.evido.api.conversation.api.dto.MessageRequest;
import com.evido.api.conversation.api.dto.MessageResponse;
import com.evido.api.conversation.api.dto.SendMessageResponse;
import reactor.core.publisher.Mono;

import java.util.List;

public interface MessageUseCase {

    Mono<SendMessageResponse> sendMessage(Long conversationId, MessageRequest request);

    List<MessageResponse> getMessages(Long conversationId);
}