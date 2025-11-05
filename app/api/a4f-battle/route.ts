import { NextResponse } from "next/server";
import { a4fClient, AI_MODELS } from "@/lib/a4fClient";
import { openRouterClient } from "@/lib/openRouterClient";
import { callGemini } from "@/lib/googleClient";
import { callGroq } from "@/lib/groqClient";
import { checkIpRateLimit, checkUserRateLimit, getClientIp } from "@/lib/rateLimit";
import { logApiRequest } from "@/lib/apiLogger";
import { auth } from "@clerk/nextjs/server";

// Helper function to clean tokenizer artifacts and special tokens from responses
function cleanModelResponse(text: string): string {
  return text
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
    .replace(/<\/SYS>>/g, '')
    .trim();
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let userId: string | null = null;
  let clientIp: string = '';
  
  try {
    // Get user authentication and IP
    const authResult = await auth();
    userId = authResult.userId;
    clientIp = getClientIp(req);
    
    // Check rate limits
    if (userId) {
      // User-based rate limit
      const rateLimitResult = await checkUserRateLimit(userId, 'battle');
      if (!rateLimitResult.allowed) {
        // Log rate limit hit
        await logApiRequest({
          userId,
          ipAddress: clientIp,
          modelName: 'N/A',
          provider: 'a4f',
          rateLimited: true,
          error: false,
          responseTime: (Date.now() - startTime) / 1000,
        });
        
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
      
      // Add rate limit info to response headers
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      headers.set('X-RateLimit-Reset', rateLimitResult.resetAt.toISOString());
    } else {
      // IP-based rate limit for anonymous users
      const rateLimitResult = await checkIpRateLimit(clientIp);
      
      if (!rateLimitResult.allowed) {
        // Log rate limit hit
        await logApiRequest({
          ipAddress: clientIp,
          modelName: 'N/A',
          provider: 'a4f',
          rateLimited: true,
          error: false,
          responseTime: (Date.now() - startTime) / 1000,
        });
        
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
    
    const { prompt, conversationHistory = [], attachments } = await req.json();

    // Minimal logging for performance
    console.log('API: Received prompt with', conversationHistory.length, 'history items');

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid prompt" },
        { status: 400 }
      );
    }

    // Check if images are present
    const hasImages = attachments && attachments.some((a: any) => a.type === 'image');

    // Step 1: Use Gemini to analyze images for non-vision models
    let visionAnalysis = '';
    
    if (hasImages) {
      try {
        // Build multimodal message for Gemini
        const analysisMessages: any[] = [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Analyze this image in detail. Describe: 1) Main subject/content, 2) Visual style and composition, 3) Colors and lighting, 4) Mood/atmosphere, 5) Any text or notable details. Be thorough and professional - this description will help other AI models understand the image." 
              },
              ...attachments
                .filter((a: any) => a.type === 'image')
                .map((a: any) => ({
                  type: "image_url",
                  image_url: { url: a.data }
                }))
            ]
          }
        ];

        // Use Gemini to analyze the image
        console.log('Using Gemini to analyze image for non-vision models...');
        visionAnalysis = await callGemini('gemini-2.5-flash-lite', analysisMessages);
        console.log('✅ Gemini analysis complete - will be shared with non-vision models');
      } catch (error) {
        console.error('❌ Failed to generate Gemini vision analysis:', error);
        visionAnalysis = '[Image present but analysis unavailable]';
      }
    }

    // Step 2: Process all models with appropriate content
    // Vision models receive images directly
    // Non-vision models receive vision analysis if available
    const results = await Promise.all(
      AI_MODELS.map(async (modelInfo) => {
        try {
          // Build messages based on model capabilities
          const modelMessages: any[] = [];
          
          // Process conversation history (only last 4 messages for speed)
          const recentHistory = conversationHistory.slice(-4);
          {
            for (const historyItem of recentHistory) {
              if (historyItem.role === 'user' && Array.isArray(historyItem.content)) {
                // This is multimodal content
                if (modelInfo.supportsVision) {
                  // Vision model: send without timestamp
                  modelMessages.push({
                    role: historyItem.role,
                    content: historyItem.content
                  });
                } else {
                  // Non-vision model: convert to text-only
                  let textContent = '';
                  let hasImage = false;
                  
                  for (const part of historyItem.content) {
                    if (part.type === 'text') {
                      textContent += part.text;
                    } else if (part.type === 'image_url') {
                      hasImage = true;
                    }
                  }
                  
                  if (hasImage) {
                    textContent += '\n\n[Note: Previous message contained an image that was analyzed]';
                  }
                  
                  modelMessages.push({
                    role: historyItem.role,
                    content: textContent
                  });
                }
              } else {
                // Regular text message - strip timestamp
                modelMessages.push({
                  role: historyItem.role,
                  content: historyItem.content
                });
              }
            }
          }
          
          // Process current message with attachments
          let userContent: any = prompt;
          
          if (attachments && attachments.length > 0) {
            if (modelInfo.supportsVision) {
              // Vision model: use multimodal format
              const contentParts: any[] = [{ type: "text", text: prompt }];
              
              for (const attachment of attachments) {
                if (attachment.type === 'image') {
                  contentParts.push({
                    type: "image_url",
                    image_url: {
                      url: attachment.data
                    }
                  });
                } else if (attachment.type === 'document') {
                  contentParts[0].text += `\n\n[File: ${attachment.filename}]\n${attachment.data}`;
                }
              }
              
              userContent = contentParts;
            } else {
              // Non-vision model: use Gemini's analysis
              let textContent = prompt;
              
              // Add Gemini's vision analysis if available
              if (hasImages && visionAnalysis) {
                // Seamlessly integrate the image description into the prompt
                textContent = `${prompt}\n\n[Context: The image shows: ${visionAnalysis}]`;
              }
              
              // Add document content
              for (const attachment of attachments) {
                if (attachment.type === 'document') {
                  textContent += `\n\n[File: ${attachment.filename}]\n${attachment.data}`;
                }
              }
              
              userContent = textContent;
            }
          }
          
          modelMessages.push({ role: "user", content: userContent });

          const temperature = 0.5;

          // Check if this is a direct Google model
          if (modelInfo.provider === 'google') {
            try {
              // Pass messages as-is to Google (supports multimodal)
              // Google client will handle the conversion
              console.log(`Calling Google Gemini API directly with model: ${modelInfo.id}`);
              console.log(`Has images: ${modelMessages.some((m: any) => Array.isArray(m.content))}`);
              const responseText = await callGemini(modelInfo.id, modelMessages);
              
              return {
                model: modelInfo.id,
                name: modelInfo.name,
                text: cleanModelResponse(responseText),
                usedFallback: false,
              };
            } catch (googleError: any) {
              console.error(`${modelInfo.name}: Google API error:`, googleError);
              return {
                model: modelInfo.id,
                name: modelInfo.name,
                text: `⚠️ Error: ${googleError.message || 'Failed to get response from Google Gemini'}`,
              };
            }
          }

          // Check if this is a direct Groq model
          if (modelInfo.provider === 'groq') {
            try {
              console.log(`Calling Groq API directly with model: ${modelInfo.id}`);
              const responseText = await callGroq(modelInfo.id, modelMessages);
              
              return {
                model: modelInfo.id,
                name: modelInfo.name,
                text: cleanModelResponse(responseText),
                usedFallback: false,
              };
            } catch (groqError: any) {
              console.error(`${modelInfo.name}: Groq API error:`, groqError);
              return {
                model: modelInfo.id,
                name: modelInfo.name,
                text: `⚠️ Error: ${groqError.message || 'Failed to get response from GPT-5'}`,
              };
            }
          }

          // Check if this is a direct OpenRouter model
          if (modelInfo.provider === 'openrouter') {
            try {
              // Convert messages to simple text format for OpenRouter
              const openRouterMessages = modelMessages.map((msg: any) => {
                if (Array.isArray(msg.content)) {
                  // Extract text parts only (OpenRouter free models don't support vision)
                  const textParts = msg.content.filter((part: any) => part.type === 'text');
                  return {
                    role: msg.role,
                    content: textParts.map((p: any) => p.text).join('\n')
                  };
                }
                return msg;
              });

              console.log(`Calling OpenRouter API directly with model: ${modelInfo.id}`);
              const completion = await openRouterClient.chat.completions.create({
                model: modelInfo.id,
                messages: openRouterMessages,
                temperature: 0.5,
                max_tokens: 500,
              });

              const responseText = completion.choices[0].message.content || "No response";
              
              return {
                model: modelInfo.id,
                name: modelInfo.name,
                text: cleanModelResponse(responseText),
                usedFallback: false,
              };
            } catch (openRouterError: any) {
              console.error(`${modelInfo.name}: OpenRouter API error:`, openRouterError);
              return {
                model: modelInfo.id,
                name: modelInfo.name,
                text: `⚠️ Error: ${openRouterError.message || 'Failed to get response'}`,
              };
            }
          }

          // For A4F models
          // Check if this model has fallback configured
          const hasFallback = modelInfo.fallbackId && (modelInfo.fallbackProvider === 'openrouter' || modelInfo.fallbackProvider === 'google');
          const timeoutMs = hasFallback ? 30000 : 60000; // 30s for models with fallback, 60s otherwise

          try {
            // Log request details for debugging
            if (modelInfo.id === 'provider-5/gpt-5-nano') {
              console.log('GPT-5 Request:', {
                model: modelInfo.id,
                messageCount: modelMessages.length,
                firstMessage: modelMessages[0],
                hasMultimodal: modelMessages.some((m: any) => Array.isArray(m.content))
              });
            }

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
            });

            // Build request options based on provider
            const requestOptions: any = {
              model: modelInfo.id,
              messages: modelMessages,
            };
            
            // provider-5 doesn't accept temperature/max_tokens parameters
            if (!modelInfo.id.startsWith('provider-5/')) {
              requestOptions.temperature = temperature;
              requestOptions.max_tokens = 500;
            }

            // Race between API call and timeout
            const completion = await Promise.race([
              a4fClient.chat.completions.create(requestOptions),
              timeoutPromise
            ]) as any;

            const responseText = completion.choices[0].message.content || "No response";

            return {
              model: modelInfo.id,
              name: modelInfo.name,
              text: cleanModelResponse(responseText),
              usedFallback: false,
            };
          } catch (apiError: any) {
            // Check if we should try fallback
            if (hasFallback && (apiError.message === 'TIMEOUT' || apiError.status === 500 || apiError.code === 'ECONNABORTED' || apiError.code === 'ETIMEDOUT')) {
              const fallbackProvider = modelInfo.fallbackProvider;
              console.log(`${modelInfo.name}: Primary A4F failed/timed out, trying ${fallbackProvider} fallback...`);
              
              try {
                // Convert messages to simple text format
                const fallbackMessages = modelMessages.map((msg: any) => {
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

                let responseText: string;

                if (fallbackProvider === 'google') {
                  // Use Google Gemini API
                  console.log(`Calling Google Gemini API with model: ${modelInfo.fallbackId}`);
                  console.log(`Message count: ${fallbackMessages.length}`);
                  responseText = await callGemini(modelInfo.fallbackId!, fallbackMessages);
                  console.log(`Google Gemini response received: ${responseText.substring(0, 100)}...`);
                } else {
                  // Use OpenRouter
                  const fallbackCompletion = await openRouterClient.chat.completions.create({
                    model: modelInfo.fallbackId!,
                    messages: fallbackMessages,
                    temperature: temperature,
                    max_tokens: 500,
                  });
                  responseText = fallbackCompletion.choices[0].message.content || "No response";
                }
                
                // responseText is assigned above in both branches

                return {
                  model: modelInfo.id,
                  name: modelInfo.name,
                  text: cleanModelResponse(responseText),
                  usedFallback: true,
                };
              } catch (fallbackError: any) {
                console.error(`${modelInfo.name}: ${fallbackProvider} fallback also failed:`, fallbackError);
                // If fallback fails, throw the original error
                throw apiError;
              }
            }
            // If it's a vision model with images, try again without images
            if (modelInfo.supportsVision && hasImages && apiError.status === 500) {
              console.log(`${modelInfo.name}: Retrying without images due to API error`);
              
              try {
                // Retry with text-only
                const textOnlyMessages = modelMessages.map(msg => {
                  if (Array.isArray(msg.content)) {
                    // Extract only text parts
                    const textParts = msg.content.filter((part: any) => part.type === 'text');
                    return {
                      ...msg,
                      content: textParts.map((p: any) => p.text).join('\n') + '\n\n[Note: Image processing temporarily unavailable for this model]'
                    };
                  }
                  return msg;
                });

                const retryCompletion = await a4fClient.chat.completions.create({
                  model: modelInfo.id,
                  messages: textOnlyMessages,
                  temperature: temperature,
                  max_tokens: 500,
                });

                const responseText = retryCompletion.choices[0].message.content || "No response";

                return {
                  model: modelInfo.id,
                  name: modelInfo.name,
                  text: `⚠️ Image processing temporarily unavailable. Text response:\n\n${cleanModelResponse(responseText)}`,
                };
              } catch {
                // If retry also fails, return error
                throw apiError;
              }
            }
            
            // If not a vision model or retry failed, throw the error
            throw apiError;
          }
        } catch (error: any) {
          // Enhanced error logging for GPT-5
          if (modelInfo.id === 'provider-5/gpt-5-nano') {
            console.error(`GPT-5 Error Details:`, {
              status: error.status,
              code: error.code,
              type: error.type,
              error: error.error,
              message: error.message,
              fullError: JSON.stringify(error, null, 2)
            });
          } else {
            console.error(`Error with model ${modelInfo.id}:`, error);
          }
          
          // Provide more helpful error messages
          let errorMessage = "Failed to get response";
          
          if (error.status === 500) {
            errorMessage = "The AI service is temporarily unavailable. Please try again.";
          } else if (error.status === 429) {
            errorMessage = "Rate limit reached. Please wait a moment and try again.";
          } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            errorMessage = "Request timed out. The model may be overloaded.";
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          return {
            model: modelInfo.id,
            name: modelInfo.name,
            text: `⚠️ Error: ${errorMessage}`,
          };
        }
      })
    );

    // Log each model request
    const responseTime = (Date.now() - startTime) / 1000;
    
    for (const result of results) {
      await logApiRequest({
        userId: userId || undefined,
        ipAddress: clientIp || undefined,
        modelName: result.name,
        provider: result.usedFallback ? 'openrouter' : (
          result.model.includes('gemini') ? 'google' :
          result.model.includes('gpt') ? 'groq' :
          result.model.includes('openrouter') ? 'openrouter' : 'a4f'
        ),
        usedFallback: result.usedFallback || false,
        rateLimited: false,
        error: result.text?.includes('⚠️ Error') || false,
        errorMessage: result.text?.includes('⚠️ Error') ? result.text : undefined,
        responseTime: responseTime,
        cost: 0, // Free tier
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("A4F Battle Error:", error);
    
    // Log error
    await logApiRequest({
      userId: userId || undefined,
      ipAddress: clientIp || undefined,
      modelName: 'N/A',
      provider: 'a4f',
      rateLimited: false,
      error: true,
      errorMessage: error.message,
      responseTime: (Date.now() - startTime) / 1000,
    });
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

