import React from 'react';
import { TRIAL_STAGES, TrialStage } from '../data/trialStages';
import { ResourceType } from '../types';
import { ITEM_BLUEPRINTS } from '../data/items';

type TrialStagesViewProps = {
    highestStageCleared: number;
    onStartStage: (stageNumber: number) => void;
    onClose: () => void;
};

const StageCard: React.FC<{
    stageInfo: TrialStage;
    isCleared: boolean;
    isUnlocked: boolean;
    onStart: () => void;
}> = ({ stageInfo, isCleared, isUnlocked, onStart }) => {

    const getStatusStyles = () => {
        if (isCleared) return 'border-green-500 bg-gray-800/50';
        if (isUnlocked) return 'border-yellow-500 bg-gray-800';
        return 'border-gray-700 bg-black/50 opacity-60';
    };

    const getButton = () => {
        if (isCleared) {
            return <button disabled className="w-full mt-4 bg-green-700 text-white font-bold py-2 px-4 rounded cursor-default">Đã Vượt</button>;
        }
        if (isUnlocked) {
            return <button onClick={onStart} className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors">Bắt Đầu</button>;
        }
        return <button disabled className="w-full mt-4 bg-gray-600 text-gray-400 font-bold py-2 px-4 rounded cursor-not-allowed">Đã Khóa</button>;
    };

    return (
        <div className={`p-4 rounded-lg border-2 flex flex-col ${getStatusStyles()}`}>
            <h3 className={`text-xl font-bold mb-3 ${isUnlocked ? 'text-yellow-400' : 'text-gray-400'}`}>Ải {stageInfo.stage}</h3>
            
            <div className="flex-grow">
                <div>
                    <h4 className="font-semibold text-gray-300 mb-1">Yêu Thú:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                        {stageInfo.enemies.map(e => <li key={e.tier}>{e.count}x {e.tier}</li>)}
                    </ul>
                </div>

                <div className="mt-3">
                    <h4 className="font-semibold text-gray-300 mb-1">Phần Thưởng:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                        {Object.entries(stageInfo.rewards.resources).map(([res, amt]) => <li key={res}>{amt} {res}</li>)}
                        {stageInfo.rewards.items.map(item => {
                            const blueprint = ITEM_BLUEPRINTS[item.blueprintId as keyof typeof ITEM_BLUEPRINTS];
                            return <li key={item.blueprintId}>{item.amount}x {blueprint?.name || 'Vật phẩm lạ'}</li>
                        })}
                    </ul>
                </div>
            </div>

            {getButton()}
        </div>
    );
};


const TrialStagesView: React.FC<TrialStagesViewProps> = ({ highestStageCleared, onStartStage, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-40 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border-2 border-yellow-500 rounded-xl w-full max-w-7xl h-[90vh] p-6 relative flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-yellow-400">Ải Thí Luyện</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>

                <div className="overflow-y-auto pr-4 -mr-4 flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {TRIAL_STAGES.map(stage => (
                            <StageCard
                                key={stage.stage}
                                stageInfo={stage}
                                isCleared={stage.stage <= highestStageCleared}
                                isUnlocked={stage.stage === highestStageCleared + 1}
                                onStart={() => onStartStage(stage.stage)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrialStagesView;
