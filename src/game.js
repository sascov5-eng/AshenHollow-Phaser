const TestScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize() { Phaser.Scene.call(this, { key: 'TestScene' }); },
  create() {
    this.add.text(40, 40, 'Ashen Hollow Android TEST', { fontSize: '32px', color: '#ffffff' });
    this.add.rectangle(640, 650, 1000, 40, 0x3b82f6);
    this.player = this.add.rectangle(200, 550, 50, 80, 0xffffff);
    this.enemy = this.add.rectangle(800, 570, 60, 60, 0xff0000);
    this.keys = this.input.keyboard.createCursorKeys();
    this.add.text(40, 100, 'LEFT RIGHT / UP', { fontSize: '24px', color: '#aaaaaa' });
    this.cameras.main.startFollow(this.player);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.existing(this.enemy);
  },
  update() {
    if (this.keys.left.isDown) this.player.x -= 5;
    if (this.keys.right.isDown) this.player.x += 5;
    if (this.keys.up.isDown) this.player.y -= 5;
  }
});

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#070a10',
  scene: [TestScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

new Phaser.Game(config);
