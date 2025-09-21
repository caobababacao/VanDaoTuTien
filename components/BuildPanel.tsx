import React from 'react';
import { Building, Resources, ResourceType } from '../types';

type BuildPanelProps = {
    buildingsToBuild: Building[];
    currentResources: Resources;
    onBuild: (buildingId: string) => void;
};

const hasEnoughResources = (cost: { resource: ResourceType; amount: number }[], resources: Resources): boolean => {
    return cost.every(c => resources[c.resource].amount >= c.amount);
};

const BuildCard: React.FC<{ building: Building; onBuild: (id: string) => void; canBuild: boolean }> = ({ building, onBuild, canBuild }) => {
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col">
            <h3 className="font-bold text-lg text-white">{building.name}</h3>
            <p className="text-gray-400 text-sm mt-1 flex-grow">{building.description}</p>
            <div className="mt-3">
                <div className="text-xs text-gray-400 mb-1">Chi phí xây dựng:</div>
                <div className="flex space-x-4 mb-3">
                    {building.upgradeCost.map(cost => (
                        <span key={cost.resource} className="text-sm font-semibold text-gray-300">
                            {cost.resource}: {cost.amount}
                        </span>
                    ))}
                </div>
                <button
                    onClick={() => onBuild(building.id)}
                    disabled={!canBuild}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Xây Dựng
                </button>
            </div>
        </div>
    );
};

const BuildPanel: React.FC<BuildPanelProps> = ({ buildingsToBuild, currentResources, onBuild }) => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-3 text-red-500">Bản Vẽ Có Sẵn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildingsToBuild.map(b => (
                    <BuildCard
                        key={b.id}
                        building={b}
                        onBuild={onBuild}
                        canBuild={hasEnoughResources(b.upgradeCost, currentResources)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BuildPanel;
