import { GoogleGenerativeAI } from "@google/generative-ai";

const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
  console.warn("GOOGLE_API_KEY is not set in environment variables - Google Gemini fallback will not work");
}

// Initialize with a placeholder if key is missing (will fail at runtime but won't crash at import)
export const googleAI = googleApiKey ? new GoogleGenerativeAI(googleApiKey) : null;

/**
 * Call Google Gemini API with support for text and images
 * @param modelName - The Gemini model to use (e.g., "gemini-2.0-flash-exp")
 * @param messages - Array of messages in OpenAI format (can include images)
 * @returns The AI response text
 */
export async function callGemini(
  modelName: string,
  messages: Array<{ role: string; content: string | any[] }>
): Promise<string> {
  try {
    if (!googleAI) {
      throw new Error("Google AI client not initialized - GOOGLE_API_KEY is missing");
    }

    const model = googleAI.getGenerativeModel({ model: modelName });

    // Filter out system messages and convert to Gemini format
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    // Convert OpenAI format messages to Gemini format
    const geminiMessages = nonSystemMessages.map((msg) => {
      // Gemini uses 'user' and 'model' roles instead of 'user' and 'assistant'
      const role = msg.role === 'assistant' ? 'model' : 'user';
      
      // Handle multimodal content (text + images)
      if (Array.isArray(msg.content)) {
        const parts = msg.content.map((part: any) => {
          if (part.type === 'text') {
            return { text: part.text };
          } else if (part.type === 'image_url') {
            // Extract base64 data from data URL
            const base64Data = part.image_url.url.split(',')[1] || part.image_url.url;
            return {
              inlineData: {
                mimeType: 'image/jpeg', // Default to JPEG, could be detected
                data: base64Data
              }
            };
          }
          return { text: '' };
        });
        return { role, parts };
      } else {
        // Simple text message
        return {
          role,
          parts: [{ text: msg.content }],
        };
      }
    });

    // If there's only one message, use generateContent instead of chat
    if (geminiMessages.length === 1) {
      const result = await model.generateContent(geminiMessages[0].parts);
      const response = await result.response;
      return response.text();
    }

    // For multi-turn conversations, use chat
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1), // All messages except the last one
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500,
      },
    });

    // Send the last message
    const lastMessageParts = geminiMessages[geminiMessages.length - 1].parts;
    const result = await chat.sendMessage(lastMessageParts);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error: any) {
    console.error("Google Gemini API error:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error.response?.data || error.toString()
    });
    throw new Error(`Gemini API failed: ${error.message || 'Unknown error'}`);
  }
}
