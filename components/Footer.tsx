import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-niko-gray/50 py-12 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <div className="text-4xl mb-4">🐼</div>
                <p className="font-heading text-2xl font-extrabold text-niko-ink mb-2">Taleah Tales</p>
                <p className="text-sm font-bold text-niko-ink/40 uppercase tracking-widest mb-6">Growing Big Hearts with Little Stories</p>
                
                <div className="flex justify-center gap-6">
                     <a href="#" className="text-niko-ink/50 hover:text-niko-teal font-bold text-sm">About</a>
                     <a href="#" className="text-niko-ink/50 hover:text-niko-teal font-bold text-sm">Safety</a>
                     <a href="#" className="text-niko-ink/50 hover:text-niko-teal font-bold text-sm">Contact</a>
                </div>

                <div className="mt-8 text-xs text-niko-ink/20">
                    © 2024 Taleah Tales. All rights reserved.
                </div>
            </div>
        </footer>
    );
};