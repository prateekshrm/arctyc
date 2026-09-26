import { Colors, FontSizes } from "@constants/theme";
import { memo, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    cancelDownload,
    checkModel,
    deleteModel,
    downloadModel,
    loadModel,
    unloadModel,
} from "@/services/model-manager";
import { useDialogStore } from "@/stores/dialog.store";
import { Model, useModelStore } from "@/stores/models.store";
import {
    DeviceCapabilities,
    getDeviceCapabilities,
} from "@/utils/device-capabilities";
import { getModelRecommendations } from "@/utils/model-recommendation";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

type TabFilter = "all" | "installed";

export default function Models() {
    const insets = useSafeAreaInsets();
    const [device] = useState<DeviceCapabilities>(() =>
        getDeviceCapabilities(),
    );
    const models = useModelStore((state) => state.models);
    const [activeTab, setActiveTab] = useState<TabFilter>("all");

    const showDialog = useDialogStore((state) => state.showDialog);

    useEffect(() => {
        const currentModels = useModelStore.getState().models;
        currentModels.forEach((model) => {
            checkModel(model.id).catch(() => {});
        });
    }, []);

    if (!device) {
        return null;
    }

    const recommendedModels = useMemo(
        () => getModelRecommendations(device, models),
        [device, models],
    );
    const recommendedIds = useMemo(
        () => new Set(recommendedModels.map((m) => m.id)),
        [recommendedModels],
    );
    const otherModels = useMemo(
        () => models.filter((m) => !recommendedIds.has(m.id)),
        [models, recommendedIds],
    );

    const installedModels = useMemo(
        () =>
            models.filter(
                (m) =>
                    m.status === "downloaded" ||
                    m.status === "loaded" ||
                    m.status === "loading",
            ),
        [models],
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 16,
                        paddingTop: 8,
                    }}
                    style={styles.modelContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.topHeader}>
                        <Text style={styles.screenDescription}>
                            Download and run open-source language models
                            directly on your device. 100% private, with zero
                            internet required.
                        </Text>
                    </View>

                    <View style={styles.systemInfoRow}>
                        <View style={styles.systemInfoItem}>
                            <View style={styles.systemIconWrapper}>
                                <RemixIcon
                                    name="hard-drive-2-line"
                                    size={FontSizes.md}
                                    color={Colors.text}
                                />
                            </View>
                            <View>
                                <Text style={styles.systemInfoLabel}>
                                    Storage
                                </Text>
                                <Text style={styles.systemInfoValue}>
                                    {device.freeStorageGB.toFixed(1)} GB Free
                                </Text>
                            </View>
                        </View>

                        <View style={styles.systemInfoDivider} />

                        <View style={styles.systemInfoItem}>
                            <View style={styles.systemIconWrapper}>
                                <RemixIcon
                                    name="dashboard-3-line"
                                    size={FontSizes.md}
                                    color={Colors.text}
                                />
                            </View>
                            <View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <Text style={styles.systemInfoLabel}>
                                        RAM
                                    </Text>
                                    <Pressable
                                        onPress={() =>
                                            showDialog({
                                                title: "About usable RAM",
                                                message:
                                                    "The RAM shown here is the usable RAM reported by your device. It may be lower than the RAM advertised by the manufacturer because some memory is reserved for the system and hardware.",
                                                confirmButton: {
                                                    label: "OK",
                                                },
                                            })
                                        }
                                        hitSlop={20}
                                        accessibilityRole="button"
                                        accessibilityLabel="Learn about usable RAM"
                                    >
                                        <RemixIcon
                                            name="information-line"
                                            size={FontSizes.xs}
                                            color={Colors.textSecondary}
                                        />
                                    </Pressable>
                                </View>
                                <Text style={styles.systemInfoValue}>
                                    {device.totalRamGB !== null
                                        ? `${device.totalRamGB.toFixed(1)} GB Usable`
                                        : "Available"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {installedModels.length > 0 && (
                        <View style={styles.filterChipsRow}>
                            <Pressable
                                style={[
                                    styles.filterChip,
                                    activeTab === "all" &&
                                        styles.filterChipActive,
                                ]}
                                onPress={() => setActiveTab("all")}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        activeTab === "all" &&
                                            styles.filterChipTextActive,
                                    ]}
                                >
                                    All ({models.length})
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.filterChip,
                                    activeTab === "installed" &&
                                        styles.filterChipActive,
                                ]}
                                onPress={() => setActiveTab("installed")}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        activeTab === "installed" &&
                                            styles.filterChipTextActive,
                                    ]}
                                >
                                    Installed ({installedModels.length})
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {activeTab === "all" || installedModels.length === 0 ? (
                        <>
                            {recommendedModels.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitleBig}>
                                            Recommended for your device
                                        </Text>
                                        <Text style={styles.sectionDescription}>
                                            Models optimized to run smoothly
                                            based on your available memory and
                                            storage.
                                        </Text>
                                    </View>

                                    <View style={styles.modelsGrid}>
                                        {recommendedModels.map((model) => (
                                            <ModelCard
                                                key={model.id}
                                                model={model}
                                                device={device}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitleBig}>
                                        {recommendedModels.length > 0
                                            ? "Other Models"
                                            : "All Models"}
                                    </Text>
                                    <Text style={styles.sectionDescription}>
                                        Browse all available models with
                                        different capabilities, sizes, and
                                        speeds.
                                    </Text>
                                </View>

                                <View style={styles.modelsGrid}>
                                    {otherModels.map((model) => (
                                        <ModelCard
                                            key={model.id}
                                            model={model}
                                            device={device}
                                        />
                                    ))}
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitleBig}>
                                    Installed Models
                                </Text>
                                <Text style={styles.sectionDescription}>
                                    Models downloaded to your device and ready
                                    to load for offline chat.
                                </Text>
                            </View>

                            <View style={styles.modelsGrid}>
                                {installedModels.map((model) => (
                                    <ModelCard
                                        key={model.id}
                                        model={model}
                                        device={device}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const ModelCard = memo(
    ({ model, device }: { model: Model; device: DeviceCapabilities }) => {
        const modelState = useModelStore((state) =>
            state.models.find((m) => m.id === model.id),
        );

        const activeModelId = useModelStore((state) => state.activeModelId);

        const isModelLoading = useModelStore((state) => state.isModelLoading);

        const showDialog = useDialogStore((state) => state.showDialog);

        const status = modelState?.status ?? "available";
        const progress = modelState?.downloadProgress ?? 0;
        const progressPercent = Math.round(progress * 100);

        const [isLocalLoading, setIsLocalLoading] = useState(false);

        const handleDownload = () => {
            const modelSizeGB = model.sizeBytes / 1024 ** 3;

            if (device.freeStorageGB < modelSizeGB) {
                showDialog({
                    title: "Not enough storage",
                    message: `This model requires ${formatBytes(
                        model.sizeBytes,
                    )} of storage, but your device doesn't have enough free space. Free up some storage and try again.`,
                    confirmButton: {
                        label: "OK",
                    },
                });

                return;
            }
            if (
                device.totalRamGB !== null &&
                model.requirements.minimumRamGB > device.totalRamGB
            ) {
                showDialog({
                    title: "Model may not run well",
                    message: `This model requires at least ${
                        model.requirements.minimumRamGB
                    } GB of RAM, while your device has ${
                        device.totalRamGB
                    } GB of usable RAM. It may fail to load or make the app unstable while running.`,
                    confirmButton: {
                        label: "Download Anyway",
                        variant: "destructive",
                        onPress: () => {
                            downloadModel(model.id).catch(() => {});
                        },
                    },
                    dismissButton: {
                        label: "Cancel",
                    },
                });

                return;
            }

            downloadModel(model.id).catch(() => {});
        };

        const handleCancel = () => {
            cancelDownload(model.id).catch(() => {});
        };

        const handleDelete = () => {
            showDialog({
                title: "Delete model?",
                message: `Are you sure you want to delete ${model.name}? This will remove the model from your device. You can download it again later if needed.`,
                confirmButton: {
                    label: "Delete Model",
                    variant: "destructive",
                    onPress: () => {
                        deleteModel(model.id).catch(() => {});
                    },
                },
                dismissButton: {
                    label: "Cancel",
                },
            });
        };

        const handleLoad = async () => {
            setIsLocalLoading(true);

            try {
                await loadModel(model.id);
            } catch {
                // Error is handled by the model store/service.
            } finally {
                setIsLocalLoading(false);
            }
        };

        const handleUnload = () => {
            unloadModel(model.id).catch(() => {});
        };

        const isDownloading = status === "downloading";

        const isCurrentActive =
            activeModelId === model.id && status === "loaded";

        const isCurrentLoading = status === "loading" || isLocalLoading;

        const isDownloaded =
            status === "downloaded" || isCurrentActive || isCurrentLoading;

        const isError = status === "error";

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleCol}>
                        <View style={styles.nameRow}>
                            <Text style={styles.modelName}>{model.name}</Text>

                            {isDownloaded && (
                                <View
                                    style={[
                                        styles.downloadedChip,
                                        isCurrentActive && styles.activeChip,
                                    ]}
                                >
                                    <RemixIcon
                                        name={
                                            isCurrentActive
                                                ? "cpu-fill"
                                                : "checkbox-circle-fill"
                                        }
                                        size={FontSizes.xs}
                                        color={
                                            isCurrentActive
                                                ? Colors.textInverse
                                                : Colors.text
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.downloadedChipText,
                                            isCurrentActive &&
                                                styles.activeChipText,
                                        ]}
                                    >
                                        {isCurrentActive
                                            ? "Active"
                                            : "Downloaded"}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.providerText}>
                            {model.provider}
                        </Text>
                    </View>
                </View>

                <Text style={styles.description}>{model.description}</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCell}>
                            <Text style={styles.statLabel}>Parameters</Text>

                            <Text style={styles.statValue}>
                                {model.parameterCount}
                            </Text>
                        </View>

                        <View style={styles.statCellDivider} />

                        <View style={styles.statCell}>
                            <Text style={styles.statLabel}>Download Size</Text>

                            <Text style={styles.statValue}>
                                {formatBytes(model.sizeBytes)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRowDivider} />

                    <View style={styles.statsRow}>
                        <View style={styles.statCell}>
                            <Text style={styles.statLabel}>Minimum RAM</Text>

                            <Text style={styles.statValue}>
                                {model.requirements.minimumRamGB} GB
                            </Text>
                        </View>
                        <View style={styles.statCellDivider} />
                        <View style={styles.statCell}>
                            <Text style={styles.statLabel}>
                                Recommended RAM
                            </Text>

                            <Text style={styles.statValue}>
                                {model.requirements.recommendedRamGB} GB
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Error */}
                {Boolean(modelState?.error) && (
                    <View style={styles.errorBox}>
                        <RemixIcon
                            name="error-warning-fill"
                            size={FontSizes.md}
                            color={Colors.error}
                        />

                        <Text style={styles.errorText} numberOfLines={2}>
                            {modelState?.error}
                        </Text>
                    </View>
                )}

                {/* Download Progress */}
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
                                        width: `${Math.min(
                                            100,
                                            Math.max(2, progressPercent),
                                        )}%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    {isDownloading ? (
                        <Pressable
                            onPress={handleCancel}
                            hitSlop={8}
                            style={({ pressed }) => [
                                styles.cancelButton,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <RemixIcon
                                name="close-line"
                                size={FontSizes.md}
                                color={Colors.buttonDangerText}
                            />

                            <Text style={styles.cancelButtonText}>
                                Cancel Download
                            </Text>
                        </Pressable>
                    ) : isDownloaded ? (
                        <View style={styles.downloadedActionsRow}>
                            {isCurrentActive ? (
                                <>
                                    <Pressable
                                        onPress={() => router.replace("/")}
                                        style={({ pressed }) => [
                                            styles.chatButton,
                                            pressed && styles.buttonPressed,
                                        ]}
                                    >
                                        <RemixIcon
                                            name="message-3-line"
                                            size={FontSizes.md}
                                            color={Colors.buttonPrimaryText}
                                        />

                                        <Text style={styles.chatButtonText}>
                                            Chat
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={handleUnload}
                                        style={({ pressed }) => [
                                            styles.loadButtonSecondary,
                                            pressed && styles.buttonPressed,
                                        ]}
                                    >
                                        <RemixIcon
                                            name="stop-circle-line"
                                            size={FontSizes.md}
                                            color={Colors.buttonSecondaryText}
                                        />

                                        <Text
                                            style={
                                                styles.loadButtonSecondaryText
                                            }
                                        >
                                            Unload
                                        </Text>
                                    </Pressable>
                                </>
                            ) : (
                                <Pressable
                                    onPress={handleLoad}
                                    disabled={
                                        isModelLoading || isCurrentLoading
                                    }
                                    style={({ pressed }) => [
                                        styles.loadButtonSecondary,
                                        isCurrentLoading &&
                                            styles.loadButtonLoading,
                                        pressed &&
                                            !isCurrentLoading &&
                                            styles.buttonPressed,
                                        isModelLoading &&
                                            !isCurrentLoading &&
                                            styles.buttonDisabled,
                                    ]}
                                >
                                    {isCurrentLoading ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={Colors.buttonSecondaryText}
                                        />
                                    ) : (
                                        <RemixIcon
                                            name="play-circle-line"
                                            size={FontSizes.md}
                                            color={Colors.buttonSecondaryText}
                                        />
                                    )}

                                    <Text
                                        style={styles.loadButtonSecondaryText}
                                    >
                                        {isCurrentLoading
                                            ? "Loading into Memory..."
                                            : "Load into Memory"}
                                    </Text>
                                </Pressable>
                            )}

                            <Pressable
                                onPress={handleDelete}
                                disabled={isCurrentLoading}
                                style={({ pressed }) => [
                                    styles.deleteButton,
                                    pressed && styles.buttonPressed,
                                    isCurrentLoading && styles.buttonDisabled,
                                ]}
                            >
                                <RemixIcon
                                    name="delete-bin-line"
                                    size={FontSizes.md}
                                    color={Colors.buttonDangerText}
                                />
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
                            <RemixIcon
                                name="download-2-line"
                                size={FontSizes.md}
                                color={Colors.buttonPrimaryText}
                            />

                            <Text style={styles.downloadButtonText}>
                                {isError
                                    ? "Retry Download"
                                    : `Download (${formatBytes(
                                          model.sizeBytes,
                                      )})`}
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>
        );
    },
);

const formatBytes = (bytes: number) => {
    const GB = 1024 ** 3;
    const MB = 1024 ** 2;

    if (bytes >= GB) {
        return `${(bytes / GB).toFixed(1)} GB`;
    }

    return `${Math.round(bytes / MB)} MB`;
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 32,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderWidth: 16,
        borderBottomWidth: 0,
        borderColor: Colors.surface,
        overflow: "hidden",
    },
    modelContainer: {
        flex: 1,
    },

    topHeader: {
        marginBottom: 14,
    },

    screenDescription: {
        fontFamily: "DMSans-Regular",
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },

    systemInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        marginBottom: 16,
    },

    systemInfoItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    systemIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },

    systemInfoLabel: {
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },

    systemInfoValue: {
        fontFamily: "PlusJakartaSans-SemiBold",
        fontSize: FontSizes.sm,
        color: Colors.text,
        marginTop: 1,
    },

    systemInfoDivider: {
        width: 1,
        height: 26,
        backgroundColor: Colors.border,
        marginHorizontal: 14,
    },

    filterChipsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
    },

    filterChip: {
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: Colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    filterChipActive: {
        backgroundColor: Colors.buttonPrimary,
        borderColor: Colors.buttonPrimary,
    },

    filterChipText: {
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },

    filterChipTextActive: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.textInverse,
    },

    section: {
        marginBottom: 28,
    },

    sectionHeader: {
        marginBottom: 14,
    },

    sectionTitleBig: {
        fontFamily: "PlusJakartaSans-SemiBold",
        fontSize: FontSizes.xl,
        color: Colors.text,
        letterSpacing: -0.4,
    },

    sectionDescription: {
        fontFamily: "DMSans-Regular",
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: 3,
        lineHeight: 18,
    },

    modelsGrid: {
        gap: 14,
    },

    card: {
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.surfaceSecondary,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },

    cardTitleCol: {
        flex: 1,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },

    modelName: {
        fontFamily: "PlusJakartaSans-SemiBold",
        fontSize: FontSizes.md,
        color: Colors.text,
        letterSpacing: -0.3,
    },

    providerText: {
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    downloadedChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 7,
        paddingVertical: 2.5,
        borderRadius: 6,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    downloadedChipText: {
        fontFamily: "DMSans-SemiBold",
        fontSize: FontSizes.xs,
        color: Colors.text,
    },

    activeChip: {
        backgroundColor: Colors.buttonPrimary,
        borderColor: Colors.buttonPrimary,
    },

    activeChipText: {
        color: Colors.textInverse,
    },

    description: {
        marginTop: 10,
        fontFamily: "DMSans-Regular",
        fontSize: FontSizes.sm,
        lineHeight: 18,
        color: Colors.textSecondary,
    },

    statsGrid: {
        marginTop: 12,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },

    statsRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    statCell: {
        flex: 1,
        paddingVertical: 4,
    },

    statCellDivider: {
        width: 1,
        height: 24,
        backgroundColor: Colors.border,
        marginHorizontal: 12,
    },

    statsRowDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 4,
    },

    statLabel: {
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.2,
    },

    statValue: {
        fontFamily: "PlusJakartaSans-SemiBold",
        fontSize: FontSizes.xs,
        color: Colors.text,
        marginTop: 2,
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        padding: 9,
        borderRadius: 10,
        backgroundColor: Colors.errorSurface,
        borderWidth: 1,
        borderColor: Colors.errorBorder,
    },

    errorText: {
        flex: 1,
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.error,
        lineHeight: 15,
    },

    progressContainer: {
        marginTop: 12,
    },

    progressLabelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },

    progressStats: {
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },

    progressPercentage: {
        fontFamily: "PlusJakartaSans-SemiBold",
        fontSize: FontSizes.xs,
        color: Colors.text,
    },

    progressBarTrack: {
        height: 6,
        borderRadius: 999,
        backgroundColor: Colors.surfaceSecondary,
        overflow: "hidden",
    },

    progressBarFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: Colors.primary,
    },

    actionsContainer: {
        marginTop: 14,
    },

    downloadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: Colors.buttonPrimary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },

    downloadButtonText: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.buttonPrimaryText,
        fontSize: FontSizes.sm,
    },

    cancelButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.buttonDangerBorder,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },

    cancelButtonText: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.buttonDangerText,
        fontSize: FontSizes.xs,
    },

    downloadedActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    loadButtonSecondary: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: Colors.buttonSecondary,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },

    loadButtonLoading: {
        backgroundColor: Colors.border,
    },

    loadButtonSecondaryText: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.buttonSecondaryText,
        fontSize: FontSizes.sm,
    },

    chatButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: Colors.buttonPrimary,
        borderWidth: 1,
        borderColor: Colors.buttonPrimary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },

    chatButtonText: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.buttonPrimaryText,
        fontSize: FontSizes.sm,
    },

    deleteButton: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: Colors.buttonDanger,
        borderWidth: 1,
        borderColor: Colors.buttonDangerBorder,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonDisabled: {
        opacity: 0.4,
    },

    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.99 }],
    },
});
