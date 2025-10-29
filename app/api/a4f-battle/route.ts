import { NextResponse } from "next/server";
import { a4fClient, AI_MODELS } from "@/lib/a4fClient";
import { openRouterClient } from "@/lib/openRouterClient";

export async function POST(req: Request) {
  try {
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

    // Step 1: Process vision models first if images are present
    let visionAnalysis = '';
    const visionModels = AI_MODELS.filter(m => m.supportsVision);
    const nonVisionModels = AI_MODELS.filter(m => !m.supportsVision);
    
    if (hasImages && visionModels.length > 0) {
      // Get analysis from first vision model (GPT-5-Nano)
      const primaryVisionModel = visionModels[0];
      try {
        const analysisMessages: any[] = [
          {
            role: "user",
            content: [
              { type: "text", text: "Provide a detailed description of this image in 3-4 sentences. Focus on key visual elements, composition, colors, mood, and any text or objects present." },
              ...attachments
                .filter((a: any) => a.type === 'image')
                .map((a: any) => ({
                  type: "image_url",
                  image_url: { url: a.data }
                }))
            ]
          }
        ];

        const analysisResponse = await a4fClient.chat.completions.create({
          model: primaryVisionModel.id,
          messages: analysisMessages,
          temperature: 0.3,
          max_tokens: 200,
        });

        visionAnalysis = analysisResponse.choices[0].message.content || '';
        console.log('Vision analysis generated for non-vision models');
      } catch (error) {
        console.error('Failed to generate vision analysis:', error);
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
                  // Vision model: send as-is
                  modelMessages.push(historyItem);
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
                // Regular text message
                modelMessages.push(historyItem);
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
              // Non-vision model: skip images, only process documents
              let textContent = '';
              
              // Add helpful context if images are present
              if (hasImages) {
                // Check if user is asking for image analysis or prompt generation
                const isAskingForAnalysis = /analyze|describe|what.*image|tell.*about.*image|see.*image/i.test(prompt);
                const isAskingForPrompt = /prompt|recreate|generate.*similar|create.*same|replicate|write.*prompt/i.test(prompt);
                
                if (visionAnalysis && isAskingForPrompt) {
                  // User wants prompt generation and we have vision analysis
                  textContent = `[SYSTEM NOTE: The user has uploaded an image and wants help creating a detailed prompt to recreate it. Here is the image description to work with.]\n\n[Image Description: ${visionAnalysis}]\n\nUser's request: ${prompt}\n\nProvide a detailed analysis of the image, breaking down key elements like subject, mood, lighting, colors, composition, and style. Then create a comprehensive, detailed prompt suitable for AI image generation tools like Midjourney, DALL-E, or Stable Diffusion. Be thorough and professional.`;
                } else if (visionAnalysis && isAskingForAnalysis) {
                  // User wants analysis and we have it
                  textContent = `[SYSTEM NOTE: The user wants image analysis. Here is the image description.]\n\n[Image Description: ${visionAnalysis}]\n\nUser's request: ${prompt}\n\nProvide detailed, professional insights about the image. Analyze the composition, elements, mood, colors, and any notable features.`;
                } else if (visionAnalysis) {
                  // We have analysis but unclear what user wants
                  textContent = `[Image Description: ${visionAnalysis}]\n\n${prompt}`;
                } else if (isAskingForPrompt) {
                  // No analysis available but user wants prompt
                  textContent = `[SYSTEM NOTE: The user has uploaded an image and wants help creating a prompt to recreate it. You cannot see the image. Suggest checking the GPT-5-Nano or Gemini models' responses for image analysis, then offer to help craft a detailed prompt based on their description.]\n\nUser's request: ${prompt}`;
                } else if (isAskingForAnalysis) {
                  // No analysis available and user wants analysis
                  textContent = `[SYSTEM NOTE: The user has uploaded an image for analysis, but you are a text-only model. Suggest they check the GPT-5-Nano or Gemini 2.5 responses in this battle for image analysis.]\n\nUser's request: ${prompt}`;
                } else {
                  // No analysis and unclear intent
                  textContent = `[SYSTEM NOTE: The user has uploaded an image but you cannot view it. Ask them to describe the image if they need your help with it.]\n\nUser's request: ${prompt}`;
                }
              } else {
                textContent = prompt;
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

          // Check if this model has fallback configured
          const hasFallback = modelInfo.fallbackId && modelInfo.fallbackProvider === 'openrouter';
          const timeoutMs = hasFallback ? 30000 : 60000; // 30s for models with fallback, 60s otherwise

          try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
            });

            // Race between API call and timeout
            const completion = await Promise.race([
              a4fClient.chat.completions.create({
                model: modelInfo.id,
                messages: modelMessages,
                temperature: temperature,
                max_tokens: 500,
              }),
              timeoutPromise
            ]) as any;

            let responseText = completion.choices[0].message.content || "No response";
            
            // For Google Gemini, strip out any <think> tags and their content
            if (modelInfo.id === "provider-3/gemini-2.5-flash-lite-preview-09-2025") {
              responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            }

            return {
              model: modelInfo.id,
              name: modelInfo.name,
              text: responseText,
              usedFallback: false,
            };
          } catch (apiError: any) {
            // Check if we should try fallback
            if (hasFallback && (apiError.message === 'TIMEOUT' || apiError.status === 500 || apiError.code === 'ECONNABORTED' || apiError.code === 'ETIMEDOUT')) {
              console.log(`${modelInfo.name}: Primary A4F failed/timed out, trying OpenRouter fallback...`);
              
              try {
                // Convert messages to simple text format for OpenRouter
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

                const fallbackCompletion = await openRouterClient.chat.completions.create({
                  model: modelInfo.fallbackId!,
                  messages: fallbackMessages,
                  temperature: temperature,
                  max_tokens: 500,
                });

                const responseText = fallbackCompletion.choices[0].message.content || "No response";

                return {
                  model: modelInfo.id,
                  name: modelInfo.name,
                  text: responseText,
                  usedFallback: true,
                };
              } catch (fallbackError: any) {
                console.error(`${modelInfo.name}: OpenRouter fallback also failed:`, fallbackError);
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

                let responseText = retryCompletion.choices[0].message.content || "No response";
                
                if (modelInfo.id === "provider-3/gemini-2.5-flash-lite-preview-09-2025") {
                  responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                }

                return {
                  model: modelInfo.id,
                  name: modelInfo.name,
                  text: `⚠️ Image processing temporarily unavailable. Text response:\n\n${responseText}`,
                };
              } catch (retryError) {
                // If retry also fails, return error
                throw apiError;
              }
            }
            
            // If not a vision model or retry failed, throw the error
            throw apiError;
          }
        } catch (error: any) {
          console.error(`Error with model ${modelInfo.id}:`, error);
          
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

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("A4F Battle Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

