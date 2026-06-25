import api from "./client";
import type { UserSettings } from "../types/userSettings";

type CommonResponse<T> = {
    success: boolean;
    code: string;
    message: string;
    data: T;
};

export type UpdateUserSettingsRequest = {
    displayName: string;
    theme: UserSettings["theme"];
    answerStyle: UserSettings["answerStyle"];
    evidenceMode: UserSettings["evidenceMode"];
};

export async function getUserSettings() {
    const response = await api.get<CommonResponse<UserSettings>>(
        "/api/users/me/settings",
    );

    return response.data.data;
}

export async function updateUserSettings(
    request: UpdateUserSettingsRequest,
) {
    const response = await api.put<CommonResponse<UserSettings>>(
        "/api/users/me/settings",
        request,
    );

    return response.data.data;
}