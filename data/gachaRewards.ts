import { GachaReward, ResourceType } from '../types';

export const GACHA_REWARDS: GachaReward[] = [
    // Rewards 1-2: Basic Resources (Weight: 75 each)
    {
        id: 1, type: 'RESOURCES', weight: 75,
        payload: { resources: [{ type: ResourceType.LươngThực, amount: 10 }, { type: ResourceType.LinhThạch, amount: 10 }, { type: ResourceType.LinhMộc, amount: 10 }] }
    },
    {
        id: 2, type: 'RESOURCES', weight: 75,
        payload: { resources: [{ type: ResourceType.QuặngSắt, amount: 10 }, { type: ResourceType.ThảoDược, amount: 5 }, { type: ResourceType.TànHồnYêuThú, amount: 1 }] }
    },

    // Rewards 3-4: Medium Resources (Weight: 70 each)
    {
        id: 3, type: 'RESOURCES', weight: 70,
        payload: { resources: [{ type: ResourceType.LươngThực, amount: 15 }, { type: ResourceType.LinhThạch, amount: 15 }, { type: ResourceType.LinhMộc, amount: 15 }] }
    },
    {
        id: 4, type: 'RESOURCES', weight: 70,
        payload: { resources: [{ type: ResourceType.QuặngSắt, amount: 15 }, { type: ResourceType.ThảoDược, amount: 7 }, { type: ResourceType.TànHồnYêuThú, amount: 3 }] }
    },

    // Rewards 5-6: Large Mixed Resources (Weight: 65, 60)
    {
        id: 5, type: 'RESOURCES', weight: 65,
        payload: { resources: [{ type: ResourceType.LươngThực, amount: 10 }, { type: ResourceType.LinhThạch, amount: 10 }, { type: ResourceType.LinhMộc, amount: 10 }, { type: ResourceType.QuặngSắt, amount: 10 }, { type: ResourceType.ThảoDược, amount: 5 }, { type: ResourceType.TànHồnYêuThú, amount: 1 }] }
    },
    {
        id: 6, type: 'RESOURCES', weight: 60,
        payload: { resources: [{ type: ResourceType.LươngThực, amount: 15 }, { type: ResourceType.LinhThạch, amount: 15 }, { type: ResourceType.LinhMộc, amount: 15 }, { type: ResourceType.QuặngSắt, amount: 15 }, { type: ResourceType.ThảoDược, amount: 7 }, { type: ResourceType.TànHồnYêuThú, amount: 2 }] }
    },

    // Rewards 7-8: Percentage Resources (Weight: 55 each)
    {
        id: 7, type: 'RESOURCES_PERCENT', weight: 55,
        payload: { resources: [{ type: ResourceType.LươngThực, percent: 30 }, { type: ResourceType.LinhThạch, percent: 30 }, { type: ResourceType.LinhMộc, percent: 30 }] }
    },
    {
        id: 8, type: 'RESOURCES_PERCENT', weight: 55,
        payload: { resources: [{ type: ResourceType.QuặngSắt, percent: 30 }, { type: ResourceType.ThảoDược, percent: 10 }, { type: ResourceType.TànHồnYêuThú, amount: 3 }] } // Note: TànHồnYêuThú is flat here
    },

    // Rewards 9-10: Higher Percentage Resources (Weight: 45 each)
    {
        id: 9, type: 'RESOURCES_PERCENT', weight: 45,
        payload: { resources: [{ type: ResourceType.LươngThực, percent: 35 }, { type: ResourceType.LinhThạch, percent: 35 }, { type: ResourceType.LinhMộc, percent: 35 }] }
    },
    {
        id: 10, type: 'RESOURCES_PERCENT', weight: 45,
        payload: { resources: [{ type: ResourceType.QuặngSắt, percent: 35 }, { type: ResourceType.ThảoDược, percent: 20 }, { type: ResourceType.TànHồnYêuThú, amount: 4 }] } // Note: TànHồnYêuThú is flat here
    },
    
    // Rewards 11-12: Large Mixed Percentage Resources (Weight: 38, 35)
    {
        id: 11, type: 'RESOURCES_PERCENT', weight: 38,
        payload: { resources: [{ type: ResourceType.LươngThực, percent: 30 }, { type: ResourceType.LinhThạch, percent: 30 }, { type: ResourceType.LinhMộc, percent: 30 }, { type: ResourceType.QuặngSắt, percent: 30 }, { type: ResourceType.ThảoDược, percent: 10 }, { type: ResourceType.TànHồnYêuThú, amount: 4 }] }
    },
    {
        id: 12, type: 'RESOURCES_PERCENT', weight: 35,
        payload: { resources: [{ type: ResourceType.LươngThực, percent: 35 }, { type: ResourceType.LinhThạch, percent: 35 }, { type: ResourceType.LinhMộc, percent: 35 }, { type: ResourceType.QuặngSắt, percent: 35 }, { type: ResourceType.ThảoDược, percent: 20 }, { type: ResourceType.TànHồnYêuThú, amount: 5 }] }
    },

    // Rewards 13-15: Basic Equipment (Flat)
    {
        id: 13, type: 'EQUIPMENT', weight: 75,
        payload: { count: 1, minBonus: 1, maxBonus: 3, minStats: 1, maxStats: 2, isPercentage: false }
    },
    {
        id: 14, type: 'EQUIPMENT', weight: 60,
        payload: { count: 2, minBonus: 1, maxBonus: 3, minStats: 1, maxStats: 2, isPercentage: false }
    },
    {
        id: 15, type: 'EQUIPMENT', weight: 45,
        payload: { count: 3, minBonus: 1, maxBonus: 3, minStats: 1, maxStats: 2, isPercentage: false }
    },

    // Rewards 16-18: Good Equipment (Flat)
    {
        id: 16, type: 'EQUIPMENT', weight: 22,
        payload: { count: 1, minBonus: 3, maxBonus: 5, minStats: 2, maxStats: 4, isPercentage: false }
    },
    {
        id: 17, type: 'EQUIPMENT', weight: 15,
        payload: { count: 1, minBonus: 4, maxBonus: 7, minStats: 3, maxStats: 4, isPercentage: false }
    },
    {
        id: 18, type: 'EQUIPMENT', weight: 6,
        payload: { count: 1, minBonus: 8, maxBonus: 10, minStats: 3, maxStats: 4, isPercentage: false }
    },

    // Rewards 19-22: Percentage Equipment
    {
        id: 19, type: 'EQUIPMENT', weight: 55,
        payload: { count: 1, minBonus: 10, maxBonus: 15, minStats: 1, maxStats: 2, isPercentage: true }
    },
    {
        id: 20, type: 'EQUIPMENT', weight: 55,
        payload: { count: 1, minBonus: 15, maxBonus: 25, minStats: 1, maxStats: 2, isPercentage: true }
    },
    {
        id: 21, type: 'EQUIPMENT', weight: 40,
        payload: { count: 1, minBonus: 12, maxBonus: 22, minStats: 2, maxStats: 3, isPercentage: true }
    },
    {
        id: 22, type: 'EQUIPMENT', weight: 25,
        payload: { count: 1, minBonus: 22, maxBonus: 30, minStats: 1, maxStats: 2, isPercentage: true }
    },

    // Reward 23: Bach Co Dan
    {
        id: 23, type: 'ITEM', weight: 65,
        payload: { items: [{ blueprintId: 'BACH_CO_DAN', amount: 1 }] }
    },

    // Rewards 24-25: Combination (Item + Resources)
    {
        id: 24, type: 'COMBINATION', weight: 50,
        payload: { rewards: [
            { type: 'ITEM', payload: { items: [{ blueprintId: 'BACH_CO_DAN', amount: 1 }] }},
            { type: 'RESOURCES', payload: { resources: [{ type: ResourceType.LươngThực, amount: 10 }, { type: ResourceType.LinhThạch, amount: 10 }, { type: ResourceType.LinhMộc, amount: 10 }] }}
        ] }
    },
    {
        id: 25, type: 'COMBINATION', weight: 50,
        payload: { rewards: [
            { type: 'ITEM', payload: { items: [{ blueprintId: 'BACH_CO_DAN', amount: 1 }] }},
            { type: 'RESOURCES', payload: { resources: [{ type: ResourceType.QuặngSắt, amount: 10 }, { type: ResourceType.ThảoDược, amount: 5 }, { type: ResourceType.TànHồnYêuThú, amount: 1 }] }}
        ] }
    },

    // Reward 26: Predefined Disciple
    {
        id: 26, type: 'DISCIPLE', weight: 5,
        payload: {}
    },
];
