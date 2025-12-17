
import React from 'react';
import { SubscriptionTier, TIER_CONFIG } from '../types';

interface HeaderProps {
    onOpenStudio: () => void;
    userTier: SubscriptionTier;
    onSetTier: (tier: SubscriptionTier) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenStudio, userTier, onSetTier }) => {
    return (
        <header className="bg-niko-cream/90 backdrop-blur-sm sticky top-0 z-50 border-b border-niko-gray/50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-4xl filter drop-shadow-sm">🐼</span>
                    <div>
                        <h1 className="font-heading text-2xl font-extrabold text-niko-ink tracking-tight">Taleah Tales</h1>
                        <p className="text-xs text-niko-teal font-bold uppercase tracking-widest hidden sm:block">Growing Big Hearts</p>
                    </div>
                </div>
                <nav className="flex items-center gap-4 text-sm font-bold text-niko-ink/70">
                    <a href="#philosophy" className="hidden md:block hover:text-niko-teal transition-colors px-4 py-2 rounded-full hover:bg-white">Values</a>
                    
                    {/* Demo Tier Switcher */}
                    <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-2 py-1 border border-niko-gray shadow-sm">
                        <span className="text-xs uppercase text-gray-400 pl-2">View as:</span>
                        <select 
                            value={userTier} 
                            onChange={(e) => onSetTier(e.target.value as SubscriptionTier)}
                            className="bg-transparent text-xs font-bold text-niko-ink outline-none cursor-pointer p-1"
                        >
                            <option value="free">🌱 Free User</option>
                            <option value="family">🎋 Family Plan</option>
                            <option value="classroom">🌳 Classroom Plan</option>
                        </select>
                    </div>

                    <button 
                        onClick={onOpenStudio}
                        className="bg-niko-teal text-white px-5 py-2.5 rounded-full hover:bg-green-700 transition-colors flex items-center gap-2 font-bold shadow-soft btn-tactile border-green-800"
                    >
                        <span>🔮</span> <span className="hidden sm:inline">Magic Studio</span>
                    </button>
                </nav>
            </div>
        </header>
    );
};
