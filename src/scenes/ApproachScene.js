import { PlayerController } from '../player/PlayerController.js';
import { TouchControls } from '../input/TouchControls.js';
import { parseTMX } from '../level/TMXParser.js';

export class ApproachScene extends Phaser.Scene {
  constructor() {
    super('Approach');
  }

  preload() {
    this.load.text('approach-tmx', 'assets/maps/approach.tmx');
  }

  create() {
    this.cameras.main.setBackgroundColor('#070a10');
    this.mapData = parseTMX(this.cache.text.get('approach-tmx'));
    this.physics.world.setBounds(0, 0, this.mapData.width, this.mapData.height);

    this.platforms = this.physics.add.staticGroup();
    for (const platform of this.mapData.platforms) {
      const block = this.add.rectangle(
        platform.x + platform.width / 2,
        platform.y + platform.height / 2,
        platform.width,
        platform.height,
        0x232b38,
        1,
      ).setStrokeStyle(2, 0x344256, 1);
      this.physics.add.existing(block, true);
      this.platforms.add(block);
    }

    this.player = new PlayerController(this, this.mapData.spawn.x, this.mapData.spawn.y);
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.enemies = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const enemyData of this.mapData.enemies) {
      const enemy = this.add.rectangle(enemyData.x, enemyData.y - 30, 40, 60, 0xa94b4b, 1);
      this.physics.add.existing(enemy);
      enemy.body.setAllowGravity(false);
      enemy.hp = 3;
      this.enemies.add(enemy);
    }
    this.physics.add.overlap(this.player.attackHitbox, this.enemies, (_, enemy) => this.onEnemyHit(enemy));

    this.touch = new TouchControls(this);
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      attack: Phaser.Input.Keyboard.KeyCodes.Z,
    });

    this.cameras.main.setBounds(0, 0, this.mapData.width, this.mapData.height);
    this.cameras.main.startFollow(this.player.sprite, true, 0.10, 0.10);
    this.cameras.main.setZoom(1.15);

    this.stateLabel = this.add.text(18, 18, 'Approach', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#d9e2ee',
    }).setScrollFactor(0).setDepth(1100);
  }

  update(_, deltaMs) {
    const touch = this.touch.snapshot();
    const keyboardX = (this.keys.left.isDown ? -1 : 0) + (this.keys.right.isDown ? 1 : 0);
    const input = {
      x: keyboardX !== 0 ? keyboardX : touch.x,
      up: this.keys.up.isDown || touch.up,
      down: this.keys.down.isDown || touch.down,
      jumpHeld: this.keys.jump.isDown || touch.jumpHeld,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.jump) || touch.jumpPressed,
      dashPressed: Phaser.Input.Keyboard.JustDown(this.keys.dash) || touch.dashPressed,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keys.attack) || touch.attackPressed,
    };

    const state = this.player.update(Math.min(deltaMs / 1000, 1 / 30), input);
    this.stateLabel.setText(`Approach  |  ${state.animationState}`);
  }

  onEnemyHit(enemy) {
    if (!this.player.attack.isHitboxActive || enemy.lastAttackSequence === this.player.attackSequence) return;
    enemy.lastAttackSequence = this.player.attackSequence;
    enemy.hp -= 1;
    enemy.setFillStyle(0xffffff, 1);
    this.time.delayedCall(80, () => enemy.active && enemy.setFillStyle(0xa94b4b, 1));
    if (enemy.hp <= 0) enemy.destroy();
  }
}
