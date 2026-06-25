package com.evido.api.usersetting.infrastructure.persistence;

import com.evido.api.usersetting.domain.AnswerStyle;
import com.evido.api.usersetting.domain.EvidenceMode;
import com.evido.api.usersetting.domain.ThemeMode;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "user_settings",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_settings_user_id", columnNames = "user_id")
        }
)
public class UserSettingsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "theme", nullable = false, length = 20)
    private ThemeMode theme;

    @Enumerated(EnumType.STRING)
    @Column(name = "answer_style", nullable = false, length = 30)
    private AnswerStyle answerStyle;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_mode", nullable = false, length = 30)
    private EvidenceMode evidenceMode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected UserSettingsEntity() {
    }

    public UserSettingsEntity(
            String userId,
            String displayName,
            ThemeMode theme,
            AnswerStyle answerStyle,
            EvidenceMode evidenceMode
    ) {
        this.userId = userId;
        this.displayName = displayName;
        this.theme = theme;
        this.answerStyle = answerStyle;
        this.evidenceMode = evidenceMode;
    }

    public static UserSettingsEntity createDefault(String userId, String displayName) {
        return new UserSettingsEntity(
                userId,
                displayName,
                ThemeMode.SYSTEM,
                AnswerStyle.EVIDENCE,
                EvidenceMode.SIMPLE
        );
    }

    public void update(
            String displayName,
            ThemeMode theme,
            AnswerStyle answerStyle,
            EvidenceMode evidenceMode
    ) {
        this.displayName = displayName;
        this.theme = theme;
        this.answerStyle = answerStyle;
        this.evidenceMode = evidenceMode;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}