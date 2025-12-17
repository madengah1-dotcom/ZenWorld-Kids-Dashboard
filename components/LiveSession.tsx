import React, { useEffect, useRef, useState } from 'react';
import { getLiveClient } from '../services/geminiService';
import { Modality } from '@google/genai';

function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

export const LiveSession: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState<string>("Ready to Connect");
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Refs for audio processing to avoid stale closures
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputContextRef = useRef<AudioContext | null>(null);
    const sessionRef = useRef<Promise<any> | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const startSession = async () => {
        setIsActive(true);
        setStatus("Connecting...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            inputContextRef.current = inputAudioContext;
            audioContextRef.current = outputAudioContext;

            const liveClient = getLiveClient();

            sessionRef.current = liveClient.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus("Connected! Say something...");
                        // Setup Audio Input
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            
                            // Convert Float32 to Int16 PCM
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            
                            const pcmBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };

                            sessionRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: any) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && audioContextRef.current) {
                            const ctx = audioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                ctx,
                                24000,
                                1
                            );

                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                    },
                    onclose: () => {
                        setStatus("Disconnected");
                        setIsActive(false);
                    },
                    onerror: (err) => {
                        console.error(err);
                        setStatus("Error occurred");
                        setIsActive(false);
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    systemInstruction: "You are a helpful, calm, and Zen educational assistant for teachers.",
                },
            });

        } catch (e) {
            console.error(e);
            setStatus("Failed to start session");
            setIsActive(false);
        }
    };

    const stopSession = () => {
        // Since we can't explicitly close the session object easily without keeping a reference to the session itself (wrapper handles it), 
        // we mainly clean up audio contexts. In a real app, we'd manage the session close call better.
        // Reloading or unmounting cleans it up typically.
        if (inputContextRef.current) inputContextRef.current.close();
        if (audioContextRef.current) audioContextRef.current.close();
        
        sourcesRef.current.forEach(s => s.stop());
        sourcesRef.current.clear();
        
        setIsActive(false);
        setStatus("Ready to Connect");
    };

    return (
        <div className="bg-stone-900 text-stone-100 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px]">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all ${isActive ? 'bg-red-500 animate-pulse' : 'bg-stone-700'}`}>
                <span className="text-4xl">🎙️</span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{status}</h3>
            <p className="text-sm text-stone-400 mb-6 text-center max-w-md">
                Talk naturally with Zen Assistant. We use Gemini Native Audio for real-time low-latency conversation.
            </p>

            {!isActive ? (
                <button 
                    onClick={startSession}
                    className="bg-zen-highlight hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                >
                    Start Conversation
                </button>
            ) : (
                <button 
                    onClick={stopSession}
                    className="bg-stone-600 hover:bg-stone-500 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                >
                    End Session
                </button>
            )}
        </div>
    );
};