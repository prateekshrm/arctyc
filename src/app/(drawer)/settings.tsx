import { usePreferencesStore } from "@/stores/preferences.store";
import { Colors, FontSizes } from "@constants/theme";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Onboarding = () => {
    const insets = useSafeAreaInsets();
    const setOnboarded = usePreferencesStore((state) => state.setOnboarded);
    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 16,
                        gap: 8,
                    }}
                    style={styles.settingContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>General</Text>
                    <Pressable
                        style={styles.setting}
                        onPress={() => setOnboarded(false)}
                    >
                        <View style={styles.settingLeft}>
                            <View style={styles.settingIcon}>
                                <RemixIcon
                                    name="compass-3-line"
                                    size={FontSizes.xxl}
                                    color={Colors.textSecondary}
                                    fallback={null}
                                />
                            </View>
                            <View>
                                <Text style={styles.settingTitle}>
                                    Onboarding
                                </Text>
                                <Text style={styles.settingDescription}>
                                    View the welcome screen again
                                </Text>
                            </View>
                        </View>
                        <RemixIcon
                            name="arrow-right-s-line"
                            size={FontSizes.xl}
                            color={Colors.text}
                            fallback={null}
                        />
                    </Pressable>
                </ScrollView>
            </View>
        </View>
    );
};

export default Onboarding;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 32,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderWidth: 16,
        borderBottomWidth: 0,
        borderColor: Colors.surface,
        overflow: "hidden",
    },
    settingContainer: {
        flex: 1,
    },
    title: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        paddingLeft: 8,
        fontFamily: "DMSans-SemiBold",
        textTransform: "uppercase",
    },
    setting: {
        borderRadius: 16,
        backgroundColor: Colors.surfaceSecondary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
        paddingRight: 12,
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    settingIcon: {
        backgroundColor: Colors.surface,
        height: 48,
        width: 48,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    settingTitle: {
        fontSize: FontSizes.lg,
        color: Colors.text,
        fontFamily: "DMSans-SemiBold",
    },
    settingDescription: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Regular",
    },
});
