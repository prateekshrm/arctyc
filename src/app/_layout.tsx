import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(drawer)" options={{ title: "Drawer" }} />
            <Stack.Screen name="onboarding" options={{ title: "Onboarding" }} />
        </Stack>
    );
}
