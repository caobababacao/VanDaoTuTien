import React from 'react';
import { Character } from '../types';
import { calculateRealm } from '../utils';

type GachaResultViewProps = {
  disciple: Character;
  onClose: () => void;
};

const GachaResultView: React.FC<GachaResultViewProps> = ({ disciple, onClose }) => {
    const realm = calculateRealm(disciple.level);
    const CARD_FRAME_URL = 'https://raw.githubusercontent.com/caobababacao/IMG_Game/main/UI/Gaccha_Card.png';
    const hasCardImage = !!disciple.cardImage;

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-50 backdrop-blur-sm animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md text-center transform animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold text-yellow-300 mb-6 animate-pulse" style={{ textShadow: '0 0 10px #fef08a' }}>
                    CHÚC MỪNG CHIÊU MỘ THÀNH CÔNG!
                </h2>
                
                {/* The Card */}
                <div className="relative w-[350px] h-[623px] mx-auto group perspective-1000">
                    <div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:[transform:rotateY(8deg)] group-hover:scale-105">
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl">
                            <div className="shimmer-effect"></div>
                        </div>

                        {hasCardImage ? (
                            <img 
                                src={disciple.cardImage} 
                                alt={disciple.name} 
                                className="absolute inset-0 w-full h-full object-cover rounded-2xl drop-shadow-[0_10px_15px_rgba(254,240,138,0.2)]"
                            />
                        ) : (
                            <>
                                {/* Fallback for randomly generated disciples with no card image */}
                                <img 
                                    src={disciple.avatar} 
                                    alt={disciple.name} 
                                    className="absolute top-[72px] left-[35px] w-[280px] h-[400px] object-cover"
                                />
                                <img 
                                    src={CARD_FRAME_URL}
                                    alt="Card Frame"
                                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(254,240,138,0.2)]"
                                />
                            </>
                        )}

                        {/* Nameplate - always visible on top of the card art */}
                        <div className="absolute bottom-[72px] left-0 w-full text-center px-4">
                            <p className="text-3xl font-bold text-white" style={{ fontFamily: 'serif', textShadow: '2px 2px 4px #000' }}>
                                {disciple.name}
                            </p>
                            <p className="text-lg text-cyan-300 font-semibold mt-1" style={{ textShadow: '1px 1px 2px #000' }}>
                                {realm}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 w-full max-w-xs mx-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                >
                    Tiếp Tục
                </button>

                <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.3s ease-out forwards;
                    }
                    
                    @keyframes scale-up {
                        from { opacity: 0; transform: scale(0.8); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-scale-up {
                        animation: scale-up 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
                    }

                    @keyframes shimmer {
                        0% { transform: translateX(-150%) rotate(25deg); }
                        100% { transform: translateX(150%) rotate(25deg); }
                    }
                    .shimmer-effect {
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 50%;
                        height: 200%;
                        background: linear-gradient(
                            to right,
                            rgba(255, 255, 255, 0) 0%,
                            rgba(255, 255, 255, 0.2) 50%,
                            rgba(255, 255, 255, 0) 100%
                        );
                        animation: shimmer 3.5s infinite linear;
                        animation-delay: 1.5s;
                    }

                    .perspective-1000 { perspective: 1000px; }
                    .transform-style-3d { transform-style: preserve-3d; }
                `}</style>
            </div>
        </div>
    );
};

export default GachaResultView;