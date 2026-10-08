import Dialog from "@/components/ui/Dialog";
import Toast from "@/components/ui/Toast";
import Header from "@/components/ui/Header";
import { usePreferencesStore } from "@/stores/preferences.store";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { Sora_500Medium } from "@expo-google-fonts/sora/500Medium";
import { Sora_600SemiBold } from "@expo-google-fonts/sora/600SemiBold";
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
        "Sora-Medium": Sora_500Medium,
        "Sora-SemiBold": Sora_600SemiBold,
        "DMSans-Regular": DMSans_400Regular,
        "DMSans-Medium": DMSans_500Medium,
        "DMSans-SemiBold": DMSans_600SemiBold,
        "DMSans-Bold": DMSans_700Bold,
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
        <>
            <Dialog />
            <Toast />
            <Stack
                screenOptions={{
                    header: ({ options }) => (
                        <Header title={options.title ?? ""} />
                    ),
                }}
            >
                <Stack.Protected guard={!onboarded}>
                    <Stack.Screen
                        name="onboarding"
                        options={{ title: "Onboarding", headerShown: false }}
                    />
                </Stack.Protected>

                <Stack.Protected guard={onboarded}>
                    <Stack.Screen
                        name="(drawer)"
                        options={{ title: "Drawer", headerShown: false }}
                    />
                </Stack.Protected>
                <Stack.Protected guard={onboarded}>
                    <Stack.Screen name="about" options={{ title: "About" }} />
                </Stack.Protected>
            </Stack>
        </>
    );
}
