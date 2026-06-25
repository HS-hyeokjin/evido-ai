package com.evido.api.usersetting.api.dto.request;

import com.evido.api.usersetting.domain.AnswerStyle;
import com.evido.api.usersetting.domain.EvidenceMode;
import com.evido.api.usersetting.domain.ThemeMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserSettingsUpdateRequest(

        @NotBlank(message = "표시 이름은 필수입니다.")
        @Size(max = 50, message = "표시 이름은 50자를 넘을 수 없습니다.")
        String displayName,

        @NotNull(message = "테마 설정은 필수입니다.")
        ThemeMode theme,

        @NotNull(message = "답변 스타일은 필수입니다.")
        AnswerStyle answerStyle,

        @NotNull(message = "근거 표시 방식은 필수입니다.")
        EvidenceMode evidenceMode
) {
}