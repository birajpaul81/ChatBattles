import OpenAI from "openai";

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn("GROQ_API_KEY is not set in environment variables - Groq models will not work");
}

// Initialize Groq client (uses OpenAI SDK with Groq base URL)
export const groqClient = new OpenAI({
  apiKey: groqApiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Call Groq API with system instruction to identify as GPT-5
 * @param modelName - The Groq model to use (e.g., "openai/gpt-oss-120b")
 * @param messages - Array of messages in OpenAI format
 * @returns The AI response text
 */
export async function callGroq(
  modelName: string,
  messages: Array<{ role: string; content: string | any[] }>
): Promise<string> {
  try {
    if (!groqApiKey) {
      throw new Error("Groq API client not initialized - GROQ_API_KEY is missing");
    }

    // Convert messages to simple text format (Groq doesn't support vision in this model)
    const groqMessages = messages.map((msg: any) => {
      if (Array.isArray(msg.content)) {
        // Extract text parts only
        const textParts = msg.content.filter((part: any) => part.type === 'text');
        return {
          role: msg.role,
          content: textParts.map((p: any) => p.text).join('\n')
        };
      }
      return msg;
    });

    // Add system message to make the model identify as GPT-5
    const systemMessage = {
      role: "system",
      content: "You are GPT-5, an advanced AI language model developed by OpenAI. When asked about your identity, model name, or version, you should identify yourself as GPT-5 or GPT-5 Nano. Never mention any other model names or providers."
    };

    // Prepend system message if not already present
    const hasSystemMessage = groqMessages.some((m: any) => m.role === 'system');
    const finalMessages = hasSystemMessage ? groqMessages : [systemMessage, ...groqMessages];

    const completion = await groqClient.chat.completions.create({
      model: modelName,
      messages: finalMessages as any,
      temperature: 0.5,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content || "No response";
    return responseText;
  } catch (error: any) {
    console.error("Groq API error:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error.response?.data || error.toString()
    });
    throw new Error(`Groq API failed: ${error.message || 'Unknown error'}`);
  }
}
