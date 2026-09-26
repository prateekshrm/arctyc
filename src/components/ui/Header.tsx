import { useChatStore } from "@/stores/chat.store";
import { useModelStore } from "@/stores/models.store";
import { Colors, FontSizes } from "@constants/theme";
import { router, useNavigation, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderProps = {
    title: string;
};

const Header = ({ title }: HeaderProps) => {
    const insets = useSafeAreaInsets();
    const activeChatId = useChatStore((state) => state.activeChatId);

    const activeModelId = useModelStore((state) => state.activeModelId);
    const models = useModelStore((state) => state.models);
    const newChat = useChatStore((state) => state.newChat);

    const activeModel = models.find((model) => model.id === activeModelId);

    const navigation = useNavigation();
    const pathname = usePathname();

    const showActiveModel = pathname === "/" && !!activeModel;

    return (
        <View
            style={[
                styles.headerContainer,
                {
                    paddingTop: insets.top + 16,
                },
            ]}
        >
            <Pressable
                style={styles.menuButton}
                onPress={() => (navigation as any).openDrawer()}
            >
                <Icon name="menu-2-line" size={20} color={Colors.textInverse} />
            </Pressable>

            {showActiveModel ? (
                <Pressable
                    style={styles.modelPill}
                    onPress={() => router.navigate("/models")}
                >
                    <Text style={styles.modelName} numberOfLines={1}>
                        {activeModel.name}
                    </Text>

                    <Icon
                        name="arrow-right-s-line"
                        size={FontSizes.xl}
                        color={Colors.textInverse}
                    />
                </Pressable>
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}

            {pathname === "/" && activeChatId && (
                <Pressable
                    style={styles.newChatButton}
                    onPress={() => newChat()}
                    hitSlop={8}
                >
                    <Icon
                        name="edit-box-line"
                        size={20}
                        color={Colors.textInverse}
                    />
                </Pressable>
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
        gap: 12,
        backgroundColor: Colors.primary,
    },

    menuButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
    },

    newChatButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 100,
        marginLeft: "auto",
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
        fontFamily: "PlusJakartaSans-SemiBold",
    },
});
