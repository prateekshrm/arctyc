import CustomDrawer from "@/components/navigation/CustomDrawer";
import Header from "@/components/ui/Header";
import { Colors, FontSizes } from "@constants/theme";
import { Drawer } from "expo-router/drawer";
import { useWindowDimensions } from "react-native";
import Icon from "react-native-remix-icon";

export default function RootLayout() {
    const dimensions = useWindowDimensions();
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                drawerActiveTintColor: Colors.text,
                header: ({ options }) => (
                    <Header title={options.title ?? ""} inDrawer={true} />
                ),
                drawerLabelStyle: {
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: FontSizes.sm,
                },
                swipeEdgeWidth: dimensions.width,
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
