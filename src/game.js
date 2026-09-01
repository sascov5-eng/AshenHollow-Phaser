const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1200 }, debug: false }
  },
  scene: {
    create() {
      this.add.text(40, 40, 'Ashen Hollow - Android Port Base', { fontSize: '32px' });

      this.player = this.physics.add.rectangle(200, 400, 32, 64, 0xffffff);
      this.player.body.setCollideWorldBounds(true);
      this.cursors = this.input.keyboard.createCursorKeys();
    },
    update() {
      const speed = 220;
      this.player.body.setVelocityX(0);

      if (this.cursors.left.isDown) this.player.body.setVelocityX(-speed);
      if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);

      if (this.cursors.up.isDown && this.player.body.blocked.down) {
        this.player.body.setVelocityY(-500);
      }
    }
  }
};

new Phaser.Game(config);
