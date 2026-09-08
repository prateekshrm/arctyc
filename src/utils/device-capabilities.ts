import * as Device from "expo-device";
import * as FileSystem from "expo-file-system";

export type DeviceCapabilities = {
    totalRamGB: number | null;
    freeStorageGB: number;
};

const BYTES_IN_GB = 1024 * 1024 * 1024;

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

    return {
        totalRamGB: totalRamGB ? parseFloat(totalRamGB.toFixed(2)) : null,
        freeStorageGB: parseFloat(freeStorageGB.toFixed(2)),
    };
}
