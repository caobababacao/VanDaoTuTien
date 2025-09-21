// Fix: Provide full content for constants.ts to define game constants and initial data.
import { Building, ResourceType, TimeOfDay, Weather, CharacterStatus } from './types';

export const ALL_BUILDINGS: Building[] = [
    {
        id: 'ho_son_dai_tran',
        name: 'Hộ Sơn Đại Trận',
        description: 'Tăng cường phòng ngự cho tông môn, khiến yêu thú khó lòng đột phá.',
        level: 0,
        maxLevel: 10,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 20 }, { resource: ResourceType.LinhThạch, amount: 10 }],
    },
    {
        id: 'vien_trach',
        name: 'Viện Trạch',
        description: 'Cung cấp chỗ ở cho các đệ tử. Mỗi cấp tăng thêm một phòng, mỗi phòng chứa được 2 người. Không có phòng trống thì không thể chiêu mộ đệ tử mới.',
        level: 0,
        maxLevel: 5, // 5 rooms * 2 capacity = 10 disciple limit
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 40 }, { resource: ResourceType.QuặngSắt, amount: 20 }],
    },
    {
        id: 'luyen_khi_cac',
        name: 'Luyện Khí Các',
        description: 'Cho phép chế tạo pháp bảo và công cụ tốt hơn. Tăng hiệu quả thu thập Quặng Sắt.',
        level: 0,
        maxLevel: 5,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 15 }, { resource: ResourceType.QuặngSắt, amount: 25 }],
    },
    {
        id: 'dan_duoc_phong',
        name: 'Đan Dược Phòng',
        description: 'Chữa trị cho các đệ tử bị thương và cho phép luyện chế đan dược.',
        level: 0,
        maxLevel: 3,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 10 }, { resource: ResourceType.LinhThạch, amount: 10 }, { resource: ResourceType.ThảoDược, amount: 5 }],
    },
    {
        id: 'tu_linh_tran',
        name: 'Tụ Linh Trận',
        description: 'Duy trì trận pháp để thu thập Linh Thạch từ không khí. Yêu cầu một Trận Pháp Sư để vận hành.',
        level: 0,
        maxLevel: 5,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 10 }, { resource: ResourceType.LinhThạch, amount: 15 }],
        generates: ResourceType.LinhThạch,
        workerCapacity: 1,
        workerStatus: CharacterStatus.TrậnPhápSư,
    },
    {
        id: 'quan_tinh_dai',
        name: 'Quan Tinh Đài',
        description: 'Tăng cường độ chính xác của người phòng thủ và đưa ra cảnh báo sớm về các cuộc tấn công của thú triều.',
        level: 0,
        maxLevel: 3,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 30 }, { resource: ResourceType.LinhThạch, amount: 10 }],
    },
    {
        id: 'tang_bao_cac',
        name: 'Tàng Bảo Các',
        description: 'Tăng số lượng vật phẩm bạn có thể giữ trong túi đồ. Mỗi cấp độ cộng thêm +4 sức chứa.',
        level: 0,
        maxLevel: 5,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 20 }, { resource: ResourceType.QuặngSắt, amount: 20 }],
    },
     {
        id: 'linh_dien',
        name: 'Linh Điền',
        description: 'Trồng trọt linh cốc để sản xuất Lương Thực. Yêu cầu đệ tử trông coi.',
        level: 0,
        maxLevel: 5,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 15 }, { resource: ResourceType.LinhThạch, amount: 5 }],
        generates: ResourceType.LươngThực,
        workerCapacity: 2,
        workerStatus: CharacterStatus.LàmRuộng,
    },
    {
        id: 'duoc_vien',
        name: 'Dược Viên',
        description: 'Trồng các loại linh thảo quý hiếm để thu hoạch Thảo Dược. Yêu cầu đệ tử chăm sóc.',
        level: 0,
        maxLevel: 5,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 20 }, { resource: ResourceType.LươngThực, amount: 10 }],
        generates: ResourceType.ThảoDược,
        workerCapacity: 1,
        workerStatus: CharacterStatus.TrồngDược,
    },
    {
        id: 'mo_sat',
        name: 'Mỏ Sắt',
        description: 'Khai thác các loại khoáng thạch để thu được Quặng Sắt. Yêu cầu đệ tử làm việc.',
        level: 0,
        maxLevel: 5,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 30 }],
        generates: ResourceType.QuặngSắt,
        workerCapacity: 2,
        workerStatus: CharacterStatus.KhaiMỏ,
    },
    {
        id: 'lam_truong',
        name: 'Lâm Trường',
        description: 'Khai thác Linh Mộc từ các khu rừng xung quanh. Yêu cầu đệ tử làm việc.',
        level: 0,
        maxLevel: 5,
        upgradeCost: [{ resource: ResourceType.QuặngSắt, amount: 15 }],
        generates: ResourceType.LinhMộc,
        workerCapacity: 2,
        workerStatus: CharacterStatus.KhaiThácGỗ,
    },
    {
        id: 'linh_tri',
        name: 'Linh Trì',
        description: 'Một hồ nước tụ đầy linh khí, cho phép đệ tử vào bế quan tu luyện để tăng tốc độ đột phá. Thời gian bế quan là 3 ngày và không thể gián đoạn.',
        level: 0,
        maxLevel: 5,
        upgradeCost: [{ resource: ResourceType.LinhMộc, amount: 50 }, { resource: ResourceType.LinhThạch, amount: 50 }],
        workerCapacity: 3, // Max capacity
        workerStatus: CharacterStatus.BếQuan,
    }
];

export const INITIAL_DAY = 1;
export const INITIAL_SECT_DEFENSE = 100;
export const MAX_DISCIPLES = 10;
export const INITIAL_MORALE = 75;
export const INITIAL_INVENTORY_CAPACITY = 8;
export const STORAGE_CAPACITY_PER_LEVEL = 4;
export const ROOM_CAPACITY = 2;

export const TIME_SEQUENCE: TimeOfDay[] = [TimeOfDay.Sáng, TimeOfDay.Trưa, TimeOfDay.Chiều, TimeOfDay.Tối];
export const ALL_WEATHERS: Weather[] = [Weather.QuangTrời, Weather.MưaPhùn, Weather.SươngMù, Weather.BãoTố, Weather.NắngGắt];

export const BEAST_BASE_HP = 20;
export const BEAST_BASE_ATTACK = 5;
export const BEAST_BASE_SPEED = 5; // units per turn
export const COMBAT_DISTANCE = 100;

export const INITIAL_LEVEL = 1;
export const INITIAL_XP = 0;
export const BASE_XP_TO_NEXT_LEVEL = 100;

// AVATAR URLs
export const PLAYER_AVATAR_MALE = 'https://raw.githubusercontent.com/caobababacao/IMG_Game/de1b189f1b19af25b26573554c82df0296f5a4f0/Avatar/User/Male/1.jpg';
export const PLAYER_AVATAR_FEMALE = 'https://raw.githubusercontent.com/caobababacao/IMG_Game/de1b189f1b19af25b26573554c82df0296f5a4f0/Avatar/User/Female/1.jpg';

export const ADVENTURE_AVATARS_MALE = [
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Male/1.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Male/2.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Male/3.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Male/4.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Male/5.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Male/6.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Male/7.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Male/8.jpg',
];

export const ADVENTURE_AVATARS_FEMALE = [
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Female/1.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Female/2.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Female/3.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Female/4.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Adventure/Female/5.jpg',
];

export const GACHA_AVATARS_MALE = [
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Male/1.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Male/2.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Male/3.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Male/4.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Male/5.jpg',
];

export const GACHA_AVATARS_FEMALE = [
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Female/1.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Female/2.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Female/3.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Female/4.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/bc2b9f1f114428f954616b80d4a6c423575f09f2/Avatar/NPC_Gaccha/Female/5.jpg',
];

export const BEAST_IMAGES_SO_GIAI = [
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/a56b6bedde033cdbd7db3f0079f358d737f12928/Enermi/Monster1.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/a56b6bedde033cdbd7db3f0079f358d737f12928/Enermi/Monster2.jpg',
];

export const BEAST_IMAGES_TRUNG_GIAI = [
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/ec551a96c01dc687944ee3172862b1df95e51fd0/Enermi/Monster3.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/ec551a96c01dc687944ee3172862b1df95e51fd0/Enermi/Monster4.jpg',
];

export const BEAST_IMAGES_CAO_GIAI = [
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/ec551a96c01dc687944ee3172862b1df95e51fd0/Enermi/Monster5.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/ec551a96c01dc687944ee3172862b1df95e51fd0/Enermi/Monster6.jpg',
];

export const BEAST_IMAGES_DAI_YEU = [
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/ec551a96c01dc687944ee3172862b1df95e51fd0/Enermi/Boss1.jpg',
    'https://raw.githubusercontent.com/caobababacao/IMG_Game/ec551a96c01dc687944ee3172862b1df95e51fd0/Enermi/Boss2.jpg',
];