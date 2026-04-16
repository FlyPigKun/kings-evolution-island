import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, HERO_OPTIONS } from '../config';

export class HeroSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HeroSelectScene' });
  }

  create(data: { onSelect: (index: number) => void }) {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    this.add.text(GAME_WIDTH / 2, 60, '选择你的英雄', {
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 4,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 100, '恭喜进化到最高形态！选择一位英雄继续战斗', {
      fontSize: '14px',
      color: '#aaa',
    }).setOrigin(0.5);

    const startX = GAME_WIDTH / 2 - (HERO_OPTIONS.length - 1) * 160;

    HERO_OPTIONS.forEach((hero, i) => {
      const cx = startX + i * 320;
      const cy = GAME_HEIGHT / 2 + 30;

      const card = this.add.rectangle(cx, cy, 260, 320, 0x222244, 0.9)
        .setStrokeStyle(2, hero.color)
        .setInteractive({ useHandCursor: true });

      const heroImg = this.add.image(cx, cy - 80, hero.texture);
      heroImg.setDisplaySize(80, 80);

      this.add.text(cx, cy - 20, hero.name, {
        fontSize: '24px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5);

      const typeMap: Record<string, string> = { warrior: '战士', mage: '法师', marksman: '射手' };
      this.add.text(cx, cy + 10, typeMap[hero.type] || hero.type, {
        fontSize: '14px', color: '#aaa',
      }).setOrigin(0.5);

      const stats = [
        `生命: ${hero.hp}`,
        `攻击: ${hero.attack}`,
        `射程: ${hero.range}`,
        `技能: ${hero.skill}`,
        `伤害: ${hero.skillDamage}`,
      ];
      this.add.text(cx, cy + 40, stats.join('\n'), {
        fontSize: '12px', color: '#ccc', lineSpacing: 4, align: 'center',
      }).setOrigin(0.5, 0);

      card.on('pointerover', () => card.setStrokeStyle(3, 0xffffff));
      card.on('pointerout', () => card.setStrokeStyle(2, hero.color));
      card.on('pointerdown', () => {
        data.onSelect(i);
        this.scene.stop();
      });
    });
  }
}
