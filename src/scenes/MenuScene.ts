import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GAME_MAPS } from '../config';

export class MenuScene extends Phaser.Scene {
  selectedMap: number = 0;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(GAME_WIDTH / 2, 60, '王者进化岛', {
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 110, '击杀进化 · 适者生存', {
      fontSize: '18px',
      color: '#aaa',
    }).setOrigin(0.5);

    // Map selection
    this.add.text(GAME_WIDTH / 2, 160, '选择地图', {
      fontSize: '20px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const mapStartX = GAME_WIDTH / 2 - (GAME_MAPS.length - 1) * 180;
    const mapCards: Phaser.GameObjects.Rectangle[] = [];
    const mapBorders: Phaser.GameObjects.Rectangle[] = [];

    GAME_MAPS.forEach((map, i) => {
      const cx = mapStartX + i * 360;
      const cy = 310;

      const border = this.add.rectangle(cx, cy, 310, 190, 0x000000, 0)
        .setStrokeStyle(3, i === 0 ? 0xFFD700 : 0x444444);
      mapBorders.push(border);

      const preview = this.add.image(cx, cy - 10, map.groundTexture)
        .setDisplaySize(280, 140);

      const card = this.add.rectangle(cx, cy, 300, 180, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      mapCards.push(card);

      this.add.text(cx, cy + 78, map.name, {
        fontSize: '14px', color: '#fff', fontStyle: 'bold',
        backgroundColor: '#00000088', padding: { x: 8, y: 3 },
      }).setOrigin(0.5);

      card.on('pointerdown', () => {
        this.selectedMap = i;
        mapBorders.forEach((b, idx) => {
          b.setStrokeStyle(3, idx === i ? 0xFFD700 : 0x444444);
        });
      });
      card.on('pointerover', () => {
        if (this.selectedMap !== i) border.setStrokeStyle(3, 0x888888);
      });
      card.on('pointerout', () => {
        if (this.selectedMap !== i) border.setStrokeStyle(3, 0x444444);
      });
    });

    const startBtn = this.add.rectangle(GAME_WIDTH / 2, 480, 220, 55, 0xff4444, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 480, '开始游戏', {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { mapIndex: this.selectedMap });
    });
    startBtn.on('pointerover', () => startBtn.setFillStyle(0xff6666));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0xff4444));

    this.add.text(GAME_WIDTH / 2, 540, '操作: 左侧摇杆移动 | 右侧攻击 | 以弱胜强获额外经验', {
      fontSize: '13px',
      color: '#666',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 565, '进化链: 小兵 → 超级兵 → Buff → 巨龙 → 暴君 → 英雄', {
      fontSize: '12px',
      color: '#555',
    }).setOrigin(0.5);
  }
}
