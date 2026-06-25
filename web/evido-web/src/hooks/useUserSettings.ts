import { useEffect, useState } from "react";
import {
    DEFAULT_USER_SETTINGS,
    type UserSettings,
} from "../types/userSettings";
import {
    getUserSettings,
    updateUserSettings,
} from "../api/userSettings";

const STORAGE_KEY = "evido-user-settings";

function loadLocalUserSettings(): UserSettings {
    if (typeof window === "undefined") {
        return DEFAULT_USER_SETTINGS;
    }

    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return DEFAULT_USER_SETTINGS;
        }

        const parsed = JSON.parse(saved) as Partial<UserSettings>;

        return {
            ...DEFAULT_USER_SETTINGS,
            ...parsed,
        };
    } catch {
        return DEFAULT_USER_SETTINGS;
    }
}

function saveLocalUserSettings(settings: UserSettings) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function removeLocalUserSettings() {
    window.localStorage.removeItem(STORAGE_KEY);
}

function getErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
            response?: {
                data?: {
                    message?: string;
                };
            };
        };

        return axiosError.response?.data?.message ?? "사용자 설정 처리 중 오류가 발생했습니다.";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "사용자 설정 처리 중 오류가 발생했습니다.";
}

export function useUserSettings() {
    const [settings, setSettings] = useState<UserSettings>(() => loadLocalUserSettings());
    const [saved, setSaved] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        async function loadSettings() {
            try {
                setLoading(true);
                setError(null);

                const serverSettings = await getUserSettings();

                if (ignore) {
                    return;
                }

                setSettings(serverSettings);
                saveLocalUserSettings(serverSettings);
                setSaved(true);
            } catch (error) {
                if (ignore) {
                    return;
                }

                setError(getErrorMessage(error));
                setSettings(loadLocalUserSettings());
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        void loadSettings();

        return () => {
            ignore = true;
        };
    }, []);

    function updateSetting<K extends keyof UserSettings>(
        key: K,
        value: UserSettings[K],
    ) {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));

        setSaved(false);
        setError(null);
    }

    async function saveSettings() {
        try {
            setSaving(true);
            setError(null);

            const updatedSettings = await updateUserSettings({
                displayName: settings.displayName.trim(),
                theme: settings.theme,
                answerStyle: settings.answerStyle,
                evidenceMode: settings.evidenceMode,
            });

            setSettings(updatedSettings);
            saveLocalUserSettings(updatedSettings);
            setSaved(true);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    function resetSettings() {
        removeLocalUserSettings();

        setSettings({
            ...DEFAULT_USER_SETTINGS,
            email: settings.email,
        });

        setSaved(false);
        setError(null);
    }

    return {
        settings,
        saved,
        loading,
        saving,
        error,
        updateSetting,
        saveSettings,
        resetSettings,
    };
}