import { Model } from "@/stores/models.store";
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
