/**
 * ByteDance API Service for BytePlus Console (console.byteplus.com)
 * Supports both image generation (Seedream) and video generation (Seedance)
 * Based on official BytePlus API documentation
 */

interface ByteDanceConfig {
  apiKey: string;
  baseUrl: string;
}

interface ImageGenerationParams {
  prompt: string;
  model?: string;
  size?: '1K' | '2K' | '4K';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  stream?: boolean;
  watermark?: boolean;
  referenceImages?: string[]; // base64 data URLs
}

interface VideoGenerationParams {
  prompt: string;
  model?: string;
  resolution?: '720p' | '1080p';
  duration?: number; // seconds (e.g., 5, 10)
  ratio?: '16:9' | '9:16' | '1:1';
  seed?: number;
  watermark?: boolean;
  generateAudio?: boolean;
  imageUrl?: string; // for image-to-video
  imagePath?: string; // base64 data URL for image-to-video
}

interface TaskResponse {
  task_id: string;
  status: string;
}

interface TaskStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  result?: {
    videos?: Array<{ url: string }>;
  };
  error?: {
    code: string;
    message: string;
  };
}

class ByteDanceService {
  private config: ByteDanceConfig;

  constructor(apiKey?: string, baseUrl?: string) {
    this.config = {
      apiKey: apiKey || import.meta.env.VITE_BYTEDANCE_API_KEY || '',
      baseUrl: baseUrl || import.meta.env.VITE_BYTEDANCE_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3'
    };

    if (!this.config.apiKey) {
      console.warn('ByteDance API key not configured');
    }
  }

  updateSettings(apiKey: string, baseUrl: string) {
    this.config.apiKey = apiKey;
    this.config.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    };
  }

  private async makeRequest(url: string, body: any): Promise<any> {
    // Always route through the /api/bytedance proxy:
    //  - In development: Vite dev server proxies to ByteDance (see vite.config.ts)
    //  - In production: Cloudflare Pages Function proxies to ByteDance (functions/api/bytedance/[[path]].ts)
    const requestUrl = `/api/bytedance${url}`;

    console.log('🚀 ByteDance API Request:', {
      url: requestUrl,
      method: 'POST',
      body: JSON.stringify(body, null, 2)
    });

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log('📥 ByteDance API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500)
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Use response text if JSON parsing fails
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return JSON.parse(responseText);
  }

  /**
   * Convert ByteDance CDN image URL to use Vite proxy to avoid CORS issues
   * Note: ByteDance signed URLs cannot be proxied, so we return the original URL
   * Browsers allow cross-origin images in <img> tags even if fetch() would fail
   */
  private proxyImageUrl(url: string): string {
    // Return original URL directly - <img> tags can load cross-origin images
    // even when fetch() would be blocked by CORS
    return url;
  }

  /**
   * Generate images using Seedream API
   * Based on Seedream-v4.5/app.py implementation
   */
  async generateImage(params: ImageGenerationParams): Promise<AsyncGenerator<any>> {
    const {
      prompt,
      model = 'seedream-4-0-250828',
      size = '2K',
      aspectRatio = '1:1',
      stream = true,
      watermark = true,
      referenceImages = []
    } = params;

    const requestBody: any = {
      model,
      prompt,
      size,
      aspect_ratio: aspectRatio,
      stream,
      watermark
    };

    // Add reference images if provided (as base64 data URLs)
    if (referenceImages && referenceImages.length > 0) {
      requestBody.image = referenceImages;
    }

    const response = await fetch(
      `/api/bytedance/images/generations`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image generation failed: ${errorText}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    const images: string[] = [];
    
    // Save reference to 'this' for use in generator function
    const self = this;

    async function* streamImages() {
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const eventType = parsed.type;
              console.log('📦 SSE event:', eventType, parsed);

              if (eventType === 'image_generation.partial_succeeded') {
                const imageUrl = parsed.url;
                console.log('🖼️ Partial image URL:', imageUrl);
                if (imageUrl) {
                  // Convert ByteDance CDN URL to use proxy to avoid CORS
                  const proxiedUrl = self.proxyImageUrl(imageUrl);
                  console.log('🔄 Proxied URL:', proxiedUrl);
                  images.push(proxiedUrl);
                  yield {
                    type: 'partial',
                    images: [...images],
                    index: parsed.image_index,
                    size: parsed.size
                  };
                }
              } else if (eventType === 'image_generation.completed') {
                console.log('✅ Image generation completed');
                yield {
                  type: 'completed',
                  images: [...images],
                  usage: parsed.usage
                };
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    }

    return streamImages();
  }

  /**
   * Generate video using Seedance API (text-to-video)
   * Based on Seedance-v1.5/app.py implementation
   */
  async generateVideoFromText(params: VideoGenerationParams): Promise<string> {
    const {
      prompt,
      model = 'seedance-1-5-pro-251215',
      resolution = '720p',
      duration = 5,
      ratio = '16:9',
      seed,
      watermark = true,
      generateAudio = false
    } = params;

    // Build prompt with parameters (following Seedance format)
    let fullPrompt = `${prompt} --resolution ${resolution} --duration ${duration} --ratio ${ratio}`;
    
    if (seed !== undefined) {
      fullPrompt += ` --seed ${seed}`;
    }
    
    if (!watermark) {
      fullPrompt += ' --no-watermark';
    }

    const requestBody: any = {
      model,
      content: [
        {
          type: 'text',
          text: fullPrompt
        }
      ]
    };

    if (generateAudio) {
      requestBody.generate_audio = true;
    }

    console.log('🎬 Creating video generation task:', requestBody);

    // Create task
    const taskResponse = await this.makeRequest('/contents/generations/tasks', requestBody);
    
    if (taskResponse.error) {
      throw new Error(taskResponse.error);
    }

    const taskId = taskResponse.id;
    console.log('✅ Task created:', taskId);

    // Poll for completion
    return this.pollTaskStatus(taskId);
  }

  /**
   * Generate video from image using Seedance API (image-to-video)
   */
  async generateVideoFromImage(params: VideoGenerationParams): Promise<string> {
    const {
      prompt = '',
      model = 'seedance-1-5-pro-251215',
      resolution = '720p',
      duration = 5,
      seed,
      watermark = true,
      generateAudio = false,
      imageUrl,
      imagePath
    } = params;

    if (!imageUrl && !imagePath) {
      throw new Error('Either imageUrl or imagePath must be provided for image-to-video');
    }

    const content: any[] = [];

    // Build prompt (note: image-to-video uses --ratio adaptive)
    let fullPrompt = prompt 
      ? `${prompt} --resolution ${resolution} --duration ${duration} --ratio adaptive`
      : `--resolution ${resolution} --duration ${duration} --ratio adaptive`;

    if (seed !== undefined) {
      fullPrompt += ` --seed ${seed}`;
    }

    if (!watermark) {
      fullPrompt += ' --no-watermark';
    }

    content.push({
      type: 'text',
      text: fullPrompt
    });

    // Add image
    if (imageUrl) {
      content.push({
        type: 'image_url',
        image_url: {
          url: imageUrl
        }
      });
    } else if (imagePath) {
      // imagePath should be a base64 data URL
      content.push({
        type: 'image_url',
        image_url: {
          url: imagePath
        }
      });
    }

    const requestBody: any = {
      model,
      content
    };

    if (generateAudio) {
      requestBody.generate_audio = true;
    }

    console.log('🎬 Creating image-to-video task:', requestBody);

    // Create task
    const taskResponse = await this.makeRequest('/contents/generations/tasks', requestBody);
    
    if (taskResponse.error) {
      throw new Error(taskResponse.error);
    }

    const taskId = taskResponse.id;
    console.log('✅ Task created:', taskId);

    // Poll for completion
    return this.pollTaskStatus(taskId);
  }

  /**
   * Poll task status until completion
   */
  private async pollTaskStatus(taskId: string, maxAttempts = 60): Promise<string> {
    const isDevelopment = import.meta.env.DEV;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      try {
        const requestUrl = isDevelopment
          ? `/api/bytedance/contents/generations/tasks/${taskId}`
          : `${this.config.baseUrl}/contents/generations/tasks/${taskId}`;

        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to get task status: ${response.status}`);
        }

        const status = await response.json();
        
        console.log(`⏳ Task ${taskId} status:`, status.status);
        console.log(`📦 Full status response:`, JSON.stringify(status, null, 2));

        if (status.status === 'succeeded') {
          // Try multiple possible response formats (based on Seedance app.py)
          let videoUrl: string | null = null;

          // Format 1: Check content.video_url
          if (status.content && typeof status.content === 'object') {
            videoUrl = status.content.video_url;
          }

          // Format 2: Check data array
          if (!videoUrl && status.data && Array.isArray(status.data)) {
            for (const item of status.data) {
              if (item.type === 'video_url' && item.url) {
                videoUrl = item.url;
                break;
              }
            }
          }

          // Format 3: Check direct video_url field
          if (!videoUrl && status.video_url) {
            videoUrl = status.video_url;
          }

          // Format 4: Check result field
          if (!videoUrl && status.result) {
            if (typeof status.result === 'object') {
              if (Array.isArray(status.result)) {
                // Array format
                for (const item of status.result) {
                  if (typeof item === 'object' && (item.video_url || item.url)) {
                    videoUrl = item.video_url || item.url;
                    break;
                  }
                }
              } else {
                // Object format
                videoUrl = status.result.video_url || status.result.url;
              }
            }
          }

          // Format 5: Check outputs field
          if (!videoUrl && status.outputs && Array.isArray(status.outputs)) {
            for (const item of status.outputs) {
              if (typeof item === 'object' && (item.video_url || item.url)) {
                videoUrl = item.video_url || item.url;
                break;
              }
            }
          }

          if (!videoUrl) {
            console.error('❌ Could not find video URL in response. Full response:', status);
            throw new Error('No video URL in successful response');
          }
          
          console.log('✅ Video generation completed:', videoUrl);
          // Return URL directly - don't try to download (CORS issue)
          return videoUrl;
        }

        if (status.status === 'failed') {
          const errorMsg = status.error?.message || 'Video generation failed';
          throw new Error(errorMsg);
        }

        // Status is 'pending' or 'processing', continue polling
        attempts++;
      } catch (error) {
        console.error('Error polling task status:', error);
        throw error;
      }
    }

    throw new Error('Video generation timeout');
  }

  /**
   * Check if ByteDance API is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.config.baseUrl;
  }

  /**
   * Get current configuration
   */
  getConfig(): ByteDanceConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const bytedanceService = new ByteDanceService();

// Export types
export type {
  ByteDanceConfig,
  ImageGenerationParams,
  VideoGenerationParams,
  TaskResponse,
  TaskStatusResponse
};
