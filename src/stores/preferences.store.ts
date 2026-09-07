import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "preferences";

export type Preferences = {
    onboarded: boolean;
};

type PreferencesStore = {
    preferences: Preferences;
    hydrated: boolean;
    hydrate: () => Promise<void>;
    setOnboarded: (value: boolean) => Promise<void>;
};

const defaultPreferences = {
    onboarded: false,
};

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
    preferences: defaultPreferences,
    hydrated: false,
    hydrate: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);

            if (stored) {
                set({
                    preferences: JSON.parse(stored),
                    hydrated: true,
                });
            } else {
                set({
                    preferences: defaultPreferences,
                    hydrated: true,
                });
            }
        } catch {
            set({
                preferences: defaultPreferences,
                hydrated: true,
            });
        }
    },
    setOnboarded: async (value: boolean) => {
        const preferences = { ...get().preferences, onboarded: value };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

        set({ preferences });
    },
}));
