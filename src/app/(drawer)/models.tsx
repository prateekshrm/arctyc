import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { MODEL_CATALOG } from "@/data/models";
import {
    DeviceCapabilities,
    getDeviceCapabilities,
} from "@/utils/device-capabilities";
import { getModelRecommendations } from "@/utils/model-recommendation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Models = () => {
    const insets = useSafeAreaInsets();
    const [device, setDevice] = useState<DeviceCapabilities | null>(null);

    useEffect(() => {
        const { totalRamGB, freeStorageGB } = getDeviceCapabilities();
        setDevice({ totalRamGB, freeStorageGB });
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
                <Text style={styles.subtitle}>
                    Download a model to start chatting offline.
                </Text>
            </View>

            {recommendedModels.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended</Text>

                    <View style={styles.models}>
                        {recommendedModels.map((model) => (
                            <ModelCard key={model.id} model={model} />
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>More models</Text>

                <View style={styles.models}>
                    {otherModels.map((model) => (
                        <ModelCard key={model.id} model={model} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const ModelCard = ({ model }: { model: (typeof MODEL_CATALOG)[number] }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <Text style={styles.modelName}>{model.name}</Text>

                    <Text style={styles.provider}>{model.provider}</Text>
                </View>

                {/* {model.recommended && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Recommended</Text>
                    </View>
                )} */}
            </View>

            <Text style={styles.description}>{model.description}</Text>

            <View style={styles.details}>
                <Detail label="Parameters" value={model.parameterCount} />

                <Detail label="Quantization" value={model.quantization} />

                <Detail label="Size" value={formatBytes(model.sizeBytes)} />
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
        paddingBottom: 16,
    },

    header: {
        marginBottom: 28,
    },

    title: {
        fontSize: 32,
        fontWeight: "700",
    },

    subtitle: {
        marginTop: 6,
        fontSize: 15,
        opacity: 0.6,
    },

    section: {
        marginBottom: 28,
    },

    sectionTitle: {
        marginBottom: 12,
        fontSize: 17,
        fontWeight: "600",
    },

    models: {
        gap: 14,
    },

    card: {
        padding: 18,
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#d6d6d6",
        backgroundColor: "#fff",
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

    modelName: {
        fontSize: 19,
        fontWeight: "600",
    },

    provider: {
        marginTop: 3,
        fontSize: 13,
        opacity: 0.5,
    },

    badge: {
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "#eeeeee",
    },

    badgeText: {
        fontSize: 11,
        fontWeight: "600",
    },

    description: {
        marginTop: 14,
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.7,
    },

    details: {
        flexDirection: "row",
        marginTop: 18,
        gap: 20,
    },

    detail: {
        flex: 1,
    },

    detailLabel: {
        fontSize: 11,
        opacity: 0.45,
    },

    detailValue: {
        marginTop: 3,
        fontSize: 13,
        fontWeight: "500",
    },
});
