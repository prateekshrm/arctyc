import { MODEL_CATALOG } from "@/data/models";
import { create } from "zustand";

type ModelStatus =
    | "available"
    | "downloading"
    | "downloaded"
    | "loading"
    | "loaded"
    | "error";

type Model = {
    id: string;
    name: string;
    size: number;
    status: ModelStatus;
    downloadProgress?: number;
    localPath?: string;
    error?: string;
};

type ModelStore = {
    models: Model[];
    activeModelId: string | null;
    isModelLoading: boolean;

    setActiveModel: (id: string | null) => void;
    updateModel: (id: string, updates: Partial<Model>) => void;
    addModel: (model: Model) => void;
    removeModel: (id: string) => void;
};

const models: Model[] = MODEL_CATALOG.map((model) => ({
    id: model.id,
    name: model.name,
    size: model.sizeBytes,
    status: "available",
}));

export const useModelStore = create<ModelStore>((set) => ({
    models,
    activeModelId: null,
    isModelLoading: false,

    setActiveModel: (id) =>
        set({
            activeModelId: id,
        }),

    updateModel: (id, updates) =>
        set((state) => ({
            models: state.models.map((model) =>
                model.id === id ? { ...model, ...updates } : model,
            ),
        })),

    addModel: (model) =>
        set((state) => ({
            models: [...state.models, model],
        })),

    removeModel: (id) =>
        set((state) => ({
            models: state.models.filter((model) => model.id !== id),
            activeModelId:
                state.activeModelId === id ? null : state.activeModelId,
        })),
}));
