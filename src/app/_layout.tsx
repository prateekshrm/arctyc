import { usePreferencesStore } from "@/stores/preferences.store";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { useFonts } from "expo-font";
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

    let [fontsLoaded] = useFonts({
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_500Medium,
        DMSans_400Regular,
    });

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        if (hydrated && fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [hydrated, fontsLoaded]);

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
