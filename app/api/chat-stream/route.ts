import { NextResponse } from 'next/server';
import { a4fClient } from '@/lib/a4fClient';
import { groqClient } from '@/lib/groqClient';
import { googleAI } from '@/lib/googleClient';
import { openRouterClient } from '@/lib/openRouterClient';
import { checkIpRateLimit, checkUserRateLimit, getClientIp } from '@/lib/rateLimit';
import { auth } from '@clerk/nextjs/server';

// Helper function to clean tokenizer artifacts and special tokens from responses
// NOTE: Don't trim() when processing streaming chunks to preserve spaces!
function cleanModelResponse(text: string, isStreamingChunk: boolean = false): string {
  const cleaned = text
    // Remove begin/end of sentence tokens (with full-width vertical bar)
    .replace(/<｜begin▁of▁sentence｜>/g, '')
    .replace(/<｜end▁of▁sentence｜>/g, '')
    // Remove begin/end of text tokens (with regular vertical bar)
    .replace(/<\|begin_of_text\|>/g, '')
    .replace(/<\|end_of_text\|>/g, '')
    // Remove sentence markers
    .replace(/<s>/g, '')
    .replace(/<\/s>/g, '')
    // Remove thinking tags (Gemini)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    // Remove any other common tokenizer artifacts
    .replace(/\[INST\]/g, '')
    .replace(/\[\/INST\]/g, '')
    .replace(/<<SYS>>/g, '')
    .replace(/<\/SYS>>/g, '');
  
  // Only trim if it's NOT a streaming chunk (to preserve spaces between words)
  return isStreamingChunk ? cleaned : cleaned.trim();
}

export async function POST(req: Request) {
  try {
    // Get user authentication
    const { userId } = await auth();
    
    // Check rate limits
    if (userId) {
      const rateLimitResult = await checkUserRateLimit(userId, 'chat');
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: rateLimitResult.message,
            rateLimit: {
              remaining: rateLimitResult.remaining,
              limit: rateLimitResult.limit,
              resetAt: rateLimitResult.resetAt,
            }
          },
          { status: 429 }
        );
      }
    } else {
      const clientIp = getClientIp(req);
      const rateLimitResult = await checkIpRateLimit(clientIp);
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: rateLimitResult.message,
            rateLimit: {
              remaining: rateLimitResult.remaining,
              limit: rateLimitResult.limit,
              resetAt: rateLimitResult.resetAt,
            }
          },
          { status: 429 }
        );
      }
    }

    const { prompt, modelId, conversationHistory = [] } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    // Prepare messages with conversation history
    const messages: any[] = [];
    
    // Add last 6 messages from history for context
    // Strip out timestamp and any other properties not supported by the API
    const recentHistory = conversationHistory.slice(-6).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));
    messages.push(...recentHistory);
    
    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt,
    });

    console.log(`Chat Stream: ${modelId} - ${messages.length} messages`);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let response: any;

          // Handle Google Gemini separately (different API)
          if (modelId === 'gemini-2.5-flash-lite') {
            if (!googleAI) {
              throw new Error('Google AI not initialized');
            }

            const model = googleAI.getGenerativeModel({ model: modelId });
            
            // Convert messages to Gemini format
            const geminiMessages = messages.map((msg) => {
              const role = msg.role === 'assistant' ? 'model' : 'user';
              return {
                role,
                parts: [{ text: msg.content }],
              };
            });

            // Start chat with history
            const chat = model.startChat({
              history: geminiMessages.slice(0, -1),
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              },
            });

            // Send last message and stream response
            const lastMessage = geminiMessages[geminiMessages.length - 1].parts;
            const result = await chat.sendMessageStream(lastMessage);

            // Stream chunks
            for await (const chunk of result.stream) {
              const content = chunk.text();
              if (content) {
                const cleanedContent = cleanModelResponse(content, true);
                // Send even if cleanedContent is empty string (could be just spaces)
                const data = JSON.stringify({ content: cleanedContent });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              }
            }
          } else {
            // Handle OpenAI-compatible APIs (Groq, A4F, OpenRouter)
            let client: any;
            
            if (modelId === 'openai/gpt-oss-120b') {
              client = groqClient;
            } else if (modelId === 'deepseek/deepseek-chat-v3.1:free') {
              client = openRouterClient;
            } else if (modelId === 'provider-3/llama-4-scout') {
              client = a4fClient;
            } else {
              client = a4fClient;
            }

            const requestOptions: any = {
              model: modelId,
              messages: messages,
              stream: true,
              temperature: 0.7,
              max_tokens: 1000,
            };

            response = await client.chat.completions.create(requestOptions) as any;

            // Stream the response
            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                const cleanedContent = cleanModelResponse(content, true);
                // Send even if cleanedContent is empty string (could be just spaces)
                const data = JSON.stringify({ content: cleanedContent });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              }
            }
          }

          // Send done signal
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();

        } catch (error: any) {
          console.error('Streaming error:', error);
          const errorMessage = JSON.stringify({ 
            error: error.message || 'Streaming failed' 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorMessage}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat stream error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
