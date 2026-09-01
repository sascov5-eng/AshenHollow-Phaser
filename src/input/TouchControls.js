const CONTROL_LAYOUT = {
  left: { x: 0.20, dx: -56, yOffset: 116, radius: 32, label: '◀' },
  right: { x: 0.20, dx: 56, yOffset: 116, radius: 32, label: '▶' },
  up: { x: 0.20, dx: 0, yOffset: 172, radius: 32, label: '▲' },
  down: { x: 0.20, dx: 0, yOffset: 60, radius: 32, label: '▼' },
  attack: { fromRight: 190, yOffset: 116, radius: 47, label: 'ATK' },
  jump: { fromRight: 75, yOffset: 116, radius: 51, label: 'JMP' },
  dash: { fromRight: 137, yOffset: 206, radius: 42, label: 'DSH' },
};

export class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.held = new Set();
    this.pressed = new Set();
    this.buttons = new Map();
    this.createButtons();
    scene.scale.on('resize', () => this.layout());
    this.layout();
  }

  createButtons() {
    for (const [name, spec] of Object.entries(CONTROL_LAYOUT)) {
      const circle = this.scene.add.circle(0, 0, spec.radius, 0x1f2633, 0.58)
        .setStrokeStyle(2, 0xffffff, 0.18)
        .setScrollFactor(0)
        .setDepth(1000)
        .setInteractive(new Phaser.Geom.Circle(0, 0, spec.radius + 12), Phaser.Geom.Circle.Contains);
      const label = this.scene.add.text(0, 0, spec.label, {
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        fontSize: name === 'attack' || name === 'jump' || name === 'dash' ? '16px' : '22px',
        color: '#f3f6fb',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

      const press = () => {
        if (!this.held.has(name)) this.pressed.add(name);
        this.held.add(name);
        circle.setAlpha(0.95);
      };
      const release = () => {
        this.held.delete(name);
        circle.setAlpha(1);
      };

      circle.on('pointerdown', press);
      circle.on('pointerup', release);
      circle.on('pointerout', release);
      circle.on('pointerupoutside', release);
      this.buttons.set(name, { circle, label, spec });
    }
  }

  layout() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const dpadCenterX = Math.min(145, Math.max(120, width * 0.20));
    const baselineY = Math.max(96, height - 116);

    for (const { circle, label, spec } of this.buttons.values()) {
      const x = spec.fromRight != null ? width - spec.fromRight : dpadCenterX + (spec.dx ?? 0);
      const y = spec.fromRight != null ? height - spec.yOffset : baselineY + (116 - spec.yOffset);
      circle.setPosition(x, y);
      label.setPosition(x, y);
    }
  }

  snapshot() {
    const output = {
      x: (this.held.has('left') ? -1 : 0) + (this.held.has('right') ? 1 : 0),
      up: this.held.has('up'),
      down: this.held.has('down'),
      jumpHeld: this.held.has('jump'),
      jumpPressed: this.pressed.has('jump'),
      dashPressed: this.pressed.has('dash'),
      attackPressed: this.pressed.has('attack'),
    };
    this.pressed.clear();
    return output;
  }
}
