import Header from "@/components/ui/Header";
import { Colors, FontSizes } from "@constants/theme";
import { Drawer } from "expo-router/drawer";
import Icon from "react-native-remix-icon";

export default function RootLayout() {
    return (
        <Drawer
            screenOptions={{
                drawerActiveTintColor: Colors.black,
                header: ({ options }) => <Header title={options.title ?? ""} />,
                drawerLabelStyle: {
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: FontSizes.md,
                },
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: "Arctyc",
                    drawerLabel: "Chat",
                    drawerIcon: ({ focused, color, size }) => (
                        <Icon
                            name={focused ? "message-3-fill" : "message-3-line"}
                            size={size}
                            color={color as any}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="models"
                options={{
                    title: "Models",
                    drawerLabel: "Models",
                    drawerIcon: ({ focused, color, size }) => (
                        <Icon
                            name={focused ? "stack-fill" : "stack-line"}
                            size={size}
                            color={color as any}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="settings"
                options={{
                    title: "Settings",
                    drawerLabel: "Settings",
                    drawerIcon: ({ focused, color, size }) => (
                        <Icon
                            name={
                                focused ? "settings-4-fill" : "settings-4-line"
                            }
                            size={size}
                            color={color as any}
                        />
                    ),
                }}
            />
        </Drawer>
    );
}
