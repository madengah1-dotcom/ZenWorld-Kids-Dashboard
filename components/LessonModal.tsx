
import React, { useState } from 'react';
import { AgeBand, SubscriptionTier, TIER_CONFIG } from '../types';

interface LessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonContext: {
        title: string;
        band: AgeBand;
        domain: string;
    } | null;
    content: { family?: string, classroom?: string } | null;
    userTier: SubscriptionTier;
    onGenerate: (type: 'family_activity' | 'classroom_plan') => void;
    isGenerating: boolean;
}

export const LessonModal: React.FC<LessonModalProps> = ({ 
    isOpen, onClose, lessonContext, content, userTier, onGenerate, isGenerating 
}) => {
    const [activeTab, setActiveTab] = useState<'free' | 'family' | 'classroom'>('free');
    const [copied, setCopied] = useState(false);

    // Ensure we start on a valid tab when opening
    React.useEffect(() => {
        if (isOpen) setActiveTab('free');
    }, [isOpen]);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    if (!isOpen || !lessonContext) return null;

    // Helper to render locked state
    const renderLocked = (tier: 'family' | 'classroom') => {
        const config = TIER_CONFIG[tier];
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full bg-niko-gray/10 rounded-3xl border-2 border-dashed border-niko-gray m-2">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-4xl">
                    🔒
                </div>
                <h3 className="font-heading text-xl font-extrabold text-niko-ink mb-2">Unlock {config.label}</h3>
                <p className="text-niko-ink/60 mb-6 max-w-xs">
                    Get access to {tier === 'family' ? 'home activities & printables' : 'full lesson plans & assessments'}.
                </p>
                <button className={`px-6 py-3 rounded-xl font-bold text-white shadow-soft hover:brightness-110 transition-all bg-${config.color === 'niko-teal' ? 'niko-teal' : 'yellow-500'}`}>
                    Upgrade for {config.price}
                </button>
            </div>
        );
    };

    // Helper to render AI Content
    const renderContent = (type: 'family_activity' | 'classroom_plan', tierName: string) => {
        // If content prop is strictly null, show error (as per prompt instructions)
        // Note: In App.tsx, initial state is {}, so this only triggers if explicitly set to null on error
        if (content === null) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-red-50 rounded-3xl border-2 border-red-100 m-2">
                     <div className="text-5xl mb-4">⚠️</div>
                     <h3 className="font-heading text-xl font-bold text-red-500 mb-2">Generation Failed</h3>
                     <p className="text-red-400 font-bold text-sm">Could not generate lesson plan. Please try again.</p>
                     <button 
                        onClick={() => onGenerate(type)}
                        className="mt-6 px-6 py-2 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 font-bold transition-colors"
                    >
                        Retry
                     </button>
                </div>
            );
        }

        const text = type === 'family_activity' ? content.family : content.classroom;
        
        if (!text) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-niko-teal/10 rounded-full flex items-center justify-center mb-4 text-3xl animate-bounce">
                        ✨
                    </div>
                    <p className="text-niko-ink/60 font-bold mb-6">Create a custom {tierName.toLowerCase()} using AI.</p>
                    <button 
                        onClick={() => onGenerate(type)}
                        disabled={isGenerating}
                        className="px-8 py-3 bg-niko-teal text-white rounded-xl font-bold shadow-soft hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? 'Generating...' : `Generate ${tierName}`}
                    </button>
                </div>
            );
        }

        return (
            <div className="animate-fade-in">
                <div className="prose prose-lg prose-stone max-w-none" dangerouslySetInnerHTML={{ 
                    __html: text
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-niko-teal">$1</strong>')
                        .replace(/^# (.*$)/gim, '<h2 class="font-heading text-2xl font-bold mb-3 text-niko-ink">$1</h2>')
                        .replace(/^## (.*$)/gim, '<h3 class="font-heading text-xl font-bold mt-8 mb-4 text-niko-coral border-b-2 border-niko-coral/20 pb-2 inline-block">$1</h3>')
                        .replace(/\n/g, '<br>')
                }} />
                <div className="mt-6 flex justify-end">
                    <button onClick={() => handleCopy(text)} className="text-sm font-bold text-niko-teal hover:underline">
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-niko-ink/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-niko-cream rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border-4 border-white" 
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-8 border-b border-niko-gray/50 flex justify-between items-start bg-white pb-0">
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between w-full mb-6">
                            <div>
                                <span className="text-xs font-bold text-niko-teal uppercase tracking-widest mb-2 bg-niko-teal/10 px-2 py-1 rounded-md self-start inline-block">
                                    {lessonContext.domain} Domain
                                </span>
                                <h3 className="font-heading text-3xl font-extrabold text-niko-ink leading-tight mt-2">{lessonContext.title}</h3>
                            </div>
                            <button onClick={onClose} className="bg-niko-gray/20 hover:bg-niko-coral hover:text-white text-niko-ink w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors font-bold">&times;</button>
                        </div>

                        {/* TABS */}
                        <div className="flex gap-2 w-full">
                            <button 
                                onClick={() => setActiveTab('free')}
                                className={`flex-1 py-3 text-sm font-extrabold uppercase tracking-wide border-b-4 transition-colors ${activeTab === 'free' ? 'border-niko-ink text-niko-ink' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                📺 Episode
                            </button>
                            <button 
                                onClick={() => setActiveTab('family')}
                                className={`flex-1 py-3 text-sm font-extrabold uppercase tracking-wide border-b-4 transition-colors flex justify-center items-center gap-2 ${activeTab === 'family' ? 'border-niko-teal text-niko-teal' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <span>🎋</span> Family
                            </button>
                            <button 
                                onClick={() => setActiveTab('classroom')}
                                className={`flex-1 py-3 text-sm font-extrabold uppercase tracking-wide border-b-4 transition-colors flex justify-center items-center gap-2 ${activeTab === 'classroom' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <span>🌳</span> Classroom
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Modal Content Area */}
                <div className="p-8 overflow-y-auto flex-1 bg-white">
                    {/* FREE TAB */}
                    {activeTab === 'free' && (
                        <div className="animate-fade-in">
                            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                                <span className="text-4xl">▶️ Video Player</span>
                            </div>
                            <h4 className="font-heading text-xl font-bold text-niko-ink mb-2">About this Episode</h4>
                            <p className="text-niko-ink/70 leading-relaxed mb-4">
                                In this episode, Taleah learns about <strong>{lessonContext.domain}</strong> and how it helps her grow. 
                                Perfect for ages {lessonContext.band === 'A' ? '2-5' : '6-8'}.
                            </p>
                            <div className="bg-niko-yellow/20 p-4 rounded-xl border border-yellow-200">
                                <strong className="text-yellow-800 text-sm uppercase block mb-1">Parent Hook</strong>
                                <p className="text-niko-ink/80 text-sm italic">"Watch how Taleah takes a deep breath before reacting!"</p>
                            </div>
                        </div>
                    )}

                    {/* FAMILY TAB */}
                    {activeTab === 'family' && (
                        <>
                            {userTier === 'free' ? renderLocked('family') : (
                                <div>
                                    <div className="flex gap-4 mb-8">
                                        <div className="flex-1 bg-niko-cream border-2 border-niko-gray rounded-2xl p-4 text-center cursor-pointer hover:border-niko-teal transition-colors">
                                            <span className="text-3xl block mb-2">📄</span>
                                            <span className="font-bold text-sm text-niko-ink">Printable Chart</span>
                                        </div>
                                        <div className="flex-1 bg-niko-cream border-2 border-niko-gray rounded-2xl p-4 text-center cursor-pointer hover:border-niko-teal transition-colors">
                                            <span className="text-3xl block mb-2">🎵</span>
                                            <span className="font-bold text-sm text-niko-ink">Calm Audio</span>
                                        </div>
                                    </div>
                                    <h4 className="font-heading text-xl font-bold text-niko-ink mb-4 border-b pb-2">Home Activity Generator</h4>
                                    {renderContent('family_activity', 'Activity')}
                                </div>
                            )}
                        </>
                    )}

                    {/* CLASSROOM TAB */}
                    {activeTab === 'classroom' && (
                        <>
                            {(userTier === 'free' || userTier === 'family') ? renderLocked('classroom') : (
                                <div>
                                    <h4 className="font-heading text-xl font-bold text-niko-ink mb-4 border-b pb-2">Magic Lesson Planner</h4>
                                    {renderContent('classroom_plan', 'Plan')}
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {/* Modal Footer */}
                <div className="p-4 border-t border-niko-gray/50 bg-niko-cream/50 flex justify-between items-center">
                     <span className="text-xs text-niko-ink/40 font-bold uppercase tracking-wide">
                        {activeTab === 'free' ? 'Always Free' : `${TIER_CONFIG[activeTab].label} Content`}
                     </span>
                     <button onClick={onClose} className="px-6 py-2 bg-white border border-niko-gray text-niko-ink rounded-xl hover:bg-gray-50 font-bold transition-colors shadow-sm">
                        Close
                     </button>
                </div>
            </div>
        </div>
    );
};
