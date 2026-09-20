import { useModelStore } from "@/stores/models.store";
import { Colors, FontSizes } from "@constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router, useNavigation, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderProps = {
    title: string;
};

const Header = ({ title }: HeaderProps) => {
    const insets = useSafeAreaInsets();

    const activeModelId = useModelStore((state) => state.activeModelId);
    const models = useModelStore((state) => state.models);

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
            <LinearGradient
                colors={[
                    "rgba(255, 255, 255, 0.9)",
                    "rgba(255, 255, 255, 0.7)",
                    "transparent",
                ]}
                locations={[0.3, 0.5, 1]}
                style={{
                    ...StyleSheet.absoluteFill,
                    height: "400%",
                }}
                pointerEvents="none"
            />

            <Pressable
                style={styles.menuButton}
                onPress={() => (navigation as any).openDrawer()}
            >
                <Icon name="menu-2-line" size={20} color={Colors.text} />
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
                        color={Colors.text}
                    />
                </Pressable>
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    headerContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },

    menuButton: {
        backgroundColor: Colors.buttonSecondary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
    },

    modelPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        backgroundColor: Colors.buttonSecondary,
        paddingVertical: 6,
        paddingLeft: 14,
        paddingRight: 8,
        borderRadius: 100,
        maxWidth: "70%",
    },

    modelName: {
        fontSize: FontSizes.md,
        color: Colors.text,
        fontFamily: "DMSans-Medium",
    },

    text: {
        fontSize: FontSizes.xl,
        color: Colors.text,
        fontFamily: "PlusJakartaSans-SemiBold",
    },
});
