import OpenAI from "openai";

const a4fApiKey = process.env.A4F_API_KEY;
const a4fBaseUrl = "https://api.a4f.co/v1";

export const a4fClient = new OpenAI({
  apiKey: a4fApiKey,
  baseURL: a4fBaseUrl,
});

export const AI_MODELS = [
  { id: "provider-3/gpt-5-nano", name: "GPT-5-Nano", color: "orange" },
  { id: "provider-5/grok-4-0709", name: "Grok-4", color: "red" },
  { id: "provider-1/deepseek-v3.1", name: "DeepSeek v3.1", color: "amber" },
];

