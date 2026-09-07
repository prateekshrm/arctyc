import { Drawer } from "expo-router/drawer";
import { Layers, MessageSquareText, Settings } from "lucide-react-native";

export default function RootLayout() {
    return (
        <Drawer
            screenOptions={{
                drawerActiveTintColor: "black",
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: "Chat",
                    drawerIcon: ({ color, size }) => (
                        <MessageSquareText size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="models"
                options={{
                    title: "Models",
                    drawerIcon: ({ color, size }) => (
                        <Layers size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="settings"
                options={{
                    title: "Settings",
                    drawerIcon: ({ color, size }) => (
                        <Settings size={size} color={color} />
                    ),
                }}
            />
        </Drawer>
    );
}
