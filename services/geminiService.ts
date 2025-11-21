import { GoogleGenAI } from "@google/genai";
import { AISettings } from "../types";

// Helper to check API Key for Veo/Pro Image models
export const ensureApiKey = async () => {
  // Cast window to any to access aistudio property and avoid TypeScript interface conflict
  const win = window as any;
  if (win.aistudio && win.aistudio.openSelectKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
};

const getAIClient = () => {
  // Always create a new client to capture the latest selected key
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Robust JSON extraction helper
const extractJSON = (text: string): any => {
  if (!text) return null;
  
  // 1. Try to locate the JSON block explicitly
  // Look for ```json and ``` markers first
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
     try {
        return JSON.parse(jsonBlockMatch[1]);
     } catch (e) {
        console.warn("Failed to parse markdown JSON block, trying generic extraction.");
     }
  }

  // 2. Generic extraction finding first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
     // Fallback: maybe it's an array?
     if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
         try { return JSON.parse(text); } catch(e) {}
     }
     throw new Error("No JSON object structure found in AI response.");
  }

  const jsonString = text.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON Parse failed:", e, "Content:", jsonString);
    // Attempt basic cleanup for common trailing comma issues or newlines
    try {
        const cleaned = jsonString.replace(/,\s*}/g, '}').replace(/\n/g, '\\n');
        return JSON.parse(cleaned);
    } catch (e2) {
        throw new Error("Failed to parse AI response. Output was not valid JSON. Please try again.");
    }
  }
};

export const analyzeTrendsAndPickTopic = async (settings: AISettings): Promise<{ topic: string; analysis: string }> => {
  const ai = getAIClient();
  
  const basePrompt = `
    Act as a professional SEO trend analyst.
    Analyze current trends related to the niche: "${settings.niche}".
    You MUST incorporate insights from the following specific keywords: "${settings.keywords}".
    
    Task:
    1. Identify a specific, high-engagement trending topic suitable for a long-form blog post.
    2. Provide a brief analysis (2-3 sentences) explaining why this topic is trending.
    
    Output Language: ${settings.language}.
    
    CRITICAL OUTPUT INSTRUCTION:
    - You MUST return RAW JSON only.
    - JSON Structure: { "topic": "...", "analysis": "..." }
  `;

  // Strategy: Try with Google Search Tool first. If 403/Permission error, fallback to basic generation.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: basePrompt,
      config: {
        tools: [{ googleSearch: {} }], // This might cause 403 on free keys
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Failed to generate topic");
    return extractJSON(text) || { topic: "New Topic", analysis: "Generated based on keywords." };

  } catch (error: any) {
    if (error.toString().includes('403') || error.toString().includes('PERMISSION_DENIED')) {
      console.warn("Google Search Tool access denied. Falling back to basic trend analysis.");
      
      // Fallback: Run without tools
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: basePrompt + "\n(Note: Generate based on your internal knowledge base as search is unavailable).",
      });
      
      const text = fallbackResponse.text;
      if (!text) throw new Error("Failed to generate topic in fallback mode");
      return extractJSON(text) || { topic: settings.niche + " Trends", analysis: "Fallback analysis." };
    }
    throw error;
  }
};

export const generateArticleContent = async (topic: string, settings: AISettings): Promise<{ title: string; content: string; excerpt: string; tags: string[]; category: string; imagePrompt: string }> => {
  const ai = getAIClient();

  const prompt = `
    Write a comprehensive, professional blog post about: "${topic}".
    
    Requirements:
    1. Language: ${settings.language}.
    2. Tone: Professional, engaging, and authoritative.
    3. Structure: Use HTML tags (<h1>, <h2>, <p>, <ul>, <li>) for formatting. 
    4. Length: Long-form, detailed (at least 800 words).
    5. Include a short excerpt (summary) and a list of 3-5 relevant tags.
    6. Classify this article into one of these categories: 'التكنولوجيا', 'الذكاء الاصطناعي', 'الاقتصاد', 'الصحة', 'نمط الحياة', 'عام'.
    7. Generate a highly detailed, photorealistic, creative AI image generation prompt (IN ENGLISH) that visually represents the specific content and theme of this article.
    
    CRITICAL OUTPUT INSTRUCTION:
    - Return RAW JSON only.
    - DO NOT use Markdown code blocks (no \`\`\`json).
    - Ensure all newlines within the "content" string are properly escaped (e.g., use \\n instead of literal line breaks).
    - Ensure all quotes within strings are escaped.
    
    JSON Structure:
    {
      "title": "The Title",
      "content": "<h1>Title</h1><p>Content...</p>",
      "excerpt": "The summary...",
      "tags": ["tag1", "tag2"],
      "category": "Category Name",
      "imagePrompt": "A cinematic shot of a robot teaching a human, 8k resolution, dramatic lighting..."
    }
  `;

  // We use standard generateContent. Note: googleSearch removed here to reduce 403 risk for content generation
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', 
    contents: prompt,
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate content");
  
  const data = extractJSON(text);

  if (!data || typeof data !== 'object') {
    throw new Error("AI response was not a valid JSON object structure.");
  }

  if (!data.title) data.title = topic;
  if (!data.content) data.content = `<p>${topic}</p>`;
  if (!data.excerpt) data.excerpt = "ملخص المقال غير متوفر.";
  if (!data.category) data.category = "عام";
  if (!data.imagePrompt) data.imagePrompt = `A professional, cinematic image representing ${topic}, high quality, 8k resolution.`;

  if (!Array.isArray(data.tags)) {
    if (typeof data.tags === 'string') {
      data.tags = (data.tags as string).split(',').map(t => t.trim());
    } else {
      data.tags = ['عام', 'تكنولوجيا', 'AI'];
    }
  }

  return data;
};

export const generateBlogImage = async (imagePrompt: string, quality: '1K' | '2K' | '4K'): Promise<string> => {
  await ensureApiKey();
  const ai = getAIClient();

  // Strategy: Try Gemini 3 Pro Image (Nano Banana Pro) first.
  // If 403/Permission Denied, fallback to Gemini 2.5 Flash Image (Nano Banana).

  try {
    const model = 'gemini-3-pro-image-preview';
    const finalPrompt = `High quality, photorealistic, cinematic 8k render, highly detailed: ${imagePrompt}. No text on image.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: quality, // Only supported on Pro
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    // Detect Permission Error
    if (error.toString().includes('403') || error.toString().includes('PERMISSION_DENIED')) {
        console.warn("Gemini 3 Pro Image access denied (403). Falling back to Flash Image model.");
        
        // Fallback
        try {
            const fallbackModel = 'gemini-2.5-flash-image';
            const fallbackResponse = await ai.models.generateContent({
                model: fallbackModel,
                contents: { parts: [{ text: imagePrompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: "16:9"
                        // imageSize is NOT supported on flash-image, so we omit it
                    }
                },
            });
            for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        } catch (fallbackError: any) {
             console.error("Fallback image generation failed:", fallbackError);
             throw new Error("Could not generate image. Please check API Key permissions.");
        }
    } else {
        // If it's another error (like safety), rethrow it
        throw error;
    }
  }

  throw new Error("No image data returned from AI.");
};