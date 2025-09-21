import React from 'react';
import { ResourceType } from '../types';

type AltarPanelProps = {
    onUseAltar: () => void;
    onTestUseAltar: () => void;
    onTestResources: () => void;
    artifactCount: number;
};


const AltarPanel: React.FC<AltarPanelProps> = ({ onUseAltar, onTestUseAltar, onTestResources, artifactCount }) => {
    const canAfford = artifactCount >= 1;

    return (
        <div>
            <h2 className="text-xl font-bold mb-3 text-purple-500">Tế Đàn Thần Bí</h2>
            <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0 md:mr-6 text-center md:text-left">
                    <p className="text-gray-300">Tế đàn rung động với một năng lượng không xác định. Hiến tế một <span className="text-purple-400 font-bold">Tàn Hồn Yêu Thú</span> có thể mang lại phần thưởng.</p>
                    <p className="text-lg font-bold text-white mt-2">
                        Tàn Hồn Yêu Thú: <span className="text-purple-400">{artifactCount}</span>
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                     <button
                        onClick={onTestResources}
                        className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Test Tài Nguyên
                    </button>
                     <button
                        onClick={onTestUseAltar}
                        className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Test Hiến Tế
                    </button>
                    <button
                        onClick={onUseAltar}
                        disabled={!canAfford}
                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Hiến Tế
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AltarPanel;