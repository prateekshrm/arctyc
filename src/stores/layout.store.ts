import { create } from "zustand";

type LayoutStore = {
    headerHeight: number;
    setHeaderHeight: (height: number) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
    headerHeight: 0,
    setHeaderHeight: (headerHeight: number) => set({ headerHeight }),
}));
