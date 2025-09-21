import React, { useState } from 'react';
import { Building, Resources, Character, CharacterStatus, Room } from '../types';
import { ALL_BUILDINGS } from '../constants';

type BuildingPanelProps = {
    buildings: Building[];
    currentResources: Resources;
    onUpgrade: (buildingId: string) => void;
    onAssignWorker: (buildingId: string, characterId: string) => void;
    onUnassignWorker: (buildingId: string, characterId: string) => void;
    onAssignRoom: (roomId: string, characterId: string) => void;
    onUnassignRoom: (characterId: string) => void;
    characters: Character[];
    day: number;
};

const BuildingCard: React.FC<{
    building: Building;
    onUpgrade: (id: string) => void;
    currentResources: Resources;
    onAssignWorker: (buildingId: string, characterId: string) => void;
    onUnassignWorker: (buildingId: string, characterId: string) => void;
    onAssignRoom: (roomId: string, characterId: string) => void;
    onUnassignRoom: (characterId: string) => void;
    characters: Character[];
    day: number;
}> = ({ building, onUpgrade, currentResources, onAssignWorker, onUnassignWorker, onAssignRoom, onUnassignRoom, characters, day }) => {
    const isMaxLevel = building.level >= building.maxLevel;

    const blueprint = ALL_BUILDINGS.find(b => b.id === building.id);
    const costMultiplier = Math.pow(1.5, building.level);
    const upgradeCost = blueprint
        ? blueprint.upgradeCost.map(c => ({ ...c, amount: Math.ceil(c.amount * costMultiplier) }))
        : [];

    const canUpgrade = !isMaxLevel && upgradeCost.every(c => currentResources[c.resource].amount >= c.amount);

    const assignedWorkers = building.assignedCharacterIds?.map(id => characters.find(c => c.id === id)).filter(Boolean) as Character[] || [];
    const idleCharacters = characters.filter(c => c.status === CharacterStatus.TĩnhTu && !c.isPlayer);
    
    // Dynamic capacity calculation
    let capacity = blueprint?.workerCapacity ?? 0;
    if (building.id === 'linh_tri') {
        capacity = building.level > 0 ? Math.min(3, Math.floor((building.level + 1) / 2)) : 0;
    }

    const canAssign = capacity > (building.assignedCharacterIds?.length ?? 0) && idleCharacters.length > 0;
    
    const unhousedDisciples = characters.filter(c => !c.isPlayer && c.roomId === null);


    const renderHousingManagement = () => (
        <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-bold text-gray-300 mb-2">Quản Lý Phòng Ở</h4>
            <div className="space-y-2">
                {building.rooms?.map((room, index) => {
                    const occupants = room.occupantIds.map(id => characters.find(c => c.id === id)).filter(Boolean) as Character[];
                    const freeSlots = room.capacity - occupants.length;
                    
                    return (
                        <div key={room.id} className="bg-gray-900/50 p-2 rounded">
                            <p className="font-semibold text-gray-300">Phòng {index + 1} ({occupants.length}/{room.capacity})</p>
                            <div className="pl-2 mt-1 space-y-1">
                                {occupants.map(occ => (
                                    <div key={occ.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center">
                                            <img src={occ.avatar} alt={occ.name} className="w-6 h-6 rounded-full mr-2 object-cover" />
                                            <span className="text-white">{occ.name}</span>
                                        </div>
                                        <button onClick={() => onUnassignRoom(occ.id)} className="text-red-500 hover:text-red-400 font-bold text-base leading-none px-2">&times;</button>
                                    </div>
                                ))}
                                {freeSlots > 0 && unhousedDisciples.length > 0 && (
                                    <select
                                        onChange={(e) => {
                                            if(e.target.value) onAssignRoom(room.id, e.target.value)
                                        }}
                                        value=""
                                        className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-white text-xs mt-1"
                                    >
                                        <option value="" disabled>-- Bố trí đệ tử --</option>
                                        {unhousedDisciples.map(char => (
                                            <option key={char.id} value={char.id}>{char.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-white">{building.name}</h3>
                    <span className="font-mono text-xl text-yellow-400">Cấp {building.level}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1 flex-grow">{building.description}</p>
            </div>
            
            {building.id === 'vien_trach' && renderHousingManagement()}

            {blueprint?.workerStatus && (
                <div className="mt-4 pt-3 border-t border-gray-700">
                    <h4 className="text-sm font-bold text-gray-300 mb-2">Phân Công ({assignedWorkers.length}/{capacity})</h4>
                    <div className="space-y-2">
                        {assignedWorkers.map(worker => {
                            const isTraining = worker.status === CharacterStatus.BếQuan;
                            const remainingDays = isTraining && worker.trainingEndDate ? worker.trainingEndDate - day : 0;
                            return (
                                <div key={worker.id} className="flex justify-between items-center bg-gray-900/50 p-1.5 rounded">
                                    <div className="flex items-center">
                                        <img src={worker.avatar} alt={worker.name} className="w-6 h-6 rounded-full mr-2 object-cover" />
                                        <span className="text-sm text-white">{worker.name}</span>
                                        {isTraining && remainingDays > 0 && <span className="text-xs text-cyan-400 ml-2">(còn {remainingDays} ngày)</span>}
                                    </div>
                                    <button
                                        onClick={() => onUnassignWorker(building.id, worker.id)}
                                        disabled={isTraining}
                                        className="text-red-500 hover:text-red-400 font-bold text-base leading-none px-2 disabled:text-gray-600 disabled:cursor-not-allowed"
                                    >&times;</button>
                                </div>
                            );
                        })}
                    </div>
                    {canAssign && (
                        <div className="mt-2">
                            <select
                                onChange={(e) => {
                                    if(e.target.value) onAssignWorker(building.id, e.target.value)
                                }}
                                value=""
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm"
                            >
                                <option value="" disabled>-- Phân công đệ tử --</option>
                                {idleCharacters.map(char => (
                                    <option key={char.id} value={char.id}>{char.name} ({char.status})</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-3">
                {isMaxLevel ? (
                    <div className="text-center py-2 text-green-400 font-bold">CẤP TỐI ĐA</div>
                ) : (
                    <>
                        <div className="text-xs text-gray-400 mb-1">Chi phí nâng cấp:</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                            {upgradeCost.map(cost => (
                                <span key={cost.resource} className={`text-sm font-semibold ${currentResources[cost.resource].amount < cost.amount ? 'text-red-500' : 'text-gray-300'}`}>
                                    {cost.resource}: {cost.amount}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={() => onUpgrade(building.id)}
                            disabled={!canUpgrade}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            Nâng Cấp
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const BuildingPanel: React.FC<BuildingPanelProps> = ({ buildings, currentResources, onUpgrade, onAssignWorker, onUnassignWorker, onAssignRoom, onUnassignRoom, characters, day }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div>
            <div 
                className="flex items-center cursor-pointer mb-3"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <h2 className="text-xl font-bold text-red-500">Công Trình Tông Môn</h2>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-2 text-gray-400 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0' : 'max-h-[2000px]'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buildings.map(b => (
                        <BuildingCard
                            key={b.id}
                            building={b}
                            onUpgrade={onUpgrade}
                            currentResources={currentResources}
                            onAssignWorker={onAssignWorker}
                            onUnassignWorker={onUnassignWorker}
                            onAssignRoom={onAssignRoom}
                            onUnassignRoom={onUnassignRoom}
                            characters={characters}
                            day={day}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuildingPanel;