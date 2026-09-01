import { MOVEMENT } from '../tuning.js';

const moveToward = (current, target, maxDelta) => {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return target;
};

export class PlayerMotor {
  constructor() {
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.coyoteRemaining = 0;
    this.jumpBufferRemaining = 0;
    this.dashRemaining = 0;
    this.dashCooldownRemaining = 0;
    this.dashDirection = 1;
    this.airDashAvailable = true;
    this.state = 'idle';
  }

  reset() {
    this.vx = 0;
    this.vy = 0;
    this.coyoteRemaining = 0;
    this.jumpBufferRemaining = 0;
    this.dashRemaining = 0;
    this.dashCooldownRemaining = 0;
    this.airDashAvailable = true;
    this.state = 'idle';
  }

  update(dt, input = {}, sensors = {}) {
    dt = Math.max(0, Math.min(Number.isFinite(dt) ? dt : 0, 0.25));
    const grounded = !!sensors.grounded;
    const wallLeft = !!sensors.wallLeft;
    const wallRight = !!sensors.wallRight;
    const x = Math.max(-1, Math.min(1, Number(input.x) || 0));

    if (grounded) {
      this.coyoteRemaining = MOVEMENT.coyoteDuration;
      this.airDashAvailable = true;
    } else {
      this.coyoteRemaining = Math.max(0, this.coyoteRemaining - dt);
    }

    if (input.jumpPressed) this.jumpBufferRemaining = MOVEMENT.jumpBufferDuration;
    else this.jumpBufferRemaining = Math.max(0, this.jumpBufferRemaining - dt);

    this.dashCooldownRemaining = Math.max(0, this.dashCooldownRemaining - dt);
    this.dashRemaining = Math.max(0, this.dashRemaining - dt);

    if (x !== 0) this.facing = x > 0 ? 1 : -1;

    if (input.dashPressed && this.dashCooldownRemaining <= 0 && this.dashRemaining <= 0 && (grounded || this.airDashAvailable)) {
      this.dashDirection = x === 0 ? this.facing : (x > 0 ? 1 : -1);
      this.dashRemaining = MOVEMENT.dashDuration;
      this.dashCooldownRemaining = MOVEMENT.dashCooldown;
      if (!grounded) this.airDashAvailable = false;
    }

    if (this.dashRemaining > 0) {
      this.vx = this.dashDirection * MOVEMENT.dashSpeed;
      this.vy = 0;
      this.state = 'dash';
      return this.snapshot();
    }

    const canWallJump = !grounded && (wallLeft || wallRight);
    if (this.jumpBufferRemaining > 0 && (grounded || this.coyoteRemaining > 0 || canWallJump)) {
      if (canWallJump) {
        const away = wallLeft ? 1 : -1;
        this.vx = away * MOVEMENT.wallJumpHorizontalSpeed;
        this.vy = -MOVEMENT.wallJumpVerticalSpeed;
        this.facing = away;
      } else {
        this.vy = -MOVEMENT.jumpVelocity;
      }
      this.jumpBufferRemaining = 0;
      this.coyoteRemaining = 0;
    }

    const targetX = x * MOVEMENT.runSpeed;
    const acceleration = grounded ? MOVEMENT.groundAcceleration : MOVEMENT.airAcceleration;
    const rate = grounded && x === 0 ? MOVEMENT.groundDeceleration : acceleration;
    this.vx = moveToward(this.vx, targetX, rate * dt);

    if (!input.jumpHeld && this.vy < -MOVEMENT.jumpReleaseVelocity) {
      this.vy = -MOVEMENT.jumpReleaseVelocity;
    }

    this.vy = Math.min(MOVEMENT.maxFallSpeed, this.vy + MOVEMENT.gravity * dt);

    if (!grounded && (wallLeft || wallRight) && this.vy > MOVEMENT.wallSlideSpeed) {
      this.vy = MOVEMENT.wallSlideSpeed;
    }

    if (!grounded) this.state = this.vy < 0 ? 'jump' : ((wallLeft || wallRight) ? 'wall-slide' : 'fall');
    else if (Math.abs(this.vx) > 12) this.state = 'run';
    else this.state = 'idle';

    return this.snapshot();
  }

  snapshot() {
    return { vx: this.vx, vy: this.vy, facing: this.facing, state: this.state };
  }
}
