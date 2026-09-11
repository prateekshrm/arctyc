import {
    AlertCircle,
    CheckCircle2,
    Download,
    Trash2,
    X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MODEL_CATALOG, ModelDefinition } from "@/data/models";
import {
    cancelDownload,
    checkModel,
    deleteModel,
    downloadModel,
} from "@/services/model-manager";
import { useModelStore } from "@/stores/models.store";
import {
    DeviceCapabilities,
    getDeviceCapabilities,
} from "@/utils/device-capabilities";
import { getModelRecommendations } from "@/utils/model-recommendation";

const Models = () => {
    const insets = useSafeAreaInsets();
    const [device] = useState<DeviceCapabilities>(() =>
        getDeviceCapabilities(),
    );

    useEffect(() => {
        // Synchronize local model files and clean up any broken partials on mount
        MODEL_CATALOG.forEach((model) => {
            checkModel(model.id).catch(() => {});
        });
    }, []);

    if (!device) {
        return null;
    }

    const recommendedModels = getModelRecommendations(device);
    const recommendedIds = new Set(recommendedModels.map((model) => model.id));
    const otherModels = MODEL_CATALOG.filter(
        (model) => !recommendedIds.has(model.id),
    );

    return (
        <ScrollView
            contentContainerStyle={[
                styles.contentContainer,
                {
                    paddingTop: insets.top + 70,
                },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Models</Text>
                <Text style={styles.subtitle}>
                    Download local models to chat completely offline on device.
                </Text>
            </View>

            {recommendedModels.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>
                            Recommended for your device
                        </Text>
                    </View>

                    <View style={styles.models}>
                        {recommendedModels.map((model) => (
                            <ModelCard
                                key={model.id}
                                model={model}
                                isRecommended
                            />
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Models</Text>

                <View style={styles.models}>
                    {otherModels.map((model) => (
                        <ModelCard key={model.id} model={model} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const ModelCard = ({
    model,
    isRecommended,
}: {
    model: ModelDefinition;
    isRecommended?: boolean;
}) => {
    const modelState = useModelStore((state) =>
        state.models.find((m) => m.id === model.id),
    );

    const status = modelState?.status ?? "available";
    const progress = modelState?.downloadProgress ?? 0;
    const progressPercent = Math.round(progress * 100);

    const handleDownload = () => {
        downloadModel(model.id).catch(() => {});
    };

    const handleCancel = () => {
        cancelDownload(model.id).catch(() => {});
    };

    const handleDelete = () => {
        deleteModel(model.id).catch(() => {});
    };

    const isDownloading = status === "downloading";
    const isDownloaded = status === "downloaded" || status === "loaded";
    const isError = status === "error";

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.modelName}>{model.name}</Text>
                        {isRecommended && (
                            <View style={styles.recommendedBadge}>
                                <Text style={styles.recommendedBadgeText}>
                                    Best Fit
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.provider}>{model.provider}</Text>
                </View>

                {isDownloaded && (
                    <View style={styles.downloadedBadge}>
                        <CheckCircle2 size={13} color="#16a34a" />
                        <Text style={styles.downloadedBadgeText}>
                            Downloaded
                        </Text>
                    </View>
                )}

                {isDownloading && (
                    <View style={styles.downloadingBadge}>
                        <Text style={styles.downloadingBadgeText}>
                            {progressPercent}%
                        </Text>
                    </View>
                )}
            </View>

            <Text style={styles.description}>{model.description}</Text>

            <View style={styles.details}>
                <Detail label="Parameters" value={model.parameterCount} />
                <Detail label="Quantization" value={model.quantization} />
                <Detail label="Size" value={formatBytes(model.sizeBytes)} />
            </View>

            {/* Error Message Callout */}
            {isError && (
                <View style={styles.errorBox}>
                    <AlertCircle
                        size={15}
                        color="#dc2626"
                        style={{ marginTop: 1 }}
                    />
                    <Text style={styles.errorText} numberOfLines={2}>
                        {modelState?.error ??
                            "Download failed. Please check your connection."}
                    </Text>
                </View>
            )}

            {/* Downloading Progress Bar & Info */}
            {isDownloading && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressLabelRow}>
                        <Text style={styles.progressStats}>
                            {formatBytes(model.sizeBytes * progress)} /{" "}
                            {formatBytes(model.sizeBytes)}
                        </Text>
                        <Text style={styles.progressPercentage}>
                            {progressPercent}%
                        </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${Math.min(100, Math.max(2, progressPercent))}%`,
                                },
                            ]}
                        />
                    </View>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                {isDownloading ? (
                    <Pressable
                        onPress={handleCancel}
                        style={({ pressed }) => [
                            styles.cancelButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <X size={15} color="#dc2626" />
                        <Text style={styles.cancelButtonText}>
                            Cancel Download
                        </Text>
                    </Pressable>
                ) : isDownloaded ? (
                    <View style={styles.downloadedActionsRow}>
                        <View style={styles.readyIndicator}>
                            <View style={styles.readyDot} />
                            <Text style={styles.readyText}>Ready offline</Text>
                        </View>
                        <Pressable
                            onPress={handleDelete}
                            style={({ pressed }) => [
                                styles.deleteButton,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <Trash2 size={15} color="#dc2626" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        onPress={handleDownload}
                        style={({ pressed }) => [
                            styles.downloadButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <Download size={15} color="#ffffff" />
                        <Text style={styles.downloadButtonText}>
                            {isError
                                ? "Retry Download"
                                : `Download (${formatBytes(model.sizeBytes)})`}
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const Detail = ({ label, value }: { label: string; value: string }) => {
    return (
        <View style={styles.detail}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
};

const formatBytes = (bytes: number) => {
    const GB = 1024 ** 3;
    const MB = 1024 ** 2;

    if (bytes >= GB) {
        return `${(bytes / GB).toFixed(1)} GB`;
    }

    return `${Math.round(bytes / MB)} MB`;
};

export default Models;

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },

    header: {
        marginBottom: 24,
    },

    title: {
        fontSize: 30,
        fontWeight: "700",
        color: "#0f172a",
        letterSpacing: -0.5,
    },

    subtitle: {
        marginTop: 6,
        fontSize: 14,
        color: "#64748b",
        lineHeight: 20,
    },

    section: {
        marginBottom: 28,
    },

    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    sectionTitle: {
        marginBottom: 12,
        fontSize: 16,
        fontWeight: "600",
        color: "#334155",
        letterSpacing: -0.2,
    },

    models: {
        gap: 14,
    },

    card: {
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },

    titleContainer: {
        flex: 1,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },

    modelName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0f172a",
        letterSpacing: -0.3,
    },

    provider: {
        marginTop: 2,
        fontSize: 13,
        color: "#64748b",
    },

    recommendedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: "#eff6ff",
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },

    recommendedBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#2563eb",
    },

    downloadedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#f0fdf4",
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },

    downloadedBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#16a34a",
    },

    downloadingBadge: {
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#f0f9ff",
        borderWidth: 1,
        borderColor: "#bae6fd",
    },

    downloadingBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0284c7",
    },

    description: {
        marginTop: 10,
        fontSize: 13.5,
        lineHeight: 19,
        color: "#475569",
    },

    details: {
        flexDirection: "row",
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        gap: 16,
    },

    detail: {
        flex: 1,
    },

    detailLabel: {
        fontSize: 11,
        color: "#94a3b8",
        fontWeight: "500",
    },

    detailValue: {
        marginTop: 2,
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginTop: 14,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
    },

    errorText: {
        flex: 1,
        fontSize: 12,
        color: "#b91c1c",
        lineHeight: 16,
    },

    progressContainer: {
        marginTop: 14,
    },

    progressLabelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },

    progressStats: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "500",
    },

    progressPercentage: {
        fontSize: 12,
        color: "#0f172a",
        fontWeight: "700",
    },

    progressBarTrack: {
        height: 6,
        borderRadius: 999,
        backgroundColor: "#f1f5f9",
        overflow: "hidden",
    },

    progressBarFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#0f172a",
    },

    actionsContainer: {
        marginTop: 14,
    },

    downloadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#0f172a",
        paddingVertical: 11,
        paddingHorizontal: 20,
        borderRadius: 12,
    },

    downloadButtonText: {
        color: "#ffffff",
        fontSize: 13.5,
        fontWeight: "600",
    },

    cancelButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#fca5a5",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },

    cancelButtonText: {
        color: "#dc2626",
        fontSize: 13,
        fontWeight: "600",
    },

    downloadedActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    readyIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    readyDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#16a34a",
    },

    readyText: {
        fontSize: 13,
        color: "#16a34a",
        fontWeight: "500",
    },

    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
    },

    deleteButtonText: {
        color: "#dc2626",
        fontSize: 12,
        fontWeight: "600",
    },

    buttonPressed: {
        opacity: 0.75,
        transform: [{ scale: 0.99 }],
    },
});
