import { NextResponse } from "next/server";
import { a4fClient, AI_MODELS } from "@/lib/a4fClient";

export async function POST(req: Request) {
  try {
    const { prompt, conversationHistory = [] } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid prompt" },
        { status: 400 }
      );
    }

    const models = AI_MODELS.map((m) => m.id);

    // Build messages array with conversation history
    const messages = [
      ...conversationHistory,
      { role: "user", content: prompt }
    ];

    const results = await Promise.all(
      models.map(async (model, index) => {
        try {
          const completion = await a4fClient.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          });

          return {
            model,
            name: AI_MODELS[index].name,
            text: completion.choices[0].message.content || "No response",
          };
        } catch (error: any) {
          console.error(`Error with model ${model}:`, error);
          return {
            model,
            name: AI_MODELS[index].name,
            text: `Error: ${error.message || "Failed to get response"}`,
          };
        }
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("A4F Battle Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

