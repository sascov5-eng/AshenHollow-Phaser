export const MOVEMENT = Object.freeze({
  colliderWidth: 36,
  colliderHeight: 60,
  gravity: 1700,
  jumpVelocity: 610,
  jumpReleaseVelocity: 285,
  maxFallSpeed: 900,
  runSpeed: 315,
  groundAcceleration: 1900,
  airAcceleration: 1050,
  groundDeceleration: 2400,
  coyoteDuration: 0.12,
  jumpBufferDuration: 0.12,
  maxMotionPerSubstep: 5,
  dashSpeed: 720,
  dashDuration: 0.16,
  dashCooldown: 0.60,
  wallSlideSpeed: 180,
  wallJumpHorizontalSpeed: 360,
  wallJumpVerticalSpeed: 560,
  sameWallLockDuration: 0.12,
});

export const ATTACK = Object.freeze({
  attackDuration: 0.22,
  cooldownDuration: 0.32,
  hitboxStart: 0.05,
  hitboxEnd: 0.13,
});
