import Phaser from 'phaser';

export class VirtualJoystick {
  scene: Phaser.Scene;
  base: Phaser.GameObjects.Arc;
  thumb: Phaser.GameObjects.Arc;
  direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  isActive: boolean = false;
  private pointer: Phaser.Input.Pointer | null = null;
  private baseX: number;
  private baseY: number;
  private radius: number = 80;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.baseX = 140;
    this.baseY = scene.scale.height - 140;

    this.base = scene.add.circle(this.baseX, this.baseY, this.radius, 0x000000, 0.3)
      .setScrollFactor(0).setDepth(100);
    this.thumb = scene.add.circle(this.baseX, this.baseY, 35, 0xffffff, 0.5)
      .setScrollFactor(0).setDepth(101);

    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.x < scene.scale.width / 2) {
        this.isActive = true;
        this.pointer = p;
        this.baseX = p.x;
        this.baseY = p.y;
        this.base.setPosition(this.baseX, this.baseY);
        this.thumb.setPosition(this.baseX, this.baseY);
        this.base.setVisible(true);
        this.thumb.setVisible(true);
      }
    });

    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.isActive && this.pointer && p.id === this.pointer.id) {
        this.updateThumb(p.x, p.y);
      }
    });

    scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.pointer && p.id === this.pointer.id) {
        this.isActive = false;
        this.pointer = null;
        this.direction.set(0, 0);
        this.thumb.setPosition(this.baseX, this.baseY);
      }
    });
  }

  private updateThumb(px: number, py: number) {
    const dx = px - this.baseX;
    const dy = py - this.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const clampDist = Math.min(dist, this.radius);
      const nx = dx / dist;
      const ny = dy / dist;
      this.thumb.setPosition(
        this.baseX + nx * clampDist,
        this.baseY + ny * clampDist
      );
      this.direction.set(nx, ny);
    } else {
      this.direction.set(0, 0);
    }
  }

  destroy() {
    this.base.destroy();
    this.thumb.destroy();
  }
}
