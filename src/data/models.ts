export type ModelFamily = "qwen" | "llama" | "gemma";

export type ModelCapability =
    | "chat"
    | "reasoning"
    | "coding"
    | "multilingual"
    | "vision";

export type ModelDefinition = {
    id: string;

    name: string;
    provider: string;
    family: ModelFamily;

    /**
     * Hugging Face model identifier:
     *
     * owner/repository/filename.gguf
     */
    modelId: string;

    parameterCount: string;
    quantization: string;

    sizeBytes: number;

    requirements: {
        minimumRamGB: number;
        recommendedRamGB: number;
    };

    capabilities: ModelCapability[];

    qualityScore: number;

    description: string;
};

const MB = 1024 ** 2;
const GB = 1024 ** 3;

export const MODEL_CATALOG: ModelDefinition[] = [
    // ─────────────────────────────────────────────
    // QWEN
    // ─────────────────────────────────────────────

    {
        id: "qwen3-0.6b",
        name: "Qwen3 0.6B",
        provider: "Qwen",
        family: "qwen",

        modelId: "second-state/Qwen3-0.6B-GGUF/Qwen3-0.6B-Q4_K_M.gguf",

        parameterCount: "0.6B",
        quantization: "Q4_K_M",

        sizeBytes: 484 * MB,

        requirements: {
            minimumRamGB: 3,
            recommendedRamGB: 4,
        },

        capabilities: ["chat", "reasoning", "multilingual"],

        qualityScore: 30,

        description:
            "Ultra-lightweight model for fast responses and lower-end devices.",
    },

    {
        id: "qwen3-1.7b",
        name: "Qwen3 1.7B",
        provider: "Qwen",
        family: "qwen",

        modelId: "ggml-org/Qwen3-1.7B-GGUF/Qwen3-1.7B-Q4_K_M.gguf",

        parameterCount: "1.7B",
        quantization: "Q4_K_M",

        sizeBytes: 1.28 * GB,

        requirements: {
            minimumRamGB: 4,
            recommendedRamGB: 6,
        },

        capabilities: ["chat", "reasoning", "coding", "multilingual"],

        qualityScore: 55,

        description:
            "Small and efficient model offering a strong balance of quality and performance.",
    },

    {
        id: "qwen3-4b",
        name: "Qwen3 4B",
        provider: "Qwen",
        family: "qwen",

        modelId: "Qwen/Qwen3-4B-GGUF/Qwen3-4B-Q4_K_M.gguf",

        parameterCount: "4B",
        quantization: "Q4_K_M",

        sizeBytes: 2.5 * GB,

        requirements: {
            minimumRamGB: 6,
            recommendedRamGB: 8,
        },

        capabilities: ["chat", "reasoning", "coding", "multilingual"],

        qualityScore: 80,

        description:
            "Strong general-purpose local model for reasoning, coding, and everyday conversations.",
    },

    {
        id: "qwen3-8b",
        name: "Qwen3 8B",
        provider: "Qwen",
        family: "qwen",

        modelId: "Qwen/Qwen3-8B-GGUF/Qwen3-8B-Q4_K_M.gguf",

        parameterCount: "8B",
        quantization: "Q4_K_M",

        sizeBytes: 5.03 * GB,

        requirements: {
            minimumRamGB: 10,
            recommendedRamGB: 12,
        },

        capabilities: ["chat", "reasoning", "coding", "multilingual"],

        qualityScore: 90,

        description:
            "High-quality local model for powerful phones and devices with ample memory.",
    },

    // ─────────────────────────────────────────────
    // LLAMA
    // ─────────────────────────────────────────────

    {
        id: "llama-3.2-1b",
        name: "Llama 3.2 1B",
        provider: "Meta",
        family: "llama",

        modelId:
            "tensorblock/Llama-3.2-1B-Instruct-GGUF/Llama-3.2-1B-Instruct-Q3_K_M.gguf",

        parameterCount: "1B",
        quantization: "Q3_K_M",

        sizeBytes: 691 * MB,

        requirements: {
            minimumRamGB: 3,
            recommendedRamGB: 4,
        },

        capabilities: ["chat", "coding"],

        qualityScore: 65,

        description:
            "Compact instruction-tuned Llama model for fast everyday conversations.",
    },

    {
        id: "llama-3.2-3b",
        name: "Llama 3.2 3B",
        provider: "Meta",
        family: "llama",

        modelId:
            "tensorblock/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q3_K_M.gguf",

        parameterCount: "3B",
        quantization: "Q3_K_M",

        sizeBytes: 1.69 * GB,

        requirements: {
            minimumRamGB: 6,
            recommendedRamGB: 8,
        },

        capabilities: ["chat", "coding"],

        qualityScore: 75,

        description:
            "Capable general-purpose Llama model with a good balance of quality and device requirements.",
    },

    // ─────────────────────────────────────────────
    // GEMMA
    // ─────────────────────────────────────────────

    {
        id: "gemma-3-1b",
        name: "Gemma 3 1B",
        provider: "Google",
        family: "gemma",

        modelId: "ggml-org/gemma-3-1b-it-GGUF/gemma-3-1b-it-Q4_K_M.gguf",

        parameterCount: "1B",
        quantization: "Q4_K_M",

        sizeBytes: 806 * MB,

        requirements: {
            minimumRamGB: 3,
            recommendedRamGB: 4,
        },

        capabilities: ["chat", "multilingual"],

        qualityScore: 65,

        description:
            "Compact instruction-tuned Gemma model designed for efficient local inference.",
    },

    {
        id: "gemma-3-4b",
        name: "Gemma 3 4B",
        provider: "Google",
        family: "gemma",

        modelId: "ggml-org/gemma-3-4b-it-GGUF/gemma-3-4b-it-Q4_K_M.gguf",

        parameterCount: "4B",
        quantization: "Q4_K_M",

        sizeBytes: 2.49 * GB,

        requirements: {
            minimumRamGB: 6,
            recommendedRamGB: 8,
        },

        capabilities: ["chat", "reasoning", "multilingual", "vision"],

        qualityScore: 80,

        description:
            "Strong multimodal Gemma model for capable devices, supporting text and image understanding.",
    },
];
