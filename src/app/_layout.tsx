import { usePreferencesStore } from "@/stores/preferences.store";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const hydrate = usePreferencesStore((state) => state.hydrate);
    const hydrated = usePreferencesStore((state) => state.hydrated);
    const onboarded = usePreferencesStore(
        (state) => state.preferences.onboarded,
    );

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        if (hydrated) {
            SplashScreen.hideAsync();
        }
    }, [hydrated]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!onboarded}>
                <Stack.Screen
                    name="onboarding"
                    options={{ title: "Onboarding" }}
                />
            </Stack.Protected>

            <Stack.Protected guard={onboarded}>
                <Stack.Screen name="(drawer)" options={{ title: "Drawer" }} />
            </Stack.Protected>
        </Stack>
    );
}
