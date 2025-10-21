import OpenAI from "openai";

const a4fApiKey = process.env.A4F_API_KEY;
const a4fBaseUrl = "https://api.a4f.co/v1";

export const a4fClient = new OpenAI({
  apiKey: a4fApiKey,
  baseURL: a4fBaseUrl,
});

export interface AIModel {
  id: string;
  name: string;
  color: string;
  supportsVision: boolean;
}

export const AI_MODELS: AIModel[] = [
  { id: "provider-3/gpt-5-nano", name: "GPT-5-Nano", color: "orange", supportsVision: true },
  { id: "provider-5/grok-4-0709", name: "Grok-4", color: "red", supportsVision: false },
  { id: "provider-1/deepseek-v3.1", name: "DeepSeek v3.1", color: "amber", supportsVision: false },
];

