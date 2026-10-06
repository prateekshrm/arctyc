import * as Device from "expo-device";
import * as FileSystem from "expo-file-system";

export type DeviceCapabilities = {
    totalRamGB: number | null;
    advertisedRamGB: number | null;
    freeStorageGB: number;
};

const BYTES_IN_GB = 1024 * 1024 * 1024;

/**
 * Maps raw usable RAM bytes reported by the OS to the device's commercial/advertised RAM tier.
 * Hardware reservations (GPU, modem, hypervisor) consume memory, so usable memory is always
 * slightly lower than advertised memory (e.g., ~5.4 GB on a 6 GB phone, ~7.2 GB on an 8 GB phone).
 */
export function getAdvertisedRamGB(
    totalRamBytes: number | null | undefined,
): number | null {
    if (!totalRamBytes || totalRamBytes <= 0) {
        return null;
    }

    const ramGBBinary = totalRamBytes / BYTES_IN_GB;
    const standardTiers = [1, 2, 3, 4, 6, 8, 10, 12, 16, 18, 24, 32, 64];

    for (const tier of standardTiers) {
        // Usable memory is typically 85-95% of the advertised tier.
        // A 5% tolerance handles slight differences in binary vs metric calculations.
        if (ramGBBinary <= tier * 1.05) {
            return tier;
        }
    }

    return Math.ceil(ramGBBinary);
}

export function getDeviceCapabilities(): DeviceCapabilities {
    let freeStorageGB = 0;

    try {
        const freeStorageBytes = FileSystem.Paths.availableDiskSpace;
        freeStorageGB = Math.max(0, freeStorageBytes) / BYTES_IN_GB;
    } catch (error) {
        console.error("Failed to read device storage capabilities:", error);
    }

    const totalRamBytes = Device.totalMemory;
    const totalRamGB = totalRamBytes ? totalRamBytes / BYTES_IN_GB : null;
    const advertisedRamGB = getAdvertisedRamGB(totalRamBytes);

    return {
        totalRamGB: totalRamGB ? parseFloat(totalRamGB.toFixed(2)) : null,
        advertisedRamGB,
        freeStorageGB: parseFloat(freeStorageGB.toFixed(2)),
    };
}
