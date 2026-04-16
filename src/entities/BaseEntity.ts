import Phaser from 'phaser';
import { EVOLUTION_CHAIN } from '../config';

export class BaseEntity {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  body: Phaser.Physics.Arcade.Body;
  tier: number;
  hp: number;
  maxHp: number;
  attackPower: number;
  speed: number;
  range: number;
  kills: number = 0;
  attackCooldown: number = 0;
  hpBar: Phaser.GameObjects.Graphics;
  nameText: Phaser.GameObjects.Text;
  isAlive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, tier: number) {
    this.scene = scene;
    this.tier = tier;
    const stats = EVOLUTION_CHAIN[tier];
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.attackPower = stats.attack;
    this.speed = stats.speed;
    this.range = stats.range;

    const displaySize = stats.size * 2;
    this.sprite = scene.add.sprite(x, y, stats.texture);
    this.sprite.setDisplaySize(displaySize, displaySize);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setSize(displaySize * 0.7, displaySize * 0.7);
    this.body.setOffset(
      (this.sprite.width - displaySize * 0.7 * (this.sprite.width / displaySize)) / 2,
      (this.sprite.height - displaySize * 0.7 * (this.sprite.height / displaySize)) / 2
    );

    this.hpBar = scene.add.graphics();
    this.nameText = scene.add.text(x, y - stats.size - 14, stats.name, {
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  updateHpBar() {
    this.hpBar.clear();
    const size = EVOLUTION_CHAIN[this.tier]?.size ?? 20;
    const barWidth = size * 2;
    const barHeight = 4;
    const x = this.sprite.x - barWidth / 2;
    const y = this.sprite.y - size - 8;

    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(x, y, barWidth, barHeight);
    this.hpBar.fillStyle(this.hp > this.maxHp * 0.3 ? 0x00ff00 : 0xff0000);
    this.hpBar.fillRect(x, y, barWidth * (this.hp / this.maxHp), barHeight);

    this.nameText.setPosition(this.sprite.x, y - 12);
  }

  takeDamage(amount: number): boolean {
    if (!this.isAlive) return false;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.isAlive = false;
    this.sprite.setVisible(false);
    this.body.enable = false;
    this.hpBar.clear();
    this.nameText.setVisible(false);
  }

  destroy() {
    this.sprite.destroy();
    this.hpBar.destroy();
    this.nameText.destroy();
  }

  distanceTo(other: BaseEntity): number {
    return Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      other.sprite.x, other.sprite.y
    );
  }

  canAttack(): boolean {
    return this.isAlive && this.attackCooldown <= 0;
  }

  tryAttack(target: BaseEntity): boolean {
    if (!this.canAttack() || !target.isAlive) return false;
    if (this.distanceTo(target) > this.range + (EVOLUTION_CHAIN[target.tier]?.size ?? 20)) return false;
    this.attackCooldown = 500;
    return target.takeDamage(this.attackPower);
  }

  update(delta: number) {
    if (!this.isAlive) return;
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.updateHpBar();
  }

  setTier(tier: number) {
    this.tier = tier;
    const stats = EVOLUTION_CHAIN[tier];
    this.maxHp = stats.hp;
    this.hp = stats.hp;
    this.attackPower = stats.attack;
    this.speed = stats.speed;
    this.range = stats.range;
    const displaySize = stats.size * 2;
    this.sprite.setTexture(stats.texture);
    this.sprite.setDisplaySize(displaySize, displaySize);
    this.body.setSize(displaySize * 0.7, displaySize * 0.7);
    this.nameText.setText(stats.name);
  }
}
