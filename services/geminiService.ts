import { GoogleGenAI } from "@google/genai";
import { PlantAnalysisResult, ScanMode } from "../types";

/**
 * Ensures a paid API key is selected for Veo models.
 */
const ensurePaidApiKey = async () => {
  // Use explicit cast to any to avoid conflict with existing global type definition for aistudio
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
    }
  }
};

/**
 * Analyzes a plant image using Gemini 2.5 Flash with Search Grounding.
 */
export const analyzePlant = async (base64Image: string, mode: ScanMode): Promise<PlantAnalysisResult> => {
  try {
    // Standard initialization for Text/Image analysis
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    let promptText = "";

    if (mode === 'identify') {
      promptText = `You are an expert botanist. Identify this plant in the image. 
            
      Please provide the output in the following Markdown format:
      # [Common Name]
      > *Scientific Name*
      
      ## Description
      [A concise description of the plant]

      ## Care Guide
      *   **Light**: [Requirements]
      *   **Water**: [Requirements]
      *   **Soil**: [Requirements]
      *   **Toxicity**: [Pet/Human safety info]

      ## Fun Fact
      [One interesting fact]

      Use Google Search to ensure the scientific name, care details, and toxicity information are accurate and up-to-date.`;
    } else {
      promptText = `You are an expert plant pathologist. Analyze this image of a sick or damaged plant.
      
      Please provide the output in the following Markdown format:
      # [Disease/Issue Name]
      > *Affected Plant (if identifiable): [Plant Name]*
      
      ## Symptoms Identified
      [List the visual symptoms observed in the image]
      
      ## Potential Causes
      [List potential fungal, bacterial, viral, pest, or environmental causes]
      
      ## Treatment & Cure
      [Step-by-step treatment plan]
      
      ## Prevention
      [Tips to prevent this from happening again]

      Use Google Search to verify the diagnosis and recommend effective treatments.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: cleanBase64
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a helpful and knowledgeable plant identifier and doctor app assistant.",
        temperature: 0.4,
      }
    });

    const text = response.text || "Could not generate a description.";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      text,
      groundingMetadata: groundingMetadata as any
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze plant");
  }
};

/**
 * Generates a video from a plant image using Veo.
 */
export const generatePlantVideo = async (base64Image: string): Promise<PlantAnalysisResult> => {
  try {
    // 1. Ensure User selects a Paid API Key (Required for Veo)
    await ensurePaidApiKey();

    // 2. Re-initialize AI client to use the potentially new key from process.env
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    // 3. Start Video Generation
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'Cinematic slow-motion shot of this plant in a beautiful botanical garden, sunlight filtering through leaves, 4k, nature documentary style, highly detailed, photorealistic.',
      image: {
        imageBytes: cleanBase64,
        mimeType: 'image/jpeg', 
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Portrait for mobile-first feel
      }
    });

    // 4. Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    // 5. Get the video URI
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
      throw new Error("Video generation completed but no URI returned.");
    }

    // Append API key for access as per docs
    const finalVideoUrl = `${videoUri}&key=${process.env.API_KEY}`;

    return {
      text: "Your cinematic plant video is ready!",
      videoUri: finalVideoUrl
    };

  } catch (error: any) {
    console.error("Veo API Error:", error);
    // If the error relates to "Requested entity was not found", it might be a stale key issue.
    if (error.message?.includes("Requested entity was not found")) {
       const aistudio = (window as any).aistudio;
       if(aistudio) await aistudio.openSelectKey();
       throw new Error("API Key issue. Please try selecting your key again.");
    }
    throw new Error(error.message || "Failed to generate video");
  }
}