
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AgeBand, AspectRatio, ImageSize, VideoAspectRatio } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Lesson Planning ---
export const generateLessonPlan = async (
    title: string,
    band: AgeBand,
    domain: string,
    type: 'family_activity' | 'classroom_plan' = 'classroom_plan'
): Promise<string> => {
    const bandLabel = band === 'A' ? 'Sprouts (2-5 years)' : 'Saplings (6-8 years)';
    
    let prompt = "";
    
    if (type === 'family_activity') {
        prompt = `
        Act as a Zen parenting coach. Create a simple, screen-free home activity for: "${title}".
        Target: ${bandLabel}. Domain: ${domain}.
        
        Structure (Markdown):
        1. 🏠 **The Home Connection** (Simple explanation for parents)
        2. 🎲 **Activity** (A 5-minute game or craft using household items)
        3. 🌙 **Bedtime Question** (A reflection question)
        `;
    } else {
        prompt = `
        Act as an expert early childhood educator (Zen/Reggio Emilia style). 
        Create a detailed lesson plan for: "${title}".
        Target: ${bandLabel}. Domain: ${domain}.
        
        Structure (Markdown):
        1. 🎭 **The Hook** (Script/Circle Time opening)
        2. 👐 **Guided Play** (Step-by-step group activity)
        3. 🧠 **Learning Check** (How to assess understanding)
        4. 📝 **Materials Needed**
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "No content generated.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

const getCurrentLocation = (): Promise<{latitude: number, longitude: number} | undefined> => {
    return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            resolve(undefined);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.warn("Geolocation denied or failed:", error);
                resolve(undefined);
            }
        );
    });
}

// --- Chat & Intelligence (Search, Maps, Thinking, Fast) ---
export const sendChatMessage = async (
    message: string,
    history: { role: string; parts: { text: string }[] }[],
    mode: 'normal' | 'search' | 'maps' | 'thinking' | 'fast'
) => {
    let model = 'gemini-3-pro-preview';
    let config: any = {};
    let tools: any[] = [];

    if (mode === 'fast') {
        model = 'gemini-2.5-flash-lite'; // Fast AI responses
    } else if (mode === 'search') {
        model = 'gemini-2.5-flash';
        tools = [{ googleSearch: {} }];
    } else if (mode === 'maps') {
        model = 'gemini-2.5-flash';
        const loc = await getCurrentLocation();
        tools = [{ googleMaps: {} }];
        if (loc) {
            config.toolConfig = {
                retrievalConfig: {
                    latLng: loc
                }
            };
        }
    } else if (mode === 'thinking') {
        model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 }; // Max thinking
    }

    try {
        const chat = ai.chats.create({
            model: model,
            history: history,
            config: {
                tools: tools.length > 0 ? tools : undefined,
                ...config
            }
        });

        const result = await chat.sendMessage({ message });
        return result;
    } catch (error) {
        console.error("Chat Error:", error);
        throw error;
    }
};

// --- Image Generation (Nano Banana Pro) ---
export const generateImage = async (prompt: string, aspectRatio: AspectRatio, size: ImageSize) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: size
                }
            }
        });
        
        let imageUrl = null;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }
        return imageUrl;
    } catch (error) {
        console.error("Image Gen Error:", error);
        throw error;
    }
};

// --- Image Editing (Nano Banana) ---
export const editImage = async (base64Image: string, prompt: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Image } },
                    { text: prompt }
                ]
            }
        });
        
        let imageUrl = null;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }
        return imageUrl;
    } catch (error) {
        console.error("Image Edit Error:", error);
        throw error;
    }
};

// --- Media Analysis (Image/Video Understanding) ---
export const analyzeMedia = async (
    base64Data: string, 
    mimeType: string, 
    prompt: string,
    isVideo: boolean = false
) => {
    // gemini-3-pro-preview for both image and video understanding
    const model = 'gemini-3-pro-preview';
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: prompt }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
};

// --- Video Generation (Veo) ---
export const generateVeoVideo = async (
    prompt: string, 
    aspectRatio: VideoAspectRatio,
    imageBase64?: string
): Promise<string> => {
    // Note: Veo requires a selected key. We assume the UI handles the check.
    const newAi = new GoogleGenAI({ apiKey: process.env.API_KEY }); // New instance for key freshness

    try {
        let operation;
        const config = {
            numberOfVideos: 1,
            aspectRatio: aspectRatio,
            // resolution: '720p' // Defaulting to 720p for compatibility
        };

        if (imageBase64) {
            operation = await newAi.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: { imageBytes: imageBase64, mimeType: 'image/png' },
                config
            });
        } else {
            operation = await newAi.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config
            });
        }

        // Polling
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await newAi.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("No video generated");

        // Fetch the video bytes
        const res = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Veo Error:", error);
        throw error;
    }
};

// --- Audio Transcription ---
export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Audio } },
                    { text: "Transcribe this audio." }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Transcription Error:", error);
        throw error;
    }
};

// --- Text to Speech ---
export const generateSpeech = async (text: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
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
        if (!base64Audio) throw new Error("No audio generated");
        return `data:audio/pcm;base64,${base64Audio}`;
    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
};

// --- Live API Helper ---
export const getLiveClient = () => {
    return ai.live;
};
