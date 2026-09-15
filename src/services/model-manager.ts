import { llama } from "@react-native-ai/llama";
import { Directory, DownloadTask, File, Paths } from "expo-file-system";

import { useModelStore } from "@/stores/models.store";

const activeDownloadTasks = new Map<string, DownloadTask>();
const cancelledDownloadIds = new Set<string>();
let activeLanguageModel: ReturnType<typeof llama.languageModel> | null = null;

export function getActiveLanguageModel() {
    return activeLanguageModel;
}

function getModelById(id: string) {
    const model = useModelStore
        .getState()
        .models.find((model) => model.id === id);

    if (!model) {
        throw new Error(`Model "${id}" not found in model store.`);
    }

    return model;
}

function parseModelId(modelId: string) {
    const parts = modelId.split("/");
    if (parts.length < 3) {
        throw new Error(
            `Invalid model ID format: "${modelId}". Expected format: "owner/repo/filename.gguf"`,
        );
    }
    const filename = parts.pop()!;
    const repo = parts.join("/");
    return { repo, filename };
}

function getModelsDirectory(): Directory {
    const dir = new Directory(Paths.document, "llama-models");
    if (!dir.exists) {
        dir.create({ intermediates: true, idempotent: true });
    }
    return dir;
}

function getModelFiles(modelId: string) {
    const { repo, filename } = parseModelId(modelId);
    const modelsDir = getModelsDirectory();
    const targetFile = new File(modelsDir, filename);
    const tempFile = new File(modelsDir, `${filename}.downloading`);
    return { repo, filename, targetFile, tempFile };
}

export async function checkModel(id: string) {
    const model = getModelById(id);
    const { targetFile } = getModelFiles(model.modelId);

    let isValid = false;

    try {
        if (targetFile.exists) {
            const size = targetFile.size;

            // Verify file has non-zero size and is at least 90% of catalog size
            if (size > 0 && size >= model.sizeBytes * 0.9) {
                isValid = true;
            } else {
                // Incomplete or corrupted file from previous interrupted download, clean it up
                targetFile.delete();
            }
        }
    } catch {
        try {
            if (targetFile.exists) {
                targetFile.delete();
            }
        } catch {}
    }

    const localPath = targetFile.uri.replace(/^file:\/\//, "");
    const store = useModelStore.getState();
    const currentModel = store.models.find((m) => m.id === id);
    const isCurrentlyLoaded =
        currentModel?.status === "loaded" && store.activeModelId === id;
    const isCurrentlyLoading = currentModel?.status === "loading";

    store.updateModel(id, {
        status: isValid
            ? isCurrentlyLoaded
                ? "loaded"
                : isCurrentlyLoading
                  ? "loading"
                  : "downloaded"
            : "available",
        localPath: isValid ? localPath : undefined,
        downloadProgress: isValid ? 1 : undefined,
    });

    return isValid;
}

export async function downloadModel(id: string) {
    const model = getModelById(id);
    const store = useModelStore.getState();
    const { repo, filename, targetFile, tempFile } = getModelFiles(
        model.modelId,
    );

    // Check if already validly downloaded
    const alreadyDownloaded = await checkModel(id);
    if (alreadyDownloaded) {
        return targetFile.uri.replace(/^file:\/\//, "");
    }

    // Cancel any existing download task for this model
    if (activeDownloadTasks.has(id)) {
        await cancelDownload(id);
    }

    cancelledDownloadIds.delete(id);

    // Ensure any stale temp file is removed
    try {
        if (tempFile.exists) {
            tempFile.delete();
        }
    } catch {}

    store.updateModel(id, {
        status: "downloading",
        downloadProgress: 0,
        error: undefined,
    });

    try {
        const url = `https://huggingface.co/${repo}/resolve/main/${filename}?download=true`;

        let lastProgressTime = 0;
        let lastProgressVal = 0;

        const task = new DownloadTask(url, tempFile, {
            onProgress: ({ bytesWritten, totalBytes }) => {
                if (cancelledDownloadIds.has(id)) return;
                const total = totalBytes > 0 ? totalBytes : model.sizeBytes;
                const progress = Math.min(1, Math.max(0, bytesWritten / total));
                const now = Date.now();

                // Throttle progress events to prevent saturating JS event loop
                if (
                    now - lastProgressTime >= 150 ||
                    progress - lastProgressVal >= 0.015 ||
                    progress >= 0.999
                ) {
                    lastProgressTime = now;
                    lastProgressVal = progress;
                    useModelStore.getState().updateModel(id, {
                        downloadProgress: progress,
                    });
                }
            },
        });

        activeDownloadTasks.set(id, task);

        const resultFile = await task.downloadAsync();
        activeDownloadTasks.delete(id);

        if (cancelledDownloadIds.has(id) || task.state === "cancelled") {
            cancelledDownloadIds.delete(id);
            setTimeout(() => {
                try {
                    if (tempFile.exists) {
                        tempFile.delete();
                    }
                } catch {}
            }, 100);
            useModelStore.getState().updateModel(id, {
                status: "available",
                downloadProgress: undefined,
                error: undefined,
            });
            return null;
        }

        if (!resultFile || !tempFile.exists) {
            throw new Error("Download produced no file.");
        }

        // Verify the downloaded file
        const size = tempFile.size;
        if (size <= 0 || size < model.sizeBytes * 0.9) {
            throw new Error(
                `Download incomplete: received ${Math.round(size / (1024 * 1024))} MB of expected ${Math.round(model.sizeBytes / (1024 * 1024))} MB.`,
            );
        }

        // If target file already exists, remove it before atomic move
        if (targetFile.exists) {
            targetFile.delete();
        }

        // Atomically move verified temp file to destination
        await tempFile.move(targetFile, { overwrite: true });

        const finalPath = targetFile.uri.replace(/^file:\/\//, "");

        useModelStore.getState().updateModel(id, {
            status: "downloaded",
            downloadProgress: 1,
            localPath: finalPath,
            error: undefined,
        });

        return finalPath;
    } catch (error) {
        activeDownloadTasks.delete(id);

        const isCancelled =
            cancelledDownloadIds.has(id) ||
            (error instanceof Error && /cancel/i.test(error.message));

        cancelledDownloadIds.delete(id);

        // Clean up partial temp file asynchronously so native file locks don't block JS thread
        setTimeout(() => {
            try {
                if (tempFile.exists) {
                    tempFile.delete();
                }
            } catch {}
        }, 100);

        if (isCancelled) {
            useModelStore.getState().updateModel(id, {
                status: "available",
                downloadProgress: undefined,
                error: undefined,
            });
            return null;
        }

        const message =
            error instanceof Error
                ? error.message
                : "Failed to download model.";

        console.error("Failed to download model:", message);

        useModelStore.getState().updateModel(id, {
            status: "error",
            error: message,
            downloadProgress: undefined,
        });

        throw error;
    }
}

export async function cancelDownload(id: string) {
    cancelledDownloadIds.add(id);

    // 1. Immediately reset store so UI responds instantaneously without lag
    useModelStore.getState().updateModel(id, {
        status: "available",
        downloadProgress: undefined,
        error: undefined,
    });

    // 2. Abort native task
    const task = activeDownloadTasks.get(id);
    if (task) {
        activeDownloadTasks.delete(id);
        try {
            task.cancel();
        } catch {}
    }

    // 3. Clean up partial temp file with a brief delay to allow OS to release open stream handles
    setTimeout(() => {
        try {
            const model = useModelStore
                .getState()
                .models.find((m) => m.id === id);
            if (model) {
                const { tempFile } = getModelFiles(model.modelId);
                if (tempFile.exists) {
                    tempFile.delete();
                }
            }
        } catch {}
    }, 150);
}

export async function deleteModel(id: string) {
    if (activeDownloadTasks.has(id)) {
        await cancelDownload(id);
    }

    const store = useModelStore.getState();
    if (store.activeModelId === id) {
        await unloadModel(id);
    }

    const model = getModelById(id);
    const { targetFile, tempFile } = getModelFiles(model.modelId);

    try {
        if (tempFile.exists) {
            tempFile.delete();
        }
    } catch {}

    try {
        if (targetFile.exists) {
            targetFile.delete();
        }
    } catch {}

    store.updateModel(id, {
        status: "available",
        downloadProgress: undefined,
        localPath: undefined,
        error: undefined,
    });

    if (store.activeModelId === id) {
        store.setActiveModel(null);
    }
}

export function getDownloadedModelPath(id: string) {
    const model = getModelById(id);
    const { targetFile } = getModelFiles(model.modelId);

    return targetFile.uri.replace(/^file:\/\//, "");
}

export async function unloadModel(id?: string) {
    const store = useModelStore.getState();
    const targetId = id ?? store.activeModelId;

    if (activeLanguageModel) {
        try {
            await activeLanguageModel.unload();
        } catch (error) {
            console.warn("Failed to unload model from memory:", error);
        }
        activeLanguageModel = null;
    }

    // Reset status for any models that were loaded or loading
    store.models.forEach((m) => {
        if (
            m.status === "loaded" ||
            m.status === "loading" ||
            (targetId && m.id === targetId)
        ) {
            store.updateModel(m.id, {
                status: "downloaded",
            });
        }
    });

    if (!id || store.activeModelId === id) {
        store.setActiveModel(null);
    }
    store.setIsModelLoading(false);
}

export async function loadModel(id: string) {
    const model = getModelById(id);
    const store = useModelStore.getState();

    // If this model is already loaded and active, return it
    if (store.activeModelId === id && activeLanguageModel) {
        return activeLanguageModel;
    }

    // Unload any currently active model first to ensure only 1 model is loaded into memory
    if (store.activeModelId || activeLanguageModel) {
        await unloadModel();
    }

    const downloaded = await checkModel(id);

    if (!downloaded) {
        throw new Error(`Model "${model.name}" has not been downloaded.`);
    }

    store.setIsModelLoading(true);
    store.updateModel(id, {
        status: "loading",
        error: undefined,
    });

    try {
        const { targetFile } = getModelFiles(model.modelId);
        const modelPath = targetFile.uri.replace(/^file:\/\//, "");

        const languageModel = llama.languageModel(modelPath);

        await languageModel.prepare();

        activeLanguageModel = languageModel;

        store.updateModel(id, {
            status: "loaded",
            localPath: modelPath,
            error: undefined,
        });

        store.setActiveModel(id);

        return languageModel;
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to load model.";

        store.updateModel(id, {
            status: "downloaded",
            error: message,
        });

        throw error;
    } finally {
        store.setIsModelLoading(false);
    }
}
