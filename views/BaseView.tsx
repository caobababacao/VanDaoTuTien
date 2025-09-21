// Fix: Provide full content for BaseView.tsx.
import React from 'react';
import { GameState, EquipmentSlot, CharacterStatus, Weather, Building, Character, Item } from '../types';
import ResourcePanel from '../components/ResourcePanel';
import CharacterPanel from '../components/CharacterPanel';
import BuildingPanel from '../components/BuildingPanel';
import BuildPanel from '../components/BuildPanel';
import { ALL_BUILDINGS } from '../constants';
import AltarPanel from '../components/AltarPanel';
import { SurvivorIcon, ScavengeIcon, SunIcon, CloudIcon, RainIcon, StormIcon, EyeIcon, BookOpenIcon, CombatIcon } from '../components/Icons';

type BaseViewProps = {
    gameState: GameState;
    onAssignCharacter: (characterId: string) => void;
    onToggleDefender: (characterId: string) => void;
    onUpgradeBuilding: (buildingId: string) => void;
    onBuildBuilding: (buildingId: string) => void;
    onNextDay: () => void;
    onStartTrial: () => void;
    onStartTrialStages: () => void;
    onUseAltar: () => void;
    onTestUseAltar: () => void;
    onTestResources: () => void;
    onUnequipItem: (characterId: string, slot: EquipmentSlot) => void;
    onOpenPlayerHub: () => void;
    onStartWorldExploration: () => void;
    onStartSectStory: () => void;
    onInteract: (characterId: string) => void;
    onAssignCharacterToBuilding: (buildingId: string, characterId: string) => void;
    onUnassignCharacterFromBuilding: (buildingId: string, characterId: string) => void;
    onAssignCharacterToRoom: (roomId: string, characterId: string) => void;
    onUnassignCharacterFromRoom: (characterId: string) => void;
};

const WeatherDisplay: React.FC<{ weather: Weather }> = ({ weather }) => {
    const weatherInfo = {
        [Weather.QuangTrời]: { Icon: SunIcon, color: 'text-yellow-400' },
        [Weather.NắngGắt]: { Icon: SunIcon, color: 'text-orange-500' },
        [Weather.MưaPhùn]: { Icon: RainIcon, color: 'text-blue-400' },
        [Weather.SươngMù]: { Icon: CloudIcon, color: 'text-gray-400' },
        [Weather.BãoTố]: { Icon: StormIcon, color: 'text-indigo-400' },
    };
    const { Icon, color } = weatherInfo[weather];
    return (
        <div className={`flex items-center space-x-2 p-2 rounded-lg bg-gray-800/50 ${color}`}>
            <Icon className="w-6 h-6" />
            <span className="font-semibold text-lg">{weather}</span>
        </div>
    );
};


const BaseView: React.FC<BaseViewProps> = ({ 
    gameState, 
    onAssignCharacter, 
    onToggleDefender, 
    onUpgradeBuilding, 
    onBuildBuilding, 
    onNextDay, 
    onStartTrial,
    onStartTrialStages, 
    onUseAltar,
    onTestUseAltar,
    onTestResources,
    onUnequipItem,
    onOpenPlayerHub,
    onStartWorldExploration,
    onStartSectStory,
    onInteract,
    onAssignCharacterToBuilding,
    onUnassignCharacterFromBuilding,
    onAssignCharacterToRoom,
    onUnassignCharacterFromRoom,
}) => {
    const { resources, characters, buildings } = gameState;

    const ownedBuildingIds = new Set(buildings.map(b => b.id));
    const buildingsToBuild = ALL_BUILDINGS.filter(b => !ownedBuildingIds.has(b.id));

    const playerCharacter = characters.find(c => c.isPlayer);
    const canPlayerExplore = playerCharacter?.status === CharacterStatus.TĩnhTu;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">{gameState.sectName} - Ngày {gameState.day} - {gameState.timeOfDay}</h1>
                    <p className="text-gray-400">Hộ Trận: {gameState.sectDefense.current}/{gameState.sectDefense.max} | Sĩ Khí: {gameState.morale.current}/{gameState.morale.max} | Đệ Tử: {gameState.population.current}/{gameState.population.capacity}</p>
                </div>
                <div className="flex items-center flex-wrap gap-2 justify-end">
                    <WeatherDisplay weather={gameState.weather} />
                     <button
                        onClick={onOpenPlayerHub}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-md transition-colors flex items-center"
                    >
                        <SurvivorIcon className="w-5 h-5 mr-2" />
                        Tông Chủ
                    </button>
                     <button
                        onClick={onStartSectStory}
                        disabled={!canPlayerExplore}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-md transition-colors flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                        title={canPlayerExplore ? "Quan sát những gì đang xảy ra trong tông môn" : "Nhân vật của bạn đang bận"}
                    >
                        <EyeIcon className="w-5 h-5 mr-2" />
                        Diễn Biến Tông Môn
                    </button>
                     <button
                        onClick={onStartWorldExploration}
                        disabled={!canPlayerExplore}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-md transition-colors flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
                        title={canPlayerExplore ? "Ra ngoài lịch luyện một ngày" : "Nhân vật của bạn đang bận"}
                    >
                        <ScavengeIcon className="w-5 h-5 mr-2" />
                        Lịch Luyện
                    </button>
                    <button
                        onClick={onStartTrialStages}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg text-md transition-colors flex items-center"
                    >
                         <CombatIcon className="w-5 h-5 mr-2" />
                        Ải Thí Luyện
                    </button>
                    <button
                        onClick={onStartTrial}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg text-md transition-colors flex items-center"
                    >
                         <CombatIcon className="w-5 h-5 mr-2" />
                        Khảo Nghiệm (Cấp {gameState.trialLevel})
                    </button>
                    <button
                        onClick={onNextDay}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                    >
                        Qua Ngày
                    </button>
                </div>
            </div>
            
            <ResourcePanel resources={resources} />
            <CharacterPanel characters={characters} onAssign={onAssignCharacter} onToggleDefender={onToggleDefender} onUnequipItem={onUnequipItem} onInteract={onInteract} />
            <BuildingPanel 
                buildings={buildings} 
                currentResources={resources} 
                onUpgrade={onUpgradeBuilding} 
                characters={characters} 
                onAssignWorker={onAssignCharacterToBuilding}
                onUnassignWorker={onUnassignCharacterFromBuilding}
                onAssignRoom={onAssignCharacterToRoom}
                onUnassignRoom={onUnassignCharacterFromRoom}
                day={gameState.day}
            />
            {buildingsToBuild.length > 0 && (
                <BuildPanel buildingsToBuild={buildingsToBuild} currentResources={resources} onBuild={onBuildBuilding} />
            )}
            <AltarPanel onUseAltar={onUseAltar} onTestUseAltar={onTestUseAltar} onTestResources={onTestResources} artifactCount={resources['Tàn Hồn Yêu Thú'].amount} />
        </div>
    );
};

export default BaseView;