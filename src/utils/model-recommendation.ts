import { Model, useModelStore } from "@/stores/models.store";
import { DeviceCapabilities } from "@/utils/device-capabilities";

export function isModelSupported(
    model: Pick<Model, "requirements">,
    device: DeviceCapabilities,
): boolean {
    const ram = device.advertisedRamGB ?? device.totalRamGB;
    if (ram === null) {
        return true;
    }
    return ram >= model.requirements.minimumRamGB;
}

export function getModelRecommendations(
    device: DeviceCapabilities,
    models: Model[] = useModelStore.getState().models,
): Model[] {
    const supportedModels = models.filter((model) =>
        isModelSupported(model, device),
    );

    if (supportedModels.length === 0) {
        return [];
    }

    // Recommend models purely on the basis of minimum RAM required:
    // Select models matching the highest supported minimum RAM tier for this device
    const maxSupportedMinRam = Math.max(
        ...supportedModels.map((m) => m.requirements.minimumRamGB),
    );

    return supportedModels.filter(
        (m) => m.requirements.minimumRamGB === maxSupportedMinRam,
    );
}
