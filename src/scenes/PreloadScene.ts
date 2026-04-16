import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const w = this.scale.width;
    const h = this.scale.height;
    const bar = this.add.graphics();
    const text = this.add.text(w / 2, h / 2 - 30, '加载中...', {
      fontSize: '20px', color: '#FFD700',
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0x333333);
      bar.fillRect(w / 2 - 150, h / 2, 300, 20);
      bar.fillStyle(0xFFD700);
      bar.fillRect(w / 2 - 150, h / 2, 300 * v, 20);
    });

    this.load.on('complete', () => {
      bar.destroy();
      text.destroy();
    });

    this.load.image('melee_minion', 'assets/units/melee_minion.png');
    this.load.image('ranged_minion', 'assets/units/ranged_minion.png');
    this.load.image('super_minion', 'assets/units/super_minion.png');
    this.load.image('red_buff', 'assets/units/red_buff.png');
    this.load.image('dragon', 'assets/units/dragon.png');
    this.load.image('tyrant', 'assets/units/tyrant.png');
    this.load.image('hero_arthur', 'assets/heroes/hero_arthur.png');
    this.load.image('hero_xiaoqiao', 'assets/heroes/hero_xiaoqiao.png');
    this.load.image('hero_sunshangxiang', 'assets/heroes/hero_sunshangxiang.png');
    // 地面底图
    this.load.image('ground_canyon', 'assets/map/ground_canyon.jpg');
    this.load.image('ground_volcano', 'assets/map/ground_volcano.jpg');
    this.load.image('ground_frozen', 'assets/map/ground_frozen.jpg');
    // 地图物件精灵
    this.load.image('obj_rock', 'assets/map/objects/rock.png');
    this.load.image('obj_tree', 'assets/map/objects/tree.png');
    this.load.image('obj_bush', 'assets/map/objects/bush.png');
    this.load.image('obj_wall', 'assets/map/objects/wall.png');
    this.load.image('obj_lava_rock', 'assets/map/objects/lava_rock.png');
    this.load.image('obj_lava_bush', 'assets/map/objects/lava_bush.png');
    this.load.image('obj_ice_crystal', 'assets/map/objects/ice_crystal.png');
    this.load.image('obj_snow_bush', 'assets/map/objects/snow_bush.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
