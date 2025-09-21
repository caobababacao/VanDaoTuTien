import React, { useState, useEffect, useRef } from 'react';
import { CombatState, DemonicBeast, Character, DemonicBeastTier } from '../types';
import { BEAST_IMAGES_SO_GIAI, BEAST_IMAGES_TRUNG_GIAI, BEAST_IMAGES_CAO_GIAI, BEAST_IMAGES_DAI_YEU } from '../constants';

type CombatViewProps = {
  combat: CombatState;
  sectDefense: { current: number; max: number };
};

const HealthBar: React.FC<{ current: number; max: number; className?: string }> = ({ current, max, className = '' }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className={`w-full bg-gray-700 rounded-full h-1.5 ${className}`}>
            <div
                className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const hashCode = (s: string) => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);

const getBeastVisuals = (beast: DemonicBeast) => {
    const hash = Math.abs(hashCode(beast.id));
    switch (beast.tier) {
        case DemonicBeastTier.TrungGiai:
            return {
                sizeClass: 'w-14 h-14',
                borderColor: 'border-orange-600',
                image: BEAST_IMAGES_TRUNG_GIAI[hash % BEAST_IMAGES_TRUNG_GIAI.length],
            };
        case DemonicBeastTier.CaoGiai:
            return {
                sizeClass: 'w-16 h-16',
                borderColor: 'border-purple-600',
                image: BEAST_IMAGES_CAO_GIAI[hash % BEAST_IMAGES_CAO_GIAI.length],
            };
        case DemonicBeastTier.DaiYeu:
            return {
                sizeClass: 'w-20 h-20', // w-18 doesn't exist, use w-20
                borderColor: 'border-yellow-400',
                image: BEAST_IMAGES_DAI_YEU[hash % BEAST_IMAGES_DAI_YEU.length],
            };
        case DemonicBeastTier.SoGiai:
        default:
            return {
                sizeClass: 'w-12 h-12',
                borderColor: 'border-red-800',
                image: BEAST_IMAGES_SO_GIAI[hash % BEAST_IMAGES_SO_GIAI.length],
            };
    }
};

const CombatView: React.FC<CombatViewProps> = ({ combat, sectDefense }) => {
    const [wallHit, setWallHit] = useState(false);
    const [activeAnimations, setActiveAnimations] = useState<string[]>([]);
    const battlefieldRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setWallHit(true);
        const timer = setTimeout(() => setWallHit(false), 200);
        return () => clearTimeout(timer);
    }, [sectDefense.current]);

    useEffect(() => {
        if (combat?.attackAnimations && combat.attackAnimations.length > 0) {
            const newAnimIds = combat.attackAnimations.map(a => a.id);
            setActiveAnimations(prev => [...prev, ...newAnimIds]);
            const timer = setTimeout(() => {
                setActiveAnimations(prev => prev.filter(id => !newAnimIds.includes(id)));
            }, 300); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [combat?.attackAnimations]);


    if (!combat) {
        return <div>Đang tải trận chiến...</div>;
    }

    const { beasts, defenders, distanceToSect, log } = combat;

    const calculateDefenderTopPercent = (index: number, totalDefenders: number): number => {
        if (totalDefenders <= 1) {
            return 50;
        }
        // Distribute defenders between 10% and 90% of the height for better spacing
        const totalSpace = 80;
        const startOffset = 10;
        const spacing = totalSpace / (totalDefenders - 1);
        return startOffset + index * spacing;
    };


    const getDefenderPosition = (index: number, totalDefenders: number) => {
        const battlefieldHeight = battlefieldRef.current?.clientHeight || 384;
        const yPercent = calculateDefenderTopPercent(index, totalDefenders);

        return {
            x: 28, // Approx center of defender icon
            y: yPercent * 0.01 * battlefieldHeight
        };
    };

    const getBeastPosition = (beast: DemonicBeast) => {
        const battlefieldWidth = battlefieldRef.current?.clientWidth || 800;
        const battlefieldHeight = battlefieldRef.current?.clientHeight || 384;
        const yPercent = (10 + (Math.abs(hashCode(beast.id)) % 6) * 15);
        
        const wallWidth = 48; // w-12
        const iconWidth = 48; // w-12
        const movementAreaWidth = battlefieldWidth - wallWidth - iconWidth;

        const leftPx = wallWidth + (beast.position / distanceToSect) * movementAreaWidth;
        
        const xCenter = leftPx + (iconWidth / 2);
        const yCenter = yPercent * 0.01 * battlefieldHeight + 20;

        return {
            x: xCenter,
            y: yCenter,
            top: `${yPercent}%`,
            left: `${leftPx}px`,
        }
    };


    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-red-500 text-center animate-pulse">
                !! THÚ TRIỀU TẤN CÔNG !!
            </h2>

            {/* Battle Field */}
            <div ref={battlefieldRef} className="relative h-96 bg-gray-900 rounded-lg p-2 border-2 border-red-800 overflow-hidden mb-4">
                {/* Wall */}
                <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gray-600 border-r-4 border-gray-500 transition-colors duration-200 ${wallHit ? 'bg-red-800' : ''}`}></div>
                
                {/* Defenders */}
                {defenders.map((d: Character, index: number) => {
                    const totalDefenders = defenders.length;
                    // Reduce size if crowded to prevent major overlap
                    const isCrowded = totalDefenders > 6;
                    const iconSize = isCrowded ? 'w-8 h-8' : 'w-10 h-10';
                    const topPercent = calculateDefenderTopPercent(index, totalDefenders);

                    return (
                        <div 
                            key={d.id} 
                            className="absolute flex flex-col items-center" 
                            style={{ left: '4px', top: `${topPercent}%`, transform: 'translateY(-50%)' }}
                        >
                            <img src={d.avatar} alt={d.name} className={`${iconSize} rounded-full border-2 border-blue-400 object-cover`} />
                            <div className="text-xs text-center text-white font-bold bg-black/50 px-1 rounded">{d.name}</div>
                        </div>
                    );
                })}

                {/* Beasts */}
                {beasts.map(beast => {
                    const visuals = getBeastVisuals(beast);
                    const pos = getBeastPosition(beast);
                    return (
                        <div
                            key={beast.id}
                            className="absolute transition-all duration-1000 ease-linear flex flex-col items-center"
                            style={{ 
                                top: pos.top,
                                left: pos.left,
                             }}
                        >
                             <img src={visuals.image} alt={beast.name} className={`${visuals.sizeClass} rounded-full object-cover drop-shadow-lg border-2 ${visuals.borderColor}`} />
                             <HealthBar current={beast.hp.current} max={beast.hp.max} className={`${visuals.sizeClass.replace('h-', 'w-')} mt-1`} />
                        </div>
                    );
                })}
                
                {/* Attack Animations */}
                 <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <svg className="w-full h-full absolute">
                        {activeAnimations.length > 0 && combat.attackAnimations.map(anim => {
                            const defenderIndex = defenders.findIndex(d => d.id === anim.defenderId);
                            const beast = beasts.find(b => b.id === anim.targetId);

                            if (defenderIndex === -1 || !beast) return null;

                            const defenderPos = getDefenderPosition(defenderIndex, defenders.length);
                            const beastPos = getBeastPosition(beast);

                            return (
                                <line 
                                    key={anim.id}
                                    x1={defenderPos.x} y1={defenderPos.y}
                                    x2={beastPos.x} y2={beastPos.y}
                                    stroke="yellow" strokeWidth="2" className="animate-bullet"
                                />
                            );
                        })}
                    </svg>
                    <style>{`
                        @keyframes bullet-fly {
                            from { stroke-dashoffset: 1000; }
                            to { stroke-dashoffset: 0; }
                        }
                        .animate-bullet {
                            stroke-dasharray: 1000;
                            animation: bullet-fly 0.3s forwards;
                        }
                    `}</style>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wall HP & Stats */}
                <div className="bg-gray-800 p-3 rounded">
                    <h3 className="font-bold text-lg text-center mb-2">Độ Bền Hộ Trận</h3>
                    <HealthBar current={sectDefense.current} max={sectDefense.max} className="h-4" />
                    <p className="text-center font-mono text-xl mt-1">{Math.round(sectDefense.current)} / {sectDefense.max}</p>
                     <div className="text-center mt-2">
                        <span className="font-bold text-lg text-red-400">Yêu Thú Còn Lại: {beasts.length}</span>
                    </div>
                </div>

                {/* Combat Log */}
                <div className="bg-gray-800 p-3 rounded">
                    <h3 className="font-bold text-lg mb-2">Chiến Báo</h3>
                    <div className="h-32 bg-gray-900 rounded p-2 overflow-y-auto flex flex-col-reverse">
                        <ul className="space-y-1 text-sm">
                            {[...log].reverse().map((entry, index) => (
                                <li key={index} className="text-gray-300 animate-fadeIn">
                                    {entry}
                                </li>
                            ))}
                        </ul>
                         <style>{`
                                @keyframes fadeIn {
                                    from { opacity: 0; transform: translateY(5px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                                .animate-fadeIn {
                                    animation: fadeIn 0.5s ease-out;
                                }
                            `}</style>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CombatView;
