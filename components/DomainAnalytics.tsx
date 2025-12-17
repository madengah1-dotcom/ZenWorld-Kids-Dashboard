import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SYLLABUS_DATA } from '../constants';
import { DOMAIN_COLORS, Domain } from '../types';

export const DomainAnalytics: React.FC = () => {
    // Aggregation logic
    const chartData = useMemo(() => {
        const counts: Record<string, number> = {};
        SYLLABUS_DATA.forEach(item => {
            counts[item.domain] = (counts[item.domain] || 0) + 1;
        });

        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key],
            color: DOMAIN_COLORS[key as Domain]
        }));
    }, []);

    return (
        <section id="domains" className="py-12 bg-stone-100">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    
                    {/* Left Column: Domain Explanations */}
                    <div className="w-full md:w-2/3">
                        <div className="mb-6">
                            <h3 className="font-serif text-2xl font-bold text-zen-dark mb-2">The 8 Learning Domains</h3>
                            <p className="text-gray-600">The curriculum rotates through these key areas to ensure holistic development.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: "🧘", title: "Self", sub: "Inner Garden" },
                                { icon: "🌳", title: "Family", sub: "The Roots" },
                                { icon: "🏘️", title: "Community", sub: "The Village" },
                                { icon: "🌊", title: "Nature", sub: "The Elements" },
                                { icon: "📐", title: "Logic", sub: "The Builder" },
                                { icon: "📖", title: "Language", sub: "The Poet" },
                                { icon: "🎨", title: "Art", sub: "The Creator" },
                                { icon: "🍎", title: "Health", sub: "The Temple" },
                            ].map((d) => (
                                <div key={d.title} className="bg-white p-4 rounded-lg shadow-sm text-center border border-stone-100 hover:border-zen-secondary transition-colors">
                                    <div className="text-2xl">{d.icon}</div>
                                    <div className="font-bold text-sm text-gray-800 mt-2">{d.title}</div>
                                    <div className="text-xs text-gray-500">{d.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visualization */}
                    <div className="w-full md:w-1/3">
                         <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200">
                            <h4 className="font-bold text-gray-800 mb-4 text-center">Curriculum Balance (Q1)</h4>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                            itemStyle={{ color: '#2C2C2C', fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Legend 
                                            layout="horizontal" 
                                            verticalAlign="bottom" 
                                            align="center"
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-4">Distribution of lessons across the first quarter.</p>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};