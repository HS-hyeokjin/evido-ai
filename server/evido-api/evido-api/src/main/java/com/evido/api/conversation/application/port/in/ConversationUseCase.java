package com.evido.api.conversation.application.port.in;

import com.evido.api.conversation.application.port.in.command.CreateConversationCommand;
import com.evido.api.conversation.application.port.in.query.GetConversationsQuery;
import com.evido.api.conversation.domain.Conversation;

import java.util.List;

public interface ConversationUseCase {

    List<Conversation> getConversation(GetConversationsQuery query);

    Conversation createConversation(CreateConversationCommand command);
}