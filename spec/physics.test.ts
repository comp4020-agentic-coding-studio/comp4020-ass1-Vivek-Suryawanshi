import { describe, expect, it } from "vitest";
import {
  AIR_SETTINGS,
  GRAVITY_EARTH,
  GRAVITY_MOON,
  OBJECTS,
  terminalVelocity,
  timeToFall,
  velocityAt,
} from "../src/physics";

const EARTH = AIR_SETTINGS.find((a) => a.name === "Earth")!;
const MOON = AIR_SETTINGS.find((a) => a.name === "Moon")!;
const HAMMER = OBJECTS.find((o) => o.name === "Hammer")!;
const FEATHER = OBJECTS.find((o) => o.name === "Feather")!;
const BOWLING_BALL = OBJECTS.find((o) => o.name === "Bowling ball")!;

describe("physics sanity checks", () => {
  it("1. with no air, any two objects land at the same time", () => {
    const height = 5;
    const tFeather = timeToFall(FEATHER, 0, GRAVITY_EARTH, height);
    const tBowlingBall = timeToFall(BOWLING_BALL, 0, GRAVITY_EARTH, height);
    expect(tFeather).toBe(tBowlingBall);
  });

  it("2. with sea-level air, nothing ever goes faster than its terminal velocity", () => {
    const vt = terminalVelocity(HAMMER, EARTH.airDensity, EARTH.gravity);
    for (const t of [0, 1, 5, 20, 100]) {
      expect(velocityAt(HAMMER, EARTH.airDensity, EARTH.gravity, t)).toBeLessThan(vt);
    }
  });

  it("3. doubling mass (same area) scales terminal velocity by sqrt(2)", () => {
    const doubled = { ...HAMMER, mass: HAMMER.mass * 2 };
    const vt1 = terminalVelocity(HAMMER, EARTH.airDensity, EARTH.gravity);
    const vt2 = terminalVelocity(doubled, EARTH.airDensity, EARTH.gravity);
    expect(vt2 / vt1).toBeCloseTo(Math.SQRT2, 5);
  });

  it("4. dropped from 5 m, an object can still be speeding up when it lands", () => {
    const vt = terminalVelocity(HAMMER, EARTH.airDensity, EARTH.gravity);
    const t = timeToFall(HAMMER, EARTH.airDensity, EARTH.gravity, 5);
    expect(velocityAt(HAMMER, EARTH.airDensity, EARTH.gravity, t)).toBeLessThan(vt);
  });

  it("5. a 2 m drop takes about 1.6 s on the Moon, about 0.64 s on Earth", () => {
    const tMoon = timeToFall(HAMMER, MOON.airDensity, GRAVITY_MOON, 2);
    const tEarth = timeToFall(HAMMER, 0, GRAVITY_EARTH, 2);
    expect(tMoon).toBeCloseTo(1.6, 1);
    expect(tEarth).toBeCloseTo(0.64, 2);
  });
});
