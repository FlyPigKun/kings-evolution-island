export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const MAP_WIDTH = 3200;
export const MAP_HEIGHT = 2400;

export const EVOLUTION_CHAIN = [
  { name: '近战小兵', tier: 0, hp: 100, attack: 10, speed: 150, range: 50, color: 0x8B4513, size: 16, texture: 'melee_minion' },
  { name: '远程小兵', tier: 1, hp: 150, attack: 15, speed: 160, range: 120, color: 0x4169E1, size: 20, texture: 'ranged_minion' },
  { name: '超级兵', tier: 2, hp: 250, attack: 25, speed: 140, range: 60, color: 0xDAA520, size: 28, texture: 'super_minion' },
  { name: '红Buff', tier: 3, hp: 400, attack: 40, speed: 130, range: 80, color: 0xFF4444, size: 34, texture: 'red_buff' },
  { name: '巨龙', tier: 4, hp: 600, attack: 55, speed: 120, range: 100, color: 0x9932CC, size: 42, texture: 'dragon' },
  { name: '暴君', tier: 5, hp: 900, attack: 75, speed: 110, range: 90, color: 0xFF6600, size: 50, texture: 'tyrant' },
] as const;

export const HERO_OPTIONS = [
  { name: '亚瑟', type: 'warrior', hp: 1500, attack: 100, speed: 130, range: 70, color: 0xFFD700, size: 56, skill: '圣剑裁决', skillDamage: 200, skillRange: 120, skillCooldown: 3000, texture: 'hero_arthur' },
  { name: '小乔', type: 'mage', hp: 800, attack: 70, speed: 140, range: 200, color: 0xFF69B4, size: 48, skill: '绽放之力', skillDamage: 300, skillRange: 180, skillCooldown: 4000, texture: 'hero_xiaoqiao' },
  { name: '孙尚香', type: 'marksman', hp: 1000, attack: 120, speed: 150, range: 250, color: 0xFF4500, size: 50, skill: '无限火力', skillDamage: 150, skillRange: 250, skillCooldown: 2000, texture: 'hero_sunshangxiang' },
] as const;

export const KILLS_TO_EVOLVE = [2, 3, 5, 7, 10, 15];

// 玩家比 AI 更强（补偿手动操作劣势）
export const PLAYER_DAMAGE_MULT = 1.5;     // 玩家伤害 x1.5
export const PLAYER_ATTACK_CD = 400;       // 玩家攻击冷却 400ms
export const AI_DAMAGE_MULT = 0.7;         // AI伤害 x0.7
export const AI_ATTACK_CD = 800;           // AI攻击冷却 800ms
export const AI_EVOLVE_RATE = 0.6;         // AI进化速度 x0.6（需要更多击杀）

export const NPC_SPAWN_ZONES = [
  { tier: 0, regions: [{ x: 200, y: 200, w: 800, h: 600 }, { x: 2200, y: 1600, w: 800, h: 600 }] },
  { tier: 1, regions: [{ x: 400, y: 800, w: 600, h: 400 }, { x: 2000, y: 1200, w: 600, h: 400 }] },
  { tier: 2, regions: [{ x: 800, y: 400, w: 800, h: 600 }, { x: 1600, y: 1400, w: 800, h: 600 }] },
  { tier: 3, regions: [{ x: 200, y: 1600, w: 400, h: 400 }, { x: 2600, y: 200, w: 400, h: 400 }] },
  { tier: 4, regions: [{ x: 1400, y: 1000, w: 400, h: 400 }] },
  { tier: 5, regions: [{ x: 1400, y: 400, w: 400, h: 300 }] },
];

export const AI_COUNT = 5;
export const NPC_COUNT_PER_TIER = [15, 12, 8, 4, 2, 1];
export const NPC_RESPAWN_MS = 3000;

export interface MapObjectDef {
  x: number; y: number; texture: string; scale?: number;
}
export interface GameMap {
  name: string;
  groundTexture: string;
  color: number;
  obstacleTexture: string;   // 该地图主题的障碍物贴图
  bushTexture: string;       // 该地图主题的草丛贴图
  obstacles: MapObjectDef[];
  bushes: MapObjectDef[];
}

export const GAME_MAPS: GameMap[] = [
  {
    name: '峡谷之巅',
    groundTexture: 'ground_canyon',
    color: 0x2d5a1e,
    obstacleTexture: 'obj_rock',
    bushTexture: 'obj_bush',
    obstacles: [
      // 上路石头
      { x: 400, y: 300, texture: 'obj_rock', scale: 1.2 },
      { x: 900, y: 250, texture: 'obj_tree' },
      { x: 1400, y: 200, texture: 'obj_rock' },
      // 中路障碍
      { x: 1200, y: 900, texture: 'obj_rock', scale: 1.5 },
      { x: 1800, y: 1100, texture: 'obj_rock', scale: 1.3 },
      { x: 1500, y: 1200, texture: 'obj_wall', scale: 1.4 },
      // 下路石头
      { x: 2200, y: 1900, texture: 'obj_rock', scale: 1.2 },
      { x: 2700, y: 2000, texture: 'obj_tree' },
      { x: 1800, y: 2100, texture: 'obj_rock' },
      // 野区
      { x: 300, y: 1400, texture: 'obj_tree', scale: 1.3 },
      { x: 600, y: 1800, texture: 'obj_rock', scale: 1.1 },
      { x: 2600, y: 600, texture: 'obj_tree', scale: 1.3 },
      { x: 2900, y: 900, texture: 'obj_rock', scale: 1.1 },
      // 龙坑周围
      { x: 1400, y: 700, texture: 'obj_rock', scale: 1.8 },
      { x: 1700, y: 1500, texture: 'obj_rock', scale: 1.6 },
    ],
    bushes: [
      // 上路草丛
      { x: 600, y: 400, texture: 'obj_bush', scale: 1.5 },
      { x: 1100, y: 350, texture: 'obj_bush', scale: 1.3 },
      // 中路草丛
      { x: 1000, y: 1000, texture: 'obj_bush', scale: 1.6 },
      { x: 2000, y: 1300, texture: 'obj_bush', scale: 1.4 },
      // 下路草丛
      { x: 2400, y: 1800, texture: 'obj_bush', scale: 1.5 },
      { x: 1900, y: 2000, texture: 'obj_bush', scale: 1.3 },
      // 野区草丛
      { x: 400, y: 1000, texture: 'obj_bush', scale: 1.8 },
      { x: 500, y: 1600, texture: 'obj_bush', scale: 1.4 },
      { x: 2700, y: 800, texture: 'obj_bush', scale: 1.8 },
      { x: 2800, y: 1400, texture: 'obj_bush', scale: 1.4 },
    ],
  },
  {
    name: '烈焰熔岩',
    groundTexture: 'ground_volcano',
    color: 0x3a1a0a,
    obstacleTexture: 'obj_lava_rock',
    bushTexture: 'obj_lava_bush',
    obstacles: [
      { x: 500, y: 400, texture: 'obj_lava_rock', scale: 1.3 },
      { x: 1000, y: 300, texture: 'obj_lava_rock', scale: 1.1 },
      { x: 1600, y: 500, texture: 'obj_lava_rock', scale: 1.5 },
      { x: 2200, y: 350, texture: 'obj_lava_rock', scale: 1.2 },
      { x: 1300, y: 1000, texture: 'obj_lava_rock', scale: 2.0 },
      { x: 1900, y: 1200, texture: 'obj_lava_rock', scale: 1.4 },
      { x: 700, y: 1500, texture: 'obj_lava_rock', scale: 1.3 },
      { x: 2500, y: 1600, texture: 'obj_lava_rock', scale: 1.3 },
      { x: 400, y: 2000, texture: 'obj_lava_rock', scale: 1.1 },
      { x: 2800, y: 2000, texture: 'obj_lava_rock', scale: 1.1 },
      { x: 1500, y: 1800, texture: 'obj_lava_rock', scale: 1.6 },
      { x: 2100, y: 800, texture: 'obj_lava_rock', scale: 1.2 },
    ],
    bushes: [
      { x: 300, y: 700, texture: 'obj_lava_bush', scale: 1.4 },
      { x: 800, y: 900, texture: 'obj_lava_bush', scale: 1.6 },
      { x: 2400, y: 500, texture: 'obj_lava_bush', scale: 1.4 },
      { x: 2700, y: 900, texture: 'obj_lava_bush', scale: 1.5 },
      { x: 500, y: 1800, texture: 'obj_lava_bush', scale: 1.5 },
      { x: 2600, y: 1800, texture: 'obj_lava_bush', scale: 1.5 },
      { x: 1100, y: 1400, texture: 'obj_lava_bush', scale: 1.7 },
      { x: 2000, y: 1600, texture: 'obj_lava_bush', scale: 1.3 },
    ],
  },
  {
    name: '冰封雪原',
    groundTexture: 'ground_frozen',
    color: 0x1a2a3e,
    obstacleTexture: 'obj_ice_crystal',
    bushTexture: 'obj_snow_bush',
    obstacles: [
      { x: 600, y: 300, texture: 'obj_ice_crystal', scale: 1.3 },
      { x: 1200, y: 400, texture: 'obj_ice_crystal', scale: 1.6 },
      { x: 2000, y: 300, texture: 'obj_ice_crystal', scale: 1.2 },
      { x: 2600, y: 500, texture: 'obj_ice_crystal', scale: 1.4 },
      { x: 1500, y: 1000, texture: 'obj_ice_crystal', scale: 2.0 },
      { x: 800, y: 1200, texture: 'obj_ice_crystal', scale: 1.3 },
      { x: 2400, y: 1300, texture: 'obj_ice_crystal', scale: 1.3 },
      { x: 400, y: 1800, texture: 'obj_ice_crystal', scale: 1.1 },
      { x: 1800, y: 1800, texture: 'obj_ice_crystal', scale: 1.5 },
      { x: 2800, y: 1900, texture: 'obj_ice_crystal', scale: 1.2 },
      { x: 1000, y: 700, texture: 'obj_ice_crystal', scale: 1.1 },
    ],
    bushes: [
      { x: 400, y: 600, texture: 'obj_snow_bush', scale: 1.6 },
      { x: 900, y: 500, texture: 'obj_snow_bush', scale: 1.4 },
      { x: 2300, y: 600, texture: 'obj_snow_bush', scale: 1.5 },
      { x: 2700, y: 800, texture: 'obj_snow_bush', scale: 1.3 },
      { x: 300, y: 1400, texture: 'obj_snow_bush', scale: 1.7 },
      { x: 600, y: 2000, texture: 'obj_snow_bush', scale: 1.5 },
      { x: 2500, y: 1600, texture: 'obj_snow_bush', scale: 1.6 },
      { x: 1600, y: 2100, texture: 'obj_snow_bush', scale: 1.8 },
      { x: 1200, y: 1500, texture: 'obj_snow_bush', scale: 1.3 },
    ],
  },
];

export function getKillCredit(killerTier: number, victimTier: number): number {
  const diff = victimTier - killerTier;
  if (diff <= 0) return 1;
  if (diff === 1) return 2;
  if (diff === 2) return 3;
  return 3 + diff;
}
