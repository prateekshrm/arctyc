import { Colors, FontSizes } from "@/constants/theme";
import { AlertDialog, Host, Text, TextButton } from "@expo/ui/jetpack-compose";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useDialogStore } from "../../stores/dialog.store";

export default function Dialog() {
    const {
        visible,
        title,
        message,
        confirmButton,
        dismissButton,
        hideDialog,
    } = useDialogStore();

    const handleConfirm = async () => {
        hideDialog();

        await confirmButton?.onPress?.();
    };

    const handleDismiss = async () => {
        hideDialog();

        await dismissButton?.onPress?.();
    };

    useEffect(() => {
        if (Platform.OS === "ios" && visible) {
            const buttons = [];

            if (dismissButton) {
                buttons.push({
                    text: dismissButton.label,
                    onPress: handleDismiss,
                });
            }

            if (confirmButton) {
                buttons.push({
                    text: confirmButton.label,
                    onPress: handleConfirm,
                });
            }

            if (buttons.length === 0) {
                buttons.push({
                    text: "OK",
                    onPress: hideDialog,
                });
            }

            Alert.alert(title, message, buttons);
        }
    }, [visible, title, message, confirmButton, dismissButton]);

    if (Platform.OS !== "android" || !visible) {
        return null;
    }

    return (
        <Host matchContents>
            <AlertDialog
                colors={{
                    containerColor: Colors.surface,
                    titleContentColor: Colors.text,
                    textContentColor: Colors.textSecondary,
                }}
                onDismissRequest={hideDialog}
            >
                <AlertDialog.Title>
                    <Text
                        style={{
                            fontSize: FontSizes.lg,
                            fontFamily: "Sora-SemiBold",
                        }}
                    >
                        {title}
                    </Text>
                </AlertDialog.Title>

                {message && (
                    <AlertDialog.Text>
                        <Text
                            style={{
                                fontSize: FontSizes.sm,
                                fontFamily: "DMSans-Regular",
                            }}
                        >
                            {message}
                        </Text>
                    </AlertDialog.Text>
                )}

                {confirmButton && (
                    <AlertDialog.ConfirmButton>
                        <TextButton
                            colors={{
                                containerColor:
                                    confirmButton.variant === "destructive"
                                        ? Colors.error
                                        : Colors.primary,
                                contentColor: Colors.textInverse,
                            }}
                            onClick={handleConfirm}
                        >
                            <Text
                                style={{
                                    fontSize: FontSizes.sm,
                                    fontFamily: "DMSans-Medium",
                                }}
                            >
                                {confirmButton.label}
                            </Text>
                        </TextButton>
                    </AlertDialog.ConfirmButton>
                )}

                {dismissButton && (
                    <AlertDialog.DismissButton>
                        <TextButton
                            colors={{
                                contentColor: Colors.text,
                            }}
                            onClick={handleDismiss}
                        >
                            <Text
                                style={{
                                    fontSize: FontSizes.sm,
                                    fontFamily: "DMSans-Medium",
                                }}
                            >
                                {dismissButton.label}
                            </Text>
                        </TextButton>
                    </AlertDialog.DismissButton>
                )}
            </AlertDialog>
        </Host>
    );
}
