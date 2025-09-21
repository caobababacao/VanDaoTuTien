import { ResourceType, DemonicBeastTier } from '../types';

export interface TrialStage {
    stage: number;
    enemies: { tier: DemonicBeastTier; count: number }[];
    rewards: {
        resources: Partial<Record<ResourceType, number>>;
        items: { blueprintId: string; amount: number }[];
    };
}

export const TRIAL_STAGES: TrialStage[] = [
    {
        stage: 1,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 5 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 10, [ResourceType.LinhThạch]: 10, [ResourceType.LinhMộc]: 10, [ResourceType.QuặngSắt]: 10, [ResourceType.ThảoDược]: 5, [ResourceType.TànHồnYêuThú]: 2 },
            items: [],
        },
    },
    {
        stage: 2,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 7 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 15, [ResourceType.LinhThạch]: 15, [ResourceType.LinhMộc]: 15, [ResourceType.QuặngSắt]: 15, [ResourceType.ThảoDược]: 8, [ResourceType.TànHồnYêuThú]: 3 },
            items: [],
        },
    },
    {
        stage: 3,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 10 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 23, [ResourceType.LinhThạch]: 23, [ResourceType.LinhMộc]: 23, [ResourceType.QuặngSắt]: 23, [ResourceType.ThảoDược]: 12, [ResourceType.TànHồnYêuThú]: 5 },
            items: [{ blueprintId: 'BACH_CO_DAN', amount: 1 }],
        },
    },
    {
        stage: 4,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 10 }, { tier: DemonicBeastTier.TrungGiai, count: 2 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 35, [ResourceType.LinhThạch]: 35, [ResourceType.LinhMộc]: 35, [ResourceType.QuặngSắt]: 35, [ResourceType.ThảoDược]: 18, [ResourceType.TànHồnYêuThú]: 8 },
            items: [{ blueprintId: 'BACH_CO_DAN', amount: 1 }],
        },
    },
    {
        stage: 5,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 11 }, { tier: DemonicBeastTier.TrungGiai, count: 3 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 53, [ResourceType.LinhThạch]: 53, [ResourceType.LinhMộc]: 53, [ResourceType.QuặngSắt]: 53, [ResourceType.ThảoDược]: 27, [ResourceType.TànHồnYêuThú]: 12 },
            items: [],
        },
    },
    {
        stage: 6,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 12 }, { tier: DemonicBeastTier.TrungGiai, count: 4 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 80, [ResourceType.LinhThạch]: 80, [ResourceType.LinhMộc]: 80, [ResourceType.QuặngSắt]: 80, [ResourceType.ThảoDược]: 41, [ResourceType.TànHồnYêuThú]: 18 },
            items: [],
        },
    },
    {
        stage: 7,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 12 }, { tier: DemonicBeastTier.TrungGiai, count: 4 }, { tier: DemonicBeastTier.CaoGiai, count: 1 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 120, [ResourceType.LinhThạch]: 120, [ResourceType.LinhMộc]: 120, [ResourceType.QuặngSắt]: 120, [ResourceType.ThảoDược]: 62, [ResourceType.TànHồnYêuThú]: 27 },
            items: [],
        },
    },
    {
        stage: 8,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 14 }, { tier: DemonicBeastTier.TrungGiai, count: 5 }, { tier: DemonicBeastTier.CaoGiai, count: 2 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 180, [ResourceType.LinhThạch]: 180, [ResourceType.LinhMộc]: 180, [ResourceType.QuặngSắt]: 180, [ResourceType.ThảoDược]: 93, [ResourceType.TànHồnYêuThú]: 41 },
            items: [{ blueprintId: 'BACH_CO_DAN', amount: 2 }],
        },
    },
    {
        stage: 9,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 16 }, { tier: DemonicBeastTier.TrungGiai, count: 5 }, { tier: DemonicBeastTier.CaoGiai, count: 4 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 270, [ResourceType.LinhThạch]: 270, [ResourceType.LinhMộc]: 270, [ResourceType.QuặngSắt]: 270, [ResourceType.ThảoDược]: 140, [ResourceType.TànHồnYêuThú]: 62 },
            items: [{ blueprintId: 'BACH_CO_DAN', amount: 3 }],
        },
    },
    {
        stage: 10,
        enemies: [{ tier: DemonicBeastTier.SoGiai, count: 18 }, { tier: DemonicBeastTier.TrungGiai, count: 5 }, { tier: DemonicBeastTier.CaoGiai, count: 5 }, { tier: DemonicBeastTier.DaiYeu, count: 1 }],
        rewards: {
            resources: { [ResourceType.LươngThực]: 405, [ResourceType.LinhThạch]: 405, [ResourceType.LinhMộc]: 405, [ResourceType.QuặngSắt]: 405, [ResourceType.ThảoDược]: 210, [ResourceType.TànHồnYêuThú]: 93 },
            items: [{ blueprintId: 'BACH_CO_DAN', amount: 4 }],
        },
    },
];
