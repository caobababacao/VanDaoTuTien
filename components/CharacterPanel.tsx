import React, { useState, useMemo } from 'react';
import { Character, CharacterStatus, Skills, EquipmentSlot, Item, Gender, Ability, SortCriteria, Personality } from '../types';
import { ScavengeIcon, BuildIcon, CombatIcon, MedicalIcon, HeartIcon } from './Icons';
import { getCharacterEffectiveSkills } from '../App';
import { MAX_DISCIPLES } from '../constants';
import { calculateRealm } from '../utils';

type CharacterPanelProps = {
  characters: Character[];
  onAssign: (characterId: string) => void;
  onToggleDefender: (characterId:string) => void;
  onUnequipItem: (characterId: string, slot: EquipmentSlot) => void;
  onInteract: (characterId: string) => void;
};

const statusAbbreviations: { [key in CharacterStatus]: string } = {
    [CharacterStatus.TĩnhTu]: 'T',
    [CharacterStatus.LuyệnTập]: 'LT',
    [CharacterStatus.LuyệnKhí]: 'LK',
    [CharacterStatus.LuyệnĐan]: 'LĐ',
    [CharacterStatus.TửVong]: 'TV',
    [CharacterStatus.LịchLuyện]: 'LL',
    [CharacterStatus.LàmRuộng]: 'LR',
    [CharacterStatus.TrồngDược]: 'TD',
    [CharacterStatus.KhaiMỏ]: 'KM',
    [CharacterStatus.KhaiThácGỗ]: 'KTG',
    [CharacterStatus.TrậnPhápSư]: 'TPS',
    [CharacterStatus.BếQuan]: 'BQ',
};

const slotsToDisplay: EquipmentSlot[] = Object.values(EquipmentSlot);


// This Modal Component contains the full details of a character, shown on click.
const CharacterDetailModal: React.FC<{ 
    character: Character;
    allCharacters: Character[];
    onClose: () => void;
    onUnequipItem: (characterId: string, slot: EquipmentSlot) => void;
}> = ({ character, allCharacters, onClose, onUnequipItem }) => {
    const isIdle = character.status === CharacterStatus.TĩnhTu;
    const effectiveSkills = getCharacterEffectiveSkills(character);
    const isPlayer = character.isPlayer;
    const genderColor = character.gender === Gender.Nữ ? 'text-pink-300' : 'text-blue-300';
    const realm = calculateRealm(character.level);

    const relationships = Object.entries(character.relationships || {})
        .map(([id, value]) => ({ id, value, name: allCharacters.find(c => c.id === id)?.name }))
        .filter(r => r.name)
        .sort((a, b) => b.value - a.value);

    const positiveRels = relationships.filter(r => r.value > 20).slice(0, 2);
    const negativeRels = relationships.filter(r => r.value < -20).sort((a,b) => a.value - b.value).slice(0, 2);
    
    // Helper components for the modal content
    const Skill: React.FC<{ icon: React.FC<any>, label: string, baseValue: number, bonusValue: number }> = ({ icon: Icon, label, baseValue, bonusValue }) => (
        <div className="flex items-center text-sm" title={`${label}: ${baseValue} (Cơ bản) + ${bonusValue} (Trang bị) = ${baseValue + bonusValue}`}>
            <Icon className="w-4 h-4 mr-1.5 text-gray-400" />
            <span className="font-semibold text-white w-4">{baseValue + bonusValue}</span>
            {bonusValue > 0 && <span className="text-green-400 text-xs ml-1">(+{bonusValue})</span>}
        </div>
    );

    const EquipmentDisplay: React.FC<{ item: Item | undefined, slot: EquipmentSlot, onUnequip: () => void }> = ({ item, slot, onUnequip }) => (
        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded text-sm">
            <span className="font-bold text-gray-400 w-24">{slot}:</span>
            {item ? (
                <div className="flex items-center flex-grow justify-end">
                    <span className="text-yellow-300 font-semibold truncate" title={item.name}>{item.name}</span>
                    <button onClick={onUnequip} className="ml-2 text-red-500 hover:text-red-400 font-bold text-lg leading-none">&times;</button>
                </div>
            ) : (
                 <span className="text-gray-500">Trống</span>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl w-full max-w-5xl p-8 relative flex flex-col border-2 border-red-500 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                
                {/* Fixed Header */}
                <div className="flex items-center mb-6 flex-shrink-0">
                    <img src={character.avatar} alt={character.name} className="w-40 h-40 rounded-full mr-8 border-4 border-gray-600 object-cover"/>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-3xl text-white">
                                    {character.name}
                                    {isPlayer && <span className="ml-2 text-sm text-yellow-400 font-normal">(Ngươi)</span>}
                                </h3>
                                <p className="text-cyan-400 text-xl font-semibold">{realm}</p>
                                <p className="text-lime-400 text-lg font-semibold mt-1">Tính Cách: {character.personality}</p>
                                <p className="text-pink-400 text-lg font-semibold mt-1">Mị Lực: {character.miLuc}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                isIdle ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'
                            }`}>
                                {character.status}
                            </span>
                        </div>
                        <p className={`text-xl font-normal ${genderColor}`}>{character.gender}</p>
                        {!isPlayer && (
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                                <HeartIcon className="w-4 h-4 mr-1.5 text-pink-400" />
                                <span>Hảo cảm (Ngươi): {character.affinity}</span>
                            </div>
                        )}
                        <div className="mt-2" title={`Kinh Nghiệm: ${character.xp} / ${character.xpToNextLevel}`}>
                            <div className="flex justify-between text-xs text-cyan-200 mb-1">
                                <span>KN (Cấp {character.level})</span>
                                <span>{character.xp} / {character.xpToNextLevel}</span>
                            </div>
                            <div className="w-full bg-gray-900 rounded-full h-2.5">
                                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(character.xp / character.xpToNextLevel) * 100}%` }}></div>
                            </div>
                        </div>
                         <div className="mt-4 bg-gray-900/50 p-3 rounded-md">
                            <h4 className="text-md font-bold text-red-500 mb-2">Kỹ Năng</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-300">
                                <Skill icon={ScavengeIcon} label="Thám Hiểm" baseValue={character.skills.thámHiểm} bonusValue={effectiveSkills.thámHiểm - character.skills.thámHiểm} />
                                <Skill icon={BuildIcon} label="Luyện Khí" baseValue={character.skills.luyệnKhí} bonusValue={effectiveSkills.luyệnKhí - character.skills.luyệnKhí} />
                                <Skill icon={CombatIcon} label="Chiến Đấu" baseValue={character.skills.chiếnĐấu} bonusValue={effectiveSkills.chiếnĐấu - character.skills.chiếnĐấu} />
                                <Skill icon={MedicalIcon} label="Luyện Đan" baseValue={character.skills.luyệnĐan} bonusValue={effectiveSkills.luyệnĐan - character.skills.luyệnĐan} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-grow overflow-y-auto -mr-4 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                        {/* Left Column */}
                        <div className="flex flex-col space-y-4">
                             {/* Equipment */}
                             <div>
                                <h4 className="text-lg font-bold text-red-500 mb-2">Trang Bị</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {slotsToDisplay.map(slot => (
                                         <EquipmentDisplay 
                                            key={slot} 
                                            item={character.equipment[slot]} 
                                            slot={slot} 
                                            onUnequip={() => onUnequipItem(character.id, slot)} 
                                        />
                                    ))}
                                </div>
                            </div>
                              {/* Abilities / Công Pháp */}
                            <div>
                                <h4 className="text-lg font-bold text-red-500 mb-2">Công Pháp</h4>
                                {character.abilities.length > 0 ? (
                                    <ul className="text-sm space-y-2 bg-gray-900/50 p-3 rounded-md max-h-32 overflow-y-auto">
                                        {character.abilities.map((ability: Ability) => (
                                            <li key={ability.name} title={ability.description} className="cursor-help">
                                                <strong className="text-cyan-300">{ability.name}</strong>
                                                <p className="text-gray-400 italic text-xs pl-2">{ability.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic bg-gray-900/50 p-3 rounded-md">Chưa học được công pháp nào.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="flex flex-col">
                             {character.backstory && (
                                <div className="mb-4 p-3 bg-gray-900/50 rounded-md">
                                    <h4 className="text-lg font-bold text-red-500 mb-2">Tiểu Sử</h4>
                                    <p className="text-sm text-gray-400 italic">{character.backstory}</p>
                                </div>
                            )}
                             {character.appearance && (
                                <div className="mb-4 p-3 bg-gray-900/50 rounded-md">
                                    <h4 className="text-lg font-bold text-red-500 mb-2">Ngoại Hình</h4>
                                    <p className="text-sm text-gray-400">{character.appearance}</p>
                                </div>
                            )}
                            
                            {!isPlayer && (positiveRels.length > 0 || negativeRels.length > 0) && (
                                <div className="flex-grow">
                                    <h4 className="text-lg font-bold text-red-500 mb-2">Quan Hệ</h4>
                                    <div className="text-sm space-y-1 p-3 bg-gray-900/50 rounded-md">
                                        {positiveRels.map(rel => (
                                            <div key={rel.id} className="flex justify-between">
                                                <span className="text-green-400">Thân thiết:</span>
                                                <span className="text-white">{rel.name} ({rel.value})</span>
                                            </div>
                                        ))}
                                        {negativeRels.map(rel => (
                                            <div key={rel.id} className="flex justify-between">
                                                <span className="text-red-400">Bất hoà:</span>
                                                <span className="text-white">{rel.name} ({rel.value})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Fixed Footer */}
                <div className="mt-6 pt-6 border-t border-gray-700 flex items-center justify-end gap-4 flex-shrink-0">
                    <p className="text-gray-500 italic">
                        {isPlayer ? "Hành động của Tông Chủ được thực hiện từ bảng điều khiển chính." : "Hành động được thực hiện từ bảng điều khiển chính."}
                    </p>
                </div>
            </div>
        </div>
    );
};

// This is the simplified card for the main panel.
const SimpleCharacterCard: React.FC<{ 
    character: Character; 
    onSelect: () => void;
    onToggleDefender: (characterId: string) => void;
    onInteract: (characterId: string) => void;
    onAssign: (characterId: string) => void;
}> = ({ character, onSelect, onToggleDefender, onInteract, onAssign }) => {
    const isPlayer = character.isPlayer;
    const isIdle = character.status === CharacterStatus.TĩnhTu;
    const realm = calculateRealm(character.level);
    
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div 
            onClick={onSelect}
            className={`bg-gray-800/80 p-3 rounded-lg border ${isPlayer ? 'border-yellow-400' : 'border-gray-700'} flex items-center cursor-pointer hover:bg-gray-700/80 transition-colors space-x-3`}
        >
             <img src={character.avatar} alt={character.name} className="w-16 h-16 rounded-full flex-shrink-0 border-2 border-gray-600 object-cover"/>
             
             <div className="flex-grow min-w-0">
                <h3 className="font-bold text-md text-white truncate">
                    {character.name}
                    {isPlayer && <span className="ml-2 text-xs text-yellow-400 font-normal">(Ngươi)</span>}
                </h3>
                <p className="text-xs text-cyan-300 font-semibold truncate" title={realm}>{realm}</p>
                {!isPlayer && (
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                        <HeartIcon className="w-4 h-4 mr-1 text-pink-400" />
                        <span>{character.affinity}</span>
                    </div>
                )}
                <div className="w-full bg-gray-900 rounded-full h-1.5 mt-1" title={`KN: ${character.xp}/${character.xpToNextLevel}`}>
                    <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${(character.xp / character.xpToNextLevel) * 100}%` }}></div>
                </div>
             </div>

             <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div
                    title={character.status}
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full ${
                        isIdle ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'
                    }`}>
                    {statusAbbreviations[character.status] || '??'}
                </div>
                 <button
                    onClick={(e) => handleActionClick(e, () => onToggleDefender(character.id))}
                    className={`text-xs font-bold py-0.5 px-2 rounded transition-colors w-full ${
                        character.isDefender
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                    }`}
                >
                    Thủ Vệ
                </button>
                {!isPlayer && (
                    <>
                         <button
                            onClick={(e) => handleActionClick(e, () => onInteract(character.id))}
                            disabled={!isIdle}
                            className="text-xs font-bold py-0.5 px-2 rounded transition-colors w-full bg-gray-600 hover:bg-gray-500 text-gray-200 disabled:bg-gray-700/50 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            Tương Tác
                        </button>
                        <button
                            onClick={(e) => handleActionClick(e, () => onAssign(character.id))}
                            disabled={!isIdle}
                            className="text-xs font-bold py-0.5 px-2 rounded transition-colors w-full bg-red-600 hover:bg-red-700 text-white disabled:bg-red-900/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            Luyện Tập
                        </button>
                    </>
                )}
             </div>
        </div>
    );
};

const CharacterPanel: React.FC<CharacterPanelProps> = ({ characters, onAssign, onToggleDefender, onUnequipItem, onInteract }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<CharacterStatus | 'all'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortCriteria, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

    const ITEMS_PER_PAGE = 8;
    
    const discipleCount = characters.filter(c => !c.isPlayer).length;

    const processedCharacters = useMemo(() => {
        let filteredCharacters = characters
            .filter(char => char.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(char => filterStatus === 'all' || char.status === filterStatus);

        return [...filteredCharacters].sort((a, b) => {
            // Always show player first
            if (a.isPlayer) return -1;
            if (b.isPlayer) return 1;

            const { key, direction } = sortConfig;
            let aValue: string | number;
            let bValue: string | number;

            if (key === 'affinity' || key === 'name' || key === 'status') {
                aValue = a[key as keyof Character] as string | number;
                bValue = b[key as keyof Character] as string | number;
            } else { // Skills
                aValue = getCharacterEffectiveSkills(a)[key];
                bValue = getCharacterEffectiveSkills(b)[key];
            }

            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [characters, searchTerm, filterStatus, sortConfig]);

    const paginatedCharacters = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedCharacters.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [processedCharacters, currentPage, ITEMS_PER_PAGE]);

    const totalPages = Math.ceil(processedCharacters.length / ITEMS_PER_PAGE);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [key, direction] = e.target.value.split('-') as [SortCriteria, 'asc' | 'desc'];
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };
    
    const statusOptions = Object.values(CharacterStatus);

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                 <h2 className="text-xl font-bold text-red-500">Đệ Tử ({discipleCount} / {MAX_DISCIPLES})</h2>
                <div className="flex-grow flex flex-wrap items-center gap-2">
                     <input
                        type="text"
                        placeholder="Tìm kiếm đệ tử..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white placeholder-gray-400 text-sm w-full sm:w-auto"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value as CharacterStatus | 'all'); setCurrentPage(1); }}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <select
                        onChange={handleSortChange}
                        defaultValue="name-asc"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                        <option value="name-asc">Sắp xếp: Tên (A-Z)</option>
                        <option value="name-desc">Sắp xếp: Tên (Z-A)</option>
                        <option value="affinity-desc">Sắp xếp: Hảo cảm (Cao nhất)</option>
                        <option value="affinity-asc">Sắp xếp: Hảo cảm (Thấp nhất)</option>
                        <option value="chiếnĐấu-desc">Sắp xếp: Chiến Đấu (Cao nhất)</option>
                        <option value="thámHiểm-desc">Sắp xếp: Thám Hiểm (Cao nhất)</option>
                        <option value="luyệnKhí-desc">Sắp xếp: Luyện Khí (Cao nhất)</option>
                        <option value="luyệnĐan-desc">Sắp xếp: Luyện Đan (Cao nhất)</option>
                    </select>
                </div>
            </div>

            {paginatedCharacters.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedCharacters.map(char => (
                            <SimpleCharacterCard 
                                key={char.id} 
                                character={char} 
                                onSelect={() => setSelectedCharacter(char)}
                                onToggleDefender={onToggleDefender}
                                onInteract={onInteract}
                                onAssign={onAssign}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-4 space-x-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <span className="text-gray-300">Trang {currentPage} / {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center text-gray-500 italic bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    Không tìm thấy đệ tử nào phù hợp.
                </div>
            )}

            {selectedCharacter && (
                <CharacterDetailModal 
                    character={selectedCharacter}
                    allCharacters={characters}
                    onClose={() => setSelectedCharacter(null)}
                    onUnequipItem={onUnequipItem}
                />
            )}
        </div>
    );
};

export default CharacterPanel;