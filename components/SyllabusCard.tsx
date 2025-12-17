
import React, { useState, useEffect } from 'react';
import { SyllabusItem, AgeBand, DOMAIN_COLORS, SubscriptionTier } from '../types';

interface SyllabusCardProps {
    item: SyllabusItem;
    band: AgeBand;
    onMagicPlanClick: (item: SyllabusItem, band: AgeBand) => void;
    userTier: SubscriptionTier;
}

export const SyllabusCard: React.FC<SyllabusCardProps> = ({ item, band, onMagicPlanClick, userTier }) => {
    const lessonTitle = band === 'A' ? item.bandA : item.bandB;
    const bandLabel = band === 'A' ? "Sprouts (2-5)" : "Saplings (6-8)";
    const color = DOMAIN_COLORS[item.domain] || '#ccc';

    // Unique ID for persistence
    const lessonId = `lesson_${item.month}_${item.week}_${band}_${item.domain}`;

    // State for Favorite
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        try {
            const favs = JSON.parse(localStorage.getItem('zen_favorites') || '[]');
            if (favs.includes(lessonId)) {
                setIsFavorite(true);
            }
        } catch (e) {
            console.error("Error reading favorites", e);
        }
    }, [lessonId]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const favs = JSON.parse(localStorage.getItem('zen_favorites') || '[]');
            let newFavs;
            if (favs.includes(lessonId)) {
                newFavs = favs.filter((id: string) => id !== lessonId);
                setIsFavorite(false);
            } else {
                newFavs = [...favs, lessonId];
                setIsFavorite(true);
            }
            localStorage.setItem('zen_favorites', JSON.stringify(newFavs));
        } catch (e) {
            console.error("Error saving favorite", e);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareData = {
            title: 'Taleah Tales Lesson',
            text: `Check out this lesson: "${lessonTitle}" (${bandLabel}) regarding ${item.domain}!`,
            url: window.location.href
        };
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // Share cancelled
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            alert("Lesson info copied to clipboard!");
        }
    };

    // Placeholder gradient based on domain color
    const bgGradient = `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`;

    const isFamilyLocked = userTier === 'free';
    const isProLocked = userTier === 'free' || userTier === 'family';

    return (
        <div className="bg-white rounded-[2rem] shadow-soft hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group overflow-hidden border border-transparent hover:border-niko-gray/30 flex flex-col h-full relative">
            
            {/* Top Action Bar (Absolute) */}
            <div className="absolute top-4 left-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <button 
                    onClick={toggleFavorite}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 transform hover:scale-110 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                    title="Toggle Favorite"
                 >
                    {isFavorite ? '❤️' : '🤍'}
                 </button>
                 <button 
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-white text-gray-400 hover:text-niko-blue flex items-center justify-center shadow-md transition-all duration-200 transform hover:scale-110"
                    title="Share Lesson"
                 >
                    📤
                 </button>
            </div>
            
            {/* Show heart if favorite even when not hovering */}
            {isFavorite && (
                <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md group-hover:hidden">
                    ❤️
                </div>
            )}

            {/* Thumbnail Area */}
            <div 
                className="h-48 w-full relative overflow-hidden flex items-center justify-center cursor-pointer"
                style={{ background: bgGradient }}
                onClick={() => onMagicPlanClick(item, band)}
            >
                <div className="text-6xl transform group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                
                {/* Age Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${band === 'A' ? 'bg-niko-yellow text-niko-ink' : 'bg-niko-blue text-white'}`}>
                    {bandLabel}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <span className="text-3xl ml-1">▶️</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex gap-2 mb-3">
                    <span 
                        className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase"
                        style={{ backgroundColor: `${color}30`, color: color }} 
                    >
                        {item.domain}
                    </span>
                    <span className="text-xs font-bold text-niko-ink/40 py-1 uppercase self-center">Week {item.week}</span>
                </div>

                <h4 className="font-heading font-extrabold text-xl text-niko-ink mb-4 leading-tight flex-1">
                    {lessonTitle}
                </h4>

                {/* Resource Pills - Styled Distinctly */}
                <div className="flex gap-2 mb-5">
                    {/* Family Pill */}
                    <div className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] uppercase font-extrabold px-2 py-1.5 rounded-lg border shadow-sm transition-colors ${
                        isFamilyLocked 
                        ? 'bg-gray-50 border-gray-200 text-gray-400' 
                        : 'bg-niko-teal/10 border-niko-teal/30 text-niko-teal'
                    }`}>
                        <span className="text-base">{isFamilyLocked ? '🔒' : '🎋'}</span>
                        <span>Family</span>
                    </div>

                    {/* Pro Pill */}
                    <div className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] uppercase font-extrabold px-2 py-1.5 rounded-lg border shadow-sm transition-colors ${
                        isProLocked 
                        ? 'bg-gray-50 border-gray-200 text-gray-400' 
                        : 'bg-niko-yellow/20 border-niko-yellow/50 text-yellow-700'
                    }`}>
                        <span className="text-base">{isProLocked ? '🔒' : '🌳'}</span>
                        <span>Classroom</span>
                    </div>
                </div>

                <button 
                    onClick={() => onMagicPlanClick(item, band)}
                    className="w-full py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 btn-tactile bg-white border-2 border-niko-ink text-niko-ink hover:bg-niko-ink hover:text-white border-b-4 border-niko-ink"
                >
                    <span>📚</span> View Resources
                </button>
            </div>
        </div>
    );
};
