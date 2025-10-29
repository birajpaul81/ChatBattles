import OpenAI from "openai";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterBaseUrl = "https://openrouter.ai/api/v1";

export const openRouterClient = new OpenAI({
  apiKey: openRouterApiKey,
  baseURL: openRouterBaseUrl,
  timeout: 60000, // 60s timeout
  maxRetries: 1,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://chatbattles.com",
    "X-Title": "ChatBattles",
  },
});
