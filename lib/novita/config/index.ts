import OpenAI from "openai";

// Initialize Novita AI using the OpenAI SDK
export const novitaAI = new OpenAI({
  apiKey: process.env.NOVITA_API_KEY,
  baseURL: "https://api.novita.ai/openai",
});

export const LLM_MODELS = {
  DEEPSEEK_V4_PRO: "deepseek/deepseek-v4-pro",
  MINI_MAX_M3: "minimax/minimax-m3",
  QWEN_3_7_MAX: "qwen/qwen3.7-max",
  XIAOMI_MIMO_V2_5_PRO: "xiaomimimo/mimo-v2.5-pro",
};
