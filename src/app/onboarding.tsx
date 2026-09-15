import { usePreferencesStore } from "@/stores/preferences.store";
import { Colors, FontSizes } from "@constants/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const setupSteps = [
    {
        icon: "download-2-line",
        title: "Install a model",
        description: "Choose and download an AI model to your device.",
    },
    {
        icon: "cpu-line",
        title: "Load the model",
        description: "Load your model and get it ready to chat.",
    },
    {
        icon: "message-3-line",
        title: "Start chatting",
        description: "Ask questions and get private AI responses.",
    },
];

const Settings = () => {
    const insets = useSafeAreaInsets();

    const setOnboarded = usePreferencesStore((state) => state.setOnboarded);

    const handleGetStarted = () => {
        setOnboarded(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={require("@/assets/onboarding.jpg")}
                    style={styles.image}
                    contentFit="cover"
                />

                <LinearGradient
                    colors={["transparent", "rgba(0, 0, 0, 1)"]}
                    style={styles.gradientyOverlay}
                />
            </View>

            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <Text style={styles.appName}>Arctyc</Text>

                <Text style={styles.description}>
                    Your private AI assistant. Chat with AI anywhere, without
                    sending your data to the cloud.
                </Text>

                <View style={styles.steps}>
                    {setupSteps.map((step, index) => (
                        <View style={styles.step} key={step.title}>
                            <View style={styles.iconContainer}>
                                <RemixIcon
                                    name={step.icon as IconName}
                                    size={21}
                                    color={Colors.white}
                                    fallback={null}
                                />
                            </View>

                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>
                                    {step.title}
                                </Text>
                                <Text style={styles.stepDescription}>
                                    {step.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleGetStarted}
                >
                    <Text style={styles.buttonText}>Get Started</Text>

                    <RemixIcon
                        name="arrow-right-s-line"
                        size={20}
                        color={Colors.text}
                        fallback={null}
                    />
                </Pressable>
            </View>
        </View>
    );
};

export default Settings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },

    imageContainer: {
        width: "100%",
        position: "relative",
    },

    image: {
        width: "100%",
        aspectRatio: 1,
        objectFit: "cover",
    },

    gradientyOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "50%",
        width: "100%",
        objectFit: "cover",
    },

    content: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 28,
    },

    appName: {
        fontSize: FontSizes.display,
        color: Colors.textInverse,
        marginBottom: 8,
        fontFamily: "PlusJakartaSans-SemiBold",
    },

    description: {
        fontSize: FontSizes.md,
        lineHeight: 24,
        fontFamily: "DMSans-Medium",
        color: "rgba(255, 255, 255, 0.85)",
        marginBottom: 24,
    },

    steps: {
        gap: 20,
        marginBottom: 36,
    },

    step: {
        flexDirection: "row",
        gap: 14,
    },

    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.16)",
        alignItems: "center",
        justifyContent: "center",
    },

    stepContent: {
        flex: 1,
    },

    stepTitle: {
        fontSize: FontSizes.md,
        lineHeight: 20,
        fontFamily: "DMSans-SemiBold",
        color: Colors.textInverse,
        marginBottom: 2,
    },

    stepDescription: {
        fontSize: FontSizes.sm,
        lineHeight: 18,
        fontFamily: "DMSans-Medium",
        color: "rgba(255, 255, 255, 0.7)",
    },

    button: {
        width: "100%",
        height: 56,
        borderRadius: 999,
        backgroundColor: Colors.white,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },

    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },

    buttonText: {
        fontSize: FontSizes.md,
        fontFamily: "DMSans-SemiBold",
        color: Colors.text,
    },
});
