
import { GoogleGenAI, Type } from "@google/genai";
import { PlantAnalysisResult, ScanMode } from "../types";

const ensurePaidApiKey = async () => {
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
    }
  }
};

export const analyzePlant = async (base64Image: string, mode: ScanMode): Promise<PlantAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    let promptText = "";
    if (mode === 'identify') {
      promptText = `You are an expert botanist. Identify this plant.
      Output format:
      # [Common Name]
      > *Scientific Name*
      ... care details ...
      
      Also, very important: Start your response by identifying the plant clearly so I can extract the name.`;
    } else {
      promptText = `You are an expert plant pathologist. Analyze this sick plant.
      Output format:
      # [Disease Name]
      > *Affected Plant (if identifiable): [Plant Name]*
      ... symptoms and treatment ...`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: promptText }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a helpful and knowledgeable plant identifier and doctor app assistant.",
        temperature: 0.4,
      }
    });

    const text = response.text || "Could not generate a description.";
    
    // Simple heuristic to extract names for the chat context
    const lines = text.split('\n');
    const commonName = lines.find(l => l.startsWith('# '))?.replace('# ', '').trim();
    const scientificName = lines.find(l => l.startsWith('> *'))?.replace('> *', '').replace('*', '').trim();

    return {
      text,
      commonName,
      scientificName,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata as any
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to analyze plant");
  }
};

export const generatePlantVideo = async (base64Image: string): Promise<PlantAnalysisResult> => {
  try {
    await ensurePaidApiKey();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'Cinematic slow-motion shot of this plant, 4k, nature documentary style.',
      image: { imageBytes: cleanBase64, mimeType: 'image/jpeg' },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed.");

    return {
      text: "Your cinematic plant video is ready!",
      videoUri: `${videoUri}&key=${process.env.API_KEY}`
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to generate video");
  }
};

export const startPlantChat = (plantContext: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a helpful AI Plant Assistant. The user has just identified a plant: ${plantContext}. 
      Answer questions specifically about this plant. Provide care advice, propagation tips, and troubleshooting. 
      Keep answers concise and helpful. Use Markdown for formatting.`,
      tools: [{ googleSearch: {} }]
    }
  });
};
