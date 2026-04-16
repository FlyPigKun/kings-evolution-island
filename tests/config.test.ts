import { describe, it, expect } from 'vitest';
import { EVOLUTION_CHAIN, HERO_OPTIONS, KILLS_TO_EVOLVE, AI_COUNT, NPC_COUNT_PER_TIER, NPC_RESPAWN_MS, MAP_WIDTH, MAP_HEIGHT, GAME_WIDTH, GAME_HEIGHT, NPC_SPAWN_ZONES, getKillCredit, PLAYER_DAMAGE_MULT, AI_DAMAGE_MULT, AI_EVOLVE_RATE, PLAYER_ATTACK_CD, AI_ATTACK_CD } from '../src/config';

describe('Game Config', () => {
  describe('Evolution Chain', () => {
    it('should have exactly 6 tiers (before hero)', () => {
      expect(EVOLUTION_CHAIN).toHaveLength(6);
    });

    it('each tier should have increasing HP', () => {
      for (let i = 1; i < EVOLUTION_CHAIN.length; i++) {
        expect(EVOLUTION_CHAIN[i].hp).toBeGreaterThan(EVOLUTION_CHAIN[i - 1].hp);
      }
    });

    it('each tier should have increasing attack', () => {
      for (let i = 1; i < EVOLUTION_CHAIN.length; i++) {
        expect(EVOLUTION_CHAIN[i].attack).toBeGreaterThan(EVOLUTION_CHAIN[i - 1].attack);
      }
    });

    it('each tier should have increasing size', () => {
      for (let i = 1; i < EVOLUTION_CHAIN.length; i++) {
        expect(EVOLUTION_CHAIN[i].size).toBeGreaterThan(EVOLUTION_CHAIN[i - 1].size);
      }
    });

    it('each tier should have a texture key', () => {
      for (const tier of EVOLUTION_CHAIN) {
        expect(tier.texture).toBeTruthy();
        expect(typeof tier.texture).toBe('string');
      }
    });

    it('tier names should be in correct order', () => {
      const expected = ['近战小兵', '远程小兵', '超级兵', '红Buff', '巨龙', '暴君'];
      expect(EVOLUTION_CHAIN.map(t => t.name)).toEqual(expected);
    });
  });

  describe('Hero Options', () => {
    it('should have exactly 3 heroes', () => {
      expect(HERO_OPTIONS).toHaveLength(3);
    });

    it('should include 亚瑟, 小乔, 孙尚香', () => {
      const names = HERO_OPTIONS.map(h => h.name);
      expect(names).toContain('亚瑟');
      expect(names).toContain('小乔');
      expect(names).toContain('孙尚香');
    });

    it('should have 3 different types (warrior, mage, marksman)', () => {
      const types = HERO_OPTIONS.map(h => h.type);
      expect(types).toContain('warrior');
      expect(types).toContain('mage');
      expect(types).toContain('marksman');
    });

    it('each hero should have skill properties', () => {
      for (const hero of HERO_OPTIONS) {
        expect(hero.skill).toBeTruthy();
        expect(hero.skillDamage).toBeGreaterThan(0);
        expect(hero.skillRange).toBeGreaterThan(0);
        expect(hero.skillCooldown).toBeGreaterThan(0);
        expect(hero.texture).toBeTruthy();
      }
    });

    it('warrior should have highest HP, marksman highest range', () => {
      const warrior = HERO_OPTIONS.find(h => h.type === 'warrior')!;
      const marksman = HERO_OPTIONS.find(h => h.type === 'marksman')!;
      const mage = HERO_OPTIONS.find(h => h.type === 'mage')!;
      expect(warrior.hp).toBeGreaterThan(mage.hp);
      expect(warrior.hp).toBeGreaterThan(marksman.hp);
      expect(marksman.range).toBeGreaterThan(warrior.range);
      expect(marksman.range).toBeGreaterThan(mage.range);
    });
  });

  describe('Evolution Pacing', () => {
    it('should have 6 kill thresholds (one per pre-hero tier)', () => {
      expect(KILLS_TO_EVOLVE).toHaveLength(6);
    });

    it('kill thresholds should be 2→3→5→7→10→15', () => {
      expect(KILLS_TO_EVOLVE).toEqual([2, 3, 5, 7, 10, 15]);
    });

    it('total kills to reach hero should be 42', () => {
      const total = KILLS_TO_EVOLVE.reduce((a, b) => a + b, 0);
      expect(total).toBe(42);
    });

    it('kill thresholds should be strictly increasing', () => {
      for (let i = 1; i < KILLS_TO_EVOLVE.length; i++) {
        expect(KILLS_TO_EVOLVE[i]).toBeGreaterThan(KILLS_TO_EVOLVE[i - 1]);
      }
    });
  });

  describe('Game Constants', () => {
    it('should have 5 AI enemies', () => {
      expect(AI_COUNT).toBe(5);
    });

    it('NPC respawn should be 3000ms', () => {
      expect(NPC_RESPAWN_MS).toBe(3000);
    });

    it('map should be larger than game viewport', () => {
      expect(MAP_WIDTH).toBeGreaterThan(GAME_WIDTH);
      expect(MAP_HEIGHT).toBeGreaterThan(GAME_HEIGHT);
    });

    it('NPC spawn zones should cover all 6 tiers', () => {
      expect(NPC_SPAWN_ZONES).toHaveLength(6);
      for (let i = 0; i < 6; i++) {
        expect(NPC_SPAWN_ZONES[i].tier).toBe(i);
        expect(NPC_SPAWN_ZONES[i].regions.length).toBeGreaterThan(0);
      }
    });

    it('NPC counts per tier should decrease for higher tiers', () => {
      expect(NPC_COUNT_PER_TIER[0]).toBeGreaterThan(NPC_COUNT_PER_TIER[5]);
    });

    it('all spawn zones should be within map bounds', () => {
      for (const zone of NPC_SPAWN_ZONES) {
        for (const r of zone.regions) {
          expect(r.x).toBeGreaterThanOrEqual(0);
          expect(r.y).toBeGreaterThanOrEqual(0);
          expect(r.x + r.w).toBeLessThanOrEqual(MAP_WIDTH);
          expect(r.y + r.h).toBeLessThanOrEqual(MAP_HEIGHT);
        }
      }
    });
  });

  describe('Balance: Player vs AI', () => {
    it('player deals more damage than AI', () => {
      expect(PLAYER_DAMAGE_MULT).toBeGreaterThan(AI_DAMAGE_MULT);
    });

    it('player attacks faster than AI', () => {
      expect(PLAYER_ATTACK_CD).toBeLessThan(AI_ATTACK_CD);
    });

    it('AI evolves slower than player', () => {
      expect(AI_EVOLVE_RATE).toBeLessThan(1);
    });
  });

  describe('Kill Credit (以弱胜强)', () => {
    it('same tier kill gives 1 credit', () => {
      expect(getKillCredit(2, 2)).toBe(1);
    });

    it('lower tier killing same tier gives 1 credit', () => {
      expect(getKillCredit(3, 1)).toBe(1);
    });

    it('killing 1 tier higher gives 2 credits', () => {
      expect(getKillCredit(0, 1)).toBe(2);
    });

    it('killing 2 tiers higher gives 3 credits', () => {
      expect(getKillCredit(0, 2)).toBe(3);
    });

    it('killing 3+ tiers higher gives 3+diff credits', () => {
      expect(getKillCredit(0, 3)).toBe(6);
      expect(getKillCredit(0, 5)).toBe(8);
    });

    it('bonus increases with tier difference', () => {
      const c1 = getKillCredit(0, 1);
      const c2 = getKillCredit(0, 2);
      const c3 = getKillCredit(0, 3);
      expect(c2).toBeGreaterThan(c1);
      expect(c3).toBeGreaterThan(c2);
    });
  });
});
