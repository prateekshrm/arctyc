import { MODEL_CATALOG, ModelDefinition } from "@/data/models";
import { create } from "zustand";

export type ModelStatus =
    | "available"
    | "downloading"
    | "downloaded"
    | "loading"
    | "loaded"
    | "error";

export type Model = ModelDefinition & {
    status: ModelStatus;
    downloadProgress?: number;
    localPath?: string;
    error?: string;
};

export type ModelStore = {
    models: Model[];
    activeModelId: string | null;
    isModelLoading: boolean;

    setModels: (models: Model[]) => void;
    setActiveModel: (id: string | null) => void;
    setIsModelLoading: (loading: boolean) => void;
    updateModel: (id: string, updates: Partial<Model>) => void;
    addModel: (model: Model) => void;
    removeModel: (id: string) => void;
};

const initialModels: Model[] = MODEL_CATALOG.map((model) => ({
    ...model,
    status: "available",
}));

export const useModelStore = create<ModelStore>((set) => ({
    models: initialModels,
    activeModelId: null,
    isModelLoading: false,

    setModels: (models) =>
        set({
            models,
        }),

    setActiveModel: (id) =>
        set({
            activeModelId: id,
        }),

    setIsModelLoading: (loading) =>
        set({
            isModelLoading: loading,
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
