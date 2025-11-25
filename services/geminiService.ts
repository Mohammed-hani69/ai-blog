
import { GoogleGenAI } from "@google/genai";
import { AISettings } from "../types";

// Helper to check API Key for Veo/Pro Image models
export const ensureApiKey = async () => {
  const win = window as any;
  if (win.aistudio && win.aistudio.openSelectKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
};

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Robust error checker for 403/Permission issues
const isPermissionError = (error: any): boolean => {
  if (!error) return false;
  // Check string representation
  const msg = error.toString().toLowerCase();
  // Check detailed object properties if available
  const status = error.status || error.response?.status;
  const code = error.code || error.error?.code;
  
  return (
    msg.includes('403') || 
    msg.includes('permission_denied') || 
    msg.includes('permission denied') ||
    msg.includes('caller does not have permission') ||
    status === 403 || 
    code === 403 ||
    status === 'PERMISSION_DENIED'
  );
};

// Robust JSON extraction helper
const extractJSON = (text: string): any => {
  if (!text) return null;
  
  // 1. Try to locate the JSON block explicitly
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
    try {
        const cleaned = jsonString.replace(/,\s*}/g, '}').replace(/\n/g, '\\n');
        return JSON.parse(cleaned);
    } catch (e2) {
        throw new Error("Failed to parse AI response. Output was not valid JSON.");
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

  try {
    // Attempt using Google Search tool for real-time data
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: basePrompt,
      config: {
        tools: [{ googleSearch: {} }], 
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return extractJSON(text) || { topic: settings.niche, analysis: "Generated topic." };

  } catch (error: any) {
    // Check if it's a permission error (403) or any other tool error
    if (isPermissionError(error)) {
      console.warn("Google Search Tool access denied (403). Running fallback trend analysis.");
      
      // Fallback: Run without tools (Basic Generation)
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: basePrompt + "\n(Note: Generate based on your internal knowledge base as search is unavailable).",
        });
        
        const text = fallbackResponse.text;
        if (!text) throw new Error("Empty response in fallback");
        return extractJSON(text) || { topic: settings.niche + " Trends", analysis: "Fallback analysis." };
      } catch (fallbackError) {
        throw new Error("Failed to generate topic even in fallback mode.");
      }
    }
    // If it's not a permission error, re-throw it (e.g., network error)
    console.error("Trend Analysis Error:", error);
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
    3. Structure: 
       - Use HTML tags for formatting.
       - **IMPORTANT SEO RULE**: Do NOT use <h1> tags in the content. The title is already the H1. Start your content hierarchy with <h2>, then <h3>, etc.
       - Use <ul> and <li> for lists.
       - Use <p> for paragraphs.
    4. Length: Long-form, detailed (at least 800 words).
    5. Include a short excerpt (meta description style summary) and a list of 3-5 relevant tags.
    6. Classify this article into one of these categories: 'التكنولوجيا', 'الذكاء الاصطناعي', 'الاقتصاد', 'الصحة', 'نمط الحياة', 'عام'.
    7. Generate a highly detailed, creative AI image generation prompt (IN ENGLISH) that visually represents the specific content.
       - **IMAGE STYLE INSTRUCTION**: The user has requested the image style be: "${settings.imageStyle || 'Professional, cinematic, photorealistic'}". Ensure the prompt strictly adheres to this style.
    
    CRITICAL OUTPUT INSTRUCTION:
    - Return RAW JSON only.
    - DO NOT use Markdown code blocks.
    - Ensure all newlines within the "content" string are properly escaped.
    
    JSON Structure:
    {
      "title": "The Title",
      "content": "<h2>Introduction</h2><p>Content...</p>",
      "excerpt": "The summary...",
      "tags": ["tag1", "tag2"],
      "category": "Category Name",
      "imagePrompt": "A cinematic shot of..."
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', 
    contents: prompt,
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate content text");
  
  const data = extractJSON(text);

  if (!data || typeof data !== 'object') {
    throw new Error("AI response was not a valid JSON object structure.");
  }

  // Ensure defaults
  if (!data.title) data.title = topic;
  if (!data.content) data.content = `<p>${topic}</p>`;
  if (!data.excerpt) data.excerpt = "ملخص المقال غير متوفر.";
  if (!data.category) data.category = "عام";
  if (!data.imagePrompt) data.imagePrompt = `A professional, cinematic image representing ${topic}, style: ${settings.imageStyle}`;

  if (!Array.isArray(data.tags)) {
    data.tags = typeof data.tags === 'string' ? data.tags.split(',') : ['عام'];
  }

  return data;
};

export const generateBlogImage = async (imagePrompt: string, quality: '1K' | '2K' | '4K'): Promise<string> => {
  await ensureApiKey();
  const ai = getAIClient();

  // Optimization: If quality is 1K, use Gemini 2.5 Flash Image immediately.
  // This prevents 403 errors on accounts that don't have access to Gemini 3 Pro Image.
  if (quality === '1K') {
      try {
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: imagePrompt }] },
              config: {
                  imageConfig: { aspectRatio: "16:9" }
              },
          });

          for (const part of response.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              }
          }
      } catch (error) {
          console.warn("Flash Image generation failed (1K), using placeholder.", error);
          return `https://picsum.photos/seed/${Date.now()}/800/450`;
      }
      // If no image part found in response
      return `https://picsum.photos/seed/${Date.now()}/800/450`;
  }

  // For High Quality (2K/4K), try Gemini 3 Pro Image
  try {
    const model = 'gemini-3-pro-image-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: imagePrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: quality, 
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    // Detect Permission Error (403)
    if (isPermissionError(error)) {
        console.warn("Gemini 3 Pro Image access denied (403). Falling back to Flash Image model.");
        
        // Fallback: Gemini 2.5 Flash Image
        try {
            const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: imagePrompt }] },
                config: {
                    imageConfig: { aspectRatio: "16:9" }
                },
            });
            for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        } catch (fallbackError: any) {
             console.error("Fallback image generation failed:", fallbackError);
             // Return a placeholder instead of crashing the whole flow
             return `https://picsum.photos/seed/${Date.now()}/800/450`;
        }
    } 
    
    // If it was another error (not 403), we still try to return a placeholder so the article is published
    console.error("Image generation error:", error);
    return `https://picsum.photos/seed/${Date.now()}/800/450`;
  }

  return `https://picsum.photos/seed/${Date.now()}/800/450`;
};