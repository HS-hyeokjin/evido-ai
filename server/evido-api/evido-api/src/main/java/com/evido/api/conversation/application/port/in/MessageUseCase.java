package com.evido.api.conversation.application.port.in;

import com.evido.api.conversation.application.dto.MessageResult;
import com.evido.api.conversation.application.dto.SendMessageResult;
import com.evido.api.conversation.application.port.in.command.SendFirstMessageCommand;
import com.evido.api.conversation.application.port.in.command.SendMessageCommand;
import com.evido.api.conversation.application.port.in.query.GetMessagesQuery;
import reactor.core.publisher.Mono;

import java.util.List;

public interface MessageUseCase {

    Mono<SendMessageResult> sendMessage(SendMessageCommand command);

    List<MessageResult> getMessages(GetMessagesQuery query);

    Mono<SendMessageResult> sendFirstMessage(SendFirstMessageCommand command);

}