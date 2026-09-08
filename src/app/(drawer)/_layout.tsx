import Header from "@/components/ui/Header";
import { Drawer } from "expo-router/drawer";
import { Layers, MessageSquareText, Settings } from "lucide-react-native";

export default function RootLayout() {
    return (
        <Drawer
            screenOptions={{
                drawerActiveTintColor: "black",
                header: ({ options }) => <Header title={options.title ?? ""} />,
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: "Arctyc",
                    drawerLabel: "Chat",
                    drawerIcon: ({ color, size }) => (
                        <MessageSquareText size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="models"
                options={{
                    title: "Models",
                    drawerLabel: "Models",
                    drawerIcon: ({ color, size }) => (
                        <Layers size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="settings"
                options={{
                    title: "Settings",
                    drawerLabel: "Settings",
                    drawerIcon: ({ color, size }) => (
                        <Settings size={size} color={color} />
                    ),
                }}
            />
        </Drawer>
    );
}
