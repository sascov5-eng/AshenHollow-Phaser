import { TouchControls } from '../input/TouchControls.js';

export class ApproachScene extends Phaser.Scene {
  constructor() {
    super('Approach');
  }

  create() {
    this.cameras.main.setBackgroundColor('#070a10');
    this.physics.world.gravity.y = 1700;
    this.physics.world.setBounds(0, 0, 1800, 720);

    this.platforms = this.physics.add.staticGroup();
    this.addPlatform(900, 670, 1800, 100);
    this.addPlatform(560, 510, 320, 40);
    this.addPlatform(1180, 430, 260, 36);

    this.player = this.add.rectangle(180, 575, 36, 60, 0xf1f5fb, 1)
      .setStrokeStyle(2, 0x74849a, 1);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(720, 900);
    this.physics.add.collider(this.player, this.platforms);

    this.enemy = this.add.rectangle(920, 585, 42, 62, 0xb44f50, 1)
      .setStrokeStyle(2, 0x6f2e32, 1);
    this.physics.add.existing(this.enemy, true);
    this.enemy.hp = 3;

    this.attackVisual = this.add.rectangle(0, 0, 68, 44, 0xffffff, 0.22)
      .setStrokeStyle(2, 0xffffff, 0.55)
      .setVisible(false);

    this.touch = new TouchControls(this);
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      attack: Phaser.Input.Keyboard.KeyCodes.Z,
    });

    this.facing = 1;
    this.attackCooldown = 0;
    this.attackRemaining = 0;
    this.dashRemaining = 0;
    this.dashCooldown = 0;

    this.cameras.main.setBounds(0, 0, 1800, 720);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    this.title = this.add.text(22, 18, 'ASHEN HOLLOW  •  ANDROID TEST 2', {
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      fontSize: '22px',
      color: '#eef4ff',
    }).setScrollFactor(0).setDepth(2000);

    this.stateLabel = this.add.text(22, 48, 'ready', {
      fontFamily: 'sans-serif',
      fontSize: '17px',
      color: '#9fb3ca',
    }).setScrollFactor(0).setDepth(2000);

    this.helpLabel = this.add.text(22, 76, 'Move • JMP • DSH • ATK', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#6f8298',
    }).setScrollFactor(0).setDepth(2000);
  }

  addPlatform(x, y, width, height) {
    const block = this.add.rectangle(x, y, width, height, 0x263243, 1)
      .setStrokeStyle(2, 0x3e526b, 1);
    this.physics.add.existing(block, true);
    this.platforms.add(block);
  }

  update(_, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 1 / 30);
    const touch = this.touch.snapshot();
    const left = this.keys.left.isDown || touch.x < 0;
    const right = this.keys.right.isDown || touch.x > 0;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.keys.jump) || touch.jumpPressed;
    const dashPressed = Phaser.Input.Keyboard.JustDown(this.keys.dash) || touch.dashPressed;
    const attackPressed = Phaser.Input.Keyboard.JustDown(this.keys.attack) || touch.attackPressed;

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.attackRemaining = Math.max(0, this.attackRemaining - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.dashRemaining = Math.max(0, this.dashRemaining - dt);

    const grounded = this.player.body.blocked.down || this.player.body.touching.down;

    if (dashPressed && this.dashCooldown <= 0) {
      this.dashRemaining = 0.16;
      this.dashCooldown = 0.60;
    }

    if (this.dashRemaining > 0) {
      this.player.body.setAllowGravity(false);
      this.player.body.setVelocity(this.facing * 720, 0);
    } else {
      this.player.body.setAllowGravity(true);
      const move = (left ? -1 : 0) + (right ? 1 : 0);
      if (move !== 0) this.facing = move > 0 ? 1 : -1;
      this.player.body.setVelocityX(move * 315);
      if (jumpPressed && grounded) this.player.body.setVelocityY(-610);
    }

    if (attackPressed && this.attackCooldown <= 0) {
      this.attackRemaining = 0.22;
      this.attackCooldown = 0.32;
      this.tryHitEnemy();
    }

    const attacking = this.attackRemaining > 0;
    this.attackVisual.setVisible(attacking);
    if (attacking) {
      this.attackVisual.setPosition(this.player.x + this.facing * 52, this.player.y);
    }

    let state = 'idle';
    if (attacking) state = 'attack';
    else if (this.dashRemaining > 0) state = 'dash';
    else if (!grounded && this.player.body.velocity.y < 0) state = 'jump';
    else if (!grounded) state = 'fall';
    else if (Math.abs(this.player.body.velocity.x) > 1) state = 'run';
    this.stateLabel.setText(`${state}  |  enemy HP: ${this.enemy?.active ? this.enemy.hp : 0}`);
  }

  tryHitEnemy() {
    if (!this.enemy?.active) return;
    const hitX = this.player.x + this.facing * 52;
    const dx = Math.abs(this.enemy.x - hitX);
    const dy = Math.abs(this.enemy.y - this.player.y);
    if (dx > 62 || dy > 54) return;

    this.enemy.hp -= 1;
    this.enemy.setFillStyle(0xffffff, 1);
    this.time.delayedCall(90, () => {
      if (this.enemy?.active) this.enemy.setFillStyle(0xb44f50, 1);
    });
    if (this.enemy.hp <= 0) this.enemy.destroy();
  }
}
