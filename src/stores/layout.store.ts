import { create } from "zustand";

type LayoutStore = {
    headerHeight: number;
    setHeaderHeight: (height: number) => void;
    chatOptionsOpen: boolean;
    setChatOptionsOpen: (value: boolean) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
    headerHeight: 0,
    setHeaderHeight: (headerHeight: number) => set({ headerHeight }),
    chatOptionsOpen: false,
    setChatOptionsOpen: (value: boolean) => set({ chatOptionsOpen: value }),
}));
