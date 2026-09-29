import { useChatStore } from "@/stores/chat.store";
import { useLayoutStore } from "@/stores/layout.store";
import { useModelStore } from "@/stores/models.store";
import { Colors, FontSizes } from "@constants/theme";
import { router, useNavigation, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderProps = {
    title: string;
    inDrawer?: boolean;
};

const Header = ({ title, inDrawer = false }: HeaderProps) => {
    const insets = useSafeAreaInsets();
    const setHeaderHeight = useLayoutStore((state) => state.setHeaderHeight);
    const activeChatId = useChatStore((state) => state.activeChatId);

    const activeModelId = useModelStore((state) => state.activeModelId);
    const models = useModelStore((state) => state.models);
    const newChat = useChatStore((state) => state.newChat);

    const setChatOptionsOpen = useLayoutStore(
        (state) => state.setChatOptionsOpen,
    );
    const chatOptionsOpen = useLayoutStore((state) => state.chatOptionsOpen);

    const activeModel = models.find((model) => model.id === activeModelId);

    const navigation = useNavigation();
    const pathname = usePathname();

    const showActiveModel = pathname === "/" && !!activeModel;

    return (
        <View
            onLayout={(e) => {
                const height = Math.round(e.nativeEvent.layout.height);
                if (height > 0) {
                    setHeaderHeight(height);
                }
            }}
            style={[
                styles.headerContainer,
                {
                    paddingTop: insets.top + 16,
                },
            ]}
        >
            <View style={styles.headerLeft}>
                <Pressable
                    style={styles.headerPillButton}
                    onPress={() => {
                        if (inDrawer) {
                            (navigation as any).openDrawer();
                        } else {
                            router.back();
                        }
                    }}
                >
                    <RemixIcon
                        name={inDrawer ? "menu-5-line" : "arrow-left-s-line"}
                        size={FontSizes.xl}
                        color={Colors.textInverse}
                    />
                </Pressable>

                {showActiveModel ? (
                    <Pressable
                        style={styles.modelPill}
                        onPress={() => router.navigate("/models")}
                    >
                        <Text style={styles.modelName} numberOfLines={1}>
                            {activeModel.name}
                        </Text>

                        <RemixIcon
                            name="arrow-right-s-line"
                            size={FontSizes.xl}
                            color={Colors.textInverse}
                        />
                    </Pressable>
                ) : (
                    <Text style={styles.text}>{title}</Text>
                )}
            </View>

            {pathname === "/" && activeChatId && (
                <View style={styles.headerRight}>
                    <Pressable
                        style={styles.headerPillButton}
                        onPress={() => newChat()}
                        hitSlop={8}
                    >
                        <RemixIcon
                            name="edit-box-line"
                            size={FontSizes.xl}
                            color={Colors.textInverse}
                        />
                    </Pressable>
                    <Pressable
                        style={styles.headerPillButton}
                        onPress={() =>
                            chatOptionsOpen
                                ? setChatOptionsOpen(false)
                                : setChatOptionsOpen(true)
                        }
                        hitSlop={8}
                    >
                        <RemixIcon
                            name={chatOptionsOpen ? "close-line" : "more-fill"}
                            size={FontSizes.xl}
                            color={Colors.textInverse}
                        />
                    </Pressable>
                </View>
            )}
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.primary,
    },

    headerPillButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
    },

    headerLeft: {
        flexDirection: "row",
        gap: 12,
    },

    headerRight: {
        flexDirection: "row",
        gap: 12,
    },

    modelPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        backgroundColor: Colors.secondary,
        paddingVertical: 6,
        paddingLeft: 14,
        paddingRight: 8,
        borderRadius: 100,
        maxWidth: "70%",
    },

    modelName: {
        fontSize: FontSizes.md,
        color: Colors.textInverse,
        fontFamily: "DMSans-Medium",
    },

    text: {
        fontSize: FontSizes.xl,
        color: Colors.textInverse,
        fontFamily: "Sora-SemiBold",
    },
});
