import { useChatStore } from "@/stores/chat.store";
import { useDialogStore } from "@/stores/dialog.store";
import { usePreferencesStore } from "@/stores/preferences.store";
import { Colors, FontSizes } from "@constants/theme";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingItem = {
    title: string;
    description: string;
    icon: IconName;
    onPress: () => void;
};

type SettingsSection = {
    title: string;
    items: SettingItem[];
};

const Settings = () => {
    const insets = useSafeAreaInsets();

    const setOnboarded = usePreferencesStore((state) => state.setOnboarded);
    const showDialog = useDialogStore((state) => state.showDialog);
    const chats = useChatStore((state) => state.chats);
    const deleteAllChats = useChatStore((state) => state.deleteAllChats);

    const handleDeleteAllChats = () => {
        if (chats.length !== 0) {
            showDialog({
                title: "Delete All Chats?",
                message:
                    "This will permanently delete all of your chats and cannot be undone. Are you sure you want to continue?",
                confirmButton: {
                    label: "Delete All",
                    variant: "destructive",
                    onPress: () => {
                        deleteAllChats();
                        ToastAndroid.show(
                            "Deleted all chats!",
                            ToastAndroid.SHORT,
                        );
                    },
                },
                dismissButton: {
                    label: "Cancel",
                },
            });
        } else {
            ToastAndroid.show("No chats to delete!", ToastAndroid.SHORT);
        }
    };

    const settingsSections: SettingsSection[] = [
        {
            title: "Data",
            items: [
                {
                    title: "Delete all chats",
                    description: "Permanently delete all the chats",
                    icon: "delete-bin-line",
                    onPress: () => handleDeleteAllChats(),
                },
            ],
        },
        {
            title: "General",
            items: [
                {
                    title: "Onboarding",
                    description: "View the welcome screen again",
                    icon: "compass-3-line",
                    onPress: () => setOnboarded(false),
                },
                {
                    title: "About",
                    description: "Learn more about Arctyc",
                    icon: "information-line",
                    onPress: () => router.push("/about"),
                },
            ],
        },
    ];

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />

            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 16,
                        gap: 24,
                    }}
                    style={styles.settingContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {settingsSections.map((section) => (
                        <View key={section.title} style={styles.section}>
                            <Text style={styles.title}>{section.title}</Text>

                            <View style={styles.sectionItems}>
                                {section.items.map((setting) => (
                                    <Pressable
                                        key={setting.title}
                                        style={({ pressed }) => [
                                            styles.setting,
                                            pressed && styles.settingPressed,
                                        ]}
                                        onPress={setting.onPress}
                                    >
                                        <View style={styles.settingLeft}>
                                            <View style={styles.settingIcon}>
                                                <RemixIcon
                                                    name={setting.icon}
                                                    size={FontSizes.xxl}
                                                    color={Colors.textSecondary}
                                                    fallback={null}
                                                />
                                            </View>

                                            <View style={styles.settingContent}>
                                                <Text
                                                    style={styles.settingTitle}
                                                >
                                                    {setting.title}
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.settingDescription
                                                    }
                                                >
                                                    {setting.description}
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
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default Settings;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
    },

    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderTopRightRadius: 32,
        borderTopLeftRadius: 32,
        borderWidth: 16,
        borderBottomWidth: 0,
        borderColor: Colors.surface,
        overflow: "hidden",
    },

    settingContainer: {
        flex: 1,
    },

    section: {
        gap: 8,
    },

    title: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        paddingLeft: 8,
        fontFamily: "DMSans-SemiBold",
        textTransform: "uppercase",
    },

    sectionItems: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        gap: 2,
        overflow: "hidden",
    },

    setting: {
        backgroundColor: Colors.surfaceSecondary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
        paddingRight: 12,
    },

    settingPressed: {
        filter: "brightness(0.95)",
    },

    settingLeft: {
        flex: 1,
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

    settingContent: {
        flex: 1,
    },

    settingTitle: {
        fontSize: FontSizes.md,
        color: Colors.text,
        fontFamily: "Sora-SemiBold",
    },

    settingDescription: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Regular",
    },
});
