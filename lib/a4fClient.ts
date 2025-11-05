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
  provider?: 'a4f' | 'google' | 'openrouter' | 'groq';
  fallbackId?: string;
  fallbackProvider?: 'openrouter' | 'google';
}

export const AI_MODELS: AIModel[] = [
  { 
    id: "openai/gpt-oss-120b", 
    name: "GPT-5", 
    color: "orange", 
    supportsVision: false,
    provider: "groq"
  },
  { 
    id: "provider-3/llama-4-scout", 
    name: "Llama-4", 
    color: "red", 
    supportsVision: false,
    fallbackId: "meta-llama/llama-4-scout:free",
    fallbackProvider: "openrouter"
  },
  { 
    id: "deepseek/deepseek-chat-v3.1:free", 
    name: "DeepSeek v3.1", 
    color: "amber", 
    supportsVision: false,
    provider: "openrouter"
  },
  { 
    id: "gemini-2.5-flash-lite", 
    name: "Google Gemini 2.5 Pro", 
    color: "blue", 
    supportsVision: true,
    provider: "google"
  },
];

