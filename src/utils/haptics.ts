import * as Haptics from "expo-haptics";
import { usePreferencesStore } from "@/stores/preferences.store";

/**
 * Centralized haptic feedback utilities for Arctyc using expo-haptics.
 * All calls are wrapped in try-catch to ensure failures or lack of hardware
 * support never interrupt core application functionality.
 * Respects the global hapticsEnabled preference.
 */

const isHapticsEnabled = (): boolean => {
    return usePreferencesStore.getState().preferences.hapticsEnabled ?? true;
};

export const lightImpact = async (): Promise<void> => {
    if (!isHapticsEnabled()) return;
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
        // Fail silently
    }
};

export const mediumImpact = async (): Promise<void> => {
    if (!isHapticsEnabled()) return;
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
        // Fail silently
    }
};

export const successNotification = async (): Promise<void> => {
    if (!isHapticsEnabled()) return;
    try {
        await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
        );
    } catch {
        // Fail silently
    }
};

export const haptics = {
    lightImpact,
    mediumImpact,
    successNotification,
};

export default haptics;
