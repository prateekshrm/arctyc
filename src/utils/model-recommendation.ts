import { MODEL_CATALOG, ModelDefinition } from "@/data/models";
import { DeviceCapabilities } from "@/utils/device-capabilities";

export function getModelRecommendations(
    device: DeviceCapabilities,
): ModelDefinition[] {
    return MODEL_CATALOG.filter((model) => {
        if (
            device.totalRamGB !== null &&
            device.totalRamGB < model.requirements.minimumRamGB
        ) {
            return false;
        }

        const modelSizeGB = model.sizeBytes / 1024 ** 3;

        if (device.freeStorageGB < modelSizeGB) {
            return false;
        }

        return true;
    })
        .map((model) => ({
            model,
            score: calculateScore(model, device),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(({ model }) => model);
}

function calculateScore(
    model: ModelDefinition,
    device: DeviceCapabilities,
): number {
    let score = model.qualityScore;

    const ram = device.totalRamGB;
    const modelSizeGB = model.sizeBytes / 1024 ** 3;

    if (ram === null) {
        score += 0;
    } else if (ram >= model.requirements.recommendedRamGB) {
        score += 30;
    } else {
        score -= 20;
    }

    if (device.freeStorageGB >= modelSizeGB * 3) {
        score += 10;
    } else if (device.freeStorageGB >= modelSizeGB * 2) {
        score += 5;
    }

    return score;
}
