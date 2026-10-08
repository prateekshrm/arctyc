import { Colors, FontSizes } from "@/constants/theme";
import { ToastVariant, useToastStore } from "@/stores/toast.store";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type VariantConfig = {
    icon: IconName;
    circleBg: string;
    iconColor: string;
};

const VARIANT_CONFIGS: Record<ToastVariant, VariantConfig> = {
    error: {
        icon: "error-warning-line",
        circleBg: "#910000",
        iconColor: "#FFFFFF",
    },
    normal: {
        icon: "information-line",
        circleBg: "#27272A",
        iconColor: "#FFFFFF",
    },
};

export default function Toast() {
    const insets = useSafeAreaInsets();
    const { visible, title, message, variant, duration, icon, id, hideToast } =
        useToastStore();

    const [isRendered, setIsRendered] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const translateY = useSharedValue(-150);
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const finishDismiss = useCallback(() => {
        setIsRendered(false);
        hideToast();
    }, [hideToast]);

    const handleDismiss = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        translateY.value = withTiming(-150, { duration: 220 }, (finished) => {
            if (finished) {
                runOnJS(finishDismiss)();
            }
        });
        opacity.value = withTiming(0, { duration: 180 });
    }, [finishDismiss, opacity, translateY]);

    useEffect(() => {
        if (visible) {
            setIsRendered(true);

            // Animate in from top
            translateY.value = -150;
            translateY.value = withSpring(0, {
                damping: 18,
                stiffness: 180,
                mass: 0.8,
            });
            opacity.value = withTiming(1, { duration: 160 });

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                handleDismiss();
            }, duration);
        } else if (isRendered) {
            handleDismiss();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [visible, id, duration, handleDismiss, isRendered, opacity, translateY]);

    if (!isRendered && !visible) {
        return null;
    }

    const currentConfig = VARIANT_CONFIGS[variant] ?? VARIANT_CONFIGS.normal;
    const resolvedIconName = (icon as IconName) || currentConfig.icon;
    const topOffset = insets.top + 16;

    return (
        <View
            style={[styles.wrapper, { top: topOffset }]}
            pointerEvents="box-none"
        >
            <Animated.View style={[styles.animatedContainer, animatedStyle]}>
                <Pressable
                    style={({ pressed }) => [
                        styles.toastCard,
                        pressed && styles.toastCardPressed,
                        {
                            borderColor: currentConfig.circleBg,
                        },
                    ]}
                    onPress={handleDismiss}
                >
                    {/* Circle icon container on the left */}
                    <View
                        style={[
                            styles.iconCircle,
                            { backgroundColor: currentConfig.circleBg },
                        ]}
                    >
                        <RemixIcon
                            name={resolvedIconName}
                            size={18}
                            color={currentConfig.iconColor}
                        />
                    </View>

                    {/* Text and subtext in 1 view on the right */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>
                            {title}
                        </Text>
                        {Boolean(message) && (
                            <Text style={styles.message} numberOfLines={2}>
                                {message}
                            </Text>
                        )}
                    </View>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 999999,
        alignItems: "center",
        paddingHorizontal: 16,
    },
    animatedContainer: {
        width: "100%",
        alignItems: "center",
    },
    toastCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderRadius: 9999,
        padding: 8,
        gap: 10,
        width: "100%",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 12,
    },
    toastCardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
        paddingRight: 6,
    },
    title: {
        fontFamily: "Sora-SemiBold",
        fontSize: FontSizes.sm,
        color: Colors.white,
        letterSpacing: -0.2,
    },
    message: {
        fontFamily: "DMSans-Regular",
        fontSize: FontSizes.xs,
        color: "#A1A1AA",
        marginTop: 1,
        lineHeight: 16,
    },
});
