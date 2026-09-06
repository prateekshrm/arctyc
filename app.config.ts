import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => {
    const profile = process.env.EAS_BUILD_PROFILE;

    const isDevelopment = profile === "development";
    const isPreview = profile === "preview";

    return {
        name: isDevelopment
            ? "Arctyc (Dev)"
            : isPreview
              ? "Arctyc (Preview)"
              : "Arctyc",

        slug: "arctyc",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "arctyc",
        userInterfaceStyle: "automatic",

        ios: {
            icon: "./assets/expo.icon",
        },

        android: {
            adaptiveIcon: {
                backgroundColor: "#FFFFFF",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png",
            },
            predictiveBackGestureEnabled: false,
        },

        web: {
            output: "static",
            favicon: "./assets/images/favicon.png",
        },

        plugins: [
            "expo-router",

            [
                "expo-splash-screen",
                {
                    backgroundColor: "#FFFFFF",
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 76,
                },
            ],

            "expo-background-task",
            "expo-secure-store",

            [
                "llama.rn",
                {
                    enableEntitlements: true,
                    entitlementsProfile: "production",
                    forceCxx20: true,
                    enableOpenCL: true,
                },
            ],

            [
                "expo-build-properties",
                {
                    android: {
                        enableMinifyInReleaseBuilds: true,
                        enableShrinkResourcesInReleaseBuilds: true,
                    },
                },
            ],
        ],

        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },
    };
};
