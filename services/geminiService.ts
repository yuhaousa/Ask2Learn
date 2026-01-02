
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { ChatMessage, LearningStatus, Dimension } from "../types.ts";
import { SYSTEM_INSTRUCTION } from "../constants.ts";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface Slide {
  title: string;
  bullets: string[];
  visualPrompt: string;
}

export interface GameScenario {
  title: string;
  mission: string;
  context: string;
  options: {
    label: string;
    outcome: string;
    isCorrect: boolean;
    scientificReason: string;
  }[];
}

export class GeminiService {
  async getTeacherResponse(history: ChatMessage[], currentQuestion: string): Promise<{ text: string; diagnosis?: LearningStatus }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        })),
        config: {
            systemInstruction: `${SYSTEM_INSTRUCTION}\n\n当前目标问题：${currentQuestion}`,
            temperature: 0.6,
        }
      });

      const fullText = response.text || "";
      
      let cleanText = fullText;
      let diagnosis: LearningStatus | undefined;

      const diagnosisMatch = fullText.match(/<diagnosis>([\s\S]*?)<\/diagnosis>/);
      if (diagnosisMatch) {
        try {
          diagnosis = JSON.parse(diagnosisMatch[1].trim());
          cleanText = fullText.replace(/<diagnosis>[\s\S]*?<\/diagnosis>/g, "").trim();
        } catch (e) {
          console.error("JSON parse error", e);
        }
      }

      return { text: cleanText, diagnosis };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return { text: "老师连接中途开小开小差了，请再说一遍好吗？" };
    }
  }

  async generateQuiz(topic: string, dimension: Dimension): Promise<QuizQuestion[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `针对话题"${topic}"中的"${dimension}"维度，生成3个具有挑战性的单选题。返回结果必须严格符合指定的JSON格式。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  minItems: 4,
                  maxItems: 4
                },
                correctAnswer: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });

      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Quiz Generation Error:", error);
      throw error;
    }
  }

  async generateFlashcards(topic: string, dimension: Dimension): Promise<Flashcard[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `针对"${topic}"中"${dimension}"维度的知识点，生成4张知识闪卡。每张卡片包含一个核心概念（正面）和简明解析（背面）。请返回JSON数组格式。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Flashcard Generation Error:", error);
      throw error;
    }
  }

  async generateInfographic(topic: string, dimension: Dimension): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `A professional, clean, and modern educational infographic about "${topic}" specifically focusing on the "${dimension}" aspect. Minimalist scientific style, clear vector-style diagrams showing buoyancy mechanisms, soft educational colors (blue, amber, white), high resolution, extremely clear and educational layout.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Infographic Generation Error:", error);
      throw error;
    }
  }

  async generateSlides(topic: string, dimension: Dimension): Promise<Slide[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `为主题"${topic}"的"${dimension}"维度生成一份教学幻灯片大纲。共生成5页幻灯片。每页包含标题、3-4个核心要点以及对该页配图的文字描述。请返回JSON格式。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                visualPrompt: { type: Type.STRING }
              },
              required: ["title", "bullets", "visualPrompt"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Slides Generation Error:", error);
      throw error;
    }
  }

  async generateSlideImage(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullPrompt = `A high-quality educational illustration for a slide deck showing: ${prompt}. Professional scientific diagram style, clean white background, vibrant educational colors, minimalist vector art, extremely clear and labeled where appropriate.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found");
    } catch (error) {
      console.error("Slide Image Generation Error:", error);
      throw error;
    }
  }

  async generateAudioOverview(topic: string, dimension: Dimension): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Say cheerfully: 你好！针对"${topic}"中"${dimension}"维度的知识，我为你准备了一份音频概述。在这个维度，我们需要重点关注...（请根据物理学知识生成一段约100字的概述内容并转换成语音）`;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio data found");
      return base64Audio;
    } catch (error) {
      console.error("Audio Generation Error:", error);
      throw error;
    }
  }

  async generateGame(topic: string, dimension: Dimension): Promise<GameScenario> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `针对话题"${topic}"中的"${dimension}"维度，生成一个科学探究冒险小游戏。学生需要做出一个关于浮力的关键决策。返回结果必须严格符合指定的JSON格式。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              mission: { type: Type.STRING },
              context: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                    isCorrect: { type: Type.BOOLEAN },
                    scientificReason: { type: Type.STRING }
                  },
                  required: ["label", "outcome", "isCorrect", "scientificReason"]
                },
                minItems: 3,
                maxItems: 3
              }
            },
            required: ["title", "mission", "context", "options"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Game Generation Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
