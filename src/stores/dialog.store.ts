import { create } from "zustand";

export type DialogButton = {
    label: string;
    onPress?: () => void | Promise<void>;
    variant?: "confirm" | "destructive";
};

export type ShowDialogParams = {
    title: string;
    message?: string;
    confirmButton?: DialogButton;
    dismissButton?: DialogButton;
};

type DialogState = {
    visible: boolean;
    title: string;
    message?: string;
    confirmButton?: DialogButton;
    dismissButton?: DialogButton;

    showDialog: (params: ShowDialogParams) => void;
    hideDialog: () => void;
};

export const useDialogStore = create<DialogState>((set) => ({
    visible: false,
    title: "",
    message: undefined,
    confirmButton: undefined,
    dismissButton: undefined,

    showDialog: ({ title, message, confirmButton, dismissButton }) =>
        set({
            visible: true,
            title,
            message,
            confirmButton,
            dismissButton,
        }),

    hideDialog: () =>
        set({
            visible: false,
            title: "",
            message: undefined,
            confirmButton: undefined,
            dismissButton: undefined,
        }),
}));
