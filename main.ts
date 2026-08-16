import {
  AIR_SETTINGS,
  OBJECTS,
  distanceAt,
  terminalVelocity,
  timeToFall,
  velocityAt,
  type AirSetting,
  type FallingObject,
} from "./src/physics";

const DROP_HEIGHT = 5; // metres
const SCALE = 100; // svg units per metre
const TOP_PADDING = 44; // svg units of headroom so a tall object isn't clipped at the start
const OBJECT_X = { a: 140, b: 240 };

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

const SHAPE_IDS: Record<string, string> = {
  Feather: "shape-feather",
  "Sheet of paper, flat": "shape-paper",
  "Ping pong ball": "shape-pingpong",
  Hammer: "shape-hammer",
  "Bowling ball": "shape-bowlingball",
  "Skydiver, belly down": "shape-skydiver",
};

const objectASelect = document.querySelector<HTMLSelectElement>("#objectA")!;
const objectBSelect = document.querySelector<HTMLSelectElement>("#objectB")!;
const airSelect = document.querySelector<HTMLSelectElement>("#airSetting")!;
const dropButton = document.querySelector<HTMLButtonElement>("#dropButton")!;
const resetButton = document.querySelector<HTMLButtonElement>("#resetButton")!;

const sceneEl = document.querySelector<SVGSVGElement>("#scene")!;
const sceneDesc = document.querySelector<SVGDescElement>("#sceneDesc")!;
const shapeA = document.querySelector<SVGGElement>("#shapeA")!;
const shapeB = document.querySelector<SVGGElement>("#shapeB")!;
const useA = document.querySelector<SVGUseElement>("#useA")!;
const useB = document.querySelector<SVGUseElement>("#useB")!;
const trailAGroup = document.querySelector<SVGGElement>("#trail-a")!;
const trailBGroup = document.querySelector<SVGGElement>("#trail-b")!;

const speedA = document.querySelector<HTMLElement>("#speedA")!;
const speedB = document.querySelector<HTMLElement>("#speedB")!;
const landedA = document.querySelector<HTMLElement>("#landedA")!;
const landedB = document.querySelector<HTMLElement>("#landedB")!;

const massA = document.querySelector<HTMLElement>("#massA")!;
const massB = document.querySelector<HTMLElement>("#massB")!;
const areaA = document.querySelector<HTMLElement>("#areaA")!;
const areaB = document.querySelector<HTMLElement>("#areaB")!;
const ratioA = document.querySelector<HTMLElement>("#ratioA")!;
const ratioB = document.querySelector<HTMLElement>("#ratioB")!;
const vtA = document.querySelector<HTMLElement>("#vtA")!;
const vtB = document.querySelector<HTMLElement>("#vtB")!;

const airNote = document.querySelector<HTMLElement>("#air-note")!;

function populateSelect(select: HTMLSelectElement, options: readonly { name: string }[]) {
  select.replaceChildren(
    ...options.map((option, index) => {
      const el = document.createElement("option");
      el.value = String(index);
      el.textContent = option.name;
      return el;
    }),
  );
}

populateSelect(objectASelect, OBJECTS);
populateSelect(objectBSelect, OBJECTS);
populateSelect(airSelect, AIR_SETTINGS);
objectBSelect.selectedIndex = Math.min(1, OBJECTS.length - 1);

function currentObjectA(): FallingObject {
  return OBJECTS[objectASelect.selectedIndex]!;
}

function currentObjectB(): FallingObject {
  return OBJECTS[objectBSelect.selectedIndex]!;
}

function currentAir(): AirSetting {
  return AIR_SETTINGS[airSelect.selectedIndex]!;
}

function setShape(use: SVGUseElement, object: FallingObject) {
  const id = SHAPE_IDS[object.name]!;
  use.setAttribute("href", `#${id}`);
  use.setAttributeNS(XLINK_NS, "href", `#${id}`);
}

function updateAirVisual(air: AirSetting) {
  sceneEl.dataset.air = air.name === "Moon" ? "moon" : "earth";
}

function updateDescription(state: "ready" | "falling" | "landed") {
  const status =
    state === "ready"
      ? "Not yet dropped."
      : state === "falling"
        ? "Falling."
        : "Both objects have landed.";
  sceneDesc.textContent =
    `Object A is a ${currentObjectA().name.toLowerCase()}. ` +
    `Object B is a ${currentObjectB().name.toLowerCase()}. ` +
    `Air setting: ${currentAir().name}. ${status}`;
}

function feetY(distance: number): number {
  return TOP_PADDING + Math.min(distance, DROP_HEIGHT) * SCALE;
}

function positionShape(shape: SVGGElement, x: number, distance: number) {
  shape.setAttribute("transform", `translate(${x}, ${feetY(distance)})`);
}

function formatSpeed(v: number): string {
  return `${v.toFixed(1)} m/s`;
}

function formatTime(t: number): string {
  return `${t.toFixed(2)} s`;
}

function formatQuantity(value: number, unit: string): string {
  return `${Number(value.toPrecision(3))} ${unit}`;
}

function formatTerminalVelocity(object: FallingObject, air: AirSetting): string {
  if (air.airDensity === 0) return "none — no air";
  return formatSpeed(terminalVelocity(object, air.airDensity, air.gravity));
}

function updateFacts(objA: FallingObject, objB: FallingObject, air: AirSetting) {
  massA.textContent = formatQuantity(objA.mass, "kg");
  areaA.textContent = formatQuantity(objA.area, "m²");
  ratioA.textContent = formatQuantity(objA.mass / objA.area, "kg/m²");
  vtA.textContent = formatTerminalVelocity(objA, air);

  massB.textContent = formatQuantity(objB.mass, "kg");
  areaB.textContent = formatQuantity(objB.area, "m²");
  ratioB.textContent = formatQuantity(objB.mass / objB.area, "kg/m²");
  vtB.textContent = formatTerminalVelocity(objB, air);
}

function updateAirNote(air: AirSetting) {
  airNote.textContent =
    air.airDensity === 0
      ? "No air means no drag, so only gravity acts, and gravity doesn't care about mass."
      : "Air resistance depends on area, weight depends on mass — what matters is the ratio between them.";
}

const TRAIL_DURATION = 0.5; // seconds a trail dot stays visible
const TRAIL_MIN_GAP = 0.03; // seconds between spawned dots
const TRAIL_POOL_SIZE = Math.ceil(TRAIL_DURATION / TRAIL_MIN_GAP) + 2;

interface TrailSample {
  distance: number;
  elapsed: number;
}

class Trail {
  private samples: TrailSample[] = [];
  private dots: SVGCircleElement[] = [];
  private lastSampleAt = -Infinity;

  constructor(group: SVGGElement, x: number, radius: number) {
    for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("class", "trail-dot");
      dot.setAttribute("cx", String(x));
      dot.setAttribute("r", String(radius));
      dot.setAttribute("opacity", "0");
      group.appendChild(dot);
      this.dots.push(dot);
    }
  }

  reset() {
    this.samples = [];
    this.lastSampleAt = -Infinity;
    for (const dot of this.dots) dot.setAttribute("opacity", "0");
  }

  update(distance: number, elapsed: number) {
    if (elapsed - this.lastSampleAt >= TRAIL_MIN_GAP) {
      this.samples.push({ distance, elapsed });
      this.lastSampleAt = elapsed;
    }
    this.samples = this.samples
      .filter((sample) => elapsed - sample.elapsed <= TRAIL_DURATION)
      .slice(-this.dots.length);

    this.dots.forEach((dot, i) => {
      const sample = this.samples[i];
      if (!sample) {
        dot.setAttribute("opacity", "0");
        return;
      }
      const age = elapsed - sample.elapsed;
      const opacity = Math.max(0, 1 - age / TRAIL_DURATION) * 0.5;
      dot.setAttribute("cy", String(feetY(sample.distance)));
      dot.setAttribute("opacity", opacity.toFixed(2));
    });
  }
}

const trailA = new Trail(trailAGroup, OBJECT_X.a, 5);
const trailB = new Trail(trailBGroup, OBJECT_X.b, 5);

let animationFrame: number | null = null;
let startTime: number | null = null;
let dropping = false;

function render(
  objA: FallingObject,
  objB: FallingObject,
  air: AirSetting,
  elapsed: number,
  landTimeA: number,
  landTimeB: number,
) {
  const tA = Math.min(elapsed, landTimeA);
  const tB = Math.min(elapsed, landTimeB);
  const distA = distanceAt(objA, air.airDensity, air.gravity, tA);
  const distB = distanceAt(objB, air.airDensity, air.gravity, tB);

  positionShape(shapeA, OBJECT_X.a, distA);
  positionShape(shapeB, OBJECT_X.b, distB);
  trailA.update(Math.min(distA, DROP_HEIGHT), elapsed);
  trailB.update(Math.min(distB, DROP_HEIGHT), elapsed);

  speedA.textContent = formatSpeed(velocityAt(objA, air.airDensity, air.gravity, tA));
  speedB.textContent = formatSpeed(velocityAt(objB, air.airDensity, air.gravity, tB));

  landedA.textContent = elapsed >= landTimeA ? formatTime(landTimeA) : "—";
  landedB.textContent = elapsed >= landTimeB ? formatTime(landTimeB) : "—";
}

function setControlsDisabled(disabled: boolean) {
  objectASelect.disabled = disabled;
  objectBSelect.disabled = disabled;
  airSelect.disabled = disabled;
  dropButton.disabled = disabled;
}

function step(
  objA: FallingObject,
  objB: FallingObject,
  air: AirSetting,
  landTimeA: number,
  landTimeB: number,
  now: number,
) {
  if (startTime === null) startTime = now;
  const elapsed = (now - startTime) / 1000;

  render(objA, objB, air, elapsed, landTimeA, landTimeB);

  if (elapsed < Math.max(landTimeA, landTimeB)) {
    animationFrame = requestAnimationFrame((next) =>
      step(objA, objB, air, landTimeA, landTimeB, next),
    );
  } else {
    dropping = false;
    setControlsDisabled(false);
    updateDescription("landed");
  }
}

function drop() {
  if (dropping) return;
  dropping = true;
  setControlsDisabled(true);
  updateDescription("falling");

  const objA = currentObjectA();
  const objB = currentObjectB();
  const air = currentAir();
  const landTimeA = timeToFall(objA, air.airDensity, air.gravity, DROP_HEIGHT);
  const landTimeB = timeToFall(objB, air.airDensity, air.gravity, DROP_HEIGHT);

  startTime = null;
  animationFrame = requestAnimationFrame((now) =>
    step(objA, objB, air, landTimeA, landTimeB, now),
  );
}

function reset() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  dropping = false;
  startTime = null;
  setControlsDisabled(false);

  positionShape(shapeA, OBJECT_X.a, 0);
  positionShape(shapeB, OBJECT_X.b, 0);
  trailA.reset();
  trailB.reset();
  speedA.textContent = formatSpeed(0);
  speedB.textContent = formatSpeed(0);
  landedA.textContent = "—";
  landedB.textContent = "—";
  updateDescription("ready");
}

objectASelect.addEventListener("change", () => {
  setShape(useA, currentObjectA());
  updateFacts(currentObjectA(), currentObjectB(), currentAir());
  updateDescription("ready");
});
objectBSelect.addEventListener("change", () => {
  setShape(useB, currentObjectB());
  updateFacts(currentObjectA(), currentObjectB(), currentAir());
  updateDescription("ready");
});
airSelect.addEventListener("change", () => {
  updateAirVisual(currentAir());
  updateFacts(currentObjectA(), currentObjectB(), currentAir());
  updateAirNote(currentAir());
  updateDescription("ready");
});
dropButton.addEventListener("click", drop);
resetButton.addEventListener("click", reset);

setShape(useA, currentObjectA());
setShape(useB, currentObjectB());
updateAirVisual(currentAir());
updateFacts(currentObjectA(), currentObjectB(), currentAir());
updateAirNote(currentAir());
reset();
