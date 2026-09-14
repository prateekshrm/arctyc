import { usePreferencesStore } from "@/stores/preferences.store";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";

const Onboarding = () => {
    const setOnboarded = usePreferencesStore((state) => state.setOnboarded);
    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Text>Onboarding</Text>
            <Button
                title="Set Onboarding False"
                onPress={() => setOnboarded(false)}
            />
        </View>
    );
};

export default Onboarding;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
