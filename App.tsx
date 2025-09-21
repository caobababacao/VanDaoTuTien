import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    GameState,
    TimeOfDay,
    ResourceType,
    CharacterStatus,
    NarrativeEvent,
    Character,
    Building,
    Resource,
    DemonicBeast,
    DemonicBeastTier,
    AttackAnimation,
    Item,
    ItemType,
    EquipmentSlot,
    Skills,
    Weather,
    Gender,
    InteractionState,
    InteractionStage,
    SectStoryState,
    Ability,
    Room,
    ItemSlotCategory,
    Personality,
    GachaReward,
    // Fix: Import GachaRewardType to resolve type errors.
    GachaRewardType,
    ItemEffect
} from './types';
import BaseView from './views/BaseView';
import ExplorationView from './views/ExplorationView';
import WorldExplorationView from './views/WorldExplorationView';
import SectStoryView from './views/SectStoryView';
import GameOverView from './views/GameOverView';
import InteractionView from './views/InteractionView';
import NarrativeLog from './components/NarrativeLog';
import LoadingSpinner from './components/LoadingSpinner';
import CombatView from './views/CombatView';
import PlayerHub from './components/PlayerHub';
import SetupView from './views/SetupView';
import GachaResultView from './views/GachaResultView';
import TrialStagesView from './views/TrialStagesView';
import { ALL_BUILDINGS, TIME_SEQUENCE, BEAST_BASE_HP, BEAST_BASE_ATTACK, BEAST_BASE_SPEED, COMBAT_DISTANCE, INITIAL_INVENTORY_CAPACITY, STORAGE_CAPACITY_PER_LEVEL, ALL_WEATHERS, MAX_DISCIPLES, ROOM_CAPACITY, PLAYER_AVATAR_MALE, PLAYER_AVATAR_FEMALE, ADVENTURE_AVATARS_FEMALE, ADVENTURE_AVATARS_MALE, GACHA_AVATARS_FEMALE, GACHA_AVATARS_MALE, INITIAL_LEVEL, INITIAL_XP, BASE_XP_TO_NEXT_LEVEL } from './constants';
import * as geminiService from './services/geminiService';
import { PREDEFINED_NPCS } from './data/npcs';
import { BUILDING_NARRATIVES } from './data/narratives';
import { TRIAL_STAGES } from './data/trialStages';
import { ITEM_BLUEPRINTS } from './data/items';
import { GACHA_REWARDS } from './data/gachaRewards';

const calculatePopulationCapacity = (buildings: Building[]): number => {
    const housingBuilding = buildings.find(b => b.id === 'vien_trach');
    if (!housingBuilding || !housingBuilding.rooms) return 0;
    return housingBuilding.rooms.reduce((total, room) => total + room.capacity, 0);
};

const createInitialState = (setupData: { playerName: string; sectName: string; playerGender: Gender }): GameState => {
    const { playerName, sectName, playerGender } = setupData;
    const initialHousingRoomId = `room-${uuidv4()}`;
    const initialBuildings: Building[] = [
        { id: 'ho_son_dai_tran', name: 'Hộ Sơn Đại Trận', description: 'Phòng thủ cơ bản.', level: 1, maxLevel: 10, upgradeCost: ALL_BUILDINGS.find(b => b.id === 'ho_son_dai_tran')?.upgradeCost || [], assignedCharacterIds: [] },
        { 
            id: 'vien_trach', 
            name: 'Viện Trạch', 
            description: 'Cung cấp chỗ ở cho đệ tử.', 
            level: 1, 
            maxLevel: 5, 
            upgradeCost: ALL_BUILDINGS.find(b => b.id === 'vien_trach')?.upgradeCost || [],
            rooms: [{ id: initialHousingRoomId, buildingId: 'vien_trach', capacity: ROOM_CAPACITY, occupantIds: ['player', 'companion'] }]
        }
    ];

    const playerAvatar = playerGender === Gender.Nam ? PLAYER_AVATAR_MALE : PLAYER_AVATAR_FEMALE;

    const playerChar: Character = { id: 'player', name: playerName, level: INITIAL_LEVEL, xp: INITIAL_XP, xpToNextLevel: BASE_XP_TO_NEXT_LEVEL, gender: playerGender, avatar: playerAvatar, status: CharacterStatus.TĩnhTu, skills: { thámHiểm: 4, luyệnKhí: 2, chiếnĐấu: 3, luyệnĐan: 1 }, abilities: [], isDefender: false, equipment: {}, isPlayer: true, backstory: `Ngươi là Tông Chủ cuối cùng của ${sectName}, mang trên vai gánh nặng phục hưng lại tông môn từ đống tro tàn.`, appearance: 'Ngoại hình của ngươi phản ánh sự kiên cường và ý chí sắt đá, dù có chút mệt mỏi từ gánh nặng phục hưng tông môn.', personality: Personality.KiênĐịnh, miLuc: 75, affinity: 0, roomId: initialHousingRoomId, relationships: { 'companion': 20 } };
    const companionChar: Character = { id: 'companion', name: 'Tiểu Vũ', level: INITIAL_LEVEL, xp: INITIAL_XP, xpToNextLevel: BASE_XP_TO_NEXT_LEVEL, gender: Gender.Nữ, avatar: ADVENTURE_AVATARS_FEMALE[0], status: CharacterStatus.TĩnhTu, skills: { thámHiểm: 2, luyệnKhí: 4, chiếnĐấu: 2, luyệnĐan: 2 }, abilities: [], isDefender: false, equipment: {}, backstory: 'Nàng là đệ tử đầu tiên và trung thành nhất của ngươi, một người có thiên phú dị chủng, nhưng quá khứ là một bí ẩn đến cả ngươi cũng không rõ.', appearance: 'Dung mạo của Tiểu Vũ đẹp đến nao lòng, tựa như tiên tử lạc bước hồng trần. Nàng sở hữu một thân hình thon thả, uyển chuyển, mỗi đường cong đều toát lên vẻ mềm mại nhưng ẩn chứa sức mạnh. Làn da trắng nõn như tuyết, mịn màng không tì vết. Đôi mắt nàng trong veo và sáng long lanh như hồ thu, ẩn chứa cả sự thông minh, tinh nghịch lẫn một chút bí ẩn sâu thẳm. Sống mũi cao thẳng, đôi môi hồng nhuận khẽ cong lên tạo thành một nụ cười vừa ngây thơ vừa quyến rũ. Khí chất của nàng vừa thanh thuần lại vừa có chút yêu mị, khiến người khác không thể không bị thu hút.', personality: Personality.TrungThành, miLuc: 85, affinity: 20, roomId: initialHousingRoomId, relationships: { 'player': 20 } };


    return {
        day: 1,
        timeOfDay: TimeOfDay.Sáng,
        weather: Weather.QuangTrời,
        sectName: sectName,
        sectDefense: { current: 100, max: 100 },
        population: { current: 2, capacity: 2 },
        morale: { current: 75, max: 100 },
        resources: {
            [ResourceType.LươngThực]: { type: ResourceType.LươngThực, amount: 20, capacity: 50 },
            [ResourceType.LinhThạch]: { type: ResourceType.LinhThạch, amount: 10, capacity: Infinity },
            [ResourceType.LinhMộc]: { type: ResourceType.LinhMộc, amount: 10, capacity: 100 },
            [ResourceType.QuặngSắt]: { type: ResourceType.QuặngSắt, amount: 5, capacity: 100 },
            [ResourceType.ThảoDược]: { type: ResourceType.ThảoDược, amount: 5, capacity: 20 },
            [ResourceType.TànHồnYêuThú]: { type: ResourceType.TànHồnYêuThú, amount: 1, capacity: Infinity },
        },
        buildings: initialBuildings,
        characters: [playerChar, companionChar],
        inventory: [],
        inventoryCapacity: INITIAL_INVENTORY_CAPACITY,
        exploration: { active: false, prompt: '', options: [], characterId: null },
        worldExploration: { isActive: false, narrative: '', options: [], log: [], companionId: null },
        worldExplorationSummaries: [],
        sectStory: { isActive: false, narrative: '', options: [], log: [] },
        sectStorySummaries: [],
        interaction: null,
        combat: null,
        gameOver: { isOver: false, reason: '' },
        narrativeLog: [{ id: 'log-1', day: 1, time: TimeOfDay.Sáng, message: `Sương sớm còn đọng trên lá, một ngày mới bắt đầu trên con đường phục hưng ${sectName}. Ngươi kiểm tra lại tài nguyên và tập hợp các đệ tử.`, isStory: true }],
        trialLevel: 1,
        highestTrialStageCleared: 0,
    };
};

// Helper to calculate a character's total skills including equipment
export const getCharacterEffectiveSkills = (character: Character): Skills => {
    const baseSkills = { ...character.skills };
    const flatBonuses: Partial<Skills> = {};
    const percentageBonuses: Partial<Skills> = {};

    Object.values(character.equipment).forEach(item => {
        item?.effects?.forEach(effect => {
            if (effect.isPercentage) {
                percentageBonuses[effect.skill] = (percentageBonuses[effect.skill] || 0) + effect.value;
            } else {
                flatBonuses[effect.skill] = (flatBonuses[effect.skill] || 0) + effect.value;
            }
        });
    });

    const effectiveSkills = { ...baseSkills };
    for (const key in baseSkills) {
        const skill = key as keyof Skills;
        const base = baseSkills[skill];
        const flat = flatBonuses[skill] || 0;
        const percent = percentageBonuses[skill] || 0;
        effectiveSkills[skill] = Math.round((base + flat) * (1 + percent / 100));
    }
    
    return effectiveSkills;
};


// Pure function to handle XP gain and level ups for a character
const gainXpAndLevelUp = (character: Character, amount: number): { updatedCharacter: Character, logMessage: string | null } => {
    const char = JSON.parse(JSON.stringify(character)); // Deep copy
    char.xp += amount;
    let logMessage: string | null = null;
    let leveledUp = false;

    while (char.xp >= char.xpToNextLevel) {
        leveledUp = true;
        char.level += 1;
        char.xp -= char.xpToNextLevel;
        char.xpToNextLevel = Math.floor(BASE_XP_TO_NEXT_LEVEL * Math.pow(1.2, char.level - 1));
        
        // Increase base skills on level up
        char.skills.thámHiểm += 1;
        char.skills.luyệnKhí += 1;
        char.skills.chiếnĐấu += 1;
        char.skills.luyệnĐan += 1;
    }

    if (leveledUp) {
        logMessage = `${char.name} cảm nhận được linh khí dao động, đã đột phá thành công, đạt đến cấp ${char.level}!`;
    }
    
    return { updatedCharacter: char, logMessage };
};

function App() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlayerHubOpen, setIsPlayerHubOpen] = useState(false);
    const [isTrialStagesViewOpen, setIsTrialStagesViewOpen] = useState(false);
    const [gachaResult, setGachaResult] = useState<Character | null>(null);
    const isVictoryProcessing = useRef(false);
    
    const handleGameStart = useCallback((setupData: { playerName: string; sectName: string; playerGender: Gender }) => {
        const initialState = createInitialState(setupData);
        setGameState(initialState);
    }, []);

    // Helper to add to the narrative log
    const addNarrativeLog = useCallback((message: string, isStory: boolean = false) => {
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                narrativeLog: [...prev.narrativeLog, {
                    id: uuidv4(),
                    day: prev.day,
                    time: prev.timeOfDay,
                    message,
                    isStory
                }]
            }
        });
    }, []);

    const applyItemsFound = useCallback((items: Omit<Item, 'id'>[]) => {
        if (!items || items.length === 0) return;
        
        setGameState(prev => {
            if (!prev) return null;
            const newInventory = [...prev.inventory];
            let spaceAvailable = prev.inventoryCapacity - newInventory.length;
            const itemsAddedLogs: string[] = [];
            const itemsDroppedLogs: string[] = [];

            items.forEach(itemData => {
                 const newItem: Item = {
                    ...itemData,
                    id: uuidv4(),
                };
                if (spaceAvailable > 0) {
                    newInventory.push(newItem);
                    itemsAddedLogs.push(newItem.name);
                    spaceAvailable--;
                } else {
                    itemsDroppedLogs.push(newItem.name);
                }
            });
            
            if(itemsAddedLogs.length > 0) {
                 setTimeout(() => addNarrativeLog(`Nhặt được: ${itemsAddedLogs.join(', ')}!`), 0);
            }
             if(itemsDroppedLogs.length > 0) {
                 setTimeout(() => addNarrativeLog(`Tìm thấy ${itemsDroppedLogs.join(', ')}, nhưng phải bỏ lại vì túi đồ đã đầy.`), 0);
            }

            return { ...prev, inventory: newInventory };
        });

    }, [addNarrativeLog]);

    // Helper to apply resource/stat updates from AI responses
    const applyUpdates = useCallback((updates: { resource: string, change: number }[]) => {
        if (!updates || updates.length === 0) return;

        setGameState(prev => {
            if (!prev) return null;
            const newState = { ...prev };
            updates.forEach(update => {
                if (Object.values(ResourceType).includes(update.resource as ResourceType)) {
                    const res = newState.resources[update.resource as ResourceType];
                    res.amount = Math.max(0, Math.min(res.capacity, res.amount + update.change));
                } else if (update.resource === 'SectDefense') {
                    newState.sectDefense.current = Math.max(0, Math.min(newState.sectDefense.max, newState.sectDefense.current + update.change));
                } else if (update.resource === 'Morale') {
                    newState.morale.current = Math.max(0, Math.min(newState.morale.max, newState.morale.current + update.change));
                }
            });
            return newState;
        });
    }, []);

    const applyRelationshipUpdates = useCallback((updates: { character1Id: string, character2Id: string, change: number }[]) => {
        if (!updates || updates.length === 0) return;
    
        setGameState(prev => {
            if (!prev) return null;
            const newCharacters = JSON.parse(JSON.stringify(prev.characters));
    
            updates.forEach(update => {
                const char1 = newCharacters.find((c: Character) => c.id === update.character1Id);
                const char2 = newCharacters.find((c: Character) => c.id === update.character2Id);
    
                if (char1 && char2) {
                    // Update relationship from char1 to char2
                    const current1to2 = char1.relationships[update.character2Id] || 0;
                    char1.relationships[update.character2Id] = Math.max(-100, Math.min(100, current1to2 + update.change));
    
                    // Update relationship from char2 to char1
                    const current2to1 = char2.relationships[update.character1Id] || 0;
                    char2.relationships[update.character1Id] = Math.max(-100, Math.min(100, current2to1 + update.change));
                }
            });
    
            return { ...prev, characters: newCharacters };
        });
    }, []);

    // Main Game Loop: Advance time of day
    const handleNextTimeOfDay = useCallback(async () => {
        if (!gameState) return;
        setIsLoading(true);
    
        // Create a full deep copy of the state to mutate throughout the turn.
        let draftState = JSON.parse(JSON.stringify(gameState)) as GameState;
        // Fix: JSON.stringify converts Infinity to null. We must restore it.
        draftState.resources[ResourceType.LinhThạch].capacity = Infinity;
        draftState.resources[ResourceType.TànHồnYêuThú].capacity = Infinity;
        
        const previousDayNumber = draftState.day;
        const turnLogs: { message: string, isStory: boolean }[] = [];
    
        // 1. Determine next time of day and if it's a new day
        const currentTimeIndex = TIME_SEQUENCE.indexOf(draftState.timeOfDay);
        const nextTimeIndex = (currentTimeIndex + 1) % TIME_SEQUENCE.length;
        const isNewDay = nextTimeIndex === 0;
    
        draftState.timeOfDay = TIME_SEQUENCE[nextTimeIndex];
        if (isNewDay) {
            draftState.day += 1;
        }
    
        // 2. Handle End-of-Day/Start-of-New-Day logic
        let summaryPromise = Promise.resolve(null);
        if (isNewDay) {
            // 2a. Summarize previous day's sect story if it exists
            if (draftState.sectStory.log && draftState.sectStory.log.length > 0) {
                summaryPromise = geminiService.summarizeSectStory(draftState.sectStory.log);
            }
            // 2b. Reset the sect story for the new day
            draftState.sectStory = { isActive: false, narrative: '', options: [], log: [] };
    
            // 2c. Handle morning events (weather, consumption, production, training)
            if (draftState.timeOfDay === TimeOfDay.Sáng) {
                // Weather Change & Effects
                if (Math.random() < 0.33) {
                    const newWeather = ALL_WEATHERS[Math.floor(Math.random() * ALL_WEATHERS.length)];
                    if (newWeather !== draftState.weather) {
                        draftState.weather = newWeather;
                        turnLogs.push({ message: `Thời tiết đã thay đổi. Trời bây giờ ${newWeather}.`, isStory: true });
                    }
                }
    
                // Weather Effects
                switch (draftState.weather) {
                    case Weather.NắngGắt:
                        turnLogs.push({ message: "Nắng gắt như thiêu đốt, các đệ tử cảm thấy mệt mỏi hơn.", isStory: false });
                        draftState.morale.current -= 2;
                        break;
                    case Weather.BãoTố:
                        const stormDamage = Math.floor(Math.random() * 5) + 2;
                        draftState.sectDefense.current -= stormDamage;
                        turnLogs.push({ message: `Một cơn bão dữ dội ập đến, gây ${stormDamage} thiệt hại cho Hộ Sơn Trận.`, isStory: false });
                        break;
                    case Weather.MưaPhùn:
                        const tuLinhTran = draftState.buildings.find(b => b.id === 'tu_linh_tran');
                        if (tuLinhTran && tuLinhTran.level > 0 && (tuLinhTran.assignedCharacterIds?.length ?? 0) > 0) {
                            const stonesGained = tuLinhTran.level;
                            draftState.resources[ResourceType.LinhThạch].amount += stonesGained;
                            turnLogs.push({ message: `Mưa Phùn mang theo linh khí, Tụ Linh Trận thu thập được ${stonesGained} Linh Thạch.`, isStory: false });
                        }
                        break;
                }
    
                // Resource consumption
                const foodConsumed = draftState.population.current;
                draftState.resources[ResourceType.LươngThực].amount -= foodConsumed;
                turnLogs.push({ message: `Đêm qua, các đệ tử đã tiêu thụ ${foodConsumed} lương thực.`, isStory: false });
                if (draftState.resources[ResourceType.LươngThực].amount < 0) {
                    draftState.morale.current -= 10;
                    draftState.resources[ResourceType.LươngThực].amount = 0;
                    turnLogs.push({ message: 'Lương thực cạn kiệt. Sĩ khí giảm sút.', isStory: true });
                }
    
                // Resource Generation
                draftState.buildings.forEach(building => {
                    const blueprint = ALL_BUILDINGS.find(b => b.id === building.id);
                    if (blueprint?.generates && building.assignedCharacterIds && building.assignedCharacterIds.length > 0) {
                        let totalAmountGenerated = 0;
                        building.assignedCharacterIds.forEach(charId => {
                            const character = draftState.characters.find(c => c.id === charId);
                            if (character) {
                                let amountPerWorker = building.level * 2;
                                const skills = getCharacterEffectiveSkills(character);
                                switch (blueprint.generates) {
                                    case ResourceType.LươngThực: case ResourceType.ThảoDược: amountPerWorker += Math.floor(skills.luyệnĐan / 2); break;
                                    case ResourceType.QuặngSắt: case ResourceType.LinhMộc: amountPerWorker += Math.floor(skills.luyệnKhí / 2); break;
                                }
                                totalAmountGenerated += Math.max(1, amountPerWorker);
                            }
                        });
                        if (totalAmountGenerated > 0) {
                            const res = draftState.resources[blueprint.generates];
                            res.amount = Math.min(res.capacity, res.amount + totalAmountGenerated);
                            turnLogs.push({ message: `${building.name} sản xuất ${totalAmountGenerated} ${blueprint.generates}.`, isStory: false });
                        }
                    }
                });

                // Character XP gain from tasks
                let charactersAfterWork = [...draftState.characters];
                const workXpLogs: string[] = [];
                charactersAfterWork = charactersAfterWork.map(char => {
                    const isWorking = draftState.buildings.some(b => b.assignedCharacterIds?.includes(char.id) && b.id !== 'linh_tri');
                    if (isWorking) {
                        const { updatedCharacter, logMessage } = gainXpAndLevelUp(char, 10);
                        if (logMessage) {
                            workXpLogs.push(logMessage);
                        }
                        return updatedCharacter;
                    }
                    return char;
                });
                draftState.characters = charactersAfterWork;
                workXpLogs.forEach(log => turnLogs.push({ message: log, isStory: true }));
                
                // Linh Tri training completion
                const linhTri = draftState.buildings.find(b => b.id === 'linh_tri');
                if (linhTri) {
                    let charactersToUpdate = [...draftState.characters];
                    const completedTraineeIds = new Set<string>();
                    const trainingCompletionLogs: { completion: string, levelUp?: string }[] = [];

                    charactersToUpdate = charactersToUpdate.map(char => {
                        if (char.status === CharacterStatus.BếQuan && draftState.day >= (char.trainingEndDate ?? Infinity)) {
                            const xpGained = linhTri.level * 100; // More XP for seclusion
                            const { updatedCharacter, logMessage } = gainXpAndLevelUp(char, xpGained);
                            
                            updatedCharacter.status = CharacterStatus.TĩnhTu;
                            delete updatedCharacter.trainingEndDate;
                            
                            const logEntry: { completion: string, levelUp?: string } = {
                                completion: `${char.name} đã hoàn thành bế quan, tu vi tăng mạnh! (+${xpGained} KN)`
                            };
                            if (logMessage) {
                                logEntry.levelUp = logMessage;
                            }
                            trainingCompletionLogs.push(logEntry);
                            completedTraineeIds.add(char.id);
                            return updatedCharacter;
                        }
                        return char;
                    });
                    
                    if (completedTraineeIds.size > 0) {
                        const updatedLinhTri = {
                            ...linhTri,
                            assignedCharacterIds: (linhTri.assignedCharacterIds ?? []).filter(id => !completedTraineeIds.has(id))
                        };
                        draftState.buildings = draftState.buildings.map(b => b.id === 'linh_tri' ? updatedLinhTri : b);
                        draftState.characters = charactersToUpdate;
                        trainingCompletionLogs.forEach(log => {
                            turnLogs.push({ message: log.completion, isStory: true });
                            if (log.levelUp) {
                                turnLogs.push({ message: log.levelUp, isStory: true });
                            }
                        });
                    }
                }
            }
        }
    
        // 3. Perform async operations: fetch summary and daily event
        try {
            const [summaryResult, eventData] = await Promise.all([
                summaryPromise,
                geminiService.generateDailyEvent(draftState)
            ]);
    
            // Process summary result
            if (summaryResult?.summary) {
                const summaryText = `Ngày ${previousDayNumber}: ${summaryResult.summary}`;
                draftState.sectStorySummaries.push(summaryText);
                turnLogs.push({ message: `(Tóm tắt tông môn) ${summaryResult.summary}`, isStory: true });
            }
    
            // Process daily event result
            turnLogs.push({ message: eventData.narrative, isStory: true });
    
            if (eventData.event && eventData.event.type !== 'nothing') {
                turnLogs.push({ message: eventData.event.message, isStory: false });
                if (eventData.event.updates) {
                    eventData.event.updates.forEach(update => {
                        if (Object.values(ResourceType).includes(update.resource as ResourceType)) {
                            const res = draftState.resources[update.resource as ResourceType];
                            res.amount = Math.max(0, Math.min(res.capacity, res.amount + update.change));
                        } else if (update.resource === 'SectDefense') {
                            draftState.sectDefense.current = Math.max(0, Math.min(draftState.sectDefense.max, draftState.sectDefense.current + update.change));
                        } else if (update.resource === 'Morale') {
                            draftState.morale.current = Math.max(0, Math.min(draftState.morale.max, draftState.morale.current + update.change));
                        }
                    });
                }
            }
        } catch (error) {
            console.error(error);
            turnLogs.push({ message: "Không gian tĩnh lặng một cách kỳ lạ. Ngươi cảm thấy một sự hiện diện vô hình, nhưng không có gì xảy ra.", isStory: true });
        } finally {
            // 4. Commit all changes to the state at once
            const newNarrativeEvents = turnLogs.map(log => ({
                id: uuidv4(),
                day: draftState.day,
                time: draftState.timeOfDay,
                message: log.message,
                isStory: log.isStory,
            }));
            draftState.narrativeLog.push(...newNarrativeEvents);
            
            setGameState(draftState);
            setIsLoading(false);
        }
    }, [gameState]);


    const handleAssignCharacter = useCallback(async (characterId: string) => {
        if (!gameState) return;
        setIsLoading(true);
        try {
            const scenario = await geminiService.generateExplorationScenario(gameState);
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    characters: prev.characters.map(c => c.id === characterId ? { ...c, status: CharacterStatus.LuyệnTập } : c),
                    exploration: { 
                        active: true, 
                        characterId, 
                        prompt: scenario.prompt,
                        options: scenario.options || [] 
                    }
                }
            });
        } catch (error) {
            console.error(error);
            addNarrativeLog("Vị đệ tử do dự, cảm thấy một cảm giác bất an. Chuyến đi tạm thời bị hủy bỏ.");
        } finally {
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog]);

    const handleExplorationChoice = useCallback(async (choice: string) => {
        if (!gameState) return;
        setIsLoading(true);
        try {
            const outcome = await geminiService.generateExplorationOutcome(gameState, choice);
            addNarrativeLog(outcome.outcome);
            if (outcome.updates) {
                applyUpdates(outcome.updates);
            }
            if (outcome.itemsFound) {
                applyItemsFound(outcome.itemsFound as Omit<Item, 'id'>[]);
            }
            // Handle combat start if necessary
        } catch (error) {
             console.error(error);
             addNarrativeLog("Lựa chọn dẫn đến một ngõ cụt bất ngờ. Vị đệ tử trở về tay không.", true);
        } finally {
            setGameState(prev => {
                if (!prev) return null;
                const characterId = prev.exploration.characterId;
                let newCharacters = [...prev.characters];
    
                if (characterId) {
                    const character = newCharacters.find(c => c.id === characterId);
                    if (character) {
                        const { updatedCharacter, logMessage } = gainXpAndLevelUp(character, 30);
                        if (logMessage) {
                            setTimeout(() => addNarrativeLog(logMessage, true), 0);
                        }
                        newCharacters = newCharacters.map(c => c.id === characterId ? updatedCharacter : c);
                    }
                }
                
                newCharacters = newCharacters.map(c => c.id === characterId ? { ...c, status: CharacterStatus.TĩnhTu } : c);

                return {
                    ...prev,
                    characters: newCharacters,
                    exploration: { active: false, prompt: '', options: [], characterId: null }
                };
            });
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog, applyUpdates, applyItemsFound]);

    const handleToggleDefender = useCallback((characterId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                characters: prev.characters.map(c => c.id === characterId ? { ...c, isDefender: !c.isDefender } : c)
            }
        });
    }, []);

    const calculateInventoryCapacity = (buildings: Building[]): number => {
        const storageBuilding = buildings.find(b => b.id === 'tang_bao_cac');
        const storageLevel = storageBuilding ? storageBuilding.level : 0;
        return INITIAL_INVENTORY_CAPACITY + (storageLevel * STORAGE_CAPACITY_PER_LEVEL);
    };

    const handleUpgradeBuilding = useCallback((buildingId: string) => {
        if (!gameState) return;
        const building = gameState.buildings.find(b => b.id === buildingId);
        const blueprint = ALL_BUILDINGS.find(b => b.id === buildingId);
        if (!building || !blueprint) return;

        const costMultiplier = Math.pow(1.5, building.level);
        const upgradeCost = blueprint.upgradeCost.map(c => ({ ...c, amount: Math.ceil(c.amount * costMultiplier) }));
        
        const canAfford = upgradeCost.every(c => gameState.resources[c.resource].amount >= c.amount);

        if (canAfford) {
            // Optimistic Update: Update state immediately
            const narrativeEntry = BUILDING_NARRATIVES[buildingId]?.upgrade || `Công trình ${building.name} đã được nâng cấp.`;
            addNarrativeLog(narrativeEntry.replace('${buildingName}', building.name).replace('${level}', (building.level + 1).toString()));

            setGameState(prev => {
                if (!prev) return null;
                const newResources = { ...prev.resources };
                upgradeCost.forEach(c => {
                    newResources[c.resource].amount -= c.amount;
                });
                
                const newBuildings = prev.buildings.map(b => {
                    if (b.id === buildingId) {
                        const newLevel = b.level + 1;
                        let newRooms = b.rooms ? [...b.rooms] : [];
                        // Special logic for Viện Trạch
                        if (buildingId === 'vien_trach') {
                            newRooms.push({ id: `room-${uuidv4()}`, buildingId: b.id, capacity: ROOM_CAPACITY, occupantIds: [] });
                        }
                        return { ...b, level: newLevel, rooms: newRooms };
                    }
                    return b;
                });

                const newInvCapacity = calculateInventoryCapacity(newBuildings);
                const newPopCapacity = calculatePopulationCapacity(newBuildings);

                return {
                    ...prev,
                    resources: newResources,
                    buildings: newBuildings,
                    inventoryCapacity: newInvCapacity,
                    population: { ...prev.population, capacity: newPopCapacity }
                };
            });
        } else {
            addNarrativeLog("Không đủ tài nguyên để nâng cấp.");
        }
    }, [gameState, addNarrativeLog]);

    const handleBuildBuilding = useCallback((buildingId: string) => {
        if (!gameState) return;
        const blueprint = ALL_BUILDINGS.find(b => b.id === buildingId);
        if (!blueprint) return;

        const canAfford = blueprint.upgradeCost.every(c => gameState.resources[c.resource].amount >= c.amount);

        if (canAfford) {
            // Optimistic Update
            const narrativeEntry = BUILDING_NARRATIVES[buildingId]?.build || `Công trình ${blueprint.name} đã được xây dựng.`;
            addNarrativeLog(narrativeEntry.replace('${buildingName}', blueprint.name));

            setGameState(prev => {
                if (!prev) return null;
                const newResources = { ...prev.resources };
                blueprint.upgradeCost.forEach(c => {
                    newResources[c.resource].amount -= c.amount;
                });
                
                const newBuilding: Building = { ...blueprint, level: 1, assignedCharacterIds: [] };
                // Special logic for Viện Trạch
                if (buildingId === 'vien_trach') {
                    newBuilding.rooms = [{ id: `room-${uuidv4()}`, buildingId: newBuilding.id, capacity: ROOM_CAPACITY, occupantIds: [] }];
                }

                const newBuildings = [...prev.buildings, newBuilding];
                const newInvCapacity = calculateInventoryCapacity(newBuildings);
                const newPopCapacity = calculatePopulationCapacity(newBuildings);

                return {
                    ...prev,
                    resources: newResources,
                    buildings: newBuildings,
                    inventoryCapacity: newInvCapacity,
                    population: { ...prev.population, capacity: newPopCapacity }
                };
            });
        } else {
            addNarrativeLog("Không đủ tài nguyên để xây dựng.");
        }
    }, [gameState, addNarrativeLog]);

    const handleUseAltar = useCallback(async () => {
        if (!gameState) return;
    
        if (gameState.resources[ResourceType.TànHồnYêuThú].amount < 1) {
            addNarrativeLog("Ngươi cần một 'Tàn Hồn Yêu Thú' để hiến tế.");
            return;
        }
    
        setIsLoading(true);
        // Deduct cost immediately
        setGameState(prev => {
            if (!prev) return null;
            const newResources = { ...prev.resources };
            newResources[ResourceType.TànHồnYêuThú].amount -= 1;
            return { ...prev, resources: newResources };
        });
    
        // Client-side weighted random selection
        const totalWeight = GACHA_REWARDS.reduce((sum, reward) => sum + reward.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedReward: GachaReward | null = null;
    
        for (const reward of GACHA_REWARDS) {
            if (random < reward.weight) {
                selectedReward = reward;
                break;
            }
            random -= reward.weight;
        }
    
        if (!selectedReward) {
            console.error("Gacha selection failed.");
            addNarrativeLog("Tế đàn im lặng, dường như có lỗi xảy ra.");
            setIsLoading(false);
            return;
        }
        
        try {
            switch (selectedReward.type) {
                case 'RESOURCES':
                case 'RESOURCES_PERCENT':
                case 'ITEM':
                case 'COMBINATION': {
                    let logMessages: string[] = [];
                    let itemsToAdd: Omit<Item, 'id'>[] = [];
                    let resourceUpdates: { resource: string, change: number }[] = [];
                    
                    const processPayload = (payload: any, type: GachaRewardType) => {
                         if (type === 'RESOURCES') {
                             payload.resources.forEach((res: { type: ResourceType, amount: number }) => {
                                 resourceUpdates.push({ resource: res.type, change: res.amount });
                                 logMessages.push(`${res.amount} ${res.type}`);
                             });
                         } else if (type === 'RESOURCES_PERCENT') {
                             payload.resources.forEach((res: { type: ResourceType, percent: number }) => {
                                 const capacity = gameState.resources[res.type].capacity;
                                 if (Number.isFinite(capacity)) {
                                     const amount = Math.ceil(capacity * (res.percent / 100));
                                     resourceUpdates.push({ resource: res.type, change: amount });
                                     logMessages.push(`${amount} ${res.type}`);
                                 }
                             });
                         } else if (type === 'ITEM') {
                             payload.items.forEach((itemInfo: { blueprintId: string, amount: number }) => {
                                 const blueprint = ITEM_BLUEPRINTS[itemInfo.blueprintId as keyof typeof ITEM_BLUEPRINTS];
                                 if (blueprint) {
                                     for(let i=0; i<itemInfo.amount; i++) {
                                        itemsToAdd.push(blueprint);
                                     }
                                     logMessages.push(`${itemInfo.amount}x ${blueprint.name}`);
                                 }
                             });
                         } else if (type === 'COMBINATION') {
                             payload.rewards.forEach((reward: { type: GachaRewardType, payload: any }) => {
                                 processPayload(reward.payload, reward.type);
                             });
                         }
                    }
                    
                    processPayload(selectedReward.payload, selectedReward.type);

                    addNarrativeLog(`Từ tế đàn, một luồng năng lượng thuần khiết tỏa ra, ban cho ngươi: ${logMessages.join(', ')}!`, true);
                    if(resourceUpdates.length > 0) applyUpdates(resourceUpdates);
                    if(itemsToAdd.length > 0) applyItemsFound(itemsToAdd);

                    break;
                }
    
                case 'EQUIPMENT': {
                    const result = await geminiService.generateRandomEquipment(selectedReward.payload);
                    addNarrativeLog(result.narrative, true);
                    
                    const newItems: Omit<Item, 'id'>[] = result.items.map((itemData: any) => ({
                        name: itemData.name,
                        description: itemData.description,
                        type: ItemType.TrangBị,
                        slot: itemData.slot as ItemSlotCategory,
                        effects: itemData.effects as ItemEffect[],
                    }));
                    
                    applyItemsFound(newItems);
                    break;
                }
    
                case 'DISCIPLE': {
                     const existingNpcIds = new Set(gameState.characters.map(c => c.id));
                     const availablePredefinedNpcs = PREDEFINED_NPCS.filter(npc => !existingNpcIds.has(npc.id));
                     if (availablePredefinedNpcs.length === 0) {
                         addNarrativeLog("Tế đàn không phản ứng. Dường như tất cả các anh linh hùng mạnh đã được triệu hồi hết.", true);
                         break;
                     }
                      if (gameState.population.current >= gameState.population.capacity) {
                         addNarrativeLog("Không còn đủ chỗ ở trong Viện Trạch. Một linh hồn mạnh mẽ xuất hiện nhưng không thể ở lại và tan biến.", true);
                         break;
                     }

                    const result = await geminiService.generateGachaDisciple(gameState);
                    addNarrativeLog(result.narrative, true);
                    const predefinedNpc = PREDEFINED_NPCS.find(npc => npc.id === result.discipleId);
                    if (predefinedNpc) {
                         const finalCharacter: Character = {
                            ...predefinedNpc,
                            status: CharacterStatus.TĩnhTu,
                            isDefender: false,
                            equipment: {},
                            roomId: null,
                            relationships: {}
                        };
                        if (predefinedNpc.summonSound) {
                            new Audio(predefinedNpc.summonSound).play();
                        } else {
                            new Audio('https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg').play();
                        }
                        setGachaResult(finalCharacter);

                        setGameState(prev => {
                            if (!prev) return null;
                             const updatedExistingChars = prev.characters.map(char => {
                                const updatedChar = { ...char, relationships: { ...char.relationships } };
                                updatedChar.relationships[finalCharacter.id] = 0;
                                finalCharacter.relationships[char.id] = 0;
                                return updatedChar;
                            });
                             return {
                                ...prev,
                                characters: [...updatedExistingChars, finalCharacter],
                                population: { ...prev.population, current: prev.population.current + 1 }
                            };
                        });
                    }
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            addNarrativeLog("Tế đàn rung chuyển dữ dội và sau đó im bặt. Dường như có gì đó đã thất bại.");
            // Refund on error
            setGameState(prev => {
                if (!prev) return null;
                const newResources = { ...prev.resources };
                newResources[ResourceType.TànHồnYêuThú].amount += 1;
                return { ...prev, resources: newResources };
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog, applyUpdates, applyItemsFound]);

    const handleTestAltar = useCallback(() => {
        if (!gameState) return;
    
        const existingNpcIds = new Set(gameState.characters.map(c => c.id));
        const availablePredefinedNpcs = PREDEFINED_NPCS.filter(npc => !existingNpcIds.has(npc.id));
    
        if (availablePredefinedNpcs.length === 0) {
            addNarrativeLog("Tế đàn không phản ứng. Dường như tất cả các anh linh hùng mạnh đã được triệu hồi hết.", true);
            return;
        }
    
        if (gameState.population.current >= gameState.population.capacity) {
            addNarrativeLog("Không còn đủ chỗ ở trong Viện Trạch. Một linh hồn mạnh mẽ xuất hiện nhưng không thể ở lại và tan biến.", true);
            return;
        }
    
        // Client-side random selection
        const randomIndex = Math.floor(Math.random() * availablePredefinedNpcs.length);
        const predefinedNpc = availablePredefinedNpcs[randomIndex];
    
        if (predefinedNpc) {
            addNarrativeLog("Từ tế đàn, một luồng ánh sáng chói lòa lóe lên, một bóng người bí ẩn xuất hiện!", true);
            
            const finalCharacter: Character = {
                ...predefinedNpc,
                status: CharacterStatus.TĩnhTu,
                isDefender: false,
                equipment: {},
                roomId: null,
                relationships: {}
            };
    
            if (predefinedNpc.summonSound) {
                new Audio(predefinedNpc.summonSound).play();
            } else {
                new Audio('https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg').play();
            }
            setGachaResult(finalCharacter);
    
            setGameState(prev => {
                if (!prev) return null;
                const updatedExistingChars = prev.characters.map(char => {
                    const updatedChar = { ...char, relationships: { ...char.relationships } };
                    updatedChar.relationships[finalCharacter.id] = 0;
                    finalCharacter.relationships[char.id] = 0;
                    return updatedChar;
                });
                return {
                    ...prev,
                    characters: [...updatedExistingChars, finalCharacter],
                    population: { ...prev.population, current: prev.population.current + 1 }
                };
            });
        } else {
            addNarrativeLog("Không thể triệu hồi đệ tử vào lúc này.", true);
        }
    }, [gameState, addNarrativeLog]);

    const handleTestResources = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const newResources = { ...prev.resources };
            newResources[ResourceType.LinhMộc].amount += 60;
            newResources[ResourceType.QuặngSắt].amount += 30;
            
            const logMessage = "Test: Nhận được 60 Linh Mộc và 30 Quặng Sắt.";
            const newLogEntry: NarrativeEvent = {
                id: uuidv4(),
                day: prev.day,
                time: prev.timeOfDay,
                message: logMessage,
                isStory: false,
            };

            return {
                ...prev,
                resources: newResources,
                narrativeLog: [...prev.narrativeLog, newLogEntry],
            };
        });
    }, []);

    const handleEquipItem = useCallback((characterId: string, itemId: string, slot: EquipmentSlot) => {
        setGameState(prev => {
            if (!prev) return null;
            const newState = JSON.parse(JSON.stringify(prev)) as GameState;
            // Fix: JSON.stringify converts Infinity to null. We must restore it.
            newState.resources[ResourceType.LinhThạch].capacity = Infinity;
            newState.resources[ResourceType.TànHồnYêuThú].capacity = Infinity;

            const itemToEquip = newState.inventory.find((i: Item) => i.id === itemId);
            const character = newState.characters.find((c: Character) => c.id === characterId);
    
            if (!itemToEquip || !character || itemToEquip.type !== ItemType.TrangBị || !itemToEquip.slot) {
                return prev;
            }
    
            // Validate if the item can be equipped in the target slot
            const itemCategory = itemToEquip.slot;
            const targetSlot = slot;
            let isValidSlot = false;
            if (itemCategory === ItemSlotCategory.VũKhí && (targetSlot === EquipmentSlot.VũKhíChính || targetSlot === EquipmentSlot.VũKhíPhụ)) isValidSlot = true;
            else if (itemCategory === ItemSlotCategory.TrangSức && (targetSlot === EquipmentSlot.TrangSức1 || targetSlot === EquipmentSlot.TrangSức2)) isValidSlot = true;
            else if ((itemCategory as string) === (targetSlot as string)) isValidSlot = true; // For direct matches like 'Đầu', 'Pháp Bảo', etc.
            
            if (!isValidSlot) {
                console.error(`Lỗi trang bị: Không thể trang bị vật phẩm loại ${itemCategory} vào ô ${targetSlot}`);
                addNarrativeLog(`Không thể trang bị ${itemToEquip.name} vào ô ${targetSlot}.`);
                return prev;
            }
            
            // Unequip existing item in the same slot, if any
            const currentlyEquipped = character.equipment[slot];
            const newInventory = newState.inventory.filter((i: Item) => i.id !== itemId);
            if (currentlyEquipped) {
                if (newInventory.length >= newState.inventoryCapacity) {
                    addNarrativeLog(`Không thể trang bị ${itemToEquip.name}, túi đồ đầy sau khi tháo ${currentlyEquipped.name}.`);
                    return prev; // Not enough space to unequip
                }
                newInventory.push(currentlyEquipped);
            }
    
            // Equip the new item
            const newEquipment = { ...character.equipment, [slot]: itemToEquip };
            
            newState.inventory = newInventory;
            newState.characters = newState.characters.map((c: Character) => 
                c.id === characterId ? { ...c, equipment: newEquipment } : c
            );
            
            addNarrativeLog(`${character.name} đã trang bị ${itemToEquip.name} vào ô ${slot}.`);
            return newState;
        });
    }, [addNarrativeLog]);

    const handleUnequipItem = useCallback((characterId: string, slot: EquipmentSlot) => {
        setGameState(prev => {
            if (!prev) return null;
            const newState = { ...prev };
            const character = newState.characters.find(c => c.id === characterId);

            if (!character) return prev;
            
            const itemToUnequip = character.equipment[slot];
            if (!itemToUnequip) return prev;

            if (newState.inventory.length >= newState.inventoryCapacity) {
                addNarrativeLog(`Không thể tháo ${itemToUnequip.name}. Túi đồ đã đầy.`);
                return prev;
            }

            const newInventory = [...newState.inventory, itemToUnequip];
            const newEquipment = { ...character.equipment };
            delete newEquipment[slot];

             newState.inventory = newInventory;
            newState.characters = newState.characters.map(c => 
                c.id === characterId ? { ...c, equipment: newEquipment } : c
            );

            addNarrativeLog(`${character.name} đã tháo ${itemToUnequip.name}.`);
            return newState;
        });
    }, [addNarrativeLog]);

    const runCombatTurn = useCallback(async () => {
        if (!gameState?.combat || !gameState.combat.active) return;
        if (gameState.combat.beasts.length === 0 && isVictoryProcessing.current) return;
    
        let combatState = JSON.parse(JSON.stringify(gameState.combat));
        let newSectDefense = gameState.sectDefense.current;
        let turnLog: string[] = [];
        let newAnimations: AttackAnimation[] = [];
    
        const getBeastDisplayName = (beast: DemonicBeast): string => {
            return beast.name;
        };
    
        // 1. Defenders attack
        combatState.defenders.forEach((defender: Character) => {
            if (combatState.beasts.length > 0) {
                const targetIndex = Math.floor(Math.random() * combatState.beasts.length);
                const target = combatState.beasts[targetIndex];
                const effectiveSkills = getCharacterEffectiveSkills(defender);
                const damage = Math.ceil(effectiveSkills.chiếnĐấu * (1 + Math.random() * 0.5));
                target.hp.current -= damage;
                turnLog.push(`${defender.name} tấn công ${getBeastDisplayName(target)} gây ${damage} sát thương.`);
                newAnimations.push({ id: uuidv4(), defenderId: defender.id, targetId: target.id });
    
                if (target.hp.current <= 0) {
                    turnLog.push(`${getBeastDisplayName(target)} đã bị tiêu diệt!`);
                    combatState.beasts.splice(targetIndex, 1);
                }
            }
        });
    
        // 2. Beasts move and attack
        combatState.beasts.forEach((beast: DemonicBeast) => {
            beast.position -= beast.speed;
            if (beast.position <= 0) {
                beast.position = 0;
                const sectDamage = beast.attack * (1 + Math.random() * 0.2);
                newSectDefense -= sectDamage;
                turnLog.push(`${getBeastDisplayName(beast)} tấn công Hộ Sơn Trận gây ${Math.round(sectDamage)} sát thương!`);
            }
        });
    
        // 3. Check for combat end (Victory)
        if (combatState.beasts.length === 0) {
            if (isVictoryProcessing.current) return;
            isVictoryProcessing.current = true;
            setIsLoading(true);
    
            // VICTORY LOGIC
            const combatType = gameState.combat.type;
            if (combatType === 'trial') {
                 try {
                    const victoryLogs: NarrativeEvent[] = [];
                    victoryLogs.push({
                        id: uuidv4(),
                        day: gameState.day,
                        time: gameState.timeOfDay,
                        message: `Khảo Nghiệm cấp ${gameState.trialLevel} thành công!`,
                        isStory: true,
                    });
    
                    const soulFragments = 5 + gameState.trialLevel * 2;
                    const scrollData = await geminiService.generateTechniqueScroll(gameState.trialLevel);
                    const newScroll: Item = {
                        id: uuidv4(),
                        name: scrollData.name,
                        description: scrollData.description,
                        type: ItemType.CôngPháp,
                        grantsAbility: { name: scrollData.name, description: scrollData.description }
                    };
                    
                    victoryLogs.push({
                        id: uuidv4(),
                        day: gameState.day,
                        time: gameState.timeOfDay,
                        message: `Phần thưởng: ${soulFragments} Tàn Hồn Yêu Thú và công pháp [${newScroll.name}]!`,
                        isStory: true,
                    });
    
                    const xpGained = gameState.trialLevel * 20;
                    let charactersWithNewXp = JSON.parse(JSON.stringify(gameState.characters));
    
                    charactersWithNewXp = charactersWithNewXp.map((char: Character) => {
                        const isDefender = gameState.combat!.defenders.some(d => d.id === char.id);
                        if (isDefender) {
                            const { updatedCharacter, logMessage } = gainXpAndLevelUp(char, xpGained);
                            if (logMessage) {
                                victoryLogs.push({
                                    id: uuidv4(),
                                    day: gameState.day,
                                    time: gameState.timeOfDay,
                                    message: logMessage,
                                    isStory: true,
                                });
                            }
                            return updatedCharacter;
                        }
                        return char;
                    });
                    
                    setGameState(prev => {
                        if (!prev) return null;
                        
                        const newResources = { ...prev.resources };
                        newResources[ResourceType.TànHồnYêuThú].amount = Math.min(newResources[ResourceType.TànHồnYêuThú].capacity, newResources[ResourceType.TànHồnYêuThú].amount + soulFragments);
                        
                        const newInventory = [...prev.inventory];
                        let inventoryFullLog: NarrativeEvent | null = null;
                        if (newInventory.length < prev.inventoryCapacity) {
                             newInventory.push(newScroll);
                        } else {
                            inventoryFullLog = {
                                id: uuidv4(),
                                day: prev.day,
                                time: prev.timeOfDay,
                                message: `Sách Công Pháp [${newScroll.name}] không thể nhận vì túi đồ đã đầy!`,
                                isStory: true
                            };
                        }
                        
                        const finalLogs = [...prev.narrativeLog, ...victoryLogs];
                        if (inventoryFullLog) finalLogs.push(inventoryFullLog);
    
                        return {
                            ...prev,
                            combat: null,
                            trialLevel: prev.trialLevel + 1,
                            resources: newResources,
                            inventory: newInventory,
                            characters: charactersWithNewXp,
                            narrativeLog: finalLogs
                        };
                    });
    
                } catch (error) {
                    console.error("Lỗi khi tạo phần thưởng khảo nghiệm:", error);
                    setGameState(prev => {
                        if (!prev) return null;
                        const errorLog: NarrativeEvent = {
                            id: uuidv4(),
                            day: prev.day,
                            time: prev.timeOfDay,
                            message: "Năng lượng từ khảo nghiệm tan biến, phần thưởng bị một thế lực bí ẩn nuốt chửng.",
                            isStory: true,
                        };
                        return {
                            ...prev,
                            combat: null,
                            trialLevel: prev.trialLevel + 1,
                            narrativeLog: [...prev.narrativeLog, errorLog]
                        };
                    });
                } finally {
                    setIsLoading(false);
                    isVictoryProcessing.current = false;
                }
            } else if (combatType === 'stage' && gameState.combat.stageLevel) {
                const stageLevel = gameState.combat.stageLevel;
                const stageData = TRIAL_STAGES.find(s => s.stage === stageLevel);
    
                if (stageData) {
                    setGameState(prev => {
                        if (!prev) return null;
    
                        const victoryLogs: string[] = [`Vượt Ải Thí Luyện ${stageLevel} thành công!`];
                        const newResources = { ...prev.resources };
                        const newInventory = [...prev.inventory];
    
                        // Grant resources
                        Object.entries(stageData.rewards.resources).forEach(([res, amount]) => {
                            const resourceType = res as ResourceType;
                            newResources[resourceType].amount = Math.min(newResources[resourceType].capacity, newResources[resourceType].amount + amount);
                        });
                        victoryLogs.push(`Nhận được tài nguyên!`);
    
                        // Grant items
                        stageData.rewards.items.forEach(itemReward => {
                            const blueprint = ITEM_BLUEPRINTS[itemReward.blueprintId as keyof typeof ITEM_BLUEPRINTS];
                            if (blueprint) {
                                for (let i = 0; i < itemReward.amount; i++) {
                                    if (newInventory.length < prev.inventoryCapacity) {
                                        newInventory.push({ ...blueprint, id: uuidv4() });
                                    } else {
                                        victoryLogs.push(`Túi đồ đã đầy, không thể nhận ${blueprint.name}.`);
                                        break; 
                                    }
                                }
                                if(newInventory.length < prev.inventoryCapacity) {
                                    victoryLogs.push(`Nhận được ${itemReward.amount} x ${blueprint.name}!`);
                                }
                            }
                        });
    
                        const xpGained = stageLevel * 15;
                        let charactersWithNewXp = [...prev.characters];
                        charactersWithNewXp = charactersWithNewXp.map(char => {
                             const isDefender = prev.combat!.defenders.some(d => d.id === char.id);
                             if(isDefender) {
                                const { updatedCharacter, logMessage } = gainXpAndLevelUp(char, xpGained);
                                if (logMessage) victoryLogs.push(logMessage);
                                return updatedCharacter;
                             }
                             return char;
                        });
    
                        const newLogEvents: NarrativeEvent[] = victoryLogs.map(msg => ({
                            id: uuidv4(),
                            day: prev.day,
                            time: prev.timeOfDay,
                            message: msg,
                            isStory: true
                        }));
    
                        return {
                            ...prev,
                            combat: null,
                            highestTrialStageCleared: Math.max(prev.highestTrialStageCleared, stageLevel),
                            resources: newResources,
                            inventory: newInventory,
                            characters: charactersWithNewXp,
                            narrativeLog: [...prev.narrativeLog, ...newLogEvents]
                        };
                    });
                }
                setIsLoading(false);
                isVictoryProcessing.current = false;
            }
    
            return; // Stop further execution
        }
        
        // Check for combat end (Defeat)
        if (newSectDefense <= 0) {
            setGameState(prev => {
                if (!prev) return null;
                return { ...prev, sectDefense: {...prev.sectDefense, current: 0}, gameOver: { isOver: true, reason: "Hộ Sơn Đại Trận đã bị phá vỡ. Bầy yêu thú tràn vào tông môn, và thành trì cuối cùng của ngươi đã bị dập tắt." } }
            });
            return;
        }
    
        // 4. Update state for next turn
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                sectDefense: { ...prev.sectDefense, current: newSectDefense },
                combat: { 
                    ...prev.combat!, 
                    beasts: combatState.beasts, 
                    log: [...prev.combat!.log, ...turnLog], 
                    attackAnimations: newAnimations 
                }
            }
        });
    
    }, [gameState]);

    const handleStartTrial = useCallback(() => {
        if (!gameState) return;
        addNarrativeLog(`Ngươi quyết định bắt đầu Khảo Nghiệm cấp ${gameState.trialLevel}!`, true);
        const trialLevel = gameState.trialLevel;
        const beasts: DemonicBeast[] = [];
    
        const totalHordeSize = 5 + Math.floor(trialLevel * 1.5);

        let daiYeuCount = 0;
        if (trialLevel >= 12) {
            daiYeuCount = 2;
        } else if (trialLevel >= 8) {
            daiYeuCount = 1;
        }

        let caoGiaiCount = 0;
        if (trialLevel >= 5) {
            caoGiaiCount = Math.max(1, Math.floor((trialLevel - 2) / 3)); // 1 at lvl 5, 2 at lvl 8...
        }

        let trungGiaiCount = 0;
        if (trialLevel >= 3) {
            trungGiaiCount = Math.max(1, Math.floor((trialLevel - 1) / 2)); // 1 at lvl 3, 2 at lvl 5...
        }

        const specialBeastCount = daiYeuCount + caoGiaiCount + trungGiaiCount;
        const soGiaiCount = Math.max(0, totalHordeSize - specialBeastCount);

        // Add Đại Yêu Thú
        for (let i = 0; i < daiYeuCount; i++) {
            const hp = 300 + (trialLevel * 20);
            beasts.push({
                id: `${DemonicBeastTier.DaiYeu}-${uuidv4()}`,
                name: 'Đại Yêu Thú',
                tier: DemonicBeastTier.DaiYeu,
                hp: { current: hp, max: hp },
                attack: 40 + (trialLevel * 3),
                speed: BEAST_BASE_SPEED - 2,
                position: COMBAT_DISTANCE,
            });
        }

        // Add Cao Giai
        for (let i = 0; i < caoGiaiCount; i++) {
            const hp = 100 + (trialLevel * 10);
            beasts.push({
                id: `${DemonicBeastTier.CaoGiai}-${uuidv4()}`,
                name: 'Yêu Thú Cao Giai',
                tier: DemonicBeastTier.CaoGiai,
                hp: { current: hp, max: hp },
                attack: 20 + (trialLevel * 2),
                speed: BEAST_BASE_SPEED,
                position: COMBAT_DISTANCE,
            });
        }

        // Add Trung Giai
        for (let i = 0; i < trungGiaiCount; i++) {
            const hp = 50 + (trialLevel * 7);
            beasts.push({
                id: `${DemonicBeastTier.TrungGiai}-${uuidv4()}`,
                name: 'Yêu Thú Trung Giai',
                tier: DemonicBeastTier.TrungGiai,
                hp: { current: hp, max: hp },
                attack: 10 + (trialLevel * 1.5),
                speed: BEAST_BASE_SPEED + 1,
                position: COMBAT_DISTANCE,
            });
        }

        // Add Sơ Giai
        for (let i = 0; i < soGiaiCount; i++) {
            const hp = BEAST_BASE_HP + (trialLevel * 5);
            beasts.push({
                id: `${DemonicBeastTier.SoGiai}-${uuidv4()}`,
                name: 'Yêu Thú Sơ Giai',
                tier: DemonicBeastTier.SoGiai,
                hp: { current: hp, max: hp },
                attack: BEAST_BASE_ATTACK + Math.floor(trialLevel * 1.2),
                speed: BEAST_BASE_SPEED + (Math.random() * 4 - 2),
                position: COMBAT_DISTANCE,
            });
        }

        const defenders = gameState.characters.filter(c => c.isDefender && c.status !== CharacterStatus.TửVong);
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                combat: { type: 'trial', active: true, beasts, defenders, distanceToSect: COMBAT_DISTANCE, log: [`Một bầy yêu thú xuất hiện cho Khảo Nghiệm cấp ${trialLevel}!`], attackAnimations: [] }
            }
        });
    }, [gameState, addNarrativeLog]);


    const handleStartTrialStage = useCallback((stageNumber: number) => {
        if (!gameState) return;
        
        const stageData = TRIAL_STAGES.find(s => s.stage === stageNumber);
        if (!stageData) {
            console.error(`Không tìm thấy dữ liệu cho ải ${stageNumber}`);
            return;
        }

        addNarrativeLog(`Thử thách Ải Thí Luyện ${stageNumber} bắt đầu!`, true);
        setIsTrialStagesViewOpen(false); // Close the selection view

        const beasts: DemonicBeast[] = [];
        stageData.enemies.forEach(enemyInfo => {
            for (let i = 0; i < enemyInfo.count; i++) {
                let hp, attack, speed, name;
                switch (enemyInfo.tier) {
                    case DemonicBeastTier.TrungGiai:
                        hp = 50 + (stageNumber * 7);
                        attack = 10 + (stageNumber * 1.5);
                        speed = BEAST_BASE_SPEED + 1;
                        name = 'Yêu Thú Trung Giai';
                        break;
                    case DemonicBeastTier.CaoGiai:
                        hp = 100 + (stageNumber * 10);
                        attack = 20 + (stageNumber * 2);
                        speed = BEAST_BASE_SPEED;
                        name = 'Yêu Thú Cao Giai';
                        break;
                    case DemonicBeastTier.DaiYeu:
                         hp = 300 + (stageNumber * 20);
                         attack = 40 + (stageNumber * 3);
                         speed = BEAST_BASE_SPEED - 2;
                         name = 'Đại Yêu Thú';
                         break;
                    case DemonicBeastTier.SoGiai:
                    default:
                         hp = BEAST_BASE_HP + (stageNumber * 5);
                         attack = BEAST_BASE_ATTACK + Math.floor(stageNumber * 1.2);
                         speed = BEAST_BASE_SPEED + (Math.random() * 4 - 2);
                         name = 'Yêu Thú Sơ Giai';
                         break;
                }
                beasts.push({
                    id: `${enemyInfo.tier}-${uuidv4()}`,
                    name,
                    tier: enemyInfo.tier,
                    hp: { current: hp, max: hp },
                    attack,
                    speed,
                    position: COMBAT_DISTANCE,
                });
            }
        });

        const defenders = gameState.characters.filter(c => c.isDefender && c.status !== CharacterStatus.TửVong);
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                combat: { 
                    type: 'stage',
                    stageLevel: stageNumber,
                    active: true, 
                    beasts, 
                    defenders, 
                    distanceToSect: COMBAT_DISTANCE, 
                    log: [`Bắt đầu Ải Thí Luyện ${stageNumber}!`], 
                    attackAnimations: [] 
                }
            }
        });

    }, [gameState, addNarrativeLog]);


    // New World Exploration Handlers
    const handleStartWorldExploration = useCallback(async () => {
        if (!gameState) return;
        setIsLoading(true);
        
        let tempState = { ...gameState };
        tempState.characters = tempState.characters.map(c => c.isPlayer ? { ...c, status: CharacterStatus.LịchLuyện } : c);

        try {
            const scene = await geminiService.generateWorldExplorationScene(tempState);
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    characters: prev.characters.map(c => c.isPlayer ? { ...c, status: CharacterStatus.LịchLuyện } : c),
                    worldExploration: {
                        isActive: true,
                        narrative: scene.narrative,
                        options: scene.options || [],
                        log: [{ id: uuidv4(), message: scene.narrative }],
                        companionId: null
                    }
                }
            });
            addNarrativeLog(`${gameState.characters.find(c => c.isPlayer)?.name} ra ngoài lịch luyện.`, true);
        } catch (error) {
            console.error(error);
            addNarrativeLog("Một cảm giác bất an ngăn ngươi ở cổng. Ngươi quyết định ở lại tông môn.");
        } finally {
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog]);

    const handleWorldExplorationChoice = useCallback(async (choice: string) => {
        if (!gameState) return;
        setIsLoading(true);
        try {
            const scene = await geminiService.generateWorldExplorationScene(gameState, choice);
            if (scene.updates) applyUpdates(scene.updates);
            if (scene.itemsFound) applyItemsFound(scene.itemsFound as Omit<Item, 'id'>[]);
            if (scene.relationshipUpdates) applyRelationshipUpdates(scene.relationshipUpdates);
            
            setGameState(prev => {
                if (!prev) return null;
                const xpGained = 25;
                const levelUpLogs: string[] = [];
                const updatedCharacters = prev.characters.map(char => {
                    if (char.isPlayer || char.id === prev.worldExploration.companionId) {
                        const { updatedCharacter, logMessage } = gainXpAndLevelUp(char, xpGained);
                        if (logMessage) levelUpLogs.push(logMessage);
                        return updatedCharacter;
                    }
                    return char;
                });
                const newLogEntries = levelUpLogs.map(msg => ({
                    id: uuidv4(),
                    day: prev.day,
                    time: prev.timeOfDay,
                    message: msg,
                    isStory: true,
                }));

                return {
                    ...prev,
                    characters: updatedCharacters,
                    worldExploration: {
                        ...prev.worldExploration,
                        narrative: scene.narrative,
                        options: scene.options || [],
                        log: [...prev.worldExploration.log, { id: uuidv4(), message: `> ${choice}` }, { id: uuidv4(), message: scene.narrative }]
                    },
                    narrativeLog: [...prev.narrativeLog, ...newLogEntries]
                };
            });

        } catch (error) {
            console.error(error);
            addNarrativeLog("Ngươi do dự, và cơ hội đã mất. Con đường phía trước không rõ ràng.");
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    worldExploration: {
                        ...prev.worldExploration,
                        narrative: "Một sự im lặng đáng lo ngại bao trùm. Lựa chọn trước đó của ngươi đã dẫn đến ngõ cụt. Ngươi phải quyết định phải làm gì tiếp theo.",
                        options: ["Cố gắng quay lại.", "Quan sát xung quanh.", "Ẩn nấp một lúc."]
                    }
                }
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog, applyUpdates, applyItemsFound, applyRelationshipUpdates]);
    
    const handleEndWorldExploration = useCallback(async () => {
        if (!gameState) return;
        setIsLoading(true);
    
        const logToSummarize = gameState.worldExploration.log;
        let summaryText: string | null = null;
        let summaryLogMessage: string | null = null;
    
        if (logToSummarize && logToSummarize.length > 2) {
            try {
                const result = await geminiService.summarizeWorldExploration(logToSummarize);
                summaryText = `Ngày ${gameState.day}: ${result.summary}`;
                summaryLogMessage = `(Ký Ức Chuyến Đi) ${result.summary}`;
            } catch (error) {
                console.error("Failed to summarize exploration:", error);
                summaryLogMessage = "Hành trình kết thúc, nhưng những ký ức dường như mơ hồ, khó nắm bắt.";
            }
        }
        
        const player = gameState.characters.find(c => c.isPlayer);
        const companionId = gameState.worldExploration.companionId;
        const companion = companionId ? gameState.characters.find(c => c.id === companionId) : null;
    
        let returnMessage = `${player?.name || 'Ngươi'} trở về tông môn.`;
        if (companion) {
            returnMessage = `${player?.name || 'Ngươi'} và ${companion.name} trở về tông môn.`;
        }
    
        setGameState(prev => {
            if (!prev) return null;
            const newSummaries = summaryText ? [...prev.worldExplorationSummaries, summaryText] : prev.worldExplorationSummaries;
            
            const newLogEntries: NarrativeEvent[] = [];
            if (summaryLogMessage) {
                newLogEntries.push({ id: uuidv4(), day: prev.day, time: prev.timeOfDay, message: summaryLogMessage, isStory: true });
            }
            newLogEntries.push({ id: uuidv4(), day: prev.day, time: prev.timeOfDay, message: returnMessage, isStory: true });
    
            return {
                ...prev,
                narrativeLog: [...prev.narrativeLog, ...newLogEntries],
                worldExplorationSummaries: newSummaries,
                worldExploration: { isActive: false, narrative: '', options: [], log: [], companionId: null },
                characters: prev.characters.map(c => 
                    (c.isPlayer || c.id === companionId) ? { ...c, status: CharacterStatus.TĩnhTu } : c
                )
            };
        });
        
        setIsLoading(false);
    }, [gameState]);

    // Sect Story Handlers
    const handleStartSectStory = useCallback(async () => {
        if (!gameState) return;
        // If a story for the current day already exists, just activate the view
        if (gameState.sectStory && gameState.sectStory.log.length > 0) {
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    sectStory: { ...prev.sectStory, isActive: true }
                }
            });
            return;
        }
    
        // Otherwise, generate the first scene for the day
        setIsLoading(true);
        try {
            const scene = await geminiService.generateSectStoryScene(gameState);
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    sectStory: {
                        isActive: true,
                        narrative: scene.narrative,
                        options: scene.options || [],
                        log: [{ id: uuidv4(), message: scene.narrative }],
                    }
                }
            });
            addNarrativeLog(`Ngươi dành thời gian quan sát diễn biến trong tông môn.`, true);
        } catch (error) {
            console.error(error);
            addNarrativeLog("Tông môn yên tĩnh đến lạ thường. Dường như không có gì đáng chú ý xảy ra.");
        } finally {
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog]);

    const handleSectStoryChoice = useCallback(async (choice: string) => {
        if (!gameState) return;
        setIsLoading(true);
        try {
            const scene = await geminiService.generateSectStoryScene(gameState, choice);
            if (scene.updates) applyUpdates(scene.updates);
            if (scene.itemsFound) applyItemsFound(scene.itemsFound as Omit<Item, 'id'>[]);
            if (scene.relationshipUpdates) applyRelationshipUpdates(scene.relationshipUpdates);
            
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    sectStory: {
                        ...prev.sectStory,
                        narrative: scene.narrative,
                        options: scene.options || [],
                        log: [...prev.sectStory.log, { id: uuidv4(), message: `> ${choice}` }, { id: uuidv4(), message: scene.narrative }]
                    }
                }
            });

        } catch (error) {
            console.error(error);
            addNarrativeLog("Hành động của ngươi không mang lại kết quả rõ ràng.");
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    sectStory: {
                        ...prev.sectStory,
                        narrative: "Không khí trở nên im lặng. Dường như không có gì thay đổi sau lựa chọn của ngươi. Ngươi nên làm gì tiếp theo?",
                        options: ["Tiếp tục quan sát từ xa.", "Tìm một nhóm đệ tử khác để theo dõi.", "Tập trung vào công việc của chính mình."]
                    }
                }
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog, applyUpdates, applyItemsFound, applyRelationshipUpdates]);
    
    const handleEndSectStory = useCallback(() => {
        addNarrativeLog("Ngươi tạm dừng quan sát và quay trở lại công việc của Tông Chủ.", true);
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                // Only deactivate the view, don't reset the story state for the day
                sectStory: { ...prev.sectStory, isActive: false },
            }
        });
    }, [addNarrativeLog]);

    // Interaction Handlers
    const handleStartInteraction = useCallback((characterId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                interaction: {
                    active: true,
                    characterId,
                    stage: 'selection',
                    scene: '',
                    options: [],
                    outcome: null,
                }
            }
        });
    }, []);
    
    const handleSelectInteractionType = useCallback(async (type: InteractionStage) => {
        if (!gameState?.interaction || !gameState.interaction.characterId) return;

        if (type === 'gifting') {
            setGameState(prev => {
                if (!prev) return null;
                return { ...prev, interaction: { ...prev.interaction!, stage: 'gifting' } }
            });
        } else if (type === 'chatting') {
            const character = gameState.characters.find(c => c.id === gameState.interaction!.characterId);
            if (!character) return;

            setIsLoading(true);
            try {
                const result = await geminiService.generateInteractionScene(gameState, character);
                setGameState(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        interaction: {
                            ...prev.interaction!,
                            stage: 'chatting',
                            scene: result.scene,
                            options: result.options || [],
                            outcome: null,
                        }
                    }
                });
            } catch (error) {
                console.error(error);
                addNarrativeLog("Đối phương dường như không muốn nói chuyện lúc này.");
                setGameState(prev => {
                    if (!prev) return null;
                    return { ...prev, interaction: null }
                });
            } finally {
                setIsLoading(false);
            }
        }
    }, [gameState, addNarrativeLog]);

    const handleGiftItem = useCallback((itemId: string) => {
        if (!gameState?.interaction?.characterId) return;

        const characterId = gameState.interaction.characterId;
        const item = gameState.inventory.find(i => i.id === itemId);
        const character = gameState.characters.find(c => c.id === characterId);

        if (!item || !character) return;
        
        const affinityGain = Math.floor(Math.random() * 5) + 1;

        setGameState(prev => {
            if (!prev) return null;
            const newCharacters = prev.characters.map(c => 
                c.id === characterId ? { ...c, affinity: c.affinity + affinityGain } : c
            );
            const newInventory = prev.inventory.filter(i => i.id !== itemId);
            return {
                ...prev,
                characters: newCharacters,
                inventory: newInventory,
                interaction: null,
            }
        });
        addNarrativeLog(`Ngươi tặng ${item.name} cho ${character.name}. Hảo cảm tăng ${affinityGain}.`);

    }, [gameState, addNarrativeLog]);

    const handleStartExploreTogether = useCallback(async () => {
        if (!gameState?.interaction?.characterId) return;
        const companionId = gameState.interaction.characterId;
        const player = gameState.characters.find(c => c.isPlayer);
        const companion = gameState.characters.find(c => c.id === companionId);

        if (!player || !companion) return;

        setIsLoading(true);
        let tempState: GameState = JSON.parse(JSON.stringify(gameState));
        // Fix: JSON.stringify converts Infinity to null. We must restore it.
        tempState.resources[ResourceType.LinhThạch].capacity = Infinity;
        tempState.resources[ResourceType.TànHồnYêuThú].capacity = Infinity;

        tempState.interaction = null;
        tempState.characters = tempState.characters.map(c => 
            (c.id === player.id || c.id === companionId) ? { ...c, status: CharacterStatus.LịchLuyện } : c
        );
        tempState.worldExploration.companionId = companionId;
        
        try {
            const scene = await geminiService.generateWorldExplorationScene(tempState);
            setGameState({
                ...tempState,
                worldExploration: {
                    ...tempState.worldExploration,
                    isActive: true,
                    narrative: scene.narrative,
                    options: scene.options,
                    log: [{ id: uuidv4(), message: scene.narrative }]
                }
            });
            addNarrativeLog(`${player.name} cùng ${companion.name} ra ngoài lịch luyện.`, true);
        } catch (error) {
            console.error(error);
            addNarrativeLog("Một cảm giác bất an ngăn các ngươi ở cổng. Chuyến đi bị hủy bỏ.");
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    characters: prev.characters.map(c => 
                        (c.isPlayer || c.id === companionId) ? { ...c, status: CharacterStatus.TĩnhTu } : c
                    ),
                    worldExploration: {
                        ...prev.worldExploration,
                        companionId: null,
                    }
                }
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog]);

    const handleInteractionChoice = useCallback(async (choice: string) => {
        if (!gameState?.interaction || !gameState.interaction.characterId) return;

        const character = gameState.characters.find(c => c.id === gameState.interaction!.characterId);
        if (!character) return;

        setIsLoading(true);
        try {
            const result = await geminiService.generateInteractionOutcome(gameState, character, choice);
            if (result.updates) {
                applyUpdates(result.updates);
            }
            if (result.relationshipUpdates) {
                applyRelationshipUpdates(result.relationshipUpdates);
            }
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    interaction: {
                        ...prev.interaction!,
                        scene: `${prev.interaction!.scene}\n\n> ${choice}`,
                        options: [],
                        outcome: result.outcome,
                    }
                }
            });
        } catch (error) {
            console.error(error);
            addNarrativeLog("Cuộc trò chuyện kết thúc một cách đột ngột.");
            setGameState(prev => {
                if (!prev) return null;
                return { ...prev, interaction: null }
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameState, addNarrativeLog, applyUpdates, applyRelationshipUpdates]);

    const handleEndInteraction = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            return { ...prev, interaction: null }
        });
    }, []);

    const handleAssignCharacterToBuilding = useCallback((buildingId: string, characterId: string) => {
        const blueprint = ALL_BUILDINGS.find(b => b.id === buildingId);
        if (!blueprint || !blueprint.workerStatus) return;

        setGameState(prev => {
            if (!prev) return null;
            const buildings = prev.buildings.map(b => {
                if (b.id === buildingId) {
                    return {
                        ...b,
                        assignedCharacterIds: [...(b.assignedCharacterIds || []), characterId]
                    };
                }
                return b;
            });
            const characters = prev.characters.map(c => {
                if (c.id === characterId) {
                    let updatedChar = { ...c, status: blueprint.workerStatus! };
                    if (buildingId === 'linh_tri') {
                        updatedChar.trainingEndDate = prev.day + 3;
                    }
                    return updatedChar;
                }
                return c;
            });

            return { ...prev, buildings, characters };
        });
    }, []);

    const handleUnassignCharacterFromBuilding = useCallback((buildingId: string, characterId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const character = prev.characters.find(c => c.id === characterId);
            if (character?.status === CharacterStatus.BếQuan) {
                addNarrativeLog(`${character.name} đang trong giai đoạn bế quan quan trọng, không thể bị làm phiền.`);
                return prev;
            }

            const buildings = prev.buildings.map(b => {
                if (b.id === buildingId) {
                    return {
                        ...b,
                        assignedCharacterIds: (b.assignedCharacterIds || []).filter(id => id !== characterId)
                    };
                }
                return b;
            });
            const characters = prev.characters.map(c => {
                if (c.id === characterId) {
                    return { ...c, status: CharacterStatus.TĩnhTu };
                }
                return c;
            });

            return { ...prev, buildings, characters };
        });
    }, [addNarrativeLog]);

    const handleAssignCharacterToRoom = useCallback((roomId: string, characterId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            let buildingId: string | undefined;
            // Unassign from old room if exists
            const characters = prev.characters.map(c => c.id === characterId ? {...c, roomId: roomId} : c);
            const buildings = prev.buildings.map(b => {
                const newRooms = b.rooms?.map(r => {
                    // Remove from old room
                    const newOccupants = r.occupantIds.filter(id => id !== characterId);
                    // Add to new room
                    if (r.id === roomId) {
                        newOccupants.push(characterId);
                        buildingId = b.id;
                    }
                    return { ...r, occupantIds: newOccupants };
                });
                return { ...b, rooms: newRooms };
            });

            if (!buildingId) return prev; // Should not happen

            return { ...prev, buildings, characters };
        });
    }, []);
    
    const handleUnassignCharacterFromRoom = useCallback((characterId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const character = prev.characters.find(c => c.id === characterId);
            if (!character || !character.roomId) return prev;

            const characters = prev.characters.map(c => c.id === characterId ? {...c, roomId: null} : c);
            const buildings = prev.buildings.map(b => {
                const newRooms = b.rooms?.map(r => {
                    if (r.id === character.roomId) {
                        return { ...r, occupantIds: r.occupantIds.filter(id => id !== characterId) };
                    }
                    return r;
                });
                return { ...b, rooms: newRooms };
            });

            return { ...prev, buildings, characters };
        });
    }, []);

    const handleUseTechniqueScroll = useCallback((characterId: string, itemId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const item = prev.inventory.find(i => i.id === itemId);
            if (!item || !item.grantsAbility) return prev;

            const character = prev.characters.find(c => c.id === characterId);
            if (!character) return prev;
            
            const alreadyHasAbility = character.abilities.some(ab => ab.name === item.grantsAbility!.name);
            if (alreadyHasAbility) {
                console.log(`${character.name} đã biết công pháp này rồi.`);
                return prev;
            }

            const newCharacters = prev.characters.map(c =>
                c.id === characterId
                    ? { ...c, abilities: [...c.abilities, item.grantsAbility!] }
                    : c
            );
            const newInventory = prev.inventory.filter(i => i.id !== itemId);
            
            console.log(`${character.name} đã học được [${item.grantsAbility.name}]!`);


            return { ...prev, characters: newCharacters, inventory: newInventory };
        });
        
        setTimeout(() => {
            const item = gameState?.inventory.find(i => i.id === itemId);
            const character = gameState?.characters.find(c => c.id === characterId);
             if (item && character && item.grantsAbility) {
                addNarrativeLog(`${character.name} đã học được [${item.grantsAbility.name}]!`);
            }
        }, 0);

    }, [addNarrativeLog, gameState]);
    
    const handleUseItem = useCallback((characterId: string, itemId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const itemIndex = prev.inventory.findIndex(i => i.id === itemId);
            if (itemIndex === -1) return prev;

            const item = prev.inventory[itemIndex];
            if (!item.onUseEffect) return prev;
            
            const charIndex = prev.characters.findIndex(c => c.id === characterId);
            if (charIndex === -1) return prev;

            const newCharacters = [...prev.characters];
            const newInventory = [...prev.inventory];
            const character = { ...newCharacters[charIndex] };

            let effectApplied = false;
            let logMessage = '';

            // Handle Bách Cơ Đan
            if (item.onUseEffect.type === 'RANDOM_SKILL_BOOST') {
                const skills: (keyof Skills)[] = ['thámHiểm', 'luyệnKhí', 'chiếnĐấu', 'luyệnĐan'];
                const randomSkill = skills[Math.floor(Math.random() * skills.length)];
                character.skills[randomSkill] += item.onUseEffect.value;
                effectApplied = true;
                logMessage = `${character.name} đã sử dụng ${item.name}, ${randomSkill} tăng ${item.onUseEffect.value} điểm!`;
            }

            if (effectApplied) {
                newCharacters[charIndex] = character;
                newInventory.splice(itemIndex, 1);
                
                // Add log message via timeout to prevent state update issues in render
                setTimeout(() => addNarrativeLog(logMessage, true), 0);

                return { ...prev, characters: newCharacters, inventory: newInventory };
            }

            return prev;
        });
    }, [addNarrativeLog]);


    // Game over checks
    useEffect(() => {
        if (!gameState || gameState.gameOver.isOver) return;

        if (gameState.morale.current <= 0) {
            setGameState(prev => prev ? { ...prev, gameOver: { isOver: true, reason: "Hy vọng đã mất. Các đệ tử tan tác, bỏ lại tông môn cho số phận." } } : null);
        }
        if (gameState.sectDefense.current <= 0) {
            setGameState(prev => prev ? {...prev, gameOver: { isOver: true, reason: "Hộ Sơn Đại Trận đã bị phá vỡ. Bầy yêu thú tràn vào tông môn, và thành trì cuối cùng của ngươi đã bị dập tắt." }} : null);
        }
        // Could add more checks here (e.g., starvation, all characters dead)
    }, [gameState]);

     // Combat loop driver
    useEffect(() => {
        if (gameState?.combat?.active && !gameState.gameOver.isOver) {
            const combatTimer = setTimeout(() => {
                runCombatTurn();
            }, 1000); // 1 second per turn
            return () => clearTimeout(combatTimer);
        }
    }, [gameState, runCombatTurn]);


    const handleRestart = () => setGameState(null);
    
    if (!gameState) {
        return <SetupView onGameStart={handleGameStart} />;
    }

    const playerCharacter = gameState.characters.find(c => c.isPlayer);

    const renderView = () => {
        if (gameState.gameOver.isOver) {
            return <GameOverView reason={gameState.gameOver.reason} onRestart={handleRestart} />;
        }
        if (gameState.combat?.active) {
            return <CombatView combat={gameState.combat} sectDefense={gameState.sectDefense} />;
        }
        if (gameState.sectStory.isActive) {
            return <SectStoryView
                storyState={gameState.sectStory}
                player={playerCharacter!}
                onMakeChoice={handleSectStoryChoice}
                onEndStory={handleEndSectStory}
            />;
        }
        if (gameState.interaction?.active) {
            return <InteractionView 
                gameState={gameState} 
                onSelectInteractionType={handleSelectInteractionType}
                onGiftItem={handleGiftItem}
                onStartExploreTogether={handleStartExploreTogether}
                onMakeChoice={handleInteractionChoice}
                onEndInteraction={handleEndInteraction}
            />;
        }
        if (gameState.worldExploration.isActive) {
            return <WorldExplorationView
                exploration={gameState.worldExploration}
                player={playerCharacter!}
                onMakeChoice={handleWorldExplorationChoice}
                onReturnToBase={handleEndWorldExploration}
            />;
        }
        if (gameState.exploration.active) {
            return <ExplorationView exploration={gameState.exploration} onMakeChoice={handleExplorationChoice} />;
        }
        const canEndTurn = !gameState.exploration.active && !gameState.combat?.active;
        return <BaseView 
            gameState={gameState} 
            onAssignCharacter={handleAssignCharacter} 
            onToggleDefender={handleToggleDefender} 
            onUpgradeBuilding={handleUpgradeBuilding} 
            // Fix: Pass handleBuildBuilding function to the onBuildBuilding prop.
            onBuildBuilding={handleBuildBuilding} 
            onNextDay={canEndTurn ? handleNextTimeOfDay : () => {}} 
            onStartTrial={handleStartTrial} 
            onStartTrialStages={() => setIsTrialStagesViewOpen(true)}
            onUseAltar={handleUseAltar}
            onTestUseAltar={handleTestAltar}
            onTestResources={handleTestResources}
            onUnequipItem={handleUnequipItem}
            onOpenPlayerHub={() => setIsPlayerHubOpen(true)}
            onStartWorldExploration={handleStartWorldExploration}
            onStartSectStory={handleStartSectStory}
            onInteract={handleStartInteraction}
            onAssignCharacterToBuilding={handleAssignCharacterToBuilding}
            onUnassignCharacterFromBuilding={handleUnassignCharacterFromBuilding}
            onAssignCharacterToRoom={handleAssignCharacterToRoom}
            onUnassignCharacterFromRoom={handleUnassignCharacterFromRoom}
        />;
    };

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
            {isLoading && <LoadingSpinner />}
            {gachaResult && (
                <GachaResultView
                    disciple={gachaResult}
                    onClose={() => setGachaResult(null)}
                />
            )}
            {isTrialStagesViewOpen && (
                <TrialStagesView
                    highestStageCleared={gameState.highestTrialStageCleared}
                    onStartStage={handleStartTrialStage}
                    onClose={() => setIsTrialStagesViewOpen(false)}
                />
            )}
            {isPlayerHubOpen && playerCharacter && (
                <PlayerHub
                    player={playerCharacter}
                    inventory={gameState.inventory}
                    inventoryCapacity={gameState.inventoryCapacity}
                    characters={gameState.characters}
                    onEquipItem={handleEquipItem}
                    onUnequipItem={handleUnequipItem}
                    onUseTechniqueScroll={handleUseTechniqueScroll}
                    onUseItem={handleUseItem}
                    onClose={() => setIsPlayerHubOpen(false)}
                />
            )}
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {renderView()}
                    </div>
                    <div>
                        <NarrativeLog log={gameState.narrativeLog} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;