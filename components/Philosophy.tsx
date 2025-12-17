import React from 'react';

const PillarCard: React.FC<{ icon: string; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => (
    <div className={`bg-white p-8 rounded-3xl border-2 border-transparent hover:border-${color} shadow-soft hover:shadow-lift hover:-translate-y-2 transition-all duration-300 group`}>
        <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
        <h4 className="font-heading font-extrabold text-xl mb-3 text-niko-ink">{title}</h4>
        <p className="text-base text-niko-ink/70 leading-relaxed">{desc}</p>
    </div>
);

export const Philosophy: React.FC = () => {
    return (
        <section id="philosophy" className="py-20 bg-white rounded-t-[3rem] -mt-10 relative z-20">
            <div className="container mx-auto px-4">
                
                {/* Parent Trust Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 bg-niko-teal/10 p-8 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm text-2xl">👩‍🏫</div>
                        <span className="font-bold text-niko-teal">Educator Approved</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm text-2xl">🧘</div>
                        <span className="font-bold text-niko-teal">No Overstimulation</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm text-2xl">❤️</div>
                        <span className="font-bold text-niko-teal">Values First Content</span>
                    </div>
                </div>

                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <span className="text-niko-coral font-bold uppercase tracking-widest text-sm mb-2 block">Our Promise</span>
                    <h3 className="font-heading text-3xl md:text-4xl font-extrabold text-niko-ink mb-4">Grounded in Ancient Wisdom</h3>
                    <p className="text-lg text-niko-ink/60">We blend the Japanese principle of <em className="text-niko-teal not-italic font-bold">Wa</em> (Harmony) with modern play-based learning.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PillarCard 
                        icon="🪁" 
                        title="Play as Learning" 
                        desc="Knowledge is not 'taught' but discovered through interaction." 
                        color="niko-yellow"
                    />
                    <PillarCard 
                        icon="🛡️" 
                        title="Emotional Safety" 
                        desc="A calm environment. No rapid edits, no screaming." 
                        color="niko-blue"
                    />
                    <PillarCard 
                        icon="🤝" 
                        title="Group Harmony" 
                        desc="Focusing on how individual actions affect the community." 
                        color="niko-teal"
                    />
                    <PillarCard 
                        icon="🍂" 
                        title="Nature Connect" 
                        desc="Using elemental metaphors to explain complex feelings." 
                        color="niko-coral"
                    />
                </div>
            </div>
        </section>
    );
};