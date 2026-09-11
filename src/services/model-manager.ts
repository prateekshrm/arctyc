import { llama } from "@react-native-ai/llama";
import { Directory, DownloadTask, File, Paths } from "expo-file-system";

import { MODEL_CATALOG } from "@/data/models";
import { useModelStore } from "@/stores/models.store";

const activeDownloadTasks = new Map<string, DownloadTask>();

function getModelById(id: string) {
    const model = MODEL_CATALOG.find((model) => model.id === id);

    if (!model) {
        throw new Error(`Model "${id}" not found in catalog.`);
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
        } catch { }
    }

    const localPath = targetFile.uri.replace(/^file:\/\//, "");

    useModelStore.getState().updateModel(id, {
        status: isValid ? "downloaded" : "available",
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

    // Ensure any stale temp file is removed
    try {
        if (tempFile.exists) {
            tempFile.delete();
        }
    } catch { }

    store.updateModel(id, {
        status: "downloading",
        downloadProgress: 0,
        error: undefined,
    });

    try {
        const url = `https://huggingface.co/${repo}/resolve/main/${filename}?download=true`;

        const task = new DownloadTask(url, tempFile, {
            onProgress: ({ bytesWritten, totalBytes }) => {
                const total = totalBytes > 0 ? totalBytes : model.sizeBytes;
                const progress = Math.min(1, Math.max(0, bytesWritten / total));
                useModelStore.getState().updateModel(id, {
                    downloadProgress: progress,
                });
            },
        });

        activeDownloadTasks.set(id, task);

        const resultFile = await task.downloadAsync();
        activeDownloadTasks.delete(id);

        if (!resultFile || !tempFile.exists) {
            throw new Error("Download was cancelled or produced no file.");
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

        // Clean up partial temp file so no corrupted files linger
        try {
            if (tempFile.exists) {
                tempFile.delete();
            }
        } catch { }

        const message =
            error instanceof Error
                ? error.message
                : "Failed to download model.";

        useModelStore.getState().updateModel(id, {
            status: "error",
            error: message,
            downloadProgress: undefined,
        });

        throw error;
    }
}

export async function cancelDownload(id: string) {
    const task = activeDownloadTasks.get(id);
    if (task) {
        try {
            task.cancel();
        } catch { }
        activeDownloadTasks.delete(id);
    }

    const model = getModelById(id);
    const { tempFile } = getModelFiles(model.modelId);

    try {
        if (tempFile.exists) {
            tempFile.delete();
        }
    } catch { }

    useModelStore.getState().updateModel(id, {
        status: "available",
        downloadProgress: undefined,
        error: undefined,
    });
}

export async function deleteModel(id: string) {
    if (activeDownloadTasks.has(id)) {
        await cancelDownload(id);
    }

    const model = getModelById(id);
    const { targetFile, tempFile } = getModelFiles(model.modelId);

    try {
        if (tempFile.exists) {
            tempFile.delete();
        }
    } catch { }

    try {
        if (targetFile.exists) {
            targetFile.delete();
        }
    } catch { }

    useModelStore.getState().updateModel(id, {
        status: "available",
        downloadProgress: undefined,
        localPath: undefined,
        error: undefined,
    });

    const activeId = useModelStore.getState().activeModelId;
    if (activeId === id) {
        useModelStore.getState().setActiveModel(null);
    }
}

export function getDownloadedModelPath(id: string) {
    const model = getModelById(id);
    const { targetFile } = getModelFiles(model.modelId);

    return targetFile.uri.replace(/^file:\/\//, "");
}

export async function loadModel(id: string) {
    const model = getModelById(id);
    const store = useModelStore.getState();

    store.updateModel(id, {
        status: "loading",
        error: undefined,
    });

    try {
        const downloaded = await checkModel(id);

        if (!downloaded) {
            throw new Error(`Model "${model.name}" has not been downloaded.`);
        }

        const { targetFile } = getModelFiles(model.modelId);
        const modelPath = targetFile.uri.replace(/^file:\/\//, "");

        const languageModel = llama.languageModel(modelPath);

        await languageModel.prepare();

        store.updateModel(id, {
            status: "loaded",
            localPath: modelPath,
        });

        store.setActiveModel(id);

        return languageModel;
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to load model.";

        store.updateModel(id, {
            status: "error",
            error: message,
        });

        throw error;
    }
}
