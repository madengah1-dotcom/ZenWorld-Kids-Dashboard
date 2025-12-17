
import React, { useState, useMemo } from 'react';
import { SyllabusCard } from './SyllabusCard';
import { SYLLABUS_DATA } from '../constants';
import { AgeBand, SyllabusItem, SubscriptionTier } from '../types';

interface SyllabusExplorerProps {
    onItemClick: (item: SyllabusItem, band: AgeBand) => void;
    userTier: SubscriptionTier;
}

export const SyllabusExplorer: React.FC<SyllabusExplorerProps> = ({ onItemClick, userTier }) => {
    const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');
    const [bandFilter, setBandFilter] = useState<AgeBand>('A');

    const filteredData = useMemo(() => {
        return SYLLABUS_DATA.filter(item => {
            if (monthFilter !== 'all' && item.month !== monthFilter) return false;
            return true;
        });
    }, [monthFilter]);

    // Emotional Nav Data
    const emotions = [
        { label: "Happy", icon: "☀️", color: "bg-niko-yellow" },
        { label: "Curious", icon: "🔍", color: "bg-niko-blue" },
        { label: "Kind", icon: "❤️", color: "bg-niko-coral" },
        { label: "Calm", icon: "🍃", color: "bg-niko-teal" },
    ];

    return (
        <section id="library" className="py-20 bg-niko-cream">
            <div className="container mx-auto px-4">
                
                {/* Emotional Nav Section */}
                <div className="mb-16">
                    <h3 className="font-heading text-2xl font-bold text-niko-ink mb-6">How are you feeling today?</h3>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                        {emotions.map((e) => (
                            <button key={e.label} className="flex flex-col items-center gap-3 min-w-[100px] group">
                                <div className={`w-20 h-20 rounded-3xl ${e.color} flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform btn-tactile border-black/10`}>
                                    {e.icon}
                                </div>
                                <span className="font-bold text-niko-ink/70">{e.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Library Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                    <div>
                        <h2 className="font-heading text-4xl font-extrabold text-niko-ink mb-2">Episode Library</h2>
                        <p className="text-niko-ink/60 font-medium">Explore stories by theme or age.</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-niko-gray">
                         <button 
                            onClick={() => setBandFilter('A')}
                            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${bandFilter === 'A' ? 'bg-niko-yellow text-niko-ink shadow-sm' : 'text-niko-ink/50 hover:bg-niko-gray/20'}`}
                         >
                            👶 Ages 2-5
                         </button>
                         <button 
                            onClick={() => setBandFilter('B')}
                            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${bandFilter === 'B' ? 'bg-niko-blue text-white shadow-sm' : 'text-niko-ink/50 hover:bg-niko-gray/20'}`}
                         >
                            🌱 Ages 6-8
                         </button>
                         <div className="w-px bg-niko-gray mx-1"></div>
                         <select 
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="bg-transparent text-sm font-bold text-niko-ink outline-none cursor-pointer hover:text-niko-teal pr-2"
                         >
                             <option value="all">All Themes</option>
                             <option value="1">Self & Routine</option>
                             <option value="2">Harmony & Others</option>
                             <option value="3">Resilience & Growth</option>
                         </select>
                    </div>
                </div>

                {/* Grid */}
                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredData.map((item, idx) => {
                            return (
                                <SyllabusCard 
                                    key={`${item.month}-${item.week}-${idx}`}
                                    item={item}
                                    band={bandFilter}
                                    onMagicPlanClick={onItemClick}
                                    userTier={userTier}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-niko-gray border-dashed">
                        <div className="text-6xl mb-4">🍃</div>
                        <p className="text-niko-ink/50 font-bold text-lg">No stories found in this garden.</p>
                    </div>
                )}
            </div>
        </section>
    );
};
