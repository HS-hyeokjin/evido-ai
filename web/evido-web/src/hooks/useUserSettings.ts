import { useState } from "react";
import {
    DEFAULT_USER_SETTINGS,
    type UserSettings,
} from "../types/userSettings";

const STORAGE_KEY = "evido-user-settings";

function loadUserSettings(): UserSettings {
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

export function useUserSettings() {
    const [settings, setSettings] = useState<UserSettings>(() => loadUserSettings());

    const [saved, setSaved] = useState(true);

    function updateSetting<K extends keyof UserSettings>(
        key: K,
        value: UserSettings[K],
    ) {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));

        setSaved(false);
    }

    function saveSettings() {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setSaved(true);
    }

    function resetSettings() {
        window.localStorage.removeItem(STORAGE_KEY);
        setSettings(DEFAULT_USER_SETTINGS);
        setSaved(true);
    }

    return {
        settings,
        saved,
        updateSetting,
        saveSettings,
        resetSettings,
    };
}