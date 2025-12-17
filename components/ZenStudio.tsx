import React, { useState, useRef } from 'react';
import { 
    generateImage, generateVeoVideo, editImage, sendChatMessage, 
    analyzeMedia, transcribeAudio, generateSpeech 
} from '../services/geminiService';
import { LiveSession } from './LiveSession';
import { AspectRatio, ImageSize, VideoAspectRatio } from '../types';

type StudioTab = 'create' | 'ask' | 'analyze' | 'voice';
type CreateMode = 'image' | 'video' | 'edit';

export const ZenStudio: React.FC = () => {
    const [activeTab, setActiveTab] = useState<StudioTab>('create');

    // -- State for Tools --
    const [createMode, setCreateMode] = useState<CreateMode>('image');
    
    const [imgPrompt, setImgPrompt] = useState('');
    const [imgRatio, setImgRatio] = useState<AspectRatio>('1:1');
    const [imgSize, setImgSize] = useState<ImageSize>('1K');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [baseImage, setBaseImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Video specific
    const [videoRatio, setVideoRatio] = useState<VideoAspectRatio>('16:9');

    // Chat specific
    const [chatMsg, setChatMsg] = useState('');
    const [chatMode, setChatMode] = useState<'normal' | 'search' | 'maps' | 'thinking' | 'fast'>('normal');
    const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
    const [chatLoading, setChatLoading] = useState(false);

    // Analysis specific
    const [analyzeFile, setAnalyzeFile] = useState<File | null>(null);
    const [analyzePrompt, setAnalyzePrompt] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');

    // TTS specific
    const [ttsText, setTtsText] = useState('');

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'base' | 'analyze') => {
        if (e.target.files && e.target.files[0]) {
            if (target === 'base') {
                const b64 = await fileToBase64(e.target.files[0]);
                setBaseImage(b64);
            } else {
                setAnalyzeFile(e.target.files[0]);
            }
        }
    };

    // --- Actions ---
    const handleCreate = async () => {
        setIsLoading(true);
        setResultImage(null); // Clear previous result
        try {
            if (createMode === 'video') {
                 if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                    // key ready
                } else if (window.aistudio) {
                    await window.aistudio.openSelectKey();
                }
                const videoUrl = await generateVeoVideo(imgPrompt, videoRatio, baseImage || undefined);
                setResultImage(videoUrl); 
            } else if (createMode === 'edit' && baseImage) {
                const url = await editImage(baseImage, imgPrompt);
                setResultImage(url);
            } else if (createMode === 'image') {
                const url = await generateImage(imgPrompt, imgRatio, imgSize);
                setResultImage(url);
            }
        } catch (e) {
            alert("Creation failed. See console.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChat = async () => {
        if (!chatMsg) return;
        setChatLoading(true);
        const newHistory = [...chatHistory, { role: 'user', parts: [{ text: chatMsg }] }];
        setChatHistory(newHistory);
        setChatMsg('');

        try {
            const result = await sendChatMessage(chatMsg, chatHistory, chatMode);
            const text = result.response.text();
            setChatHistory([...newHistory, { role: 'model', parts: [{ text }] }]);
        } catch (e) {
            console.error(e);
        } finally {
            setChatLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!analyzeFile) return;
        setIsLoading(true);
        try {
            const b64 = await fileToBase64(analyzeFile);
            if (analyzeFile.type.startsWith('audio/')) {
                const text = await transcribeAudio(b64, analyzeFile.type);
                setAnalysisResult(text || "No transcription.");
            } else {
                const text = await analyzeMedia(b64, analyzeFile.type, analyzePrompt || "Describe this.");
                setAnalysisResult(text || "No analysis.");
            }
        } catch (e) {
            console.error(e);
            setAnalysisResult("Error analyzing media.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTTS = async () => {
        setIsLoading(true);
        try {
            const audioUrl = await generateSpeech(ttsText);
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const binary = atob(audioUrl.split(',')[1]);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const float32 = new Float32Array(bytes.length / 2);
            const dataView = new DataView(bytes.buffer);
            for (let i = 0; i < bytes.length / 2; i++) {
                float32[i] = dataView.getInt16(i * 2, true) / 32768.0;
            }
            const buffer = ctx.createBuffer(1, float32.length, 24000);
            buffer.getChannelData(0).set(float32);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl border-4 border-niko-teal/20 overflow-hidden flex flex-col min-h-[650px]">
            {/* Sidebar / Header */}
            <div className="bg-niko-cream border-b border-niko-gray p-4 flex gap-4 overflow-x-auto">
                <button onClick={() => setActiveTab('create')} className={`px-6 py-3 rounded-xl font-bold transition-all btn-tactile ${activeTab === 'create' ? 'bg-niko-yellow text-niko-ink border-yellow-500' : 'bg-white text-niko-ink/50 hover:bg-white/80 border-transparent'}`}>🎨 Create</button>
                <button onClick={() => setActiveTab('ask')} className={`px-6 py-3 rounded-xl font-bold transition-all btn-tactile ${activeTab === 'ask' ? 'bg-niko-blue text-white border-blue-600' : 'bg-white text-niko-ink/50 hover:bg-white/80 border-transparent'}`}>🧠 Oracle</button>
                <button onClick={() => setActiveTab('analyze')} className={`px-6 py-3 rounded-xl font-bold transition-all btn-tactile ${activeTab === 'analyze' ? 'bg-niko-coral text-white border-red-400' : 'bg-white text-niko-ink/50 hover:bg-white/80 border-transparent'}`}>👁️ Analyze</button>
                <button onClick={() => setActiveTab('voice')} className={`px-6 py-3 rounded-xl font-bold transition-all btn-tactile ${activeTab === 'voice' ? 'bg-niko-teal text-white border-green-700' : 'bg-white text-niko-ink/50 hover:bg-white/80 border-transparent'}`}>🎙️ Voice</button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto bg-white">
                {/* --- CREATE TAB --- */}
                {activeTab === 'create' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        {/* Creation Mode Switcher */}
                        <div className="flex bg-niko-cream p-1 rounded-2xl mb-6 shadow-inner">
                            <button 
                                onClick={() => setCreateMode('image')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${createMode === 'image' ? 'bg-white text-niko-teal shadow-sm' : 'text-niko-ink/50 hover:text-niko-ink'}`}
                            >
                                🖼️ Image Gen
                            </button>
                            <button 
                                onClick={() => setCreateMode('video')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${createMode === 'video' ? 'bg-white text-niko-blue shadow-sm' : 'text-niko-ink/50 hover:text-niko-ink'}`}
                            >
                                🎬 Veo Video
                            </button>
                            <button 
                                onClick={() => setCreateMode('edit')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${createMode === 'edit' ? 'bg-white text-niko-coral shadow-sm' : 'text-niko-ink/50 hover:text-niko-ink'}`}
                            >
                                ✏️ Image Edit
                            </button>
                        </div>

                        {/* Upload Section for Edit/Video */}
                        {(createMode === 'edit' || createMode === 'video') && (
                            <div className="p-8 border-2 border-dashed border-niko-gray rounded-3xl text-center bg-niko-cream/30">
                                <p className="text-sm font-bold text-niko-ink/50 mb-2">
                                    {createMode === 'video' ? 'Upload Image for Video (Optional)' : 'Upload Source Image (Required)'}
                                </p>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'base')} className="mx-auto block" />
                                {baseImage && <p className="text-niko-teal font-bold text-sm mt-2">✅ Image Loaded</p>}
                            </div>
                        )}

                        {/* Text Prompt */}
                        <div>
                             <label className="block text-sm font-bold text-niko-ink/60 mb-2 uppercase tracking-wide">
                                {createMode === 'edit' ? 'Instructions' : 'Prompt'}
                             </label>
                            <textarea 
                                className="w-full p-4 border-2 border-niko-gray rounded-2xl focus:border-niko-teal outline-none font-medium resize-none h-32" 
                                placeholder={createMode === 'video' ? "Describe the video magic..." : "Describe what you want to see..."}
                                value={imgPrompt}
                                onChange={e => setImgPrompt(e.target.value)}
                            />
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            {createMode === 'image' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-niko-ink/40 mb-1 uppercase">Aspect Ratio</label>
                                        <select value={imgRatio} onChange={e => setImgRatio(e.target.value as AspectRatio)} className="w-full p-3 border-2 border-niko-gray rounded-xl font-bold text-niko-ink bg-white">
                                            <option value="1:1">1:1 Square</option>
                                            <option value="16:9">16:9 Landscape</option>
                                            <option value="9:16">9:16 Portrait</option>
                                            <option value="3:4">3:4 Portrait</option>
                                            <option value="4:3">4:3 Landscape</option>
                                            <option value="2:3">2:3 Portrait</option>
                                            <option value="3:2">3:2 Landscape</option>
                                            <option value="21:9">21:9 Ultrawide</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-niko-ink/40 mb-1 uppercase">Size</label>
                                        <select value={imgSize} onChange={e => setImgSize(e.target.value as ImageSize)} className="w-full p-3 border-2 border-niko-gray rounded-xl font-bold text-niko-ink bg-white">
                                            <option value="1K">1K - Standard</option>
                                            <option value="2K">2K - High Res</option>
                                            <option value="4K">4K - Ultra Res</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {createMode === 'video' && (
                                <div>
                                    <label className="block text-xs font-bold text-niko-ink/40 mb-1 uppercase">Video Ratio</label>
                                    <select value={videoRatio} onChange={e => setVideoRatio(e.target.value as VideoAspectRatio)} className="w-full p-3 border-2 border-niko-gray rounded-xl font-bold text-niko-ink bg-white">
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        <button 
                            disabled={isLoading}
                            onClick={handleCreate}
                            className="w-full bg-niko-yellow text-niko-ink py-4 rounded-2xl font-heading font-extrabold text-xl hover:brightness-105 disabled:opacity-50 btn-tactile border-yellow-500 shadow-lift"
                        >
                            {isLoading ? 'Conjuring...' : `Generate ${createMode === 'video' ? 'Video' : 'Image'}`}
                        </button>

                        {/* Result Display */}
                        {resultImage && (
                            <div className="mt-8">
                                <h3 className="font-heading text-lg font-bold text-niko-ink mb-2">Result</h3>
                                <div className="border-4 border-white shadow-lg rounded-3xl overflow-hidden bg-niko-gray/10">
                                    {createMode === 'video' ? (
                                        <video src={resultImage} controls autoPlay className="w-full" />
                                    ) : (
                                        <img src={resultImage} alt="Generated" className="w-full block" />
                                    )}
                                </div>
                                {createMode !== 'video' && (
                                    <a 
                                        href={resultImage} 
                                        download="zen-creation.png" 
                                        className="block text-center mt-2 text-sm font-bold text-niko-teal hover:underline"
                                    >
                                        Download Image
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* --- ASK TAB --- */}
                {activeTab === 'ask' && (
                    <div className="flex flex-col h-full max-w-3xl mx-auto">
                         <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                             {['normal', 'search', 'maps', 'thinking', 'fast'].map(m => (
                                 <button 
                                    key={m}
                                    onClick={() => setChatMode(m as any)}
                                    className={`px-4 py-2 rounded-full text-xs uppercase font-bold border-2 transition-colors ${chatMode === m ? 'bg-niko-ink text-white border-niko-ink' : 'bg-white text-niko-ink/40 border-niko-gray'}`}
                                 >
                                     {m}
                                 </button>
                             ))}
                         </div>
                         
                         <div className="flex-1 bg-niko-cream rounded-3xl p-6 mb-6 overflow-y-auto max-h-[400px] border border-niko-gray/30">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`mb-4 p-4 rounded-2xl text-base font-medium ${msg.role === 'user' ? 'bg-white ml-8 shadow-sm text-niko-ink rounded-tr-sm' : 'bg-niko-teal/10 mr-8 text-niko-ink rounded-tl-sm'}`}>
                                    <strong className="block text-xs uppercase opacity-50 mb-1">{msg.role === 'user' ? 'You' : 'Taleah Bot'}</strong> 
                                    <div className="whitespace-pre-wrap">{msg.parts[0].text}</div>
                                </div>
                            ))}
                            {chatLoading && <div className="text-center text-niko-teal font-bold animate-pulse">Thinking...</div>}
                         </div>

                         <div className="flex gap-3">
                             <input 
                                className="flex-1 p-4 border-2 border-niko-gray rounded-2xl focus:border-niko-blue outline-none font-bold text-niko-ink placeholder-niko-ink/30"
                                placeholder="Ask a question..."
                                value={chatMsg}
                                onChange={e => setChatMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleChat()}
                             />
                             <button onClick={handleChat} className="bg-niko-blue text-white px-8 rounded-2xl font-bold btn-tactile border-blue-600">Send</button>
                         </div>
                    </div>
                )}

                {/* --- ANALYZE TAB --- */}
                {activeTab === 'analyze' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div className="border-4 border-dashed border-niko-gray rounded-3xl p-12 text-center bg-niko-cream">
                            <div className="text-4xl mb-4">👁️</div>
                            <p className="mb-6 text-niko-ink font-bold">Upload Image, Video, or Audio</p>
                            <input type="file" onChange={e => handleFileUpload(e, 'analyze')} className="mx-auto" />
                        </div>
                        
                        {analyzeFile && !analyzeFile.type.startsWith('audio/') && (
                            <input 
                                className="w-full p-4 border-2 border-niko-gray rounded-2xl focus:border-niko-coral outline-none font-bold" 
                                placeholder="What should I look for?"
                                value={analyzePrompt}
                                onChange={e => setAnalyzePrompt(e.target.value)}
                            />
                        )}

                        <button 
                            onClick={handleAnalyze} 
                            disabled={isLoading || !analyzeFile}
                            className="w-full bg-niko-coral text-white py-4 rounded-2xl font-bold hover:brightness-105 disabled:opacity-50 btn-tactile border-red-400"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Media'}
                        </button>

                        {analysisResult && (
                            <div className="bg-niko-cream border border-niko-gray p-6 rounded-3xl mt-6">
                                <h4 className="font-bold text-sm mb-3 text-niko-coral uppercase tracking-wider">Analysis Result</h4>
                                <p className="text-base text-niko-ink leading-relaxed">{analysisResult}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- VOICE TAB --- */}
                {activeTab === 'voice' && (
                    <div className="space-y-12 max-w-2xl mx-auto">
                        <div>
                            <h3 className="font-heading text-2xl font-extrabold text-niko-ink mb-6 text-center">Live Conversation</h3>
                            <LiveSession />
                        </div>

                        <div className="border-t-2 border-dashed border-niko-gray pt-8">
                            <h3 className="font-heading text-xl font-bold text-niko-ink mb-4">Text to Speech</h3>
                            <textarea 
                                className="w-full p-4 border-2 border-niko-gray rounded-2xl mb-4 focus:border-niko-teal outline-none font-medium h-32" 
                                placeholder="Enter text to speak..."
                                value={ttsText}
                                onChange={e => setTtsText(e.target.value)}
                            />
                            <button 
                                onClick={handleTTS}
                                disabled={isLoading}
                                className="w-full bg-niko-ink text-white py-3 rounded-2xl font-bold btn-tactile border-gray-700"
                            >
                                {isLoading ? 'Generating Audio...' : 'Speak'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};