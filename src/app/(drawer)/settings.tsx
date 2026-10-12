import { useChatStore } from "@/stores/chat.store";
import { useDialogStore } from "@/stores/dialog.store";
import { usePreferencesStore } from "@/stores/preferences.store";
import { toast } from "@/stores/toast.store";
import { haptics } from "@/utils/haptics";
import { Colors, FontSizes } from "@constants/theme";
import { Host, Switch } from "@expo/ui";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavigationSettingItem = {
    type?: "navigation";
    title: string;
    description: string;
    icon: IconName;
    onPress: () => void;
};

type SwitchSettingItem = {
    type: "switch";
    title: string;
    description: string;
    icon: IconName;
    value: boolean;
    onValueChange: (value: boolean) => void;
};

type SettingItem = NavigationSettingItem | SwitchSettingItem;

type SettingsSection = {
    title: string;
    items: SettingItem[];
};

const Settings = () => {
    const insets = useSafeAreaInsets();

    const setOnboarded = usePreferencesStore((state) => state.setOnboarded);
    const hapticsEnabled = usePreferencesStore(
        (state) => state.preferences.hapticsEnabled ?? true,
    );
    const setHapticsEnabled = usePreferencesStore(
        (state) => state.setHapticsEnabled,
    );
    const showDialog = useDialogStore((state) => state.showDialog);
    const chats = useChatStore((state) => state.chats);
    const deleteAllChats = useChatStore((state) => state.deleteAllChats);

    const handleHapticsToggle = async (value: boolean) => {
        await setHapticsEnabled(value);
        if (value) {
            haptics.lightImpact();
        }
    };

    const handleDeleteAllChats = () => {
        if (chats.length !== 0) {
            showDialog({
                title: "Delete All Chats?",
                message:
                    "This will permanently delete all of your chats and cannot be undone. Are you sure you want to continue?",
                confirmButton: {
                    label: "Delete All",
                    variant: "destructive",
                    onPress: async () => {
                        await deleteAllChats();
                        haptics.mediumImpact();
                        toast.show(
                            "Chats deleted",
                            "All chats have been permanently deleted",
                            "delete-bin-line",
                        );
                    },
                },
                dismissButton: {
                    label: "Cancel",
                },
            });
        } else {
            toast.show(
                "No chats to delete",
                "You don't have any chats yet",
                "chat-delete-line",
            );
        }
    };

    const settingsSections: SettingsSection[] = [
        {
            title: "Preferences",
            items: [
                {
                    type: "switch",
                    title: "Haptic feedback",
                    description: "Vibrate on interactions",
                    icon: "volume-vibrate-line",
                    value: hapticsEnabled,
                    onValueChange: handleHapticsToggle,
                },
            ],
        },
        {
            title: "Data",
            items: [
                {
                    type: "navigation",
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
                    type: "navigation",
                    title: "Onboarding",
                    description: "View the welcome screen again",
                    icon: "compass-3-line",
                    onPress: () => setOnboarded(false),
                },
                {
                    type: "navigation",
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
                                {section.items.map((setting) => {
                                    if (setting.type === "switch") {
                                        return (
                                            <Pressable
                                                key={setting.title}
                                                style={({ pressed }) => [
                                                    styles.setting,
                                                    pressed &&
                                                        styles.settingPressed,
                                                ]}
                                                onPress={() =>
                                                    setting.onValueChange(
                                                        !setting.value,
                                                    )
                                                }
                                            >
                                                <View
                                                    style={styles.settingLeft}
                                                >
                                                    <View
                                                        style={
                                                            styles.settingIcon
                                                        }
                                                    >
                                                        <RemixIcon
                                                            name={setting.icon}
                                                            size={FontSizes.xxl}
                                                            color={
                                                                Colors.textSecondary
                                                            }
                                                            fallback={null}
                                                        />
                                                    </View>

                                                    <View
                                                        style={
                                                            styles.settingContent
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.settingTitle
                                                            }
                                                        >
                                                            {setting.title}
                                                        </Text>

                                                        <Text
                                                            style={
                                                                styles.settingDescription
                                                            }
                                                        >
                                                            {
                                                                setting.description
                                                            }
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Host matchContents>
                                                    <Switch
                                                        value={setting.value}
                                                        onValueChange={
                                                            setting.onValueChange
                                                        }
                                                    />
                                                </Host>
                                            </Pressable>
                                        );
                                    }

                                    return (
                                        <Pressable
                                            key={setting.title}
                                            style={({ pressed }) => [
                                                styles.setting,
                                                pressed &&
                                                    styles.settingPressed,
                                            ]}
                                            onPress={setting.onPress}
                                        >
                                            <View style={styles.settingLeft}>
                                                <View
                                                    style={styles.settingIcon}
                                                >
                                                    <RemixIcon
                                                        name={setting.icon}
                                                        size={FontSizes.xxl}
                                                        color={
                                                            Colors.textSecondary
                                                        }
                                                        fallback={null}
                                                    />
                                                </View>

                                                <View
                                                    style={
                                                        styles.settingContent
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.settingTitle
                                                        }
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
                                    );
                                })}
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
