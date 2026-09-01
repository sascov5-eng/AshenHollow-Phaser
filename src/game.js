const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false }
  },
  scene: {
    preload() {},
    create() {
      this.add.text(40, 40, 'Ashen Hollow - Android Port Base', { fontSize: '32px' });
      this.player = this.physics.add.sprite(200, 400, null);
      this.player.setSize(32,64);
      this.cursors = this.input.keyboard.createCursorKeys();
    },
    update() {
      if (this.cursors.left.isDown) this.player.setVelocityX(-200);
      else if (this.cursors.right.isDown) this.player.setVelocityX(200);
      else this.player.setVelocityX(0);
      if (this.cursors.up.isDown && this.player.body.blocked.down) this.player.setVelocityY(-450);
    }
  }
};

new Phaser.Game(config);
