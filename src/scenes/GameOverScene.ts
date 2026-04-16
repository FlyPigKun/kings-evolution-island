import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { time: number; kills: number; maxTier: string; mapIndex?: number; victory?: boolean }) {
    const isVictory = data.victory === true;
    this.cameras.main.setBackgroundColor(isVictory ? '#0a1a0a' : '#1a0a0a');

    const sec = Math.floor((data.time || 0) / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;

    this.add.text(GAME_WIDTH / 2, 100, isVictory ? '胜利!' : '游戏结束', {
      fontSize: '48px',
      color: isVictory ? '#FFD700' : '#ff4444',
      stroke: '#000',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (isVictory) {
      this.add.text(GAME_WIDTH / 2, 155, '你消灭了所有敌人!', {
        fontSize: '18px', color: '#88ff88',
      }).setOrigin(0.5);
    }

    const stats = [
      `存活时间: ${min}分${s}秒`,
      `总击杀数: ${data.kills || 0}`,
      `最高进化: ${data.maxTier || '近战小兵'}`,
    ];

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, stats.join('\n'), {
      fontSize: '22px',
      color: '#fff',
      lineSpacing: 16,
      align: 'center',
    }).setOrigin(0.5);

    const retryBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 220, 55, 0x4488ff, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, '再来一局', {
      fontSize: '22px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    retryBtn.on('pointerdown', () => this.scene.start('GameScene', { mapIndex: data.mapIndex ?? 0 }));
    retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x66aaff));
    retryBtn.on('pointerout', () => retryBtn.setFillStyle(0x4488ff));

    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 175, 220, 55, 0x444444, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 175, '返回主页', {
      fontSize: '22px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x666666));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x444444));
  }
}
