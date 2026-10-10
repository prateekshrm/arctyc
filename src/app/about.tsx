import { Colors, FontSizes } from "@/constants/theme";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as Application from "expo-application";
import * as Linking from "expo-linking";

const APP_NAME = "Arctyc";

const AUTHOR = {
    name: "Prateek Sharma",
    bio: "Software Developer",
    portfolio: "https://pratk.in",
    github: "https://github.com/prateekshrm",
};

const REPOSITORY_URL = "https://github.com/prateekshrm/arctyc";

const About = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />

            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.contentContainer,
                        {
                            paddingBottom: insets.bottom + 16,
                        },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* App Header */}
                    <View style={styles.appHeader}>
                        <Image
                            source={require("@/assets/images/splash-icon.png")}
                            style={styles.appIcon}
                        />

                        <Text style={styles.appName}>{APP_NAME}</Text>

                        <View style={styles.versionPill}>
                            <Text style={styles.versionText}>
                                Version {Application.nativeApplicationVersion}
                            </Text>
                        </View>

                        <Text style={styles.appDescription}>
                            Private, offline AI on your device.
                        </Text>
                    </View>

                    {/* Links */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Project</Text>

                        <View style={styles.card}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.linkItem,
                                    pressed && styles.linkItemPressed,
                                ]}
                                onPress={() => Linking.openURL(REPOSITORY_URL)}
                            >
                                <View style={styles.linkIcon}>
                                    <RemixIcon
                                        name="github-fill"
                                        size={FontSizes.xxl}
                                        color={Colors.textSecondary}
                                    />
                                </View>

                                <View style={styles.linkContent}>
                                    <Text style={styles.linkTitle}>GitHub</Text>

                                    <Text style={styles.linkDescription}>
                                        View the source code
                                    </Text>
                                </View>

                                <RemixIcon
                                    name="arrow-right-s-line"
                                    size={FontSizes.xl}
                                    color={Colors.text}
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* Author */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Author</Text>

                        <View style={styles.authorCard}>
                            <Image
                                source={require("@/assets/profile.png")}
                                style={styles.avatar}
                            />

                            <View style={styles.authorContent}>
                                <Text style={styles.authorName}>
                                    {AUTHOR.name}
                                </Text>

                                <Text style={styles.authorBio}>
                                    {AUTHOR.bio}
                                </Text>

                                <View style={styles.authorLinks}>
                                    <Pressable
                                        style={styles.authorLink}
                                        onPress={() =>
                                            Linking.openURL(AUTHOR.portfolio)
                                        }
                                    >
                                        <RemixIcon
                                            name="global-line"
                                            size={FontSizes.md}
                                            color={Colors.textSecondary}
                                        />

                                        <Text
                                            style={styles.authorLinkText}
                                            numberOfLines={1}
                                        >
                                            pratk.in
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={styles.authorLink}
                                        onPress={() =>
                                            Linking.openURL(AUTHOR.github)
                                        }
                                    >
                                        <RemixIcon
                                            name="github-fill"
                                            size={FontSizes.md}
                                            color={Colors.textSecondary}
                                        />

                                        <Text style={styles.authorLinkText}>
                                            @prateekshrm
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Built with React Native and a focus on
                            privacy-first, on-device AI.
                        </Text>

                        <View style={styles.copyright}>
                            <RemixIcon
                                name="copyright-line"
                                size={FontSizes.xl}
                                color={Colors.textSecondary}
                                fallback={null}
                            />
                            <Text style={styles.copyrightText}>
                                {new Date().getFullYear()} {AUTHOR.name}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default About;

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

    scrollView: {
        flex: 1,
    },

    contentContainer: {
        gap: 24,
    },

    // App header

    appHeader: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 8,
    },

    appIcon: {
        width: 88,
        height: 88,
        marginBottom: 14,
    },

    appName: {
        fontSize: FontSizes.xxl,
        color: Colors.text,
        fontFamily: "Sora-SemiBold",
    },

    versionPill: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: Colors.surfaceSecondary,
    },

    versionText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Medium",
    },

    appDescription: {
        marginTop: 12,
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Regular",
        textAlign: "center",
    },

    // Sections

    section: {
        gap: 8,
    },

    sectionTitle: {
        paddingLeft: 8,
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-SemiBold",
        textTransform: "uppercase",
    },

    // Project links

    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        gap: 2,
        overflow: "hidden",
    },

    linkItem: {
        backgroundColor: Colors.surfaceSecondary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
        paddingRight: 12,
    },

    linkItemPressed: {
        filter: "brightness(0.95)",
    },

    linkIcon: {
        width: 48,
        height: 48,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.surface,
    },

    linkContent: {
        flex: 1,
        marginLeft: 10,
    },

    linkTitle: {
        fontSize: FontSizes.md,
        color: Colors.text,
        fontFamily: "Sora-SemiBold",
    },

    linkDescription: {
        marginTop: 1,
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Regular",
    },

    // Author

    authorCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 12,
        borderRadius: 16,
        backgroundColor: Colors.surfaceSecondary,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 999,
    },

    authorContent: {
        flex: 1,
        marginLeft: 12,
    },

    authorName: {
        fontSize: FontSizes.md,
        color: Colors.text,
        fontFamily: "Sora-SemiBold",
    },

    authorBio: {
        marginTop: 1,
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Regular",
    },

    authorLinks: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 10,
    },

    authorLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    authorLinkText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Medium",
    },

    // Footer

    footer: {
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 4,
    },

    footerText: {
        maxWidth: 300,
        textAlign: "center",
        lineHeight: 20,
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Regular",
    },

    copyright: {
        marginTop: 12,
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        fontFamily: "DMSans-Medium",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },

    copyrightText: {
        fontFamily: "DMSans-Medium",
        color: Colors.textSecondary,
    },
});
