
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { ChatMessage, LearningStatus, Dimension } from "../types.ts";
import { SYSTEM_INSTRUCTION } from "../constants.ts";
import { bytedanceService } from "./bytedanceService.ts";

export type ApiProvider = 'google' | 'bytedance';

export interface ApiSettings {
  provider: ApiProvider;
  googleApiKey: string;
  bytedanceApiKey: string;
  bytedanceBaseUrl: string;
  bytedanceModelId: string;
}

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

export interface TutorialGuide {
  title: string;
  description: string;
  htmlCode: string;  // 包含完整的 HTML、CSS 和 JavaScript 代码
}

export interface VideoResult {
  videoUrl: string;
  script: string;
}

export class GeminiService {
  private apiSettings: ApiSettings;

  constructor() {
    // 初始化时从 localStorage 加载设置，如果没有则使用默认值
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      try {
        this.apiSettings = JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse API settings:', e);
        this.apiSettings = this.getDefaultSettings();
      }
    } else {
      this.apiSettings = this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): ApiSettings {
    return {
      provider: 'google',
      googleApiKey: import.meta.env.VITE_API_KEY || '',
      bytedanceApiKey: import.meta.env.VITE_BYTEDANCE_API_KEY || '',
      bytedanceBaseUrl: import.meta.env.VITE_BYTEDANCE_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3',
      bytedanceModelId: import.meta.env.VITE_BYTEDANCE_MODEL_ID || ''
    };
  }

  // 更新 API 设置
  updateSettings(settings: ApiSettings) {
    this.apiSettings = settings;
  }

  // 获取当前使用的 AI 实例
  private getAI(): GoogleGenAI {
    if (this.apiSettings.provider === 'bytedance') {
      return new GoogleGenAI({ 
        apiKey: this.apiSettings.bytedanceApiKey,
        baseURL: this.apiSettings.bytedanceBaseUrl
      });
    } else {
      return new GoogleGenAI({ apiKey: this.apiSettings.googleApiKey });
    }
  }

  // 获取当前使用的模型名称
  private getModelName(defaultModel: string): string {
    if (this.apiSettings.provider === 'bytedance') {
      // 使用用户配置的模型端点ID，如果没有配置则使用默认值
      return this.apiSettings.bytedanceModelId || 'ep-20250110112532-nwfj4';
    }
    return defaultModel;
  }

  // 获取当前提供商名称
  getProviderName(): string {
    return this.apiSettings.provider === 'bytedance' ? '字节豆包' : 'Google Gemini';
  }

  async getTeacherResponse(history: ChatMessage[], currentQuestion: string): Promise<{ text: string; diagnosis?: LearningStatus }> {
    const ai = this.getAI();
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: this.getModelName("gemini-3-pro-preview"),
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
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: this.getModelName("gemini-3-flash-preview"),
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
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: this.getModelName("gemini-3-flash-preview"),
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

  async generateInfographic(topic: string, dimension: Dimension, language: 'zh' | 'en' = 'zh'): Promise<string> {
    // ByteDance 使用 Seedream 图片生成 API
    if (this.apiSettings.provider === 'bytedance') {
      bytedanceService.updateSettings(
        this.apiSettings.bytedanceApiKey,
        this.apiSettings.bytedanceBaseUrl
      );

      // Simplify prompt to avoid content detection
      const prompt = language === 'en'
        ? `Educational scientific diagram. Professional illustration with clear labels and visual elements. All text in English.`
        : `教育科学图表。专业插图，标签清晰，视觉元素丰富。所有文字使用中文。`;

      try {
        const generator = await bytedanceService.generateImage({
          prompt,
          model: 'seedream-4-0-250828',
          size: '2K',
          aspectRatio: '3:4',
          stream: true,
          watermark: true
        });

        // Get the first (and likely only) image
        let imageUrl = '';
        for await (const result of generator) {
          if (result.type === 'partial' && result.images.length > 0) {
            imageUrl = result.images[0];
          } else if (result.type === 'completed' && result.images.length > 0) {
            imageUrl = result.images[0];
            break;
          }
        }

        if (!imageUrl) {
          throw new Error('No image generated');
        }

        return imageUrl;
      } catch (error: any) {
        console.error("ByteDance Infographic Generation Error:", error);
        // If content detection error, return empty string to fail gracefully
        if (error.message?.includes('InputTextSensitiveContentDetected') || 
            error.message?.includes('sensitive')) {
          console.warn('Content detection triggered, using fallback');
          return '';
        }
        throw error;
      }
    }

    const ai = this.getAI();
    
    const textInstruction = language === 'en'
      ? 'with all text labels in English'
      : 'with all text labels in Chinese (中文)';
    
    const prompt = `A professional, clean, and modern educational infographic about "${topic}" specifically focusing on the "${dimension}" aspect. Minimalist scientific style, clear vector-style diagrams, soft educational colors (blue, amber, white), high resolution, extremely clear and educational layout ${textInstruction}.`;
    
    try {
      const response = await ai.models.generateContent({
        model: this.getModelName('gemini-2.5-flash-image'),
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

  async generateSlides(topic: string, dimension: Dimension, language: 'zh' | 'en' = 'zh'): Promise<Slide[]> {
    // ByteDance 暂不支持结构化 JSON 输出，使用简化的幻灯片生成
    if (this.apiSettings.provider === 'bytedance') {
      // 返回预定义的幻灯片结构
      const slides: Slide[] = language === 'en' ? [
        {
          title: `${topic}: ${dimension}`,
          bullets: [
            'Key concepts overview',
            'Fundamental principles',
            'Practical applications',
            'Common scenarios'
          ],
          visualPrompt: `Educational diagram showing ${topic} with focus on ${dimension}, clear scientific illustration, professional style`
        },
        {
          title: 'Core Principles',
          bullets: [
            'Basic theory explanation',
            'Scientific foundations',
            'Key formulas and relationships'
          ],
          visualPrompt: `Scientific diagram explaining core principles of ${topic} related to ${dimension}, clear labels`
        },
        {
          title: 'Mathematical Analysis',
          bullets: [
            'Calculation methods',
            'Formula applications',
            'Numerical examples'
          ],
          visualPrompt: `Mathematical formulas and calculations for ${topic} focusing on ${dimension}, educational style`
        },
        {
          title: 'Practical Examples',
          bullets: [
            'Real-world applications',
            'Case study analysis',
            'Problem-solving approach'
          ],
          visualPrompt: `Practical examples demonstrating ${topic} and ${dimension}, realistic illustrations`
        },
        {
          title: 'Summary',
          bullets: [
            'Key takeaways',
            'Important concepts review',
            'Further exploration topics'
          ],
          visualPrompt: `Summary infographic for ${topic} covering ${dimension}, clean design with key points`
        }
      ] : [
        {
          title: `${topic}：${dimension}`,
          bullets: [
            '核心概念概述',
            '基本原理介绍',
            '实际应用场景',
            '常见案例分析'
          ],
          visualPrompt: `Educational diagram showing ${topic} with focus on ${dimension}, clear scientific illustration, professional style, Chinese labels`
        },
        {
          title: '核心原理',
          bullets: [
            '基础理论解释',
            '科学依据说明',
            '关键公式与关系'
          ],
          visualPrompt: `Scientific diagram explaining core principles of ${topic} related to ${dimension}, clear labels in Chinese`
        },
        {
          title: '数学分析',
          bullets: [
            '计算方法介绍',
            '公式应用实例',
            '数值计算示例'
          ],
          visualPrompt: `Mathematical formulas and calculations for ${topic} focusing on ${dimension}, educational style with Chinese text`
        },
        {
          title: '实例分析',
          bullets: [
            '真实场景应用',
            '案例深度剖析',
            '问题解决方法'
          ],
          visualPrompt: `Practical examples demonstrating ${topic} and ${dimension}, realistic illustrations with Chinese labels`
        },
        {
          title: '总结回顾',
          bullets: [
            '核心要点总结',
            '重要概念复习',
            '拓展学习方向'
          ],
          visualPrompt: `Summary infographic for ${topic} covering ${dimension}, clean design with key points in Chinese`
        }
      ];
      return slides;
    }

    const ai = this.getAI();
    
    const prompt = language === 'en'
      ? `Generate a complete teaching slide outline for the topic "${topic}" focusing on the "${dimension}" dimension. Create 10 slides covering:
1. Title slide
2. Concept introduction
3-4. Core principles explanation
5-6. Formulas and calculations
7-8. Case analysis
9. Common misconceptions
10. Summary and reflection questions

Each slide should include title, 3-4 key points, and a detailed English description for image generation. Return in JSON format.`
      : `为主题"${topic}"的"${dimension}"维度生成一份完整的教学幻灯片大纲。共生成10页幻灯片，涵盖以下内容：
1. 标题页
2. 概念引入
3-4. 核心原理讲解
5-6. 公式与计算
7-8. 实例分析
9. 常见误区
10. 总结与思考题

每页包含标题、3-4个核心要点以及对该页配图的详细英文描述（用于AI生成图片）。请返回JSON格式。`;
    
    try {
      const response = await ai.models.generateContent({
        model: this.getModelName("gemini-3-flash-preview"),
        contents: prompt,
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

  async generateSlideImage(prompt: string, language: 'zh' | 'en' = 'zh'): Promise<string> {
    // ByteDance 使用 Seedream 图片生成 API
    if (this.apiSettings.provider === 'bytedance') {
      bytedanceService.updateSettings(
        this.apiSettings.bytedanceApiKey,
        this.apiSettings.bytedanceBaseUrl
      );

      // Simplify prompt to avoid content detection issues
      const textInstruction = language === 'en'
        ? 'All text labels in English.'
        : 'All text in Chinese.';
      
      // 创建与幻灯片内容相关的图片描述
      // 提取关键词，避免使用可能触发内容审核的完整句子
      const keywords = prompt.split(/[：:,，、]/).slice(0, 3).join(' ');
      
      const imagePrompt = language === 'en'
        ? `Educational illustration about: ${keywords}. Professional scientific diagram, clear visual representation, clean modern design. ${textInstruction}`
        : `关于 ${keywords} 的教学配图。科学示意图，视觉清晰，现代简洁设计。${textInstruction}`;

      try {
        const generator = await bytedanceService.generateImage({
          prompt: imagePrompt,
          model: 'seedream-4-0-250828',
          size: '2K',
          aspectRatio: '16:9',
          stream: true,
          watermark: true
        });

        // Get the first (and likely only) image
        let imageUrl = '';
        for await (const result of generator) {
          if (result.type === 'partial' && result.images.length > 0) {
            imageUrl = result.images[0];
          } else if (result.type === 'completed' && result.images.length > 0) {
            imageUrl = result.images[0];
            break;
          }
        }

        if (!imageUrl) {
          throw new Error('No image generated');
        }

        // Return URL directly - browser will handle CORS for img tags
        return imageUrl;
      } catch (error: any) {
        console.error("ByteDance Slide Image Generation Error:", error);
        // If content detection error, return a placeholder or throw with friendly message
        if (error.message?.includes('InputTextSensitiveContentDetected') || 
            error.message?.includes('sensitive')) {
          console.warn('Content detection triggered, using fallback');
          // Return empty string to indicate failure gracefully
          return '';
        }
        throw error;
      }
    }

    const ai = this.getAI();
    
    const textInstruction = language === 'en'
      ? 'with any text labels in English'
      : 'with any text labels in Chinese (中文)';
    
    const fullPrompt = `A high-quality educational illustration for a slide deck showing: ${prompt}. Professional scientific diagram style, clean white background, vibrant educational colors, minimalist vector art, extremely clear and labeled ${textInstruction}.`;
    
    try {
      const response = await ai.models.generateContent({
        model: this.getModelName('gemini-2.5-flash-image'),
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

  async generateAudioOverview(topic: string, dimension: Dimension): Promise<string> {    // 字节跳动暂不支持音频生成
    if (this.apiSettings.provider === 'bytedance') {
      throw new Error('字节豆包暂不支持音频生成功能，请切换到 Google Gemini。');
    }
        const ai = this.getAI();
    const prompt = `Say cheerfully: 你好！针对“${topic}”中“${dimension}”维度的知识，我为你准备了一份音频概述。在这个维度，我们需要重点关注...（请根据物理学知识生成一段约100字的概述内容并转换成语音）`;
    
    try {
      const response = await ai.models.generateContent({
        model: this.getModelName("gemini-2.5-flash-preview-tts"),
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
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: this.getModelName("gemini-3-flash-preview"),
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

  async generateTutorial(topic: string, dimension: Dimension): Promise<TutorialGuide> {
    const ai = this.getAI();
    
    // 验证 API Key
    if (!this.apiSettings.googleApiKey && this.apiSettings.provider === 'google') {
      throw new Error('请先配置 Google API Key');
    }
    if (!this.apiSettings.bytedanceApiKey && this.apiSettings.provider === 'bytedance') {
      throw new Error('请先配置字节跳动 API Key');
    }
    
    try {
      const prompt = `生成一个关于"${topic}"的"${dimension}"维度的交互式HTML学习游戏。

要求：
1. 生成一个完整的、可直接运行的 HTML 文件代码
2. 必须包含：HTML 结构、CSS 样式和 JavaScript 交互逻辑
3. 创建一个有趣的互动游戏，帮助学生理解${topic}的${dimension}
4. 游戏应该包含：
   - 清晰的游戏说明
   - 互动元素（按钮、拖拽、点击等）
   - 即时反馈和分数系统
   - 知识点讲解
5. 使用现代、美观的设计，有渐变色、圆角、阴影等
6. 所有文字使用中文
7. 代码应该完整，可以直接在浏览器中运行
8. 不要使用外部库，使用纯 HTML/CSS/JS

返回JSON格式：
{
  "title": "游戏标题",
  "description": "游戏简介",
  "htmlCode": "完整的HTML代码，包含<html><head><style>...</style></head><body><script>...</script></body></html>"
}`;

      const response = await ai.models.generateContent({
        model: this.getModelName("gemini-3-flash-preview"),
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              htmlCode: { type: Type.STRING }
            },
            required: ["title", "description", "htmlCode"]
          }
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      
      // 验证返回的数据结构
      if (!result.title || !result.description || !result.htmlCode) {
        throw new Error('API 返回的数据格式不正确');
      }
      
      return result;
    } catch (error: any) {
      console.error("Tutorial Generation Error:", error);
      
      // 提供更详细的错误信息
      if (error.message?.includes('API key')) {
        throw new Error('API Key 无效或已过期，请检查配置');
      } else if (error.message?.includes('quota')) {
        throw new Error('API 配额已用尽，请稍后再试');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络设置');
      } else if (error.message) {
        throw new Error(`生成失败: ${error.message}`);
      }
      throw error;
    }
  }

  async generateVideo(topic: string, dimension: Dimension, language: 'zh' | 'en' = 'zh'): Promise<VideoResult> {
    // 字节跳动使用不同的视频生成API
    if (this.apiSettings.provider === 'bytedance') {
      // Update ByteDance service configuration
      bytedanceService.updateSettings(
        this.apiSettings.bytedanceApiKey,
        this.apiSettings.bytedanceBaseUrl
      );

      // Generate video prompt
      const prompt = language === 'en'
        ? `Educational video about "${topic}" focusing on "${dimension}". Show clear scientific concepts, diagrams, and explanations. Professional educational style with smooth animations.`
        : `关于"${topic}"的"${dimension}"维度的教学视频。展示清晰的科学概念、图表和解释。专业教学风格，流畅动画。`;

      try {
        const videoUrl = await bytedanceService.generateVideoFromText({
          prompt,
          model: 'seedance-1-5-pro-251215',
          resolution: '720p',
          duration: 10,
          ratio: '16:9',
          watermark: true,
          generateAudio: arguments.length >= 4 ? arguments[3] : false
        });

        // Generate simple script without calling external API
        const script = language === 'en'
          ? `Educational video about ${topic}, focusing on the ${dimension} dimension. This 10-second video demonstrates key concepts with clear visual explanations and professional animations.`
          : `关于${topic}的${dimension}维度的教学视频。这个10秒视频通过清晰的视觉解释和专业动画展示关键概念。`;

        return {
          videoUrl,
          script
        };
      } catch (error) {
        console.error("ByteDance Video Generation Error:", error);
        throw error;
      }
    }
    
    const ai = this.getAI();
    
    const langInstruction = language === 'en' 
      ? `Generate a 30-second educational video script for the topic "${topic}" focusing on the "${dimension}" dimension. Include:
1. Opening (5 seconds)
2. Core concept explanation (15 seconds)
3. Example demonstration (8 seconds)
4. Summary (2 seconds)

Return JSON format with script field (complete script text in English) and videoPrompt field (detailed English prompt for video generation with text overlays in English).`
      : `为主题"${topic}"的"${dimension}"维度生成一个30秒教学视频脚本。包括：
1. 开场白（5秒）
2. 核心概念讲解（15秒）
3. 实例演示说明（8秒）
4. 总结（2秒）

请返回JSON格式，包含script字段（完整脚本文本）和videoPrompt字段（用于生成视频的英文提示词，要求视频中的文字使用中文）。`;
    
    // First generate a script for the video
    const scriptResponse = await ai.models.generateContent({
      model: this.getModelName("gemini-3-flash-preview"),
      contents: langInstruction,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING },
            videoPrompt: { type: Type.STRING }
          },
          required: ["script", "videoPrompt"]
        }
      }
    });

    const scriptData = JSON.parse(scriptResponse.text || "{}");
    
    // Add explicit language requirement to video prompt
    const languageSuffix = language === 'zh' 
      ? ' All text overlays, labels, and captions must be in Chinese (中文).' 
      : ' All text overlays, labels, and captions must be in English.';
    
    const finalPrompt = (scriptData.videoPrompt || `Educational animation explaining ${topic} focusing on ${dimension}. Clean, professional scientific visualization with clear diagrams and smooth transitions. Suitable for students.`) + languageSuffix;
    
    try {
      // Generate video using Veo
      let operation = await ai.models.generateVideos({
        model: this.getModelName("veo-2.0-generate-001"),
        prompt: finalPrompt,
        config: {
          numberOfVideos: 1,
          durationSeconds: 8,
          aspectRatio: "16:9",
        },
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      console.log("Video operation response:", JSON.stringify(operation.response, null, 2));

      const generatedVideo = operation.response?.generatedVideos?.[0];
      if (!generatedVideo || !generatedVideo.video) {
        throw new Error("No video generated");
      }

      // Get the video URI and fetch with API key
      const videoUri = generatedVideo.video.uri;
      if (!videoUri) {
        throw new Error("No video URI returned");
      }

      // Fetch the video with API key authentication
      const apiKey = import.meta.env.VITE_API_KEY;
      const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
      
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.status}`);
      }

      const videoBlob = await videoResponse.blob();
      const videoUrl = URL.createObjectURL(videoBlob);

      return {
        videoUrl,
        script: scriptData.script || ""
      };
    } catch (error) {
      console.error("Video Generation Error:", error);
      // Return a placeholder with just the script if video generation fails
      return {
        videoUrl: "",
        script: scriptData.script || "视频生成暂时不可用，请查看文字脚本。"
      };
    }
  }
}

export const geminiService = new GeminiService();
