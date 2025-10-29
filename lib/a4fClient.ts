import OpenAI from "openai";

const a4fApiKey = process.env.A4F_API_KEY;
const a4fBaseUrl = "https://api.a4f.co/v1";

export const a4fClient = new OpenAI({
  apiKey: a4fApiKey,
  baseURL: a4fBaseUrl,
  timeout: 60000, // 60s timeout - more reasonable for API calls
  maxRetries: 2, // Allow 2 retries for reliability
});

export interface AIModel {
  id: string;
  name: string;
  color: string;
  supportsVision: boolean;
  fallbackId?: string;
  fallbackProvider?: 'openrouter';
}

export const AI_MODELS: AIModel[] = [
  { id: "provider-3/gpt-5-nano", name: "GPT-5", color: "orange", supportsVision: true },
  { 
    id: "provider-3/llama-4-scout", 
    name: "Lima-4", 
    color: "red", 
    supportsVision: false,
    fallbackId: "meta-llama/llama-4-scout:free",
    fallbackProvider: "openrouter"
  },
  { 
    id: "provider-1/deepseek-v3.1", 
    name: "DeepSeek v3.1", 
    color: "amber", 
    supportsVision: false,
    fallbackId: "deepseek/deepseek-chat-v3.1:free",
    fallbackProvider: "openrouter"
  },
  { id: "provider-3/gemini-2.5-flash-lite-preview-09-2025", name: "Google Gemini 2.5 Pro", color: "blue", supportsVision: true },
];

