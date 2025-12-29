
import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult } from "../types";

const API_KEY = process.env.API_KEY;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!API_KEY) throw new Error("API Key is missing");
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async translateText(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following text from ${sourceLang === 'auto' ? 'automatically detected language' : sourceLang} to ${targetLang}. Return only the translated text.\n\nText: "${text}"`,
      });
      return response.text || null;
    } catch (error) {
      console.error("Gemini Text Translation Error:", error);
      return null;
    }
  }

  async translateImage(base64Image: string, sourceLang: string, targetLang: string): Promise<OCRResult | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: `Perform OCR on this image. 
              The text is likely in ${sourceLang === 'auto' ? 'its native language' : sourceLang}. 
              Translate any text found into ${targetLang}. 
              Return ONLY a JSON object with this structure: 
              { "originalText": "...", "translatedText": "...", "pronunciation": "...", "confidence": 0.95 }
              If no legible text is found, return exactly: { "originalText": "", "translatedText": "", "confidence": 0 }`
            }
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              originalText: { type: Type.STRING },
              translatedText: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ["originalText", "translatedText", "confidence"]
          }
        }
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text) as OCRResult;
    } catch (error) {
      console.error("Gemini Vision Translation Error:", error);
      return null;
    }
  }

  async analyzeVideoFrame(base64Frame: string, targetLang: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Frame } },
            { text: `This is a frame from a video. Briefly describe the context and translate any visual text or likely dialogue context into ${targetLang}.` }
          ]
        }
      });
      return response.text || null;
    } catch (error) {
      console.error("Video Frame Analysis Error:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
