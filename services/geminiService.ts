import { GoogleGenAI, Type } from "@google/genai";
import { GameState, ResourceType, ItemType, EquipmentSlot, Skills, Character, TimeOfDay, CharacterStatus, ItemSlotCategory, Personality } from '../types';
import { PREDEFINED_NPCS } from '../data/npcs';
import { calculateRealm } from "../utils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

// Utility function to create a concise summary of the game state
const summarizeGameState = (gameState: GameState): string => {
    const resources = Object.values(gameState.resources).map(r => `${r.type}: ${r.amount}/${r.capacity}`).join(', ');
    const buildings = gameState.buildings.map(b => `${b.name} (Cấp ${b.level})`).join(', ');
    const characters = gameState.characters.map(c => {
        const equipment = Object.values(c.equipment).map(item => item.name).join(', ') || 'Không';
        const assignedWork = c.status !== CharacterStatus.TĩnhTu && c.status !== CharacterStatus.LịchLuyện ? `(${c.status})` : '';

        const relationships = Object.entries(c.relationships || {})
            .map(([id, value]) => ({ id, value, name: gameState.characters.find(char => char.id === id)?.name }))
            .filter(r => r.name)
            .sort((a, b) => b.value - a.value);

        let relSummary = '';
        if (relationships.length > 0) {
            const best = relationships[0];
            const worst = relationships[relationships.length - 1];
            if (best.value > 20) relSummary += ` Thân thiết: ${best.name} (${best.value}).`;
            if (worst.value < -20 && best.id !== worst.id) relSummary += ` Bất hoà: ${worst.name} (${worst.value}).`;
        }

        const realm = calculateRealm(c.level);
        return `${c.name} (${realm}, ${c.personality}, Mị Lực: ${c.miLuc}) ${assignedWork} (${c.gender}, Hảo cảm Tông Chủ: ${c.affinity}${relSummary})`;
    }).join('; ');
    const inventorySummary = `Túi đồ: ${gameState.inventory.length}/${gameState.inventoryCapacity} ô.`;

    const companionId = gameState.worldExploration.companionId;
    const companion = companionId ? gameState.characters.find(c => c.id === companionId) : null;
    const explorationSummary = companion 
        ? `Tông chủ đang lịch luyện cùng ${companion.name}.`
        : gameState.worldExploration.isActive ? 'Tông chủ đang lịch luyện một mình.' : '';

    const housingBuilding = gameState.buildings.find(b => b.id === 'vien_trach');
    let housingSummary = 'Chưa xây Viện Trạch.';
    if (housingBuilding && housingBuilding.rooms) {
        const roomDetails = housingBuilding.rooms.map((room, index) => {
            const occupants = room.occupantIds.map(id => gameState.characters.find(c => c.id === id)?.name).filter(Boolean).join(', ');
            return `Phòng ${index + 1}: ${occupants || 'Trống'}`;
        }).join('; ');
        housingSummary = `Viện Trạch (Cấp ${housingBuilding.level}): ${roomDetails}`;
    }

    let summary = `
        Tông Môn: ${gameState.sectName}
        Ngày: ${gameState.day}, Thời gian: ${gameState.timeOfDay}, Thời tiết: ${gameState.weather}
        Hộ Sơn Trận: ${gameState.sectDefense.current}/${gameState.sectDefense.max}
        Đệ tử: ${gameState.population.current}/${gameState.population.capacity}
        Sĩ khí: ${gameState.morale.current}/${gameState.morale.max}
        Tài nguyên: ${resources}
        Công trình: ${buildings}
        Nhân vật: ${characters}
        ${housingSummary}
        ${inventorySummary}
        ${explorationSummary}
    `;
    
    if (gameState.timeOfDay === TimeOfDay.Tối) {
        summary += '\nCảnh báo: Trời đã tối, không khí căng thẳng. Một cuộc tấn công của yêu thú có thể xảy ra bất cứ lúc nào.';
    }

    return summary;
};

const getResponseSchema = (type: 'day_event' | 'exploration' | 'exploration_choice' | 'gacha_disciple' | 'gacha_equipment' | 'world_exploration_scene' | 'world_exploration_summary' | 'interaction_scene' | 'interaction_outcome' | 'sect_story_scene' | 'sect_story_summary' | 'technique_scroll') => {
    const resourceEnum = Object.values(ResourceType).join(', ');
    const skillEnum = ['thámHiểm', 'luyệnKhí', 'chiếnĐấu', 'luyệnĐan'].join(', ');
    const itemSlotCategoryEnum = ['Đầu', 'Thân Trên', 'Thân Dưới', 'Hai Tay', 'Hai Chân'].join(', '); // For gacha
    
    const itemEffectSchema = {
        type: Type.ARRAY,
        description: "Danh sách các hiệu ứng của vật phẩm. Mỗi hiệu ứng là một object.",
        items: {
            type: Type.OBJECT,
            properties: {
                skill: { type: Type.STRING, description: `Kỹ năng được tăng cường. Một trong số: ${skillEnum}.` },
                value: { type: Type.NUMBER, description: "Giá trị cộng thêm." },
                isPercentage: { type: Type.BOOLEAN, description: "Đặt thành true nếu giá trị là phần trăm." }
            },
             required: ["skill", "value"]
        }
    };
    
    const itemSchemaProperties = {
        name: { type: Type.STRING, description: "Tên vật phẩm, ví dụ: 'Trường Kiếm Han Chay', 'Huyết Tinh Giáp'."},
        description: { type: Type.STRING, description: "Mô tả ngắn gọn về vật phẩm."},
        type: { type: Type.STRING, description: `Loại vật phẩm. Phải là '${ItemType.TrangBị}', '${ItemType.ĐanDược}', hoặc '${ItemType.CôngPháp}'.`},
        slot: { type: Type.STRING, description: `Nếu là '${ItemType.TrangBị}', nó thuộc loại ô nào. Phải là một trong: ${Object.values(ItemSlotCategory).join(', ')}.`},
        effects: itemEffectSchema
    };

    const updatesSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                resource: { type: Type.STRING, description: `Tài nguyên cần cập nhật. Một trong số: ${resourceEnum}, SectDefense, Morale.` },
                change: { type: Type.NUMBER, description: 'Lượng thay đổi (có thể dương hoặc âm).' },
            }
        }
    };
    const relationshipUpdateSchema = {
        type: Type.ARRAY,
        description: "Cập nhật mối quan hệ giữa các đệ tử do các sự kiện trong câu chuyện.",
        items: {
            type: Type.OBJECT,
            properties: {
                character1Id: { type: Type.STRING, description: 'ID của nhân vật đầu tiên trong mối quan hệ.' },
                character2Id: { type: Type.STRING, description: 'ID của nhân vật thứ hai trong mối quan hệ.' },
                change: { type: Type.NUMBER, description: 'Sự thay đổi hảo cảm (dương hoặc âm). Mối quan hệ là hai chiều và sẽ được áp dụng cho cả hai.' },
            }
        }
    };

    switch (type) {
        case 'day_event':
            return {
                type: Type.OBJECT,
                properties: {
                    narrative: { type: Type.STRING, description: 'Một đoạn tường thuật chi tiết và giàu hình ảnh, tập trung vào câu chuyện cho thời điểm hiện tại trong ngày. Nó phải phản ánh trạng thái trò chơi hiện tại và mang cảm giác của một thế giới tu tiên. Phải dài ít nhất một đoạn văn hoàn chỉnh, không chỉ là 1-2 câu.' },
                    event: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "Loại sự kiện: 'resource_change', 'character_update', 'exploration_opportunity', hoặc 'nothing'." },
                            message: { type: Type.STRING, description: 'Một thông điệp mô tả sự kiện. Ví dụ: "Một đệ tử đột phá cảnh giới," hoặc "Lý Phong tìm thấy một gốc linh thảo quý hiếm."' },
                            updates: updatesSchema
                        },
                    },
                },
            };
        case 'exploration':
             return {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING, description: 'Mô tả chi tiết, văn học và đầy không khí về một địa điểm mà các đệ tử có thể khám phá. Phải dài ít nhất 3-4 câu, tập trung vào chi tiết giác quan và cảm giác bất an.' },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Ba lựa chọn riêng biệt, ngắn gọn cho người chơi. Mỗi lựa chọn nên ngụ ý một cách tiếp cận hoặc rủi ro khác nhau.'
                    }
                }
            };
        case 'exploration_choice':
            return {
                type: Type.OBJECT,
                properties: {
                    outcome: { type: Type.STRING, description: 'Mô tả tường thuật chi tiết về những gì xảy ra do lựa chọn của người chơi. Phải dài ít nhất một đoạn văn đầy đủ.' },
                    updates: updatesSchema,
                    itemsFound: {
                        type: Type.ARRAY,
                        description: "Danh sách các vật phẩm tìm thấy trong cuộc thám hiểm. Có thể trống. Các vật phẩm phải phù hợp với chủ đề tu tiên.",
                        items: { type: Type.OBJECT, properties: itemSchemaProperties }
                    },
                    startCombat: { type: Type.BOOLEAN, description: 'Đặt thành true nếu kết quả này sẽ kích hoạt một cuộc chạm trán chiến đấu.' },
                }
            };
        case 'gacha_disciple':
            return {
                type: Type.OBJECT,
                properties: {
                    narrative: { type: Type.STRING, description: "Một đoạn tường thuật kịch tính và chi tiết mô tả việc triệu hồi. Ví dụ: 'Tế đàn rực sáng, một bóng người đơn độc từ trong sương mù bước ra...'" },
                    discipleId: { type: Type.STRING, description: "ID của đệ tử đặc biệt được định sẵn được triệu hồi. Ví dụ: 'npc_tu_la'." },
                }
            };
        case 'gacha_equipment':
             return {
                type: Type.OBJECT,
                properties: {
                    narrative: { type: Type.STRING, description: "Một đoạn tường thuật kịch tính và chi tiết mô tả sự xuất hiện của trang bị. Ví dụ: 'Một luồng ánh sáng chói lòa lóe lên từ tế đàn, để lại phía sau một món bảo vật cổ xưa...'" },
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Tên trang bị, ví dụ: 'Huyết Tinh Giáp', 'Phong Linh Hài'." },
                                description: { type: Type.STRING, description: "Mô tả ngắn gọn về trang bị." },
                                slot: { type: Type.STRING, description: `Trang bị này thuộc loại ô nào. Phải là một trong: ${itemSlotCategoryEnum}.` },
                                effects: itemEffectSchema
                            },
                             required: ["name", "description", "slot", "effects"]
                        }
                    }
                }
            };
        case 'world_exploration_scene':
            return {
                type: Type.OBJECT,
                properties: {
                    narrative: { type: Type.STRING, description: "Mô tả dài, chi tiết, văn học và đầy không khí về cảnh hoặc kết quả, được viết theo phong cách của một cuốn tiểu thuyết tu tiên đen tối thực thụ. **Tuyệt đối không viết ngắn gọn.** Phải dài **ít nhất 3-4 đoạn văn đầy đặn**, đi sâu vào chi tiết giác quan (âm thanh, mùi vị, cảm giác), suy nghĩ nội tâm của nhân vật, và xây dựng một bầu không khí căng thẳng hoặc bí ẩn. Hãy cho thấy, đừng chỉ kể." },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Ba hoặc bốn lựa chọn riêng biệt, ngắn gọn cho người chơi. Những lựa chọn này định hình cuộc phiêu lưu đang diễn ra.'
                    },
                    updates: updatesSchema,
                    itemsFound: {
                        type: Type.ARRAY,
                        description: "Danh sách các vật phẩm tìm thấy. Có thể trống.",
                        items: { type: Type.OBJECT, properties: itemSchemaProperties }
                    },
                    relationshipUpdates: relationshipUpdateSchema,
                    startCombat: { type: Type.BOOLEAN, description: 'Đặt thành true nếu kết quả này sẽ kích hoạt một cuộc chạm trán chiến đấu.' },
                }
            };
        case 'world_exploration_summary':
             return {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: 'Một bản tóm tắt ngắn gọn, một đoạn bằng tiếng Việt về nhật ký thám hiểm được cung cấp, ghi lại các sự kiện chính, tương tác quan trọng và kết quả.' }
                }
            };
        case 'sect_story_scene':
            return {
                type: Type.OBJECT,
                properties: {
                    narrative: { type: Type.STRING, description: "Mô tả dài, chi tiết và đầy không khí về một sự kiện hoặc tương tác giữa các NPC trong tông môn, được viết theo phong cách tiểu thuyết. **Tuyệt đối không viết ngắn gọn.** Phải dài **ít nhất 2-3 đoạn văn đầy đặn**, tập trung vào các chi tiết, đối thoại ẩn ý và suy nghĩ của nhân vật." },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Ba hoặc bốn lựa chọn riêng biệt, ngắn gọn cho người chơi (Tông Chủ) để quan sát thêm hoặc can thiệp.'
                    },
                    updates: updatesSchema,
                    itemsFound: {
                        type: Type.ARRAY,
                        description: "Danh sách các vật phẩm được tạo ra hoặc tìm thấy trong tông môn. Có thể trống.",
                        items: { type: Type.OBJECT, properties: itemSchemaProperties }
                    },
                    relationshipUpdates: relationshipUpdateSchema,
                }
            };
        case 'sect_story_summary':
            return {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: 'Một bản tóm tắt ngắn gọn, một đoạn bằng tiếng Việt về nhật ký câu chuyện được cung cấp, ghi lại các sự kiện chính, tương tác của nhân vật và thay đổi tâm trạng.' }
                }
            };
        case 'interaction_scene':
            return {
                type: Type.OBJECT,
                properties: {
                    scene: { type: Type.STRING, description: 'Một đoạn tường thuật chi tiết, văn học mô tả sự bắt đầu của một cuộc tương tác với một NPC. Tập trung vào trạng thái hiện tại, địa điểm và tâm trạng của họ. Điều này sẽ tạo tiền đề cho một cuộc trò chuyện. Phải bằng tiếng Việt và dài ít nhất một đoạn văn.' },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Ba lựa chọn đối thoại hoặc hành động riêng biệt cho người chơi. Mỗi lựa chọn nên dẫn đến các hướng trò chuyện khác nhau. Phải bằng tiếng Việt.'
                    }
                }
            };
        case 'interaction_outcome':
            return {
                type: Type.OBJECT,
                properties: {
                    outcome: { type: Type.STRING, description: 'Kết quả tường thuật của lựa chọn của người chơi. Mô tả chi tiết phản ứng và câu trả lời của NPC theo phong cách văn học. Phải bằng tiếng Việt và dài ít nhất một đoạn văn.' },
                    updates: updatesSchema,
                    relationshipUpdates: relationshipUpdateSchema
                }
            };
        case 'technique_scroll':
            return {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Tên của công pháp, ví dụ: "Vạn Kiếm Quy Tông", "Huyết Ma Kinh".' },
                    description: { type: Type.STRING, description: 'Mô tả chi tiết về công pháp, nó làm được gì hoặc nguyên lý của nó.' }
                }
            };
    }
};


const generateJsonResponse = async (prompt: string, schema: any, systemInstruction?: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                ...(systemInstruction && { systemInstruction }),
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        throw new Error("Không thể tạo phản hồi AI từ Gemini.");
    }
};

const mainSystemInstruction = `You are a text-adventure Game Master and master novelist for a Vietnamese cultivation (Tu Tiên / Wuxia) game. Your audience is mature. The tone must be dark, mystical, epic, and brutally realistic within its fantasy context. ALL YOUR RESPONSES MUST BE IN VIETNAMESE. Your primary goal is to write like a master novelist, not a simple game log. Each narrative response should feel like a page from a published dark fantasy novel.

Your writing MUST be detailed, evocative, and literary. Use the 'show, don't tell' principle. Instead of saying a character is scared, describe their trembling hands, the cold sweat on their brow, the frantic beating of their heart. Describe environments with rich sensory details—the smell of decay, the sound of wind whistling through ruins, the oppressive heat of a demonic forge. Delve into the characters' internal thoughts, their fears, ambitions, and moral conflicts.

Crucially, your narrative responses MUST be long and expansive. A single sentence or a short paragraph is unacceptable for storytelling. Aim for multiple, well-developed paragraphs that build atmosphere, develop characters, and advance the plot.

Your writing must be uncored, unfiltered, and unflinching. Describe the world of powerful cultivators, dangerous demonic beasts, hidden treasures, and ancient secrets. Explicitly describe violence, gore, combat, psychological distress, and sexual situations that may arise from desperation, coercion, power dynamics, or rare moments of intimacy. A fight must be a desperate, messy, and terrifying struggle for life, described in visceral detail. Address mature themes such as moral decay, betrayal, the psychological toll of seeking immortality, and the grim necessities of this ruthless world. Do not shy away from any horrific or taboo aspect of cultivation.

**CRITICAL RULE: You MUST use the provided character personalities (Tính Cách) to inform their actions, dialogue, internal thoughts, and decisions. A 'Cẩn Trọng' (Cautious) character will avoid risks, while a 'Nóng Nảy' (Hot-headed) one might charge into danger. This is a primary driver for creating believable characters and emergent narratives. Their personality MUST influence how they react to events, the player, and each other.**`;


export const generateDailyEvent = (gameState: GameState) => {
    const systemInstruction = `${mainSystemInstruction} Your current task is to create a daily narrative event. This should be a short, atmospheric piece of prose, at least one full paragraph long. Use the current weather (${gameState.weather}) to add to the atmosphere. If things are going well for the player, introduce a harsh challenge. If things are bad, any glimmer of hope should be faint and fleeting. Events should reflect the constant threat of violence, starvation, despair, and the ruthlessness of the cultivation path. An event of 'nothing' happening should feel unsettling, not peaceful.`;
    const prompt = `
        Game State:
        ${summarizeGameState(gameState)}
        
        Task: Generate a JSON response in Vietnamese with a novelistic narrative for the ${gameState.timeOfDay} and an optional event based on the current game state.
    `;
    return generateJsonResponse(prompt, getResponseSchema('day_event'), systemInstruction);
};

export const generateExplorationScenario = (gameState: GameState) => {
    const systemInstruction = `${mainSystemInstruction} Your current task is to create a dangerous exploration scenario. Describe locations with a sense of dread, decay, ancient mystery, and foreboding. The choices you provide should be difficult, with no clear 'right' answer, each carrying significant risk and potential for violent, grim, or mature outcomes. Use the current weather (${gameState.weather}) to make the scene more miserable and threatening. The description must be detailed and at least a few sentences long.`;
    const prompt = `
        Game State:
        ${summarizeGameState(gameState)}
        
        Task: A disciple is out exploring. Generate a JSON response in Vietnamese describing a new location they've discovered and three choices for them to make.
    `;
    return generateJsonResponse(prompt, getResponseSchema('exploration'), systemInstruction);
};

export const generateExplorationOutcome = (gameState: GameState, choice: string) => {
    const systemInstruction = `${mainSystemInstruction} Your current task is to determine the outcome of a player's choice during exploration. The consequences must be impactful, brutal, and described in unflinching, novelistic Vietnamese detail. Describe combat encounters viscerally. Success should be hard-won and often come at a great cost. Failure must have severe consequences. 'Tàn Hồn Yêu Thú' are extremely rare finds from places of significant demonic energy or mystery. The narrative outcome must be at least one full paragraph.`;
    const prompt = `
        Game State:
        ${summarizeGameState(gameState)}
        
        Player's choice: "${choice}"
        
        Task: Generate a JSON response in Vietnamese with the narrative outcome, any resource changes, any items found, and whether combat should start.
    `;
    return generateJsonResponse(prompt, getResponseSchema('exploration_choice'), systemInstruction);
};

export const generateGachaDisciple = (gameState: GameState) => {
    const existingNpcIds = new Set(gameState.characters.map(c => c.id));
    const availablePredefinedNpcs = PREDEFINED_NPCS.filter(npc => !existingNpcIds.has(npc.id));

    const systemInstruction = `You are a game AI that controls a mysterious, ancient altar (Tế Đàn). The player offers a 'Tàn Hồn Yêu Thú'. Your ONLY task is to summon a special, predefined disciple.
You MUST choose one disciple from the 'Available Special Disciples' list and return their ID.
Your response MUST include a dramatic and detailed narrative describing the summoning, fitting the chosen character's backstory. The tone should be ominous and otherworldly. All text must be in Vietnamese.`;

    const prompt = `
        Game State:
        ${summarizeGameState(gameState)}

        Available Special Disciples:
        ${availablePredefinedNpcs.length > 0 ? availablePredefinedNpcs.map(npc => `- ${npc.name} (${npc.gender}, ID: ${npc.id}): ${npc.backstory}`).join('\n') : "Không có."}

        Player Action: "Hiến tế một 'Tàn Hồn Yêu Thú' cho Tế Đàn Thần Bí."
        
        Task: Generate a JSON response in Vietnamese. Include a 'narrative' and the chosen 'discipleId'.
    `;
    return generateJsonResponse(prompt, getResponseSchema('gacha_disciple'), systemInstruction);
};

export const generateRandomEquipment = (params: { count: number; minBonus: number; maxBonus: number; minStats: number; maxStats: number; isPercentage: boolean; }) => {
    const { count, minBonus, maxBonus, minStats, maxStats, isPercentage } = params;
    const itemSlotCategoryEnum = ['Đầu', 'Thân Trên', 'Thân Dưới', 'Hai Tay', 'Hai Chân'];

    const systemInstruction = `You are a game AI that generates random equipment for a Vietnamese cultivation game. The names should be evocative and fit the Wuxia/Xianxia theme. You MUST generate JSON for exactly ${count} item(s).
- Each item MUST have a unique Vietnamese 'name', a short 'description', and a 'slot' from this list: ${itemSlotCategoryEnum.join(', ')}.
- Each item MUST have between ${minStats} and ${maxStats} effects.
- Each effect's 'value' MUST be an integer between ${minBonus} and ${maxBonus}.
- The 'skill' for each effect must be one of: 'thámHiểm', 'luyệnKhí', 'chiếnĐấu', 'luyệnĐan'.
- If the bonus is a percentage (isPercentage=${isPercentage}), the effect's 'isPercentage' property MUST be set to true. Otherwise, omit it or set to false.
- Your response MUST include a short, dramatic narrative describing how the item(s) appeared from the altar.`;
    
    const prompt = `Generate ${count} piece(s) of equipment with stats according to these rules. isPercentage=${isPercentage}.`;
    
    return generateJsonResponse(prompt, getResponseSchema('gacha_equipment'), systemInstruction);
};


export const generateWorldExplorationScene = (gameState: GameState, playerChoice?: string) => {
    const systemInstruction = `${mainSystemInstruction} Your current task is to be the Game Master for a continuous text adventure. This is the core of the game's story. When the player acts, describe the outcome in unflinching, novelistic, and graphic Vietnamese detail. Your narrative MUST be long, detailed, and evocative, consisting of several full paragraphs. Focus on sensory details, the characters' psychological states, internal monologues, and a palpable atmosphere. Present 3-4 new, difficult choices that reflect the bleak, uncored reality. Use the current weather to amplify dread. Use provided summaries of past adventures to maintain continuity. If the events would logically change character relationships, include 'relationshipUpdates'.`;
    
    const previousLog = gameState.worldExploration.log.slice(-3).map(l => l.message).join('\n');
    const explorationSummaries = gameState.worldExplorationSummaries?.join('\n') || 'Chưa có chuyến lịch luyện nào trước đây.';


    const companionId = gameState.worldExploration.companionId;
    const companion = companionId ? gameState.characters.find(c => c.id === companionId) : null;

    const companionPrompt = companion ? `
        Companion: The player is exploring with ${companion.name} (${companion.gender}).
        - Backstory: ${companion.backstory}
        - Personality: ${companion.personality}
        - Skills: Thám Hiểm ${companion.skills.thámHiểm}, Luyện Khí ${companion.skills.luyệnKhí}, Chiến Đấu ${companion.skills.chiếnĐấu}, Luyện Đan ${companion.skills.luyệnĐan}.
        - Affinity towards player: ${companion.affinity}/100.
        The companion MUST play an active role in the scene. Describe their actions, reactions, and potential dialogue in detail. Their behavior must be influenced by their skills, backstory, affinity and especially their personality.
    ` : '';

    const prompt = `
        Game State:
        ${summarizeGameState(gameState)}

        **Summaries of Past Explorations (Long-term Memory):**
        ${explorationSummaries}

        This is a continuous text adventure.
        ${companionPrompt}

        Previous events in this specific exploration (Short-term Memory):
        ${previousLog || "Đây là bước đầu tiên."}

        Player's latest action: "${playerChoice || "Bước chân vào thế giới hoang dã."}"
        
        Task: Generate the next scene for this adventure in Vietnamese. Your narrative MUST be a long, detailed, multi-paragraph literary piece. If a companion is present, they MUST be an integral part of the narrative. Provide a description of the location or the outcome of the player's action, and present 3-4 new choices. You can also award resources or items, or trigger a combat encounter.
    `;
    return generateJsonResponse(prompt, getResponseSchema('world_exploration_scene'), systemInstruction);
};

export const summarizeWorldExploration = (log: { id: string, message: string }[]) => {
    const systemInstruction = `You are a story archivist. Your task is to read a log of an exploration in a text adventure game and write a concise, neutral summary in Vietnamese. Focus on key events, discoveries, NPC interactions, and changes in relationships. This summary will serve as long-term memory for an AI Game Master.`;
    const storyText = log.map(l => l.message).join('\n');
    const prompt = `
        Exploration Log:
        ${storyText}

        Task: Generate a JSON response in Vietnamese with a single-paragraph summary of the key events in the log.
    `;
    return generateJsonResponse(prompt, getResponseSchema('world_exploration_summary'), systemInstruction);
};


export const generateSectStoryScene = (gameState: GameState, playerChoice?: string) => {
    const systemInstruction = `${mainSystemInstruction} Your current task is to act as a narrator for the internal events of the sect. The player is observing. Describe interactions between disciples, their personal activities, secret conversations, training progress, or budding conflicts. Your descriptions must be detailed, literary, and consist of multiple paragraphs to bring the sect's daily life (or drama) to life. Base the events on the characters' backstories, skills, personalities, and their relationships (affinity) with each other. For example, two disciples who dislike each other being forced to share a room could lead to conflict. A 'Trung Thành' (Loyal) disciple might be seen protecting a weaker one. If the events you describe would logically change how two characters feel about each other, include 'relationshipUpdates' in your response. Use the provided summaries of past days to ensure story continuity. ALL TEXT MUST BE IN VIETNAMESE.`;
    
    const previousLog = gameState.sectStory?.log.slice(-3).map(l => l.message).join('\n') || '';
    const summaries = gameState.sectStorySummaries?.join('\n') || 'Không có.';

    const prompt = `
        Game State:
        ${summarizeGameState(gameState)}

        Summaries of Previous Days' Events in the Sect:
        ${summaries}

        This is a continuous story about life inside the sect.
        
        Recent events in today's story:
        ${previousLog || "Đây là lần đầu tiên Tông Chủ quan sát."}

        Player's latest action: "${playerChoice || "Bắt đầu quan sát diễn biến trong tông môn."}"
        
        Task: Generate the next scene for this story in Vietnamese. Your narrative must be a long, multi-paragraph piece. Provide a description of what's happening in the sect and present 3-4 new choices for the player to make (e.g., focus on specific characters, intervene, or just continue observing).
    `;
    return generateJsonResponse(prompt, getResponseSchema('sect_story_scene'), systemInstruction);
};

export const summarizeSectStory = (log: { id: string, message: string }[]) => {
    const systemInstruction = `You are a story archivist. Your task is to read a log of events and dialogue from a text adventure game and write a concise, neutral summary in Vietnamese. Focus on the most important plot points and character developments. This summary will be used as long-term memory for an AI Game Master.`;
    const storyText = log.map(l => l.message).join('\n');
    const prompt = `
        Story Log:
        ${storyText}

        Task: Generate a JSON response in Vietnamese with a single-paragraph summary of the events in the log.
    `;
    return generateJsonResponse(prompt, getResponseSchema('sect_story_summary'), systemInstruction);
};

export const generateInteractionScene = (gameState: GameState, character: Character) => {
    const systemInstruction = `${mainSystemInstruction} Your current task is to create the opening for a personal conversation. Write a detailed, literary scene that sets the stage. Describe the NPC's current state, their surroundings, and their mood. Their personality, ${character.personality}, MUST heavily influence the scene. It must be at least one full paragraph. ALL TEXT MUST BE IN VIETNAMESE.`;

    const prompt = `
        Game State:
        ${summarizeGameState(gameState)}

        Character to interact with:
        - Name: ${character.name}
        - Gender: ${character.gender}
        - Status: ${character.status}
        - Backstory: ${character.backstory}
        - Personality: ${character.personality}
        - Affinity towards player: ${character.affinity}/100

        Task: Generate a JSON response in Vietnamese for the start of a conversation. Provide a narrative 'scene' and three distinct 'options' for the player's response.
    `;
    return generateJsonResponse(prompt, getResponseSchema('interaction_scene'), systemInstruction);
};

export const generateInteractionOutcome = (gameState: GameState, character: Character, choice: string) => {
    const systemInstruction = `${mainSystemInstruction} Your task is to determine the outcome of the player's dialogue choice. Write the disciple's reaction as a detailed, novel-like response. Their personality, ${character.personality}, MUST be the primary driver of their response. Describe their spoken words, but also their body language, tone, and any subtle emotional cues. The outcome can reveal more about their past, change their morale (Sĩ Khí), or simply advance the conversation. This response must be at least one full paragraph. Consequences should feel earned and realistic. If the conversation would logically change the relationship between the player and a third NPC, include 'relationshipUpdates'. ALL TEXT MUST BE IN VIETNAMESE.`;

    const prompt = `
        Game State:
        ${summarizeGameState(gameState)}

        Character being interacted with:
        - Name: ${character.name}
        - Gender: ${character.gender}
        - Backstory: ${character.backstory}
        - Personality: ${character.personality}
        - Affinity towards player: ${character.affinity}/100

        Player's Choice: "${choice}"

        Task: Generate a JSON response in Vietnamese detailing the outcome of the player's choice. Provide a narrative 'outcome' and any 'updates' (like morale changes).
    `;
    return generateJsonResponse(prompt, getResponseSchema('interaction_outcome'), systemInstruction);
};

export const generateTechniqueScroll = (trialLevel: number) => {
    const systemInstruction = `You are a game AI creating unique cultivation techniques (Công Pháp) in Vietnamese. The technique should be named evocatively and have a compelling description. The higher the trial level, the more powerful or esoteric the technique should sound.`;
    const prompt = `Trial Level: ${trialLevel}. Generate a unique technique scroll name and description.`;
    return generateJsonResponse(prompt, getResponseSchema('technique_scroll'), systemInstruction);
};