import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, MAP_WIDTH, MAP_HEIGHT, AI_COUNT, NPC_COUNT_PER_TIER, NPC_SPAWN_ZONES, EVOLUTION_CHAIN, NPC_RESPAWN_MS, GAME_MAPS, GameMap, PLAYER_DAMAGE_MULT, PLAYER_ATTACK_CD, AI_DAMAGE_MULT, AI_ATTACK_CD } from '../config';
import { Player } from '../entities/Player';
import { AIPlayer } from '../entities/AIPlayer';
import { NPC } from '../entities/NPC';
import { BaseEntity } from '../entities/BaseEntity';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { HUD } from '../ui/HUD';
import { Minimap } from '../ui/Minimap';

export class GameScene extends Phaser.Scene {
  player!: Player;
  ais: AIPlayer[] = [];
  npcs: NPC[] = [];
  joystick!: VirtualJoystick;
  hud!: HUD;
  minimap!: Minimap;
  elapsed: number = 0;
  totalKills: number = 0;
  mapGraphics!: Phaser.GameObjects.Graphics;
  npcRespawnTimers: { npc: NPC; timer: number; tier: number }[] = [];
  obstacles!: Phaser.Physics.Arcade.StaticGroup;
  bushSprites: Phaser.GameObjects.Sprite[] = [];
  currentMap!: GameMap;
  playerInBush: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data: { mapIndex?: number } = {}) {
    this.elapsed = 0;
    this.totalKills = 0;
    this.ais = [];
    this.npcs = [];
    this.npcRespawnTimers = [];
    this.playerInBush = false;
    this.bushSprites = [];
    this.currentMap = GAME_MAPS[data.mapIndex ?? 0];

    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    this.drawMap();
    this.createBushes();

    this.player = new Player(this, MAP_WIDTH / 2, MAP_HEIGHT / 2);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

    this.player.onEvolveToHero = () => {
      this.scene.pause();
      this.scene.launch('HeroSelectScene', {
        onSelect: (heroIndex: number) => {
          this.player.becomeHero(heroIndex);
          this.hud.updateTier(0, true, this.player.heroData!.name);
          this.hud.showHeroSkill(this.player.heroData!.name, this.player.heroData!.skill);
          this.scene.resume();
        },
      });
    };

    this.player.onDeath = () => {
      this.time.delayedCall(500, () => {
        this.scene.start('GameOverScene', {
          time: this.elapsed,
          kills: this.totalKills,
          maxTier: this.player.isHero
            ? `英雄·${this.player.heroData?.name}`
            : EVOLUTION_CHAIN[this.player.tier].name,
          mapIndex: GAME_MAPS.indexOf(this.currentMap),
          victory: false,
        });
      });
    };

    for (let i = 0; i < AI_COUNT; i++) {
      const x = Phaser.Math.Between(200, MAP_WIDTH - 200);
      const y = Phaser.Math.Between(200, MAP_HEIGHT - 200);
      this.ais.push(new AIPlayer(this, x, y));
    }

    this.spawnNPCs();
    this.createObstacles();

    this.joystick = new VirtualJoystick(this);
    this.hud = new HUD(this);
    this.minimap = new Minimap(this);

    this.hud.onAttack = () => this.playerAttack();
    this.hud.onSkill = () => this.playerUseSkill();

    this.hud.updateTier(0, false);
    this.hud.updateKills(0, 0, false);
  }

  drawMap() {
    const mapBg = this.add.image(MAP_WIDTH / 2, MAP_HEIGHT / 2, this.currentMap.groundTexture);
    mapBg.setDisplaySize(MAP_WIDTH, MAP_HEIGHT);
    mapBg.setDepth(-1);

    this.mapGraphics = this.add.graphics();
    this.mapGraphics.setDepth(0);
  }

  createObstacles() {
    this.obstacles = this.physics.add.staticGroup();

    for (const obs of this.currentMap.obstacles) {
      const s = obs.scale ?? 1;
      const spr = this.add.sprite(obs.x, obs.y, obs.texture);
      spr.setScale(s);
      spr.setDepth(2);
      this.physics.add.existing(spr, true);
      const body = spr.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(spr.width * s * 0.7, spr.height * s * 0.7);
      body.setOffset(spr.width * 0.15, spr.height * 0.15);
      this.obstacles.add(spr);
    }

    this.physics.add.collider(this.player.sprite, this.obstacles);
    for (const ai of this.ais) {
      this.physics.add.collider(ai.sprite, this.obstacles);
    }
    for (const npc of this.npcs) {
      this.physics.add.collider(npc.sprite, this.obstacles);
    }
  }

  createBushes() {
    for (const bdef of this.currentMap.bushes) {
      const s = bdef.scale ?? 1;
      const spr = this.add.sprite(bdef.x, bdef.y, bdef.texture);
      spr.setScale(s);
      spr.setDepth(3);
      spr.setAlpha(0.85);
      this.bushSprites.push(spr);
    }
  }

  spawnNPCs() {
    for (let tierIdx = 0; tierIdx < NPC_SPAWN_ZONES.length; tierIdx++) {
      const zone = NPC_SPAWN_ZONES[tierIdx];
      const count = NPC_COUNT_PER_TIER[tierIdx] ?? 2;
      for (let i = 0; i < count; i++) {
        const region = zone.regions[i % zone.regions.length];
        const x = Phaser.Math.Between(region.x, region.x + region.w);
        const y = Phaser.Math.Between(region.y, region.y + region.h);
        this.npcs.push(new NPC(this, x, y, zone.tier));
      }
    }
  }

  canPlayerSee(target: BaseEntity): boolean {
    const targetInBush = this.isInBush(target.sprite.x, target.sprite.y);
    if (!targetInBush) return true;
    if (!this.playerInBush) return false;
    return this.inSameBush(this.player.sprite.x, this.player.sprite.y, target.sprite.x, target.sprite.y);
  }

  playerAttack() {
    if (!this.player.isAlive || !this.player.canAttack()) return;

    const allTargets: BaseEntity[] = [...this.ais, ...this.npcs];
    let closest: BaseEntity | null = null;
    let closestDist = this.player.range + 60;

    for (const t of allTargets) {
      if (!t.isAlive) continue;
      if (!this.canPlayerSee(t)) continue;
      const dist = this.player.distanceTo(t);
      if (dist < closestDist) {
        closest = t;
        closestDist = dist;
      }
    }

    if (closest) {
      const victimTier = closest.tier;
      const killed = this.player.tryAttack(closest, PLAYER_DAMAGE_MULT, PLAYER_ATTACK_CD);
      if (killed) {
        this.player.onKill(victimTier);
        this.totalKills++;
        this.scheduleNpcRespawn(closest);
      }

      this.showAttackEffect(this.player, closest);
    }
  }

  playerUseSkill() {
    if (!this.player.isHero) return;
    const visibleEntities: BaseEntity[] = [...this.ais, ...this.npcs].filter(e => e.isAlive && this.canPlayerSee(e));
    this.player.useSkill(visibleEntities);

    for (const e of visibleEntities) {
      if (!e.isAlive) {
        this.totalKills++;
        this.scheduleNpcRespawn(e);
      }
    }
  }

  showAttackEffect(attacker: BaseEntity, target: BaseEntity) {
    const line = this.add.line(
      0, 0,
      attacker.sprite.x, attacker.sprite.y,
      target.sprite.x, target.sprite.y,
      0xffff00, 0.6
    ).setOrigin(0, 0).setDepth(8);

    this.tweens.add({
      targets: line,
      alpha: 0,
      duration: 200,
      onComplete: () => line.destroy(),
    });
  }

  scheduleNpcRespawn(entity: BaseEntity) {
    if (entity instanceof NPC) {
      this.npcRespawnTimers.push({ npc: entity, timer: NPC_RESPAWN_MS, tier: entity.tier });
    }
  }

  showBushNotice(text: string) {
    const notice = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, text,
      { fontSize: '16px', color: '#88ff88', stroke: '#000', strokeThickness: 3, fontStyle: 'bold' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({
      targets: notice,
      alpha: 0,
      y: notice.y - 30,
      duration: 1200,
      onComplete: () => notice.destroy(),
    });
  }

  inSameBush(x1: number, y1: number, x2: number, y2: number): boolean {
    for (let i = 0; i < this.bushSprites.length; i++) {
      const spr = this.bushSprites[i];
      const s = this.currentMap.bushes[i]?.scale ?? 1;
      const radius = 64 * s * 0.8;
      const d1 = Phaser.Math.Distance.Between(x1, y1, spr.x, spr.y);
      const d2 = Phaser.Math.Distance.Between(x2, y2, spr.x, spr.y);
      if (d1 < radius && d2 < radius) return true;
    }
    return false;
  }

  isInBush(x: number, y: number): boolean {
    for (let i = 0; i < this.bushSprites.length; i++) {
      const spr = this.bushSprites[i];
      const s = this.currentMap.bushes[i]?.scale ?? 1;
      const radius = 64 * s * 0.8;
      const dist = Phaser.Math.Distance.Between(x, y, spr.x, spr.y);
      if (dist < radius) return true;
    }
    return false;
  }

  update(_time: number, delta: number) {
    this.elapsed += delta;

    this.player.setMoveDirection(this.joystick.direction.x, this.joystick.direction.y);
    this.player.update(delta);

    // === 草丛系统：所有单位都能隐身 ===
    const wasInBush = this.playerInBush;
    this.playerInBush = this.isInBush(this.player.sprite.x, this.player.sprite.y);

    // 玩家草丛视觉
    if (this.playerInBush) {
      this.player.sprite.setAlpha(this.player.invincibleTimer > 0
        ? 0.3 + Math.sin(Date.now() * 0.01) * 0.1
        : 0.4);
      this.player.nameText.setAlpha(0.4);
    } else if (this.player.invincibleTimer <= 0) {
      this.player.sprite.setAlpha(1);
      this.player.nameText.setAlpha(1);
    }

    if (this.playerInBush && !wasInBush) {
      this.showBushNotice('隐入草丛');
    } else if (!this.playerInBush && wasInBush) {
      this.showBushNotice('离开草丛');
    }

    // 检测所有AI和NPC是否在草丛
    const aiInBush: boolean[] = this.ais.map(ai =>
      ai.isAlive && this.isInBush(ai.sprite.x, ai.sprite.y)
    );
    const npcInBush: boolean[] = this.npcs.map(npc =>
      npc.isAlive && this.isInBush(npc.sprite.x, npc.sprite.y)
    );

    // AI/NPC 草丛隐身视觉：在草丛中的单位对玩家半透明（除非玩家也在同一草丛）
    for (let i = 0; i < this.ais.length; i++) {
      if (!this.ais[i].isAlive) continue;
      if (aiInBush[i]) {
        const bothInSameBush = this.playerInBush && this.inSameBush(
          this.player.sprite.x, this.player.sprite.y,
          this.ais[i].sprite.x, this.ais[i].sprite.y
        );
        this.ais[i].sprite.setAlpha(bothInSameBush ? 0.6 : 0.25);
        this.ais[i].nameText.setAlpha(bothInSameBush ? 0.6 : 0.15);
      } else {
        this.ais[i].sprite.setAlpha(1);
        this.ais[i].nameText.setAlpha(1);
      }
    }
    for (let i = 0; i < this.npcs.length; i++) {
      if (!this.npcs[i].isAlive) continue;
      if (npcInBush[i]) {
        const bothInSameBush = this.playerInBush && this.inSameBush(
          this.player.sprite.x, this.player.sprite.y,
          this.npcs[i].sprite.x, this.npcs[i].sprite.y
        );
        this.npcs[i].sprite.setAlpha(bothInSameBush ? 0.7 : 0.2);
        this.npcs[i].nameText.setAlpha(bothInSameBush ? 0.7 : 0.1);
      } else {
        this.npcs[i].sprite.setAlpha(0.9);
        this.npcs[i].nameText.setAlpha(1);
      }
    }

    // === 构建每个AI能看到的实体列表（草丛规则） ===
    for (const ai of this.ais) {
      if (!ai.isAlive) {
        ai.update(delta);
        continue;
      }
      const aiInB = this.isInBush(ai.sprite.x, ai.sprite.y);

      // AI能看到的目标：不在草丛的 + 同草丛内的
      const visible: BaseEntity[] = [];
      // 玩家
      if (this.player.isAlive) {
        if (!this.playerInBush || (aiInB && this.inSameBush(ai.sprite.x, ai.sprite.y, this.player.sprite.x, this.player.sprite.y))) {
          visible.push(this.player);
        }
      }
      // 其他AI
      for (let j = 0; j < this.ais.length; j++) {
        const other = this.ais[j];
        if (other === ai || !other.isAlive) continue;
        if (!aiInBush[j] || (aiInB && this.inSameBush(ai.sprite.x, ai.sprite.y, other.sprite.x, other.sprite.y))) {
          visible.push(other);
        }
      }
      // NPC
      for (let j = 0; j < this.npcs.length; j++) {
        const npc = this.npcs[j];
        if (!npc.isAlive) continue;
        if (!npcInBush[j] || (aiInB && this.inSameBush(ai.sprite.x, ai.sprite.y, npc.sprite.x, npc.sprite.y))) {
          visible.push(npc);
        }
      }

      ai.updateAI(delta, visible);
      ai.update(delta);

      // AI攻击NPC
      for (let j = 0; j < this.npcs.length; j++) {
        const npc = this.npcs[j];
        if (!npc.isAlive) continue;
        const canSee = !npcInBush[j] || (aiInB && this.inSameBush(ai.sprite.x, ai.sprite.y, npc.sprite.x, npc.sprite.y));
        if (canSee && ai.canAttack() && ai.distanceTo(npc) <= ai.range + 30) {
          const victimTier = npc.tier;
          const killed = ai.tryAttack(npc, AI_DAMAGE_MULT, AI_ATTACK_CD);
          if (killed) {
            ai.onKill(victimTier);
            this.scheduleNpcRespawn(npc);
          }
        }
      }

      // AI攻击其他AI
      for (let j = 0; j < this.ais.length; j++) {
        const otherAi = this.ais[j];
        if (otherAi === ai || !otherAi.isAlive) continue;
        const canSee = !aiInBush[j] || (aiInB && this.inSameBush(ai.sprite.x, ai.sprite.y, otherAi.sprite.x, otherAi.sprite.y));
        if (canSee && ai.canAttack() && ai.tier > otherAi.tier && ai.distanceTo(otherAi) <= ai.range + 30) {
          ai.tryAttack(otherAi, AI_DAMAGE_MULT, AI_ATTACK_CD);
        }
      }

      // AI攻击玩家
      if (this.player.isAlive && ai.canAttack() && ai.distanceTo(this.player) <= ai.range + 30) {
        const canSeePlayer = !this.playerInBush || (aiInB && this.inSameBush(ai.sprite.x, ai.sprite.y, this.player.sprite.x, this.player.sprite.y));
        if (canSeePlayer && ai.tier >= this.player.tier && !this.player.isHero) {
          const killed = ai.tryAttack(this.player, AI_DAMAGE_MULT, AI_ATTACK_CD);
          if (killed) this.player.onDeath?.();
        }
      }
    }

    for (const npc of this.npcs) {
      npc.updateNPC(delta);
    }

    for (let i = this.npcRespawnTimers.length - 1; i >= 0; i--) {
      this.npcRespawnTimers[i].timer -= delta;
      if (this.npcRespawnTimers[i].timer <= 0) {
        const { npc, tier } = this.npcRespawnTimers[i];
        const zone = NPC_SPAWN_ZONES[tier];
        if (zone) {
          const region = zone.regions[Phaser.Math.Between(0, zone.regions.length - 1)];
          npc.respawn(
            Phaser.Math.Between(region.x, region.x + region.w),
            Phaser.Math.Between(region.y, region.y + region.h)
          );
        }
        this.npcRespawnTimers.splice(i, 1);
      }
    }

    this.hud.updateTier(this.player.tier, this.player.isHero, this.player.heroData?.name);
    this.hud.updateKills(this.player.kills, this.player.tier, this.player.isHero);
    this.hud.updateTimer(this.elapsed);
    if (this.player.isHero) {
      this.hud.updateSkillCooldown(this.player.skillCooldown);
    }

    this.minimap.update(this.player, this.ais, this.npcs);

    // 胜利检测：所有AI死亡
    if (this.player.isAlive && this.ais.every(ai => !ai.isAlive)) {
      this.scene.start('GameOverScene', {
        time: this.elapsed,
        kills: this.totalKills,
        maxTier: this.player.isHero
          ? `英雄·${this.player.heroData?.name}`
          : EVOLUTION_CHAIN[this.player.tier].name,
        mapIndex: GAME_MAPS.indexOf(this.currentMap),
        victory: true,
      });
    }
  }
}
