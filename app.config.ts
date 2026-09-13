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
            package: isDevelopment
                ? "com.prateeksh.arctyc.dev"
                : isPreview
                  ? "com.prateeksh.arctyc.preview"
                  : "com.prateeksh.arctyc",
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

            [
                "expo-notifications",
                {
                    icon: "./assets/images/notification-icon.png",
                },
            ],

            "expo-background-task",
            "expo-secure-store",
            "llama.rn",

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

        extra: {
            eas: {
                projectId: "031c8d95-660c-4a3d-8e7e-c49ffd25381e",
            },
        },
    };
};
