// Fix: Provide full content for types.ts to define data structures for the application.
export enum ResourceType {
    LươngThực = 'Lương Thực',
    LinhThạch = 'Linh Thạch',
    LinhMộc = 'Linh Mộc',
    QuặngSắt = 'Quặng Sắt',
    ThảoDược = 'Thảo Dược',
    TànHồnYêuThú = 'Tàn Hồn Yêu Thú',
}

export enum CharacterStatus {
    TĩnhTu = 'Tĩnh Tu', // Idle
    LuyệnTập = 'Luyện Tập', // Training
    LuyệnKhí = 'Luyện Khí', // Crafting
    LuyệnĐan = 'Luyện Đan', // Alchemy
    TửVong = 'TửVong', // Dead
    LịchLuyện = 'Lịch Luyện', // Exploring
    LàmRuộng = 'Làm Ruộng', // Farming
    TrồngDược = 'Trồng Dược', // Herb gathering
    KhaiMỏ = 'Khai Mỏ', // Mining
    KhaiThácGỗ = 'Khai Thác Gỗ', // Logging
    TrậnPhápSư = 'Trận Pháp Sư', // Array Master
    BếQuan = 'Bế Quan', // Secluded Cultivation
}

export enum TimeOfDay {
    Sáng = 'Sáng',
    Trưa = 'Trưa',
    Chiều = 'Chiều',
    Tối = 'Tối',
}

export enum Weather {
    QuangTrời = 'Quang Trời',
    MưaPhùn = 'Mưa Phùn',
    SươngMù = 'Sương Mù',
    BãoTố = 'Bão Tố',
    NắngGắt = 'Nắng Gắt',
}

export enum ItemType {
    TrangBị = 'Trang Bị',
    ĐanDược = 'Đan Dược',
    CôngPháp = 'Công Pháp',
}

export enum ItemSlotCategory {
    Đầu = 'Đầu',
    ThânTrên = 'Thân Trên',
    ThânDưới = 'Thân Dưới',
    HaiTay = 'Hai Tay',
    HaiChân = 'Hai Chân',
    TrangSức = 'Trang Sức',
    PhápBảo = 'Pháp Bảo',
    VũKhí = 'Vũ Khí',
}

export enum EquipmentSlot {
    VũKhíChính = 'Vũ Khí Chính',
    VũKhíPhụ = 'Vũ Khí Phụ',
    Đầu = 'Đầu',
    ThânTrên = 'Thân Trên',
    ThânDưới = 'Thân Dưới',
    HaiTay = 'Hai Tay',
    HaiChân = 'Hai Chân',
    PhápBảo = 'Pháp Bảo',
    TrangSức1 = 'Trang Sức 1',
    TrangSức2 = 'Trang Sức 2',
}


export enum Gender {
    Nam = 'Nam',
    Nữ = 'Nữ',
}

export enum Personality {
    KiêuNgạo = 'Kiêu Ngạo',
    CẩnTrọng = 'Cẩn Trọng',
    TànNhẫn = 'Tàn Nhẫn',
    TrungThành = 'Trung Thành',
    PhóngKhoáng = 'Phóng Khoáng',
    ÂmTrầm = 'Âm Trầm',
    ChínhNghĩa = 'Chính Nghĩa',
    NóngNảy = 'Nóng Nảy',
    KiênĐịnh = 'Kiên Định',
}

export interface Ability {
    name: string;
    description: string;
}

export interface ItemEffect {
    skill: keyof Skills;
    value: number;
    isPercentage?: boolean;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    slot?: ItemSlotCategory;
    effects?: ItemEffect[];
    grantsAbility?: Ability;
    onUseEffect?: {
        type: 'RANDOM_SKILL_BOOST';
        value: number;
    };
}

export interface Resource {
    type: ResourceType;
    amount: number;
    capacity: number;
}

export type Resources = {
    [key in ResourceType]: Resource;
};

export interface Skills {
    thámHiểm: number; // scavenging
    luyệnKhí: number; // building
    chiếnĐấu: number; // combat
    luyệnĐan: number; // medical
}

export interface Character {
    id: string;
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    gender: Gender;
    avatar: string;
    cardImage?: string;
    status: CharacterStatus;
    skills: Skills;
    abilities: Ability[];
    isDefender: boolean;
    equipment: Partial<Record<EquipmentSlot, Item>>;
    isPlayer?: boolean;
    backstory?: string;
    appearance?: string;
    personality: Personality;
    miLuc: number; // Mị Lực / Charm
    affinity: number; // Hảo cảm with Player
    roomId: string | null;
    relationships: { [characterId: string]: number }; // Hảo cảm with other NPCs
    trainingEndDate?: number;
}

export interface Room {
    id: string;
    buildingId: string;
    capacity: number;
    occupantIds: string[];
}

export interface Building {
    id: string;
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    upgradeCost: { resource: ResourceType; amount: number }[];
    // For resource generation buildings
    generates?: ResourceType;
    workerCapacity?: number;
    assignedCharacterIds?: string[];
    workerStatus?: CharacterStatus;
    rooms?: Room[];
}

export interface NarrativeEvent {
    id: string;
    day: number;
    time: TimeOfDay;
    message: string;
    isStory: boolean;
}

export interface ExplorationState {
    active: boolean;
    prompt: string;
    options: string[];
    characterId: string | null;
}

export interface WorldExplorationState {
    isActive: boolean;
    narrative: string;
    options: string[];
    log: { id: string, message: string }[];
    companionId: string | null;
}

export interface SectStoryState {
    isActive: boolean;
    narrative: string;
    options: string[];
    log: { id: string, message: string }[];
}

export enum DemonicBeastTier {
    SoGiai = 'Sơ Giai',
    TrungGiai = 'Trung Giai',
    CaoGiai = 'Cao Giai',
    DaiYeu = 'Đại Yêu',
}


export interface DemonicBeast { // Formerly Zombie
    id: string;
    name: string;
    tier: DemonicBeastTier;
    hp: { current: number; max: number };
    attack: number;
    speed: number;
    position: number;
}

export interface AttackAnimation {
    id: string;
    defenderId: string;
    targetId: string;
}

export type InteractionStage = 'selection' | 'chatting' | 'gifting';

export interface InteractionState {
    active: boolean;
    characterId: string | null;
    stage: InteractionStage;
    scene?: string;
    options?: string[];
    outcome?: string | null;
}


export interface CombatState {
    active: boolean;
    type: 'trial' | 'stage';
    stageLevel?: number;
    beasts: DemonicBeast[]; // Formerly zombies
    defenders: Character[];
    distanceToSect: number; // Formerly distanceToWall
    log: string[];
    attackAnimations: AttackAnimation[];
}

export interface GameState {
    day: number;
    timeOfDay: TimeOfDay;
    weather: Weather;
    sectName: string;
    sectDefense: { current: number; max: number }; // Formerly wallHp
    population: { current: number; capacity: number };
    morale: { current: number; max: number };
    resources: Resources;
    buildings: Building[];
    characters: Character[];
    inventory: Item[];
    inventoryCapacity: number;
    exploration: ExplorationState;
    worldExploration: WorldExplorationState;
    worldExplorationSummaries: string[];
    sectStory: SectStoryState;
    sectStorySummaries: string[];
    interaction: InteractionState | null;
    combat: CombatState | null;
    gameOver: { isOver: boolean, reason: string };
    narrativeLog: NarrativeEvent[];
    trialLevel: number;
    highestTrialStageCleared: number;
}

export type SortCriteria = 'name' | 'affinity' | 'chiếnĐấu' | 'thámHiểm' | 'luyệnKhí' | 'luyệnĐan' | 'status';

// Gacha Reward Types
export type GachaRewardType = 'RESOURCES' | 'RESOURCES_PERCENT' | 'EQUIPMENT' | 'ITEM' | 'DISCIPLE' | 'COMBINATION';

export interface GachaReward {
    id: number;
    type: GachaRewardType;
    weight: number;
    payload: any;
}