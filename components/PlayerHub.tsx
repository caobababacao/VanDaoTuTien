import React, { useState } from 'react';
import { Character, Item, EquipmentSlot, Skills, ItemType, Gender, Ability, ItemSlotCategory, ItemEffect } from '../types';
import { ScavengeIcon, BuildIcon, CombatIcon, MedicalIcon, BookOpenIcon } from './Icons';
import { getCharacterEffectiveSkills } from '../App';
import { calculateRealm } from '../utils';

type PlayerHubProps = {
    player: Character;
    inventory: Item[];
    inventoryCapacity: number;
    characters: Character[];
    onEquipItem: (characterId: string, itemId: string, slot: EquipmentSlot) => void;
    onUnequipItem: (characterId: string, slot: EquipmentSlot) => void;
    onUseTechniqueScroll: (characterId: string, itemId: string) => void;
    onUseItem: (characterId: string, itemId: string) => void;
    onClose: () => void;
};

// --- Inventory Item Card Logic (Moved from InventoryPanel) ---
const getAvailableSlots = (item: Item): EquipmentSlot[] => {
    if (!item.slot) return [];
    switch (item.slot) {
        case ItemSlotCategory.VũKhí: return [EquipmentSlot.VũKhíChính, EquipmentSlot.VũKhíPhụ];
        case ItemSlotCategory.TrangSức: return [EquipmentSlot.TrangSức1, EquipmentSlot.TrangSức2];
        case ItemSlotCategory.Đầu: return [EquipmentSlot.Đầu];
        case ItemSlotCategory.ThânTrên: return [EquipmentSlot.ThânTrên];
        case ItemSlotCategory.ThânDưới: return [EquipmentSlot.ThânDưới];
        case ItemSlotCategory.HaiTay: return [EquipmentSlot.HaiTay];
        case ItemSlotCategory.HaiChân: return [EquipmentSlot.HaiChân];
        case ItemSlotCategory.PhápBảo: return [EquipmentSlot.PhápBảo];
        default: return [];
    }
}

const ItemCard: React.FC<{
    item: Item;
    characters: Character[];
    onEquipItem: (characterId: string, itemId: string, slot: EquipmentSlot) => void;
    onUseTechniqueScroll: (characterId: string, itemId: string) => void;
    onUseItem: (characterId: string, itemId: string) => void;
}> = ({ item, characters, onEquipItem, onUseTechniqueScroll, onUseItem }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [equipStage, setEquipStage] = useState<'closed' | 'char_select' | 'slot_select'>('closed');
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
    const [isLearning, setIsLearning] = useState(false);
    const [isUsing, setIsUsing] = useState(false);

    const handleCardClick = () => {
        setIsExpanded(!isExpanded);
        // Reset sub-menus when collapsing
        if (isExpanded) {
            setEquipStage('closed');
            setIsLearning(false);
            setIsUsing(false);
        }
    };
    
    const handleActionContainerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleEquipClick = () => {
        if (equipStage === 'closed') {
            setEquipStage('char_select');
        } else {
            setEquipStage('closed');
        }
    };

    const handleCharSelect = (charId: string) => {
        const availableSlots = getAvailableSlots(item);
        if (availableSlots.length === 1) {
            onEquipItem(charId, item.id, availableSlots[0]);
            setEquipStage('closed');
            setIsExpanded(false); // Close card after action
        } else if (availableSlots.length > 1) {
            setSelectedCharId(charId);
            setEquipStage('slot_select');
        }
    };
    
    const handleSlotSelect = (slot: EquipmentSlot) => {
        if (selectedCharId) {
            onEquipItem(selectedCharId, item.id, slot);
        }
        setEquipStage('closed');
        setSelectedCharId(null);
        setIsExpanded(false); // Close card after action
    };

    const handleLearn = (characterId: string) => {
        onUseTechniqueScroll(characterId, item.id);
        setIsLearning(false);
        setIsExpanded(false); // Close card after action
    }
    
    const handleUse = (characterId: string) => {
        onUseItem(characterId, item.id);
        setIsUsing(false);
        setIsExpanded(false); // Close card after action
    }

    const itemTypeDisplay = {
        [ItemType.TrangBị]: item.slot,
        [ItemType.ĐanDược]: "Đan Dược",
        [ItemType.CôngPháp]: "Công Pháp"
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-gray-800 p-3 rounded-lg border border-gray-600 cursor-pointer transition-all duration-200"
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-md text-yellow-300 flex items-center">
                    {item.type === ItemType.CôngPháp && <BookOpenIcon className="w-4 h-4 mr-2 text-cyan-400" />}
                    {item.name}
                </h4>
                <span className="text-xs text-gray-400">{itemTypeDisplay[item.type]}</span>
            </div>

            {isExpanded && (
                <div className="mt-2" onClick={handleActionContainerClick}>
                    <p className="text-sm text-gray-300 italic my-1">{item.description}</p>
                    {item.effects && (
                        <div className="text-sm text-green-400 space-y-0.5">
                            {item.effects.map((effect, index) => (
                                <p key={index}>
                                    Hiệu quả: +{effect.value}{effect.isPercentage ? '%' : ''} {effect.skill}
                                </p>
                            ))}
                        </div>
                    )}
                    <div className="mt-3">
                        {item.type === ItemType.TrangBị && (
                            <div className="relative">
                                <button
                                    onClick={handleEquipClick}
                                    className="w-full text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 px-3 rounded transition-colors"
                                >
                                    {equipStage !== 'closed' ? 'Hủy' : 'Trang Bị'}
                                </button>
                                {equipStage !== 'closed' && (
                                    <div className="absolute bottom-full mb-2 w-full bg-gray-700 border border-gray-600 rounded-lg z-10 p-2 space-y-1 max-h-48 overflow-y-auto">
                                       {equipStage === 'char_select' && (
                                           <>
                                            <p className="text-xs text-center text-gray-300 mb-1">Trang bị cho:</p>
                                            {characters.map(char => (
                                                <button 
                                                    key={char.id} 
                                                    onClick={() => handleCharSelect(char.id)}
                                                    className="w-full block text-left text-sm text-white hover:bg-blue-600 p-1.5 rounded"
                                                >
                                                    {char.name}
                                                </button>
                                            ))}
                                           </>
                                       )}
                                       {equipStage === 'slot_select' && (
                                           <>
                                             <p className="text-xs text-center text-gray-300 mb-1">Chọn ô:</p>
                                             {getAvailableSlots(item).map(slot => (
                                                 <button
                                                    key={slot}
                                                    onClick={() => handleSlotSelect(slot)}
                                                    className="w-full block text-left text-sm text-white hover:bg-blue-600 p-1.5 rounded"
                                                 >
                                                    {slot}
                                                 </button>
                                             ))}
                                           </>
                                       )}
                                    </div>
                                )}
                            </div>
                        )}
                         {item.type === ItemType.ĐanDược && item.onUseEffect && (
                             <div className="relative">
                                <button
                                    onClick={() => setIsUsing(!isUsing)}
                                    className="w-full text-sm bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-3 rounded transition-colors"
                                >
                                    {isUsing ? 'Hủy' : 'Sử Dụng'}
                                </button>
                                {isUsing && (
                                     <div className="absolute bottom-full mb-2 w-full bg-gray-700 border border-gray-600 rounded-lg z-10 p-2 space-y-1 max-h-48 overflow-y-auto">
                                        <p className="text-xs text-center text-gray-300 mb-1">Sử dụng cho:</p>
                                        {characters.map(char => (
                                            <button 
                                                key={char.id} 
                                                onClick={() => handleUse(char.id)}
                                                className="w-full block text-left text-sm text-white hover:bg-green-700 p-1.5 rounded"
                                            >
                                                {char.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {item.type === ItemType.CôngPháp && (
                             <div className="relative">
                                <button
                                    onClick={() => setIsLearning(!isLearning)}
                                    className="w-full text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 px-3 rounded transition-colors"
                                >
                                    {isLearning ? 'Hủy' : 'Học'}
                                </button>
                                {isLearning && (
                                    <div className="absolute bottom-full mb-2 w-full bg-gray-700 border border-gray-600 rounded-lg z-10 p-2 space-y-1 max-h-48 overflow-y-auto">
                                        <p className="text-xs text-center text-gray-300 mb-1">Truyền thụ cho:</p>
                                        {characters.map(char => {
                                            const alreadyLearned = char.abilities.some(a => a.name === item.grantsAbility?.name);
                                            return (
                                                <button 
                                                    key={char.id} 
                                                    onClick={() => handleLearn(char.id)}
                                                    disabled={alreadyLearned}
                                                    className="w-full block text-left text-sm text-white hover:bg-cyan-700 p-1.5 rounded disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                >
                                                    {char.name} {alreadyLearned ? "(Đã học)" : ""}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- End Inventory Item Card Logic ---

const Skill: React.FC<{ icon: React.FC<any>, label: string, baseValue: number, bonusValue: number }> = ({ icon: Icon, label, baseValue, bonusValue }) => (
    <div className="flex items-center text-lg" title={`${label}: ${baseValue} (Cơ bản) + ${bonusValue} (Trang bị) = ${baseValue + bonusValue}`}>
        <Icon className="w-6 h-6 mr-2 text-gray-400" />
        <span className="font-semibold text-white w-8">{baseValue + bonusValue}</span>
        {bonusValue > 0 && <span className="text-green-400 text-md ml-1">(+{bonusValue})</span>}
        <span className="text-gray-400 ml-2">{label}</span>
    </div>
);

const EquipmentSlotDisplay: React.FC<{
    player: Character;
    slot: EquipmentSlot;
    onUnequipItem: (characterId: string, slot: EquipmentSlot) => void;
}> = ({ player, slot, onUnequipItem }) => {
    const item = player.equipment[slot];
    return (
        <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700 h-full flex flex-col justify-between">
            <h4 className="text-md font-bold text-yellow-400 mb-2">{slot}</h4>
            {item ? (
                <div>
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-gray-400 italic my-1">{item.description}</p>
                    {item.effects && (
                        <div className="text-sm text-green-400 font-semibold space-y-0.5">
                            {item.effects.map((effect, index) => (
                                <p key={index}>
                                    Hiệu quả: +{effect.value}{effect.isPercentage ? '%' : ''} {effect.skill}
                                </p>
                            ))}
                        </div>
                    )}
                    <button 
                        onClick={() => onUnequipItem(player.id, slot)}
                        className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-1.5 px-3 rounded transition-colors"
                    >
                        Tháo
                    </button>
                </div>
            ) : (
                <p className="text-gray-500 text-center text-sm py-4">-- Trống --</p>
            )}
        </div>
    );
};

const PlayerHub: React.FC<PlayerHubProps> = ({ player, inventory, inventoryCapacity, characters, onEquipItem, onUnequipItem, onUseTechniqueScroll, onUseItem, onClose }) => {
    const effectiveSkills = getCharacterEffectiveSkills(player);
    const genderColor = player.gender === Gender.Nữ ? 'text-pink-300' : 'text-blue-300';
    const realm = calculateRealm(player.level);
    
    const slotsToDisplay: EquipmentSlot[] = Object.values(EquipmentSlot);

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-40 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-red-500 rounded-xl w-full max-w-7xl h-[90vh] p-6 relative flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                <div className="flex items-center mb-6">
                    <img src={player.avatar} alt={player.name} className="w-24 h-24 rounded-full mr-6 border-4 border-yellow-400 object-cover"/>
                    <div className="flex-grow">
                        <div>
                            <h2 className="text-3xl font-bold text-white">
                                Thông Tin Tông Chủ: <span className="text-yellow-400">{player.name}</span>
                                <span className={`ml-2 text-2xl font-normal ${genderColor}`}>({player.gender})</span>
                            </h2>
                            <p className="text-cyan-400 text-2xl font-semibold">{realm}</p>
                        </div>
                        <div className="mt-2 max-w-md">
                            <div className="flex justify-between text-sm text-cyan-200 mb-1">
                                <span className="font-bold">Cấp {player.level}</span>
                                <span>KN: {player.xp} / {player.xpToNextLevel}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(player.xp / player.xpToNextLevel) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
                    {/* Left Column: Player Stats & Equipment */}
                    <div className="lg:col-span-2 flex flex-col space-y-6 overflow-y-auto pr-2">
                         <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-bold mb-3 text-red-500">Trang Bị</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                               {slotsToDisplay.map(slot => (
                                   <EquipmentSlotDisplay key={slot} player={player} slot={slot} onUnequipItem={onUnequipItem} />
                               ))}
                            </div>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-bold mb-3 text-red-500">Kỹ Năng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Skill icon={CombatIcon} label="Chiến Đấu" baseValue={player.skills.chiếnĐấu} bonusValue={effectiveSkills.chiếnĐấu - player.skills.chiếnĐấu} />
                                <Skill icon={ScavengeIcon} label="Thám Hiểm" baseValue={player.skills.thámHiểm} bonusValue={effectiveSkills.thámHiểm - player.skills.thámHiểm} />
                                <Skill icon={BuildIcon} label="Luyện Khí" baseValue={player.skills.luyệnKhí} bonusValue={effectiveSkills.luyệnKhí - player.skills.luyệnKhí} />
                                <Skill icon={MedicalIcon} label="Luyện Đan" baseValue={player.skills.luyệnĐan} bonusValue={effectiveSkills.luyệnĐan - player.skills.luyệnĐan} />
                            </div>
                        </div>
                         <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-bold mb-3 text-red-500">Công Pháp</h3>
                             {player.abilities.length > 0 ? (
                                <div className="space-y-3">
                                    {player.abilities.map((ability: Ability) => (
                                        <div key={ability.name} className="bg-gray-900/50 p-3 rounded">
                                            <h4 className="font-bold text-cyan-300 flex items-center"><BookOpenIcon className="w-5 h-5 mr-2" />{ability.name}</h4>
                                            <p className="text-sm text-gray-400 italic mt-1">{ability.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Chưa học được công pháp nào.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Inventory */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col">
                        <h3 className="text-xl font-bold mb-3 text-red-500">Túi Đồ ({inventory.length} / {inventoryCapacity})</h3>
                        <div className="overflow-y-auto flex-grow pr-2">
                             {inventory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {inventory.map(item => (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            characters={characters}
                                            onEquipItem={onEquipItem}
                                            onUseTechniqueScroll={onUseTechniqueScroll}
                                            onUseItem={onUseItem}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 italic mt-8">
                                    Túi đồ của bạn trống rỗng.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerHub;