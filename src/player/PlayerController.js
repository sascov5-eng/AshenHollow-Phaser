import { PlayerMotor } from './PlayerMotor.js';
import { AttackController } from '../combat/AttackController.js';
import { MOVEMENT } from '../tuning.js';

export class PlayerController {
  constructor(scene, x, y) {
    this.scene = scene;
    this.motor = new PlayerMotor();
    this.attack = new AttackController();

    this.sprite = scene.physics.add.rectangle(x, y, MOVEMENT.colliderWidth, MOVEMENT.colliderHeight, 0xe8eef7, 1);
    this.sprite.setStrokeStyle(2, 0x59677a, 1);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setSize(MOVEMENT.colliderWidth, MOVEMENT.colliderHeight, true);

    this.attackHitbox = scene.add.zone(x, y, 62, 42);
    scene.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.setAllowGravity(false);
    this.attackHitbox.body.enable = false;

    this.animationState = 'idle';
    this.attackStarted = false;
    this.attackSequence = 0;
  }

  update(dt, input) {
    const body = this.sprite.body;
    const sensors = {
      grounded: body.blocked.down || body.touching.down,
      wallLeft: body.blocked.left || body.touching.left,
      wallRight: body.blocked.right || body.touching.right,
    };

    if (input.attackPressed) {
      this.attackStarted = this.attack.tryStart(this.resolveAttackDirection(input, sensors.grounded));
      if (this.attackStarted) this.attackSequence += 1;
    } else {
      this.attackStarted = false;
    }
    this.attack.update(dt);

    const motion = this.motor.update(dt, input, sensors);
    body.setVelocity(motion.vx, motion.vy);

    this.animationState = this.attack.isAttacking ? 'attack' : motion.state;
    this.updateVisualState(motion.facing);
    this.updateAttackHitbox(motion.facing);

    return {
      animationState: this.animationState,
      attackStarted: this.attackStarted,
      attackActive: this.attack.isHitboxActive,
      facing: motion.facing,
    };
  }

  resolveAttackDirection(input, grounded) {
    if (input.up) return 'up';
    if (input.down && !grounded) return 'down';
    return 'horizontal';
  }

  updateVisualState(facing) {
    const colorByState = {
      idle: 0xe8eef7,
      run: 0xdce8f6,
      jump: 0xbcd8f2,
      fall: 0xa8bfd8,
      'wall-slide': 0xb8c4d6,
      dash: 0xf6f0d0,
      attack: 0xffffff,
    };
    this.sprite.setFillStyle(colorByState[this.animationState] ?? 0xe8eef7, 1);
    this.sprite.setScale(facing < 0 ? -1 : 1, 1);
  }

  updateAttackHitbox(facing) {
    const active = this.attack.isHitboxActive;
    this.attackHitbox.body.enable = active;
    if (!active) return;

    const direction = this.attack.currentDirection;
    if (direction === 'up') {
      this.attackHitbox.setSize(42, 62);
      this.attackHitbox.body.setSize(42, 62, true);
      this.attackHitbox.setPosition(this.sprite.x, this.sprite.y - 50);
    } else if (direction === 'down') {
      this.attackHitbox.setSize(42, 62);
      this.attackHitbox.body.setSize(42, 62, true);
      this.attackHitbox.setPosition(this.sprite.x, this.sprite.y + 50);
    } else {
      this.attackHitbox.setSize(62, 42);
      this.attackHitbox.body.setSize(62, 42, true);
      this.attackHitbox.setPosition(this.sprite.x + facing * 49, this.sprite.y);
    }
  }
}
