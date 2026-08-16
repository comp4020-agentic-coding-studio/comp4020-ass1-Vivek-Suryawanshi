export interface FallingObject {
  readonly name: string;
  readonly mass: number;
  readonly area: number;
  readonly dragCoefficient: number;
}

export interface AirSetting {
  readonly name: string;
  readonly airDensity: number;
  readonly gravity: number;
}

export const GRAVITY_EARTH = 9.81;
export const GRAVITY_MOON = 1.62;

export const OBJECTS: readonly FallingObject[] = [
  { name: "Feather", mass: 0.0005, area: 0.005, dragCoefficient: 0.8 },
  { name: "Sheet of paper, flat", mass: 0.005, area: 0.062, dragCoefficient: 1.2 },
  { name: "Ping pong ball", mass: 0.0027, area: 0.00126, dragCoefficient: 0.47 },
  { name: "Hammer", mass: 1.0, area: 0.005, dragCoefficient: 1.0 },
  { name: "Bowling ball", mass: 7.26, area: 0.0366, dragCoefficient: 0.47 },
  { name: "Skydiver, belly down", mass: 80, area: 0.6, dragCoefficient: 1.0 },
];

export const AIR_SETTINGS: readonly AirSetting[] = [
  { name: "Earth", airDensity: 1.225, gravity: GRAVITY_EARTH },
  { name: "Thin air (5000 m)", airDensity: 0.736, gravity: GRAVITY_EARTH },
  { name: "Moon", airDensity: 0, gravity: GRAVITY_MOON },
];

export function terminalVelocity(
  object: FallingObject,
  airDensity: number,
  gravity: number,
): number {
  if (airDensity === 0) return Infinity;
  return Math.sqrt(
    (2 * object.mass * gravity) / (airDensity * object.dragCoefficient * object.area),
  );
}

export function velocityAt(
  object: FallingObject,
  airDensity: number,
  gravity: number,
  t: number,
): number {
  if (airDensity === 0) return gravity * t;
  const vt = terminalVelocity(object, airDensity, gravity);
  return vt * Math.tanh((gravity * t) / vt);
}

export function distanceAt(
  object: FallingObject,
  airDensity: number,
  gravity: number,
  t: number,
): number {
  if (airDensity === 0) return 0.5 * gravity * t * t;
  const vt = terminalVelocity(object, airDensity, gravity);
  return ((vt * vt) / gravity) * Math.log(Math.cosh((gravity * t) / vt));
}

export function timeToFall(
  object: FallingObject,
  airDensity: number,
  gravity: number,
  height: number,
): number {
  if (airDensity === 0) return Math.sqrt((2 * height) / gravity);
  const vt = terminalVelocity(object, airDensity, gravity);
  const u = Math.acosh(Math.exp((height * gravity) / (vt * vt)));
  return (u * vt) / gravity;
}
