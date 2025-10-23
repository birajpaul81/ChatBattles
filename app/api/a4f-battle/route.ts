import { NextResponse } from "next/server";
import { a4fClient, AI_MODELS } from "@/lib/a4fClient";

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

    // Step 1: If images are present, get description from vision model first
    let imageDescription = '';
    const hasImages = attachments && attachments.some((a: any) => a.type === 'image');
    
    if (hasImages) {
      try {
        const visionModel = AI_MODELS.find(m => m.supportsVision);
        if (visionModel) {
          // Build multimodal message for image description
          const descriptionParts: any[] = [
            { 
              type: "text", 
              text: "Please provide a detailed description of the image(s) in 2-3 sentences. Focus on the key visual elements, text (if any), and overall context." 
            }
          ];
          
          for (const attachment of attachments) {
            if (attachment.type === 'image') {
              descriptionParts.push({
                type: "image_url",
                image_url: {
                  url: attachment.data
                }
              });
            }
          }
          
          const descriptionResponse = await a4fClient.chat.completions.create({
            model: visionModel.id,
            messages: [{ role: "user", content: descriptionParts }],
            temperature: 0.3,
            max_tokens: 150,
          });
          
          imageDescription = descriptionResponse.choices[0].message.content || '';
          console.log('Image description generated:', imageDescription.substring(0, 50) + '...');
        }
      } catch (error) {
        console.error('Error generating image description:', error);
      }
    }

    // Step 2: Process all models with appropriate content
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
          let imageDescriptionPrefix = '';
          
          // Prepare image description prefix for non-vision models
          if (!modelInfo.supportsVision && imageDescription) {
            imageDescriptionPrefix = `[Image Description: ${imageDescription}]\n\n`;
          }
          
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
              // Non-vision model: use text with image description
              let textContent = imageDescriptionPrefix + userContent; // Prepend image description
              
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

          // Minimal logging
          if (!modelInfo.supportsVision && imageDescription) {
            console.log(`${modelInfo.name}: Using image description`);
          }

          const temperature = 0.5;

          const completion = await a4fClient.chat.completions.create({
            model: modelInfo.id,
            messages: modelMessages,
            temperature: temperature,
            max_tokens: 500,
          });

          let responseText = completion.choices[0].message.content || "No response";
          
          // For Google Gemini, strip out any <think> tags and their content
          if (modelInfo.id === "provider-3/gemini-2.5-flash-lite-preview-09-2025") {
            responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          }

          return {
            model: modelInfo.id,
            name: modelInfo.name,
            text: responseText,
          };
        } catch (error: any) {
          console.error(`Error with model ${modelInfo.id}:`, error);
          return {
            model: modelInfo.id,
            name: modelInfo.name,
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

