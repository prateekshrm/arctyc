import { useChatStore } from "@/stores/chat.store";
import { useDialogStore } from "@/stores/dialog.store";
import { Colors, FontSizes } from "@constants/theme";
import { router, usePathname } from "expo-router";
import { DrawerContentComponentProps } from "expo-router/drawer";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomDrawer(props: DrawerContentComponentProps) {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();

    const chats = useChatStore((state) => state.chats);
    const activeChatId = useChatStore((state) => state.activeChatId);
    const loadChats = useChatStore((state) => state.loadChats);
    const setActiveChatId = useChatStore((state) => state.setActiveChatId);
    const newChat = useChatStore((state) => state.newChat);
    const deleteChat = useChatStore((state) => state.deleteChat);

    const showDialog = useDialogStore((state) => state.showDialog);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    const handleNewChat = () => {
        newChat();
        if (pathname !== "/") {
            router.navigate("/");
        }
        props.navigation.closeDrawer();
    };

    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);
        if (pathname !== "/") {
            router.navigate("/");
        }
        props.navigation.closeDrawer();
    };

    const handleDeleteChat = (chatId: string, chatTitle: string) => {
        showDialog({
            title: "Delete Chat",
            message: `Are you sure you want to delete "${chatTitle}"?`,
            confirmButton: {
                label: "Delete",
                variant: "destructive",
                onPress: () => deleteChat(chatId),
            },
            dismissButton: {
                label: "Cancel",
            },
        });
    };

    return (
        <View style={styles.mainContainer}>
            {/* Header Branding */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 16,
                    },
                ]}
            >
                <Text style={styles.brandTitle}>Arctyc</Text>
                <Pressable
                    style={styles.menuCloseButton}
                    onPress={() => props.navigation.closeDrawer()}
                >
                    <Icon
                        name="close-line"
                        size={20}
                        color={Colors.textInverse}
                    />
                </Pressable>
            </View>
            <View style={styles.container}>
                <ScrollView
                    {...props}
                    style={styles.drawerContainer}
                    contentContainerStyle={styles.drawerContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.newChatButton,
                            pressed && styles.pressed,
                        ]}
                        onPress={handleNewChat}
                    >
                        <Icon
                            name="edit-box-line"
                            size={FontSizes.xl}
                            color={Colors.text}
                        />
                        <Text style={styles.newChatText}>New Chat</Text>
                    </Pressable>

                    {/* Chat History Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent</Text>
                    </View>

                    {chats.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTextHead}>
                                No saved chats
                            </Text>
                            <Text style={styles.emptyTextDescription}>
                                Recent chats will appear here so you can
                                continue them later
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.chatList}>
                            {chats.map((chat) => {
                                const isActive =
                                    pathname === "/" &&
                                    activeChatId === chat.id;

                                return (
                                    <View
                                        key={chat.id}
                                        style={[
                                            styles.chatItemRow,
                                            isActive &&
                                                styles.activeChatItemRow,
                                        ]}
                                    >
                                        <Pressable
                                            style={styles.chatItemContent}
                                            onPress={() =>
                                                handleSelectChat(chat.id)
                                            }
                                        >
                                            <Icon
                                                name="message-3-line"
                                                size={18}
                                                color={
                                                    isActive
                                                        ? Colors.text
                                                        : Colors.textSecondary
                                                }
                                            />
                                            <Text
                                                style={[
                                                    styles.chatTitle,
                                                    isActive &&
                                                        styles.activeChatTitle,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {chat.title}
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            style={styles.deleteButton}
                                            hitSlop={8}
                                            onPress={() =>
                                                handleDeleteChat(
                                                    chat.id,
                                                    chat.title,
                                                )
                                            }
                                        >
                                            <Icon
                                                name="delete-bin-line"
                                                size={16}
                                                color={Colors.muted}
                                            />
                                        </Pressable>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </View>
            {/* Bottom Navigation */}
            <View
                style={[
                    styles.footer,
                    {
                        paddingBottom: insets.bottom + 16,
                    },
                ]}
            >
                <Pressable
                    style={({ pressed }) => [
                        styles.navItem,
                        pathname === "/models" && styles.activeNavItem,
                        pressed && styles.pressed,
                    ]}
                    onPress={() => {
                        router.navigate("/models");
                        props.navigation.closeDrawer();
                    }}
                >
                    <Icon
                        name={
                            pathname === "/models" ? "stack-fill" : "stack-line"
                        }
                        size={20}
                        color={Colors.text}
                    />
                    <Text style={styles.navItemText}>Models</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.navItem,
                        pathname === "/settings" && styles.activeNavItem,
                        pressed && styles.pressed,
                    ]}
                    onPress={() => {
                        router.navigate("/settings");
                        props.navigation.closeDrawer();
                    }}
                >
                    <Icon
                        name={
                            pathname === "/settings"
                                ? "settings-4-fill"
                                : "settings-4-line"
                        }
                        size={20}
                        color={Colors.text}
                    />
                    <Text style={styles.navItemText}>Settings</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: Colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    brandTitle: {
        fontSize: FontSizes.xl,
        fontFamily: "PlusJakartaSans-SemiBold",
        color: Colors.textInverse,
    },
    menuCloseButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderTopRightRadius: 32,
        borderTopLeftRadius: 32,
        borderWidth: 16,
        borderColor: Colors.surface,
        overflow: "hidden",
    },
    drawerContainer: {
        flex: 1,
    },
    drawerContentContainer: {
        flexGrow: 1,
    },
    newChatButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: Colors.surfaceSecondary,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        marginBottom: 20,
    },
    newChatText: {
        fontSize: FontSizes.sm,
        fontFamily: "DMSans-SemiBold",
        color: Colors.text,
    },
    sectionHeader: {
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: FontSizes.xs,
        fontFamily: "PlusJakartaSans-SemiBold",
        color: Colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    emptyContainer: {
        paddingTop: 8,
        paddingLeft: 8,
    },
    emptyTextHead: {
        fontSize: FontSizes.lg,
        color: Colors.text,
        fontFamily: "DMSans-Medium",
    },
    emptyTextDescription: {
        marginTop: 4,
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
        fontFamily: "DMSans-Regular",
    },
    chatList: {
        gap: 4,
    },
    chatItemRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 10,
        overflow: "hidden",
    },
    activeChatItemRow: {
        backgroundColor: Colors.surfaceSecondary,
    },
    chatItemContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
        marginRight: 6,
    },
    chatTitle: {
        fontSize: FontSizes.sm,
        fontFamily: "DMSans-Medium",
        color: Colors.textSecondary,
        flex: 1,
    },
    activeChatTitle: {
        color: Colors.text,
        fontFamily: "DMSans-SemiBold",
    },
    deleteButton: {
        padding: 4,
        borderRadius: 6,
    },
    footer: {
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 16,
        paddingHorizontal: 16,
        gap: 4,
    },
    navItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
    },
    activeNavItem: {
        backgroundColor: Colors.surfaceSecondary,
    },
    navItemText: {
        fontSize: FontSizes.sm,
        fontFamily: "DMSans-SemiBold",
        color: Colors.text,
    },
    pressed: {
        opacity: 0.7,
    },
});
