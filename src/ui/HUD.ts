import Phaser from 'phaser';
import { KILLS_TO_EVOLVE, EVOLUTION_CHAIN, HERO_OPTIONS } from '../config';

export class HUD {
  scene: Phaser.Scene;
  tierText: Phaser.GameObjects.Text;
  killsText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  progressBar: Phaser.GameObjects.Graphics;
  attackBtn: Phaser.GameObjects.Arc;
  attackBtnText: Phaser.GameObjects.Text;
  skillBtn: Phaser.GameObjects.Arc;
  skillBtnText: Phaser.GameObjects.Text;
  skillCooldownText: Phaser.GameObjects.Text;

  onAttack: (() => void) | null = null;
  onSkill: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const w = scene.scale.width;
    const h = scene.scale.height;

    this.tierText = scene.add.text(20, 16, '', {
      fontSize: '16px', color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100);

    this.killsText = scene.add.text(20, 40, '', {
      fontSize: '14px', color: '#fff', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(100);

    this.timerText = scene.add.text(w / 2, 16, '0:00', {
      fontSize: '18px', color: '#fff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.progressBar = scene.add.graphics().setScrollFactor(0).setDepth(100);

    this.attackBtn = scene.add.circle(w - 100, h - 120, 40, 0xff4444, 0.7)
      .setScrollFactor(0).setDepth(100).setInteractive();
    this.attackBtnText = scene.add.text(w - 100, h - 120, '攻击', {
      fontSize: '16px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    this.skillBtn = scene.add.circle(w - 190, h - 80, 35, 0x4488ff, 0.7)
      .setScrollFactor(0).setDepth(100).setInteractive().setVisible(false);
    this.skillBtnText = scene.add.text(w - 190, h - 80, '技能', {
      fontSize: '14px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setVisible(false);
    this.skillCooldownText = scene.add.text(w - 190, h - 55, '', {
      fontSize: '11px', color: '#aaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    this.attackBtn.on('pointerdown', () => this.onAttack?.());
    this.skillBtn.on('pointerdown', () => this.onSkill?.());
  }

  updateTier(tier: number, isHero: boolean, heroName?: string) {
    if (isHero) {
      this.tierText.setText(`英雄: ${heroName}`);
      this.skillBtn.setVisible(true);
      this.skillBtnText.setVisible(true);
    } else {
      this.tierText.setText(`等级: ${EVOLUTION_CHAIN[tier].name}`);
    }
  }

  updateKills(kills: number, tier: number, isHero: boolean) {
    if (isHero) {
      this.killsText.setText(`击杀: ${kills}`);
      this.progressBar.clear();
    } else {
      const needed = KILLS_TO_EVOLVE[tier] ?? 0;
      this.killsText.setText(`进化: ${kills}/${needed}`);

      this.progressBar.clear();
      const barW = 200;
      const barH = 8;
      const barX = 20;
      const barY = 64;
      this.progressBar.fillStyle(0x333333);
      this.progressBar.fillRect(barX, barY, barW, barH);
      this.progressBar.fillStyle(0x00ccff);
      this.progressBar.fillRect(barX, barY, barW * (kills / (needed || 1)), barH);
    }
  }

  updateTimer(elapsed: number) {
    const sec = Math.floor(elapsed / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    this.timerText.setText(`${min}:${s.toString().padStart(2, '0')}`);
  }

  updateSkillCooldown(cd: number) {
    if (cd > 0) {
      this.skillCooldownText.setText(`${(cd / 1000).toFixed(1)}s`);
      this.skillBtn.setAlpha(0.3);
    } else {
      this.skillCooldownText.setText('');
      this.skillBtn.setAlpha(0.7);
    }
  }

  showHeroSkill(heroName: string, skillName: string) {
    this.skillBtnText.setText(skillName);
  }

  destroy() {
    this.tierText.destroy();
    this.killsText.destroy();
    this.timerText.destroy();
    this.progressBar.destroy();
    this.attackBtn.destroy();
    this.attackBtnText.destroy();
    this.skillBtn.destroy();
    this.skillBtnText.destroy();
    this.skillCooldownText.destroy();
  }
}
