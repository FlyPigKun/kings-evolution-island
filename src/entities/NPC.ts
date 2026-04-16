import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { EVOLUTION_CHAIN, MAP_WIDTH, MAP_HEIGHT } from '../config';

export class NPC extends BaseEntity {
  wanderTimer: number = 0;
  spawnX: number;
  spawnY: number;
  wanderRadius: number = 150;

  constructor(scene: Phaser.Scene, x: number, y: number, tier: number) {
    super(scene, x, y, tier);
    this.spawnX = x;
    this.spawnY = y;
    this.sprite.setAlpha(0.9);
  }

  updateNPC(delta: number) {
    if (!this.isAlive) return;
    super.update(delta);

    this.wanderTimer -= delta;
    if (this.wanderTimer <= 0) {
      this.wanderTimer = 1500 + Math.random() * 2000;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.wanderRadius;
      const tx = Phaser.Math.Clamp(this.spawnX + Math.cos(angle) * dist, 50, MAP_WIDTH - 50);
      const ty = Phaser.Math.Clamp(this.spawnY + Math.sin(angle) * dist, 50, MAP_HEIGHT - 50);
      const moveAngle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, tx, ty);
      this.body.setVelocity(
        Math.cos(moveAngle) * this.speed * 0.3,
        Math.sin(moveAngle) * this.speed * 0.3
      );
    }
  }

  respawn(x: number, y: number) {
    this.isAlive = true;
    this.hp = this.maxHp;
    this.spawnX = x;
    this.spawnY = y;
    this.sprite.setPosition(x, y);
    this.sprite.setVisible(true);
    this.body.enable = true;
    this.nameText.setVisible(true);
  }
}
