import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { KILLS_TO_EVOLVE, EVOLUTION_CHAIN, HERO_OPTIONS, MAP_WIDTH, MAP_HEIGHT, getKillCredit, AI_EVOLVE_RATE } from '../config';

export class AIPlayer extends BaseEntity {
  target: BaseEntity | null = null;
  isHero: boolean = false;
  heroData: typeof HERO_OPTIONS[number] | null = null;
  skillCooldown: number = 0;
  decisionTimer: number = 0;
  wanderTarget: Phaser.Math.Vector2;
  aiName: string;
  indicator: Phaser.GameObjects.Graphics;
  aiLabel: Phaser.GameObjects.Text;

  private static AI_NAMES = ['影', '风', '雷', '火', '冰', '暗', '光', '雨'];
  private static nameIndex = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 0);
    this.aiName = AIPlayer.AI_NAMES[AIPlayer.nameIndex++ % AIPlayer.AI_NAMES.length];
    this.nameText.setText(this.aiName);
    this.nameText.setColor('#ff6666');
    this.sprite.setTint(0xff8888);

    this.indicator = scene.add.graphics();
    this.indicator.setDepth(this.sprite.depth - 1);

    this.aiLabel = scene.add.text(x, y, '⚔', {
      fontSize: '10px',
    }).setOrigin(0.5).setDepth(this.sprite.depth + 1);

    this.wanderTarget = new Phaser.Math.Vector2(
      Phaser.Math.Between(100, MAP_WIDTH - 100),
      Phaser.Math.Between(100, MAP_HEIGHT - 100)
    );
  }

  onKill(victimTier: number = this.tier) {
    const credit = getKillCredit(this.tier, victimTier);
    this.kills += credit;
    if (this.isHero) return;

    const needed = KILLS_TO_EVOLVE[this.tier] !== undefined
      ? Math.ceil(KILLS_TO_EVOLVE[this.tier] / AI_EVOLVE_RATE)
      : undefined;
    if (needed !== undefined && this.kills >= needed) {
      this.kills = 0;
      if (this.tier < EVOLUTION_CHAIN.length - 1) {
        this.setTier(this.tier + 1);
        this.nameText.setText(this.aiName);
        this.sprite.setTint(0xff8888);
      } else {
        const heroIdx = Phaser.Math.Between(0, HERO_OPTIONS.length - 1);
        this.becomeHero(heroIdx);
      }
    }
  }

  becomeHero(heroIndex: number) {
    const hero = HERO_OPTIONS[heroIndex];
    this.isHero = true;
    this.heroData = hero;
    this.maxHp = hero.hp;
    this.hp = hero.hp;
    this.attackPower = hero.attack;
    this.speed = hero.speed;
    this.range = hero.range;
    const displaySize = hero.size * 2;
    this.sprite.setTexture(hero.texture);
    this.sprite.setDisplaySize(displaySize, displaySize);
    this.sprite.setTint(0xff6666);
    this.body.setSize(displaySize * 0.7, displaySize * 0.7);
    this.nameText.setText(`${this.aiName}·${hero.name}`);
  }

  findTarget(entities: BaseEntity[]): BaseEntity | null {
    let closest: BaseEntity | null = null;
    let closestDist = 300;

    for (const e of entities) {
      if (!e.isAlive || e === this) continue;
      const dist = this.distanceTo(e);
      if (dist < closestDist) {
        if (e.tier <= this.tier || (this.isHero && !((e as AIPlayer).isHero))) {
          closest = e;
          closestDist = dist;
        }
      }
    }
    return closest;
  }

  updateAI(delta: number, entities: BaseEntity[]) {
    if (!this.isAlive) return;

    this.decisionTimer -= delta;
    if (this.decisionTimer <= 0) {
      this.decisionTimer = 500 + Math.random() * 500;
      this.target = this.findTarget(entities);

      if (!this.target) {
        this.wanderTarget.set(
          Phaser.Math.Between(100, MAP_WIDTH - 100),
          Phaser.Math.Between(100, MAP_HEIGHT - 100)
        );
      }
    }

    if (this.target && this.target.isAlive) {
      const dist = this.distanceTo(this.target);
      if (dist > this.range) {
        const angle = Phaser.Math.Angle.Between(
          this.sprite.x, this.sprite.y,
          this.target.sprite.x, this.target.sprite.y
        );
        this.body.setVelocity(
          Math.cos(angle) * this.speed,
          Math.sin(angle) * this.speed
        );
      } else {
        this.body.setVelocity(0, 0);
        if (this.canAttack()) {
          const killed = this.tryAttack(this.target);
          if (killed) this.onKill();
        }
      }

      if (this.target.tier > this.tier && dist < 200) {
        const angle = Phaser.Math.Angle.Between(
          this.target.sprite.x, this.target.sprite.y,
          this.sprite.x, this.sprite.y
        );
        this.body.setVelocity(
          Math.cos(angle) * this.speed,
          Math.sin(angle) * this.speed
        );
      }
    } else {
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y,
        this.wanderTarget.x, this.wanderTarget.y
      );
      if (dist < 20) {
        this.wanderTarget.set(
          Phaser.Math.Between(100, MAP_WIDTH - 100),
          Phaser.Math.Between(100, MAP_HEIGHT - 100)
        );
      }
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        this.wanderTarget.x, this.wanderTarget.y
      );
      this.body.setVelocity(
        Math.cos(angle) * this.speed * 0.6,
        Math.sin(angle) * this.speed * 0.6
      );
    }
  }

  override update(delta: number) {
    if (!this.isAlive) return;
    super.update(delta);
    this.skillCooldown = Math.max(0, this.skillCooldown - delta);

    const size = EVOLUTION_CHAIN[this.tier]?.size ?? 20;
    const ringRadius = size + 6;
    this.indicator.clear();
    this.indicator.lineStyle(2, 0xff3333, 0.8);
    this.indicator.strokeCircle(this.sprite.x, this.sprite.y, ringRadius);

    this.aiLabel.setPosition(this.sprite.x + size + 4, this.sprite.y - size - 4);
  }

  override die() {
    super.die();
    this.indicator.clear();
    this.aiLabel.setVisible(false);
  }

  respawnAsMinion(x: number, y: number) {
    this.isAlive = true;
    this.tier = 0;
    this.kills = 0;
    this.isHero = false;
    this.heroData = null;
    this.setTier(0);
    this.sprite.setTint(0xff8888);
    this.sprite.setPosition(x, y);
    this.sprite.setVisible(true);
    this.body.enable = true;
    this.nameText.setText(this.aiName);
    this.nameText.setVisible(true);
    this.aiLabel.setVisible(true);
    this.hp = this.maxHp;
  }

  override destroy() {
    super.destroy();
    this.indicator.destroy();
    this.aiLabel.destroy();
  }
}
