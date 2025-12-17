import React from 'react';

export const Hero: React.FC = () => {
    return (
        <section className="relative pt-12 pb-20 overflow-hidden">
            {/* Nature Background Decor */}
            <div className="absolute top-10 left-10 text-6xl opacity-30 animate-bounce delay-700">🎋</div>
            <div className="absolute bottom-20 right-10 text-6xl opacity-30 animate-bounce delay-1000">🌿</div>
            <div className="absolute top-40 right-20 text-4xl opacity-20 animate-pulse">☀️</div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    
                    {/* Left: Text Content */}
                    <div className="w-full md:w-1/2 text-center md:text-left z-10">
                        <div className="inline-block bg-white px-4 py-1 rounded-full text-xs font-bold text-niko-coral mb-4 border border-niko-coral/20 shadow-sm">
                            New: The "Bamboo Garden" Collection 🐼
                        </div>
                        <h2 className="font-heading text-5xl md:text-7xl font-extrabold text-niko-ink mb-6 leading-[1.1]">
                            Big Wisdom for <span className="text-niko-teal">Little Hearts.</span>
                        </h2>
                        <p className="text-xl text-niko-ink/80 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0 font-medium">
                            Safe, calm animation inspired by Zen values. 
                            We help kids grow <strong>resilience</strong> and <strong>harmony</strong> through play.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <button className="bg-niko-yellow text-niko-ink px-8 py-4 rounded-full font-heading font-extrabold text-lg shadow-lift btn-tactile border-yellow-500 flex items-center justify-center gap-3">
                                <span>▶️</span> Start Watching
                            </button>
                            <a href="#philosophy" className="bg-white text-niko-teal border-2 border-niko-teal px-8 py-4 rounded-full font-heading font-bold text-lg hover:bg-green-50 transition-colors flex items-center justify-center">
                                For Parents
                            </a>
                        </div>
                    </div>

                    {/* Right: Mascot / Visual */}
                    <div className="w-full md:w-1/2 flex justify-center z-10">
                        <div className="relative w-80 h-80 md:w-96 md:h-96 bg-niko-teal/20 rounded-full flex items-center justify-center overflow-visible">
                            {/* Circle Border */}
                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-niko-teal/40 animate-[spin_20s_linear_infinite]"></div>
                            
                            {/* Panda Mascot */}
                            <div className="text-[150px] md:text-[200px] leading-none filter drop-shadow-xl hover:scale-105 transition-transform cursor-default z-10 transform translate-y-2">
                                🐼
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute -top-8 -right-4 bg-white p-3 rounded-2xl shadow-lg transform rotate-12 border border-green-100 z-20">
                                <span className="text-4xl">🍵</span>
                            </div>
                            <div className="absolute bottom-6 -left-10 bg-white p-3 rounded-2xl shadow-lg transform -rotate-12 border border-green-100 z-20">
                                <span className="text-4xl">🎎</span>
                            </div>
                            
                            {/* Falling Leaves */}
                            <div className="absolute bottom-0 right-10 text-6xl opacity-90 z-0 transform translate-y-4">🍃</div>
                            <div className="absolute top-10 left-0 text-5xl opacity-80 z-0 transform -translate-x-4">🎋</div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};