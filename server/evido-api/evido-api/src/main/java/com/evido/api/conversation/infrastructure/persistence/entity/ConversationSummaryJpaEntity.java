package com.evido.api.conversation.infrastructure.persistence.entity;

import com.evido.api.conversation.domain.ConversationSummary;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "conversation_summary")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ConversationSummaryJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "summary_id")
    private Long id;

    @Column(name = "conversation_id", nullable = false, unique = true)
    private Long conversationId;

    @Lob
    @Column(name = "summary", nullable = false, columnDefinition = "LONGTEXT")
    private String summary;

    @Column(name = "last_message_id")
    private Long lastMessageId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    private ConversationSummaryJpaEntity(
            Long id,
            Long conversationId,
            String summary,
            Long lastMessageId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.conversationId = conversationId;
        this.summary = summary;
        this.lastMessageId = lastMessageId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ConversationSummaryJpaEntity from(ConversationSummary domain) {
        return new ConversationSummaryJpaEntity(
                domain.getId(),
                domain.getConversationId(),
                domain.getSummary(),
                domain.getLastMessageId(),
                domain.getCreatedAt(),
                domain.getUpdatedAt()
        );
    }

    public ConversationSummary toDomain() {
        return ConversationSummary.of(
                this.id,
                this.conversationId,
                this.summary,
                this.lastMessageId,
                this.createdAt,
                this.updatedAt
        );
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        if (this.createdAt == null) {
            this.createdAt = now;
        }

        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}