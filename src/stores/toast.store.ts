import { create } from "zustand";
import type { IconName } from "react-native-remix-icon";

export type ToastVariant = "normal" | "error";

type ToastState = {
    visible: boolean;
    title: string;
    message?: string;
    variant: ToastVariant;
    duration: number;
    icon?: IconName;
    id: number;

    show: (
        title: string,
        message?: string,
        icon?: IconName,
        duration?: number
    ) => void;
    error: (
        title: string,
        message?: string,
        icon?: IconName,
        duration?: number
    ) => void;
    hideToast: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    title: "",
    message: undefined,
    variant: "normal",
    duration: 3000,
    icon: "information-line",
    id: 0,

    show: (
        title: string,
        message?: string,
        icon: IconName = "information-line",
        duration: number = 3000
    ) =>
        set({
            visible: true,
            title,
            message,
            variant: "normal",
            icon: icon || "information-line",
            duration: duration ?? 3000,
            id: Date.now(),
        }),

    error: (
        title: string,
        message?: string,
        icon: IconName = "error-warning-line",
        duration: number = 3000
    ) =>
        set({
            visible: true,
            title,
            message,
            variant: "error",
            icon: icon || "error-warning-line",
            duration: duration ?? 3000,
            id: Date.now(),
        }),

    hideToast: () =>
        set({
            visible: false,
        }),
}));

export const toast = {
    show: (
        title: string,
        message?: string,
        icon?: IconName,
        duration?: number
    ) => useToastStore.getState().show(title, message, icon, duration),
    error: (
        title: string,
        message?: string,
        icon?: IconName,
        duration?: number
    ) => useToastStore.getState().error(title, message, icon, duration),
    hide: () => useToastStore.getState().hideToast(),
};
