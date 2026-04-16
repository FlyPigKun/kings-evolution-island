import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT, GAME_WIDTH } from '../config';
import { BaseEntity } from '../entities/BaseEntity';
import { Player } from '../entities/Player';
import { AIPlayer } from '../entities/AIPlayer';

export class Minimap {
  scene: Phaser.Scene;
  graphics: Phaser.GameObjects.Graphics;
  width: number = 160;
  height: number = 120;
  x: number;
  y: number = 10;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.x = GAME_WIDTH - this.width - 10;
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(100);
  }

  update(player: Player, ais: AIPlayer[], npcs: BaseEntity[]) {
    this.graphics.clear();

    this.graphics.fillStyle(0x1a3a1a, 0.7);
    this.graphics.fillRect(this.x, this.y, this.width, this.height);
    this.graphics.lineStyle(1, 0x446644);
    this.graphics.strokeRect(this.x, this.y, this.width, this.height);

    const sx = this.width / MAP_WIDTH;
    const sy = this.height / MAP_HEIGHT;

    for (const npc of npcs) {
      if (!npc.isAlive) continue;
      this.graphics.fillStyle(0x888888, 0.6);
      this.graphics.fillCircle(this.x + npc.sprite.x * sx, this.y + npc.sprite.y * sy, 1.5);
    }

    for (const ai of ais) {
      if (!ai.isAlive) continue;
      this.graphics.fillStyle(0xff4444);
      this.graphics.fillCircle(this.x + ai.sprite.x * sx, this.y + ai.sprite.y * sy, 3);
    }

    if (player.isAlive) {
      this.graphics.fillStyle(0x00ff88);
      this.graphics.fillCircle(this.x + player.sprite.x * sx, this.y + player.sprite.y * sy, 4);
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
