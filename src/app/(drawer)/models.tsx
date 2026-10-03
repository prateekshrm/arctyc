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
    const activeModelId = useModelStore((state) => state.activeModelId);
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

    const activeModel = useMemo(
        () =>
            models.find((m) => m.id === activeModelId && m.status === "loaded"),
        [models, activeModelId],
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 24,
                        gap: 16,
                    }}
                    style={styles.modelContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Device System Info Card */}
                    <View style={styles.systemInfoCard}>
                        <View style={styles.systemInfoItem}>
                            <View style={styles.systemIconWrapper}>
                                <RemixIcon
                                    name="hard-drive-2-line"
                                    size={FontSizes.md}
                                    color={Colors.text}
                                />
                            </View>
                            <View style={styles.systemInfoTextCol}>
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
                            <View style={styles.systemInfoTextCol}>
                                <View style={styles.ramLabelRow}>
                                    <Text style={styles.systemInfoLabel}>
                                        RAM
                                    </Text>
                                    <Pressable
                                        onPress={() =>
                                            showDialog({
                                                title: "About usable RAM",
                                                message:
                                                    "The RAM shown here is usable memory reported by your device. It may be slightly lower than advertised because some is reserved for the system.",
                                                confirmButton: {
                                                    label: "OK",
                                                },
                                            })
                                        }
                                        hitSlop={12}
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
                                        ? `${device.totalRamGB.toFixed(1)} GB`
                                        : "Available"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Active Model Indicator Banner */}
                    {activeModel && (
                        <View style={styles.activeModelCard}>
                            <View style={styles.activeModelLeft}>
                                <View style={styles.activeIconWrapper}>
                                    <RemixIcon
                                        name="brain-line"
                                        size={FontSizes.md}
                                        color={Colors.text}
                                    />
                                </View>
                                <View style={styles.activeModelTextCol}>
                                    <View style={styles.activeLabelRow}>
                                        {/* <View
                                            style={styles.activeIndicatorDot}
                                        /> */}
                                        <Text style={styles.activeBadgeLabel}>
                                            Active Model
                                        </Text>
                                    </View>
                                    <Text
                                        style={styles.activeModelName}
                                        numberOfLines={1}
                                    >
                                        {activeModel.name}
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.activeChatButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={() => router.replace("/")}
                            >
                                <RemixIcon
                                    name="message-3-line"
                                    size={FontSizes.xs}
                                    color={Colors.buttonPrimaryText}
                                />
                                <Text style={styles.activeChatButtonText}>
                                    Chat
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Top Header */}
                    <View style={styles.topHeader}>
                        <Text style={styles.screenDescription}>
                            Download and run open-source models offline on your
                            device. Private, fast, and no internet required.
                        </Text>
                    </View>

                    {/* Filter Tabs */}
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
                                        <Text style={styles.sectionTitle}>
                                            Recommended
                                        </Text>
                                        <Text style={styles.sectionDescription}>
                                            Optimized for your device memory and
                                            storage
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
                                    <Text style={styles.sectionTitle}>
                                        {recommendedModels.length > 0
                                            ? "Other Models"
                                            : "All Models"}
                                    </Text>
                                    <Text style={styles.sectionDescription}>
                                        Available open-source models with
                                        various sizes
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
                                <Text style={styles.sectionTitle}>
                                    Installed Models
                                </Text>
                                <Text style={styles.sectionDescription}>
                                    Downloaded to your device and ready to load
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
                    } GB of usable RAM. It may fail to load or run slowly.`,
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
                message: `Are you sure you want to delete ${model.name}? You can download it again anytime.`,
                confirmButton: {
                    label: "Delete",
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
            <View style={[styles.card, isCurrentActive && styles.cardActive]}>
                {/* Header: Title, Provider, and Status badge */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleCol}>
                        <Text style={styles.modelName}>{model.name}</Text>
                        <Text style={styles.providerText}>
                            {model.provider}
                        </Text>
                    </View>

                    {isDownloaded && (
                        <View
                            style={[
                                styles.statusBadge,
                                isCurrentActive && styles.statusBadgeActive,
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
                                    styles.statusBadgeText,
                                    isCurrentActive &&
                                        styles.statusBadgeTextActive,
                                ]}
                            >
                                {isCurrentActive ? "Active" : "Downloaded"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Compact Spec Badges */}
                <View style={styles.specsRow}>
                    <View style={styles.specBadge}>
                        <RemixIcon
                            name="hard-drive-2-line"
                            size={12}
                            color={Colors.textSecondary}
                        />
                        <Text style={styles.specBadgeText}>
                            {formatBytes(model.sizeBytes)}
                        </Text>
                    </View>

                    <View style={styles.specBadge}>
                        <RemixIcon
                            name="equalizer-line"
                            size={12}
                            color={Colors.textSecondary}
                        />
                        <Text style={styles.specBadgeText}>
                            {model.parameterCount}
                        </Text>
                    </View>

                    <View style={styles.specBadge}>
                        <RemixIcon
                            name="dashboard-3-line"
                            size={12}
                            color={Colors.textSecondary}
                        />
                        <Text style={styles.specBadgeText}>
                            {model.requirements.minimumRamGB} GB+ RAM
                        </Text>
                    </View>
                </View>

                {/* Error Banner */}
                {Boolean(modelState?.error) && (
                    <View style={styles.errorBox}>
                        <RemixIcon
                            name="error-warning-fill"
                            size={FontSizes.sm}
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

                {/* Actions: Pill-shaped rounded buttons */}
                <View style={styles.actionsContainer}>
                    {isDownloading ? (
                        <Pressable
                            onPress={handleCancel}
                            style={({ pressed }) => [
                                styles.cancelPillButton,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <RemixIcon
                                name="close-line"
                                size={FontSizes.sm}
                                color={Colors.buttonDangerText}
                            />
                            <Text style={styles.cancelPillButtonText}>
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
                                            styles.pillButtonPrimary,
                                            styles.flexButton,
                                            pressed && styles.buttonPressed,
                                        ]}
                                    >
                                        <RemixIcon
                                            name="message-3-line"
                                            size={FontSizes.sm}
                                            color={Colors.buttonPrimaryText}
                                        />
                                        <Text
                                            style={styles.pillButtonPrimaryText}
                                        >
                                            Chat
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={handleUnload}
                                        style={({ pressed }) => [
                                            styles.pillButtonSecondary,
                                            pressed && styles.buttonPressed,
                                        ]}
                                    >
                                        <RemixIcon
                                            name="stop-circle-line"
                                            size={FontSizes.sm}
                                            color={Colors.buttonSecondaryText}
                                        />
                                        <Text
                                            style={
                                                styles.pillButtonSecondaryText
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
                                        styles.pillButtonPrimary,
                                        styles.flexButton,
                                        isCurrentLoading &&
                                            styles.pillButtonLoading,
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
                                            color={Colors.buttonPrimaryText}
                                        />
                                    ) : (
                                        <RemixIcon
                                            name="play-circle-line"
                                            size={FontSizes.sm}
                                            color={Colors.buttonPrimaryText}
                                        />
                                    )}
                                    <Text style={styles.pillButtonPrimaryText}>
                                        {isCurrentLoading
                                            ? "Loading..."
                                            : "Load Model"}
                                    </Text>
                                </Pressable>
                            )}

                            <Pressable
                                onPress={handleDelete}
                                disabled={isCurrentLoading}
                                style={({ pressed }) => [
                                    styles.deleteIconButton,
                                    pressed && styles.buttonPressed,
                                    isCurrentLoading && styles.buttonDisabled,
                                ]}
                                hitSlop={4}
                                accessibilityRole="button"
                                accessibilityLabel="Delete model"
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
                                styles.pillButtonPrimary,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <RemixIcon
                                name="download-line"
                                size={FontSizes.sm}
                                color={Colors.buttonPrimaryText}
                            />
                            <Text style={styles.pillButtonPrimaryText}>
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
        borderTopRightRadius: 32,
        borderTopLeftRadius: 32,
        borderWidth: 16,
        borderBottomWidth: 0,
        borderColor: Colors.surface,
        overflow: "hidden",
    },
    modelContainer: {
        flex: 1,
    },

    topHeader: {},

    screenDescription: {
        fontFamily: "DMSans-Regular",
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },

    /* Device Info Card */
    systemInfoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 16,
        padding: 12,
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

    systemInfoTextCol: {
        flex: 1,
    },

    ramLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    systemInfoLabel: {
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },

    systemInfoValue: {
        fontFamily: "Sora-SemiBold",
        fontSize: FontSizes.sm,
        color: Colors.text,
        marginTop: 1,
    },

    systemInfoDivider: {
        width: 1,
        height: 28,
        backgroundColor: Colors.border,
        marginHorizontal: 12,
    },

    /* Filter Chips */
    filterChipsRow: {
        flexDirection: "row",
        gap: 8,
    },

    filterChip: {
        paddingVertical: 7,
        paddingHorizontal: 16,
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

    /* Sections */
    section: {
        gap: 10,
    },

    sectionHeader: {
        gap: 2,
    },

    sectionTitle: {
        fontFamily: "Sora-SemiBold",
        fontSize: FontSizes.lg,
        color: Colors.text,
        letterSpacing: -0.3,
    },

    sectionDescription: {
        fontFamily: "DMSans-Regular",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        lineHeight: 16,
    },

    modelsGrid: {
        gap: 10,
    },

    /* Active Model Card Banner */
    activeModelCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 16,
        padding: 12,
    },

    activeModelLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginRight: 10,
    },

    activeIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },

    activeModelTextCol: {
        flex: 1,
    },

    activeLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    activeIndicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#16A34A",
    },

    activeBadgeLabel: {
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },

    activeModelName: {
        fontFamily: "Sora-SemiBold",
        fontSize: FontSizes.sm,
        color: Colors.text,
        marginTop: 1,
    },

    activeChatButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: Colors.buttonPrimary,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
    },

    activeChatButtonText: {
        fontFamily: "DMSans-SemiBold",
        fontSize: FontSizes.xs,
        color: Colors.buttonPrimaryText,
    },

    /* Model Card */
    card: {
        padding: 14,
        borderRadius: 16,
        backgroundColor: Colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    cardActive: {
        borderColor: Colors.text,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
    },

    cardTitleCol: {
        flex: 1,
    },

    modelName: {
        fontFamily: "Sora-SemiBold",
        fontSize: FontSizes.md,
        color: Colors.text,
        letterSpacing: -0.3,
    },

    providerText: {
        fontFamily: "DMSans-Regular",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    /* Badges */
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    statusBadgeText: {
        fontFamily: "DMSans-SemiBold",
        fontSize: 11,
        color: Colors.text,
    },

    statusBadgeActive: {
        backgroundColor: Colors.buttonPrimary,
        borderColor: Colors.buttonPrimary,
    },

    statusBadgeTextActive: {
        color: Colors.textInverse,
    },

    /* Specs Row */
    specsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
    },

    specBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    specBadgeText: {
        fontFamily: "DMSans-Medium",
        fontSize: 11,
        color: Colors.textSecondary,
    },

    /* Error Box */
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
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

    /* Progress */
    progressContainer: {
        marginTop: 8,
    },

    progressLabelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },

    progressStats: {
        fontFamily: "DMSans-Medium",
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },

    progressPercentage: {
        fontFamily: "DMSans-SemiBold",
        fontSize: FontSizes.xs,
        color: Colors.text,
    },

    progressBarTrack: {
        height: 5,
        borderRadius: 999,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: "hidden",
    },

    progressBarFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: Colors.primary,
    },

    /* Action Buttons */
    actionsContainer: {
        marginTop: 10,
    },

    downloadedActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    flexButton: {
        flex: 1,
    },

    pillButtonPrimary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: Colors.buttonPrimary,
        height: 38,
        paddingHorizontal: 16,
        borderRadius: 999,
    },

    pillButtonPrimaryText: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.buttonPrimaryText,
        fontSize: FontSizes.xs,
    },

    pillButtonSecondary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        height: 38,
        paddingHorizontal: 14,
        borderRadius: 999,
    },

    pillButtonSecondaryText: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.text,
        fontSize: FontSizes.xs,
    },

    pillButtonLoading: {
        opacity: 0.8,
    },

    deleteIconButton: {
        width: 38,
        height: 38,
        borderRadius: 999,
        backgroundColor: Colors.buttonDanger,
        borderWidth: 1,
        borderColor: Colors.buttonDangerBorder,
        alignItems: "center",
        justifyContent: "center",
    },

    cancelPillButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.buttonDangerBorder,
        height: 38,
        paddingHorizontal: 16,
        borderRadius: 999,
    },

    cancelPillButtonText: {
        fontFamily: "DMSans-SemiBold",
        color: Colors.buttonDangerText,
        fontSize: FontSizes.xs,
    },

    buttonDisabled: {
        opacity: 0.4,
    },

    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});
