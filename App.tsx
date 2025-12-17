
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Philosophy } from './components/Philosophy';
import { DomainAnalytics } from './components/DomainAnalytics';
import { SyllabusExplorer } from './components/SyllabusExplorer';
import { Footer } from './components/Footer';
import { LessonModal } from './components/LessonModal';
import { ZenStudio } from './components/ZenStudio';
import { SyllabusItem, AgeBand, SubscriptionTier } from './types';
import { generateLessonPlan } from './services/geminiService';

const App: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [studioOpen, setStudioOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<{ title: string; band: AgeBand; domain: string } | null>(null);
    const [generatingKey, setGeneratingKey] = useState<string | null>(null);
    // Modal Content stores generated text or null on error
    const [modalContent, setModalContent] = useState<{ family?: string, classroom?: string } | null>({});
    
    // User Tier State (Mocking Auth)
    const [userTier, setUserTier] = useState<SubscriptionTier>('free');

    const handleOpenResources = (lesson: SyllabusItem, band: AgeBand) => {
        const title = band === 'A' ? lesson.bandA : lesson.bandB;
        
        setSelectedLesson({
            title,
            band,
            domain: lesson.domain
        });
        
        setModalContent({}); // Reset content to empty object (not null) for fresh state
        setModalOpen(true);
    };

    const handleGenerateContent = async (type: 'family_activity' | 'classroom_plan') => {
        if (!selectedLesson) return;
        
        const key = `${type}`; // Simple key for spinner
        setGeneratingKey(key);

        // If we are retrying after an error, reset to empty object so we don't show error while loading
        if (modalContent === null) {
            setModalContent({});
        }

        try {
            const text = await generateLessonPlan(selectedLesson.title, selectedLesson.band, selectedLesson.domain, type);
            setModalContent(prev => {
                // Handle case where prev might be null if recovering from error state
                const current = prev || {};
                return {
                    ...current,
                    [type === 'family_activity' ? 'family' : 'classroom']: text
                };
            });
        } catch (error) {
            console.error("Failed to generate plan:", error);
            // Set content to null to trigger error UI in LessonModal
            setModalContent(null);
        } finally {
            setGeneratingKey(null);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedLesson(null);
        setModalContent({});
    };

    return (
        <div className="antialiased min-h-screen flex flex-col font-sans relative">
            <Header 
                onOpenStudio={() => setStudioOpen(true)} 
                userTier={userTier}
                onSetTier={setUserTier}
            />
            
            <main className="flex-grow">
                <Hero />
                <Philosophy />
                <DomainAnalytics />
                <SyllabusExplorer 
                    onItemClick={handleOpenResources} 
                    userTier={userTier}
                />
            </main>
            <Footer />
            
            <LessonModal 
                isOpen={modalOpen} 
                onClose={handleCloseModal} 
                lessonContext={selectedLesson}
                content={modalContent}
                userTier={userTier}
                onGenerate={handleGenerateContent}
                isGenerating={!!generatingKey}
            />

            {/* Zen Studio Overlay */}
            {studioOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-4xl max-h-[90vh] flex flex-col relative">
                        <button 
                            onClick={() => setStudioOpen(false)}
                            className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300"
                        >
                            &times; Close Studio
                        </button>
                        <ZenStudio />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
