package com.evido.api.usersetting.api.dto.response;

import com.evido.api.usersetting.domain.AnswerStyle;
import com.evido.api.usersetting.domain.EvidenceMode;
import com.evido.api.usersetting.domain.ThemeMode;
import com.evido.api.usersetting.infrastructure.persistence.UserSettingsEntity;

public record UserSettingsResponse(
        String displayName,
        String email,
        ThemeMode theme,
        AnswerStyle answerStyle,
        EvidenceMode evidenceMode
) {

    public static UserSettingsResponse from(
            UserSettingsEntity settings,
            String email
    ) {
        return new UserSettingsResponse(
                settings.getDisplayName(),
                email,
                settings.getTheme(),
                settings.getAnswerStyle(),
                settings.getEvidenceMode()
        );
    }
}