import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { KILLS_TO_EVOLVE, EVOLUTION_CHAIN, HERO_OPTIONS, getKillCredit } from '../config';

export class Player extends BaseEntity {
  isHero: boolean = false;
  heroData: typeof HERO_OPTIONS[number] | null = null;
  skillCooldown: number = 0;
  invincibleTimer: number = 0;
  onEvolveToHero: (() => void) | null = null;
  onDeath: (() => void) | null = null;
  indicator: Phaser.GameObjects.Graphics;

  moveDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 0);
    this.sprite.setDepth(10);
    this.hpBar.setDepth(11);
    this.nameText.setDepth(11);
    this.nameText.setText('你');
    this.nameText.setColor('#00ff88');

    this.indicator = scene.add.graphics();
    this.indicator.setDepth(9);
  }

  setMoveDirection(x: number, y: number) {
    this.moveDirection.set(x, y);
    if (this.moveDirection.length() > 0) {
      this.moveDirection.normalize();
    }
  }

  onKill(victimTier: number = this.tier) {
    const credit = getKillCredit(this.tier, victimTier);
    this.kills += credit;
    if (this.isHero) return;

    if (credit > 1) {
      this.showBonusText(credit);
    }

    const needed = KILLS_TO_EVOLVE[this.tier];
    if (needed !== undefined && this.kills >= needed) {
      this.kills = 0;
      if (this.tier < EVOLUTION_CHAIN.length - 1) {
        this.setTier(this.tier + 1);
        this.invincibleTimer = 500;
        this.showEvolveEffect();
      } else {
        this.onEvolveToHero?.();
      }
    }
  }

  showBonusText(credit: number) {
    const txt = this.scene.add.text(
      this.sprite.x, this.sprite.y - 40,
      `+${credit} 以弱胜强!`,
      { fontSize: '14px', color: '#ffff00', stroke: '#000', strokeThickness: 3, fontStyle: 'bold' }
    ).setOrigin(0.5).setDepth(20);
    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => txt.destroy(),
    });
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
    this.body.setSize(displaySize * 0.7, displaySize * 0.7);
    this.nameText.setText(hero.name);
  }

  useSkill(entities: BaseEntity[]): boolean {
    if (!this.isHero || !this.heroData || this.skillCooldown > 0) return false;
    this.skillCooldown = this.heroData.skillCooldown;

    const skillRange = this.heroData.skillRange;
    const skillDamage = this.heroData.skillDamage;

    const effect = this.scene.add.circle(this.sprite.x, this.sprite.y, skillRange, 0xffff00, 0.3);
    effect.setDepth(5);
    this.scene.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => effect.destroy(),
    });

    for (const entity of entities) {
      if (!entity.isAlive || entity === this) continue;
      if (this.distanceTo(entity) <= skillRange) {
        const victimTier = entity.tier;
        const killed = entity.takeDamage(skillDamage);
        if (killed) this.onKill(victimTier);
      }
    }
    return true;
  }

  showEvolveEffect() {
    const ring = this.scene.add.circle(this.sprite.x, this.sprite.y, 10, 0xffffff, 0.6);
    ring.setDepth(15);
    this.scene.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 600,
      onComplete: () => ring.destroy(),
    });
  }

  override die() {
    super.die();
    this.onDeath?.();
  }

  override takeDamage(amount: number): boolean {
    if (this.invincibleTimer > 0) return false;
    return super.takeDamage(amount);
  }

  override update(delta: number) {
    if (!this.isAlive) return;
    super.update(delta);

    this.invincibleTimer = Math.max(0, this.invincibleTimer - delta);
    this.skillCooldown = Math.max(0, this.skillCooldown - delta);

    if (this.invincibleTimer > 0) {
      this.sprite.setAlpha(0.5 + Math.sin(Date.now() * 0.01) * 0.3);
    } else {
      this.sprite.setAlpha(1);
    }

    this.body.setVelocity(
      this.moveDirection.x * this.speed,
      this.moveDirection.y * this.speed
    );

    const size = this.isHero ? (this.heroData?.size ?? 50) : (EVOLUTION_CHAIN[this.tier]?.size ?? 20);
    const ringRadius = size + 6;
    this.indicator.clear();
    this.indicator.lineStyle(2, 0x00ff88, 0.8);
    this.indicator.strokeCircle(this.sprite.x, this.sprite.y, ringRadius);
  }
}
