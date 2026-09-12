import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PropertyKey, RiveFile, hex } from "@stevysmith/rive-generator";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "rive", "basmat-agent.riv");

function oval(riv, parent, name, x, y, width, height, color) {
  const shape = riv.addShape(parent, { name, x, y });
  riv.addEllipse(shape, { width, height });
  riv.addSolidColor(riv.addFill(shape), hex(color));
  return shape;
}

function box(riv, parent, name, x, y, width, height, color, radius = 10) {
  const shape = riv.addShape(parent, { name, x, y });
  riv.addRectangle(shape, { width, height, cornerRadius: radius });
  riv.addSolidColor(riv.addFill(shape), hex(color));
  return shape;
}

function track(riv, animation, target, property, frames) {
  const keyed = riv.addKeyedObject(animation, target);
  const prop = riv.addKeyedProperty(keyed, property);
  for (const frame of frames) {
    riv.addKeyFrameDouble(prop, {
      frame: frame.t,
      value: frame.v,
      interpolation: "cubic"
    });
  }
}

function anim(riv, artboard, name, duration, loop, apply) {
  const clip = riv.addLinearAnimation(artboard, { name, fps: 60, duration, loop });
  apply(clip);
  return clip;
}

const riv = new RiveFile();
const artboard = riv.addArtboard({ name: "mascot", width: 200, height: 220 });
const root = riv.addNode(artboard, { name: "root", x: 100, y: 148 });
const leftLeg = box(riv, root, "leftLeg", -12, 38, 16, 28, "#15803d", 8);
const rightLeg = box(riv, root, "rightLeg", 12, 38, 16, 28, "#15803d", 8);
const leftArm = oval(riv, root, "leftArm", -34, 4, 18, 36, "#16a34a");
const torso = box(riv, root, "torso", 0, 6, 58, 68, "#16a34a", 22);
const rightArm = riv.addNode(root, { name: "rightArm", x: 34, y: 4 });
oval(riv, rightArm, "rightArmBody", 0, 0, 18, 36, "#16a34a");
const torch = riv.addNode(rightArm, { name: "torch", x: 2, y: -22 });
box(riv, torch, "stick", 0, 8, 7, 22, "#92400e", 3);
oval(riv, torch, "flame", 0, -8, 16, 20, "#f59e0b");
oval(riv, torch, "glow", 0, -12, 8, 10, "#fde68a");
const head = riv.addNode(root, { name: "head", x: 0, y: -46 });
oval(riv, head, "face", 0, 0, 60, 54, "#fde8c8");
oval(riv, head, "hair", 0, -18, 58, 22, "#173524");
oval(riv, head, "eyeL", -12, -2, 10, 12, "#ffffff");
oval(riv, head, "eyeR", 12, -2, 10, 12, "#ffffff");
const pupilL = oval(riv, head, "pupilL", -12, -1, 5, 6, "#173524");
const pupilR = oval(riv, head, "pupilR", 12, -1, 5, 6, "#173524");
oval(riv, head, "smile", 0, 12, 16, 7, "#fb7185");

anim(riv, artboard, "idle", 120, "loop", (clip) => {
  track(riv, clip, root, PropertyKey.y, [
    { t: 0, v: 148 },
    { t: 60, v: 143 },
    { t: 120, v: 148 }
  ]);
  track(riv, clip, root, PropertyKey.scaleY, [
    { t: 0, v: 1 },
    { t: 60, v: 1.03 },
    { t: 120, v: 1 }
  ]);
  track(riv, clip, head, PropertyKey.rotation, [
    { t: 0, v: -0.04 },
    { t: 60, v: 0.04 },
    { t: 120, v: -0.04 }
  ]);
});

anim(riv, artboard, "run", 36, "loop", (clip) => {
  track(riv, clip, root, PropertyKey.y, [
    { t: 0, v: 148 },
    { t: 18, v: 138 },
    { t: 36, v: 148 }
  ]);
  track(riv, clip, leftLeg, PropertyKey.rotation, [
    { t: 0, v: 0.45 },
    { t: 18, v: -0.45 },
    { t: 36, v: 0.45 }
  ]);
  track(riv, clip, rightLeg, PropertyKey.rotation, [
    { t: 0, v: -0.45 },
    { t: 18, v: 0.45 },
    { t: 36, v: -0.45 }
  ]);
  track(riv, clip, leftArm, PropertyKey.rotation, [
    { t: 0, v: -0.5 },
    { t: 18, v: 0.5 },
    { t: 36, v: -0.5 }
  ]);
  track(riv, clip, rightArm, PropertyKey.rotation, [
    { t: 0, v: 0.5 },
    { t: 18, v: -0.5 },
    { t: 36, v: 0.5 }
  ]);
});

anim(riv, artboard, "invite", 90, "pingPong", (clip) => {
  track(riv, clip, rightArm, PropertyKey.rotation, [
    { t: 0, v: 0 },
    { t: 45, v: -0.9 },
    { t: 90, v: 0 }
  ]);
  track(riv, clip, head, PropertyKey.rotation, [
    { t: 0, v: 0 },
    { t: 45, v: 0.08 },
    { t: 90, v: 0 }
  ]);
});

anim(riv, artboard, "cheer", 48, "loop", (clip) => {
  track(riv, clip, root, PropertyKey.y, [
    { t: 0, v: 148 },
    { t: 24, v: 132 },
    { t: 48, v: 148 }
  ]);
  track(riv, clip, leftArm, PropertyKey.rotation, [
    { t: 0, v: -0.2 },
    { t: 24, v: -1.2 },
    { t: 48, v: -0.2 }
  ]);
  track(riv, clip, rightArm, PropertyKey.rotation, [
    { t: 0, v: 0.2 },
    { t: 24, v: 1.2 },
    { t: 48, v: 0.2 }
  ]);
});

anim(riv, artboard, "think", 96, "loop", (clip) => {
  track(riv, clip, head, PropertyKey.rotation, [
    { t: 0, v: 0 },
    { t: 48, v: 0.22 },
    { t: 96, v: 0 }
  ]);
  track(riv, clip, pupilL, PropertyKey.x, [
    { t: 0, v: -12 },
    { t: 48, v: -9 },
    { t: 96, v: -12 }
  ]);
});

anim(riv, artboard, "thinking", 96, "loop", (clip) => {
  track(riv, clip, head, PropertyKey.rotation, [
    { t: 0, v: -0.12 },
    { t: 48, v: 0.16 },
    { t: 96, v: -0.12 }
  ]);
  track(riv, clip, root, PropertyKey.y, [
    { t: 0, v: 148 },
    { t: 48, v: 145 },
    { t: 96, v: 148 }
  ]);
});

anim(riv, artboard, "search", 80, "loop", (clip) => {
  track(riv, clip, root, PropertyKey.rotation, [
    { t: 0, v: -0.08 },
    { t: 40, v: 0.1 },
    { t: 80, v: -0.08 }
  ]);
  track(riv, clip, head, PropertyKey.x, [
    { t: 0, v: -4 },
    { t: 40, v: 6 },
    { t: 80, v: -4 }
  ]);
});

anim(riv, artboard, "rest", 140, "loop", (clip) => {
  track(riv, clip, root, PropertyKey.y, [
    { t: 0, v: 154 },
    { t: 70, v: 151 },
    { t: 140, v: 154 }
  ]);
  track(riv, clip, root, PropertyKey.scaleY, [
    { t: 0, v: 0.94 },
    { t: 70, v: 0.96 },
    { t: 140, v: 0.94 }
  ]);
  track(riv, clip, head, PropertyKey.rotation, [
    { t: 0, v: 0.18 },
    { t: 70, v: 0.12 },
    { t: 140, v: 0.18 }
  ]);
});

anim(riv, artboard, "torch", 70, "loop", (clip) => {
  track(riv, clip, torch, PropertyKey.scaleY, [
    { t: 0, v: 1 },
    { t: 35, v: 1.28 },
    { t: 70, v: 1 }
  ]);
  track(riv, clip, torch, PropertyKey.y, [
    { t: 0, v: -22 },
    { t: 35, v: -28 },
    { t: 70, v: -22 }
  ]);
  track(riv, clip, rightArm, PropertyKey.rotation, [
    { t: 0, v: -0.4 },
    { t: 35, v: -0.7 },
    { t: 70, v: -0.4 }
  ]);
});

anim(riv, artboard, "wave", 50, "loop", (clip) => {
  track(riv, clip, rightArm, PropertyKey.rotation, [
    { t: 0, v: -0.3 },
    { t: 25, v: -1.35 },
    { t: 50, v: -0.3 }
  ]);
  track(riv, clip, head, PropertyKey.rotation, [
    { t: 0, v: 0 },
    { t: 25, v: 0.1 },
    { t: 50, v: 0 }
  ]);
});

anim(riv, artboard, "greeting", 56, "loop", (clip) => {
  track(riv, clip, leftArm, PropertyKey.rotation, [
    { t: 0, v: 0.2 },
    { t: 28, v: 1.1 },
    { t: 56, v: 0.2 }
  ]);
  track(riv, clip, root, PropertyKey.y, [
    { t: 0, v: 148 },
    { t: 28, v: 142 },
    { t: 56, v: 148 }
  ]);
});

anim(riv, artboard, "success", 54, "loop", (clip) => {
  track(riv, clip, root, PropertyKey.y, [
    { t: 0, v: 148 },
    { t: 18, v: 128 },
    { t: 54, v: 148 }
  ]);
  track(riv, clip, root, PropertyKey.scaleY, [
    { t: 0, v: 1 },
    { t: 18, v: 1.08 },
    { t: 54, v: 1 }
  ]);
  track(riv, clip, leftArm, PropertyKey.rotation, [
    { t: 0, v: 0 },
    { t: 18, v: -1 },
    { t: 54, v: 0 }
  ]);
});

anim(riv, artboard, "poke", 42, "oneShot", (clip) => {
  track(riv, clip, root, PropertyKey.rotation, [
    { t: 0, v: 0 },
    { t: 21, v: 6.28 },
    { t: 42, v: 6.28 }
  ]);
  track(riv, clip, root, PropertyKey.y, [
    { t: 0, v: 148 },
    { t: 21, v: 118 },
    { t: 42, v: 148 }
  ]);
});

mkdirSync(dirname(out), { recursive: true });
const bytes = riv.export();
writeFileSync(out, bytes);
const stamp = Buffer.from(bytes.subarray(0, 4)).toString("ascii");
if (stamp !== "RIVE") {
  throw new Error("generated file is not a Rive binary");
}
console.log(`wrote ${out} (${bytes.length} bytes)`);
