"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* Maps overall scroll progress [0..1] to a sub-interval [a..b], eased. */
function seg(p: number, a: number, b: number) {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return 1 - Math.pow(1 - t, 3);
}

type Ref = React.MutableRefObject<number>;
type P = { p: Ref };
type V3 = [number, number, number];

/* ---------- procedural material textures (self-contained, no downloads) ---------- */

function makeTexture(size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function noise(ctx: CanvasRenderingContext2D, s: number, n: number, alpha: number) {
  for (let i = 0; i < n; i++) {
    const v = Math.random();
    ctx.fillStyle = v < 0.5 ? `rgba(30,25,18,${alpha * Math.random()})` : `rgba(255,250,240,${alpha * Math.random()})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function useMaterials() {
  return useMemo(() => {
    const brickTex = makeTexture(512, (ctx, s) => {
      ctx.fillStyle = "#b3a794";
      ctx.fillRect(0, 0, s, s);
      const bh = s / 16, bw = s / 8;
      for (let r = 0; r < 16; r++) {
        const off = r % 2 === 0 ? 0 : bw / 2;
        for (let c = -1; c < 9; c++) {
          ctx.fillStyle = `hsl(${18 + Math.random() * 8}, ${42 + Math.random() * 14}%, ${38 + Math.random() * 14}%)`;
          ctx.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
        }
      }
      noise(ctx, s, 2600, 0.16);
    });
    brickTex.repeat.set(2.2, 2.2);

    const concreteTex = makeTexture(256, (ctx, s) => {
      ctx.fillStyle = "#c3bcab";
      ctx.fillRect(0, 0, s, s);
      noise(ctx, s, 2400, 0.2);
      ctx.strokeStyle = "rgba(80,72,58,0.12)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * s, 0);
        ctx.lineTo(Math.random() * s, s);
        ctx.stroke();
      }
    });

    const stuccoTex = makeTexture(256, (ctx, s) => {
      ctx.fillStyle = "#eeeade";
      ctx.fillRect(0, 0, s, s);
      noise(ctx, s, 1600, 0.08);
    });

    const stoneTex = makeTexture(512, (ctx, s) => {
      ctx.fillStyle = "#c9bfa8";
      ctx.fillRect(0, 0, s, s);
      const rows = 6, rh = s / rows;
      for (let r = 0; r < rows; r++) {
        let x = r % 2 === 0 ? 0 : -s / 10;
        while (x < s) {
          const w = s / 5 + Math.random() * (s / 7);
          ctx.fillStyle = `hsl(${40 + Math.random() * 8}, ${20 + Math.random() * 10}%, ${72 + Math.random() * 9}%)`;
          ctx.fillRect(x + 2, r * rh + 2, w - 4, rh - 4);
          x += w;
        }
      }
      noise(ctx, s, 2200, 0.1);
    });
    stoneTex.repeat.set(1.6, 1.1);

    const woodTex = makeTexture(512, (ctx, s) => {
      const planks = 12, ph = s / planks;
      for (let r = 0; r < planks; r++) {
        const light = 26 + Math.random() * 12;
        ctx.fillStyle = `hsl(${20 + Math.random() * 6}, ${46 + Math.random() * 10}%, ${light}%)`;
        ctx.fillRect(0, r * ph, s, ph);
        for (let g = 0; g < 26; g++) {
          ctx.strokeStyle = `hsla(${16 + Math.random() * 10}, 50%, ${light - 10 + Math.random() * 22}%, 0.35)`;
          const y = r * ph + Math.random() * ph;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(s * 0.3, y + Math.random() * 3 - 1.5, s * 0.7, y + Math.random() * 3 - 1.5, s, y);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(20,12,6,0.85)";
        ctx.fillRect(0, r * ph, s, 2);
      }
    });
    woodTex.repeat.set(1, 2);

    const oakTex = makeTexture(256, (ctx, s) => {
      const planks = 6, pw = s / planks;
      for (let c = 0; c < planks; c++) {
        const light = 58 + Math.random() * 10;
        ctx.fillStyle = `hsl(${32 + Math.random() * 6}, ${34 + Math.random() * 8}%, ${light}%)`;
        ctx.fillRect(c * pw, 0, pw, s);
        ctx.fillStyle = "rgba(60,40,20,0.35)";
        ctx.fillRect(c * pw, 0, 1.5, s);
      }
      noise(ctx, s, 900, 0.07);
    });
    oakTex.repeat.set(3, 3);

    const soilTex = makeTexture(256, (ctx, s) => {
      ctx.fillStyle = "#6e5a44";
      ctx.fillRect(0, 0, s, s);
      noise(ctx, s, 3000, 0.35);
    });

    const groundTex = makeTexture(512, (ctx, s) => {
      ctx.fillStyle = "#d9d3c2";
      ctx.fillRect(0, 0, s, s);
      noise(ctx, s, 3600, 0.14);
    });
    groundTex.repeat.set(18, 18);

    const brick = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.95 });
    return {
      brick,
      brickFadeA: new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.95, transparent: true }),
      brickFadeB: new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.95, transparent: true }),
      concrete: new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.9 }),
      stucco: new THREE.MeshStandardMaterial({ map: stuccoTex, roughness: 0.85 }),
      stone: new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.9 }),
      wood: new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 }),
      oak: new THREE.MeshStandardMaterial({ map: oakTex, roughness: 0.6 }),
      soilMap: soilTex,
      ground: new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.96 }),
      fascia: new THREE.MeshStandardMaterial({ color: "#1d1b18", roughness: 0.35, metalness: 0.55 }),
      steel: new THREE.MeshStandardMaterial({ color: "#8d8d8a", roughness: 0.45, metalness: 0.7 }),
      plank: new THREE.MeshStandardMaterial({ color: "#9a7748", roughness: 0.9 }),
      crane: new THREE.MeshStandardMaterial({ color: "#d29a2a", roughness: 0.5, metalness: 0.35 }),
      walnut: new THREE.MeshStandardMaterial({ color: "#4e3624", roughness: 0.55 }),
      brass: new THREE.MeshStandardMaterial({ color: "#b08d57", roughness: 0.28, metalness: 0.85 }),
      cream: new THREE.MeshStandardMaterial({ color: "#e9e1d2", roughness: 0.95 }),
      linen: new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: 0.95 }),
      terra: new THREE.MeshStandardMaterial({ color: "#a65c38", roughness: 0.9 }),
      graphite: new THREE.MeshStandardMaterial({ color: "#22252a", roughness: 0.3, metalness: 0.7 }),
      carGlass: new THREE.MeshStandardMaterial({ color: "#11161b", roughness: 0.08, metalness: 0.6 }),
      tyre: new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.95 }),
      silver: new THREE.MeshStandardMaterial({ color: "#c9c9c6", roughness: 0.25, metalness: 0.9 }),
      greenDark: new THREE.MeshStandardMaterial({ color: "#586b41", roughness: 1 }),
      green: new THREE.MeshStandardMaterial({ color: "#71855a", roughness: 1 }),
      skin: new THREE.MeshStandardMaterial({ color: "#b07a58", roughness: 0.65 }),
      skin2: new THREE.MeshStandardMaterial({ color: "#9c6a4a", roughness: 0.65 }),
      hair: new THREE.MeshStandardMaterial({ color: "#221a14", roughness: 0.85 }),
      shoe: new THREE.MeshStandardMaterial({ color: "#2a2724", roughness: 0.55 }),
      charcoalCloth: new THREE.MeshStandardMaterial({ color: "#3a3a3c", roughness: 1 }),
      slate: new THREE.MeshStandardMaterial({ color: "#8a857b", roughness: 1 }),
      terraCloth: new THREE.MeshStandardMaterial({ color: "#a56a4d", roughness: 1 }),
      denim: new THREE.MeshStandardMaterial({ color: "#4a5668", roughness: 1 }),
      hiVis: new THREE.MeshStandardMaterial({ color: "#e8641f", roughness: 0.9 }),
      visStripe: new THREE.MeshStandardMaterial({ color: "#d8d8d2", roughness: 0.4 }),
      hatYellow: new THREE.MeshStandardMaterial({ color: "#e8c034", roughness: 0.6 }),
      kidBlue: new THREE.MeshStandardMaterial({ color: "#5b7ba6", roughness: 1 }),
      kidGreen: new THREE.MeshStandardMaterial({ color: "#7d9b6a", roughness: 1 }),
    };
  }, []);
}

type Mats = ReturnType<typeof useMaterials>;

/* ---------- animated primitives ---------- */

function GrowY({ p, a, b, pos, size, material, shadow = true }: P & { a: number; b: number; pos: V3; size: V3; material: THREE.Material; shadow?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!mesh.current) return;
    const s = seg(p.current, a, b);
    mesh.current.visible = s > 0.001;
    mesh.current.scale.y = Math.max(s, 0.0001);
    mesh.current.position.y = pos[1] - (size[1] / 2) * (1 - s) + 0.001;
  });
  return (
    <mesh ref={mesh} position={pos} material={material} castShadow={shadow} receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

/* Brick core that rises, then dissolves once the finished hollow shell covers it. */
function BrickCore({ p, a, b, fade, pos, size, material }: P & { a: number; b: number; fade: number; pos: V3; size: V3; material: THREE.MeshStandardMaterial }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!mesh.current) return;
    const s = seg(p.current, a, b);
    const o = 1 - seg(p.current, fade, fade + 0.05);
    mesh.current.visible = s > 0.001 && o > 0.01;
    mesh.current.scale.y = Math.max(s, 0.0001);
    mesh.current.position.y = pos[1] - (size[1] / 2) * (1 - s) + 0.001;
    material.opacity = o;
  });
  return (
    <mesh ref={mesh} position={pos} material={material} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

/* Present between [up..upEnd] and struck after [down..downEnd] (vertical). */
function Temporary({ p, up, upEnd, down, downEnd, children, position }: P & { up: number; upEnd: number; down: number; downEnd: number; children: React.ReactNode; position?: V3 }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const s = Math.min(seg(p.current, up, upEnd), 1 - seg(p.current, down, downEnd));
    group.current.visible = s > 0.001;
    group.current.scale.y = Math.max(s, 0.0001);
  });
  return (
    <group ref={group} position={position}>
      {children}
    </group>
  );
}

/* Uniform-scale presence window — for people & equipment. */
function Between({ p, from, to, children, position, rotation }: P & { from: number; to: number; children: React.ReactNode; position: V3; rotation?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const s = Math.min(seg(p.current, from, from + 0.04), 1 - seg(p.current, to, to + 0.04));
    group.current.visible = s > 0.001;
    group.current.scale.setScalar(Math.max(s, 0.0001));
  });
  return (
    <group ref={group} position={position} rotation={[0, rotation ?? 0, 0]}>
      {children}
    </group>
  );
}

function DropIn({ p, a, b, pos, size, material }: P & { a: number; b: number; pos: V3; size: V3; material: THREE.Material }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!mesh.current) return;
    const s = seg(p.current, a, b);
    mesh.current.visible = s > 0.001;
    mesh.current.position.y = pos[1] + (1 - s) * 1.4;
  });
  return (
    <mesh ref={mesh} position={pos} material={material} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

function PopIn({ p, a, b, children, position, rotation }: P & { a: number; b: number; children: React.ReactNode; position: V3; rotation?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const t = Math.min(1, Math.max(0, (p.current - a) / (b - a)));
    const sc = t <= 0 ? 0.0001 : Math.max(0.0001, Math.min(1 + Math.sin(t * Math.PI) * 0.08, 1.12) * t);
    group.current.visible = t > 0.001;
    group.current.scale.setScalar(sc);
  });
  return (
    <group ref={group} position={position} rotation={[0, rotation ?? 0, 0]}>
      {children}
    </group>
  );
}

function GlassWindow({ p, a, b, pos, size, glow = 1 }: P & { a: number; b: number; pos: V3; size: [number, number]; glow?: number }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1d1b18", roughness: 0.35, metalness: 0.55 }), []);
  const [w, h] = size;
  const f = 0.07;
  useFrame(() => {
    if (!group.current || !mat.current) return;
    const s = seg(p.current, a, b);
    group.current.visible = s > 0.001;
    group.current.scale.setScalar(Math.max(s, 0.0001));
    mat.current.opacity = s * 0.42;
    mat.current.emissiveIntensity = seg(p.current, 0.88, 1) * 0.5 * glow;
  });
  return (
    <group ref={group} position={pos}>
      <mesh position={[0, h / 2 - f / 2, 0]} material={frameMat} castShadow>
        <boxGeometry args={[w, f, 0.1]} />
      </mesh>
      <mesh position={[0, -h / 2 + f / 2, 0]} material={frameMat} castShadow>
        <boxGeometry args={[w, f, 0.1]} />
      </mesh>
      <mesh position={[-w / 2 + f / 2, 0, 0]} material={frameMat} castShadow>
        <boxGeometry args={[f, h, 0.1]} />
      </mesh>
      <mesh position={[w / 2 - f / 2, 0, 0]} material={frameMat} castShadow>
        <boxGeometry args={[f, h, 0.1]} />
      </mesh>
      <mesh>
        <boxGeometry args={[w - f, h - f, 0.04]} />
        <meshStandardMaterial ref={mat} color="#9fc0c8" roughness={0.06} metalness={0.25} transparent opacity={0} emissive="#ffb877" emissiveIntensity={0} />
      </mesh>
    </group>
  );
}

/* ---------- people — archviz render-figure anatomy ---------- */

function Human({
  mats,
  h = 1.78,
  kid = false,
  female = false,
  hat = false,
  walk = false,
  shirt,
  pants,
  darkSkin = false,
}: {
  mats: Mats;
  h?: number;
  kid?: boolean;
  female?: boolean;
  hat?: boolean;
  walk?: boolean;
  shirt: THREE.Material;
  pants: THREE.Material;
  darkSkin?: boolean;
}) {
  const s = h / 1.78;
  const skinMat = darkSkin ? mats.skin2 : mats.skin;
  const headR = kid ? 0.128 : 0.104;
  const swing = walk ? 0.3 : 0.05;
  return (
    <group scale={s}>
      {/* shoes */}
      <mesh position={[-0.09, 0.045, walk ? 0.1 : 0.03]} material={mats.shoe} castShadow>
        <boxGeometry args={[0.11, 0.08, 0.26]} />
      </mesh>
      <mesh position={[0.09, 0.045, walk ? -0.08 : 0.03]} material={mats.shoe} castShadow>
        <boxGeometry args={[0.11, 0.08, 0.26]} />
      </mesh>
      {/* legs — swing when walking */}
      <group position={[-0.09, 0.92, 0]} rotation={[swing, 0, 0]}>
        <mesh position={[0, -0.42, 0]} material={pants} castShadow>
          <capsuleGeometry args={[0.068, 0.62, 4, 10]} />
        </mesh>
      </group>
      <group position={[0.09, 0.92, 0]} rotation={[-swing, 0, 0]}>
        <mesh position={[0, -0.42, 0]} material={pants} castShadow>
          <capsuleGeometry args={[0.068, 0.62, 4, 10]} />
        </mesh>
      </group>
      {/* hips */}
      <mesh position={[0, 0.98, 0]} scale={[1, 0.9, 0.86]} material={female ? shirt : pants} castShadow>
        <capsuleGeometry args={[0.13, 0.08, 4, 12]} />
      </mesh>
      {/* dress skirt */}
      {female && (
        <mesh position={[0, 0.76, 0]} material={shirt} castShadow>
          <cylinderGeometry args={[0.135, 0.25, 0.52, 14]} />
        </mesh>
      )}
      {/* torso — slightly flattened front-to-back */}
      <mesh position={[0, 1.27, 0]} scale={[1, 1, 0.8]} material={shirt} castShadow>
        <capsuleGeometry args={[0.148, 0.38, 4, 14]} />
      </mesh>
      {/* hi-vis band */}
      {hat && (
        <mesh position={[0, 1.27, 0]} scale={[1.06, 1, 0.86]} material={mats.visStripe}>
          <cylinderGeometry args={[0.152, 0.152, 0.05, 14]} />
        </mesh>
      )}
      {/* arms — upper arm + naturally bent forearm */}
      {([-1, 1] as const).map((side) => (
        <group key={side} position={[side * 0.21, 1.45, 0]} rotation={[walk ? -side * 0.3 : 0.1, 0, side * -0.08]}>
          <mesh position={[0, -0.15, 0]} material={shirt} castShadow>
            <capsuleGeometry args={[0.05, 0.22, 4, 8]} />
          </mesh>
          <group position={[0, -0.3, 0]} rotation={[-0.5, 0, 0]}>
            <mesh position={[0, -0.12, 0]} material={skinMat} castShadow>
              <capsuleGeometry args={[0.041, 0.18, 4, 8]} />
            </mesh>
          </group>
        </group>
      ))}
      {/* neck + head (ellipsoid) */}
      <mesh position={[0, 1.57, 0]} material={skinMat}>
        <cylinderGeometry args={[0.048, 0.054, 0.1, 10]} />
      </mesh>
      <mesh position={[0, 1.69, 0]} scale={[0.94, 1.12, 0.98]} material={skinMat} castShadow>
        <sphereGeometry args={[headR, 18, 16]} />
      </mesh>
      {/* hair or hard hat */}
      {hat ? (
        <>
          <mesh position={[0, 1.76, 0]} material={mats.hatYellow} castShadow>
            <sphereGeometry args={[headR + 0.022, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[0, 1.755, 0]} material={mats.hatYellow}>
            <cylinderGeometry args={[headR + 0.05, headR + 0.05, 0.014, 16]} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 1.725, -0.012]} scale={[0.97, 0.8, 1.02]} material={mats.hair}>
            <sphereGeometry args={[headR + 0.01, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.85]} />
          </mesh>
          {female && (
            <mesh position={[0, 1.56, -0.085]} rotation={[0.12, 0, 0]} material={mats.hair}>
              <capsuleGeometry args={[0.05, 0.24, 4, 8]} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

/* Worker that walks a short beat along the frontage. */
function WalkingWorker({ p, mats }: P & { mats: Mats }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime * 0.45;
    const x = 5 + Math.sin(t) * 3.2;
    group.current.position.set(x, Math.abs(Math.sin(t * 6)) * 0.03, 4.4);
    group.current.rotation.y = Math.cos(t) > 0 ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <Between p={p} from={0.2} to={0.74} position={[5, 0, 4.4]}>
      <group ref={group}>
        <Human mats={mats} walk shirt={mats.hiVis} pants={mats.denim} hat darkSkin />
      </group>
    </Between>
  );
}

/* Kid chasing circles on the lawn. */
function PlayingKid({ p, mats, center, r, speed, mat }: P & { mats: Mats; center: V3; r: number; speed: number; mat: THREE.Material }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime * speed;
    group.current.position.set(center[0] + Math.cos(t) * r, Math.abs(Math.sin(t * 5)) * 0.06, center[2] + Math.sin(t) * r);
    group.current.rotation.y = -t + Math.PI / 2;
  });
  return (
    <Between p={p} from={0.93} to={2} position={center}>
      <group ref={group}>
        <Human mats={mats} h={1.06} kid walk shirt={mat} pants={mats.linen} />
      </group>
    </Between>
  );
}

/* ---------- vehicles ---------- */

/* Real modelled sports car (three.js sample asset, DRACO-compressed, served locally). */
function RealCar() {
  const { scene } = useGLTF("/models/ferrari.glb", "/draco/");
  const car = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 4.4 / Math.max(size.x, size.z, 0.001);
    c.scale.setScalar(scale);
    const box2 = new THREE.Box3().setFromObject(c);
    c.position.y = -box2.min.y;
    c.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const m = mesh.material as THREE.MeshPhysicalMaterial;
      if (m?.name === "body") {
        m.color = new THREE.Color("#23262b");
        m.metalness = 0.9;
        m.roughness = 0.35;
      }
    });
    return c;
  }, [scene]);
  return <primitive object={car} />;
}

useGLTF.preload("/models/ferrari.glb", "/draco/");

/* Motorbike removed — no free real-look 3D bike asset available;
   a procedural one read as a toy next to the real car model. */

/* ---------- luxury interior ---------- */

function Bulb({ pos, r = 0.07, cord = 0 }: { pos: V3; r?: number; cord?: number }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffe9c4", emissive: "#ffc074", emissiveIntensity: 1.6 }), []);
  return (
    <group position={pos}>
      {cord > 0 && (
        <mesh position={[0, cord / 2 + r * 0.8, 0]}>
          <cylinderGeometry args={[0.008, 0.008, cord, 4]} />
          <meshStandardMaterial color="#1d1b18" />
        </mesh>
      )}
      <mesh material={mat}>
        <sphereGeometry args={[r, 10, 8]} />
      </mesh>
    </group>
  );
}

function LivingRoom({ p, mats }: P & { mats: Mats }) {
  return (
    <group>
      {/* oak floor + rug */}
      <PopIn p={p} a={0.84} b={0.9} position={[4.3, 0.45, 0]}>
        <mesh material={mats.oak} receiveShadow>
          <boxGeometry args={[5.0, 0.06, 4.6]} />
        </mesh>
      </PopIn>
      <PopIn p={p} a={0.87} b={0.93} position={[4.3, 0.5, 0.4]}>
        <mesh material={mats.cream}>
          <boxGeometry args={[3.0, 0.025, 2.0]} />
        </mesh>
      </PopIn>
      {/* sofa against the back wall, facing the front glazing */}
      <PopIn p={p} a={0.88} b={0.94} position={[4.3, 0, -1.45]}>
        <mesh position={[0, 0.68, 0]} material={mats.cream} castShadow>
          <boxGeometry args={[2.5, 0.42, 0.92]} />
        </mesh>
        <mesh position={[0, 1.05, -0.38]} material={mats.cream}>
          <boxGeometry args={[2.5, 0.55, 0.2]} />
        </mesh>
        <mesh position={[-1.36, 0.85, 0]} material={mats.cream}>
          <boxGeometry args={[0.26, 0.6, 0.92]} />
        </mesh>
        <mesh position={[1.36, 0.85, 0]} material={mats.cream}>
          <boxGeometry args={[0.26, 0.6, 0.92]} />
        </mesh>
        <mesh position={[-0.6, 0.95, 0.05]} material={mats.linen}>
          <boxGeometry args={[0.72, 0.16, 0.75]} />
        </mesh>
        <mesh position={[0.2, 0.95, 0.05]} material={mats.linen}>
          <boxGeometry args={[0.72, 0.16, 0.75]} />
        </mesh>
        <mesh position={[0.95, 1.02, -0.2]} rotation={[0.25, 0.3, 0]} material={mats.terraCloth}>
          <boxGeometry args={[0.34, 0.34, 0.12]} />
        </mesh>
        <mesh position={[-1.0, 1.02, -0.2]} rotation={[0.2, -0.3, 0]} material={mats.terraCloth}>
          <boxGeometry args={[0.34, 0.34, 0.12]} />
        </mesh>
      </PopIn>
      {/* walnut & brass coffee table */}
      <PopIn p={p} a={0.9} b={0.95} position={[4.3, 0, 0.45]}>
        <mesh position={[0, 0.86, 0]} material={mats.walnut} castShadow>
          <boxGeometry args={[1.25, 0.06, 0.65]} />
        </mesh>
        {([[-0.55, 0.28], [0.55, 0.28], [-0.55, -0.28], [0.55, -0.28]] as const).map(([x, z], i) => (
          <mesh key={i} position={[x, 0.65, z]} material={mats.brass}>
            <cylinderGeometry args={[0.018, 0.018, 0.38, 6]} />
          </mesh>
        ))}
        <mesh position={[0.2, 0.93, 0]} material={mats.brass}>
          <cylinderGeometry args={[0.09, 0.11, 0.07, 10]} />
        </mesh>
      </PopIn>
      {/* media wall */}
      <PopIn p={p} a={0.89} b={0.95} position={[2.45, 0, -1.95]}>
        <mesh position={[0, 0.68, 0]} material={mats.walnut} castShadow>
          <boxGeometry args={[1.3, 0.42, 0.38]} />
        </mesh>
        <mesh position={[0, 1.62, -0.05]}>
          <boxGeometry args={[1.15, 0.68, 0.05]} />
          <meshStandardMaterial color="#101418" emissive="#31485e" emissiveIntensity={0.35} roughness={0.2} />
        </mesh>
      </PopIn>
      {/* brass floor lamp + planter */}
      <PopIn p={p} a={0.91} b={0.96} position={[6.25, 0, -1.35]}>
        <mesh position={[0, 1.25, 0]} material={mats.brass}>
          <cylinderGeometry args={[0.02, 0.02, 1.6, 6]} />
        </mesh>
        <Bulb pos={[0, 2.1, 0]} r={0.12} />
      </PopIn>
      <PopIn p={p} a={0.92} b={0.97} position={[6.3, 0, 1.45]}>
        <mesh position={[0, 0.62, 0]} material={mats.terra} castShadow>
          <cylinderGeometry args={[0.17, 0.13, 0.36, 10]} />
        </mesh>
        <mesh position={[0, 1.05, 0]} material={mats.green}>
          <sphereGeometry args={[0.26, 10, 8]} />
        </mesh>
        <mesh position={[0.1, 1.3, 0.05]} material={mats.greenDark}>
          <sphereGeometry args={[0.18, 10, 8]} />
        </mesh>
      </PopIn>
      {/* pendants over the table */}
      <PopIn p={p} a={0.9} b={0.96} position={[3.9, 0, 0.45]}>
        <Bulb pos={[0, 2.55, 0]} cord={0.5} />
      </PopIn>
      <PopIn p={p} a={0.91} b={0.97} position={[4.75, 0, 0.45]}>
        <Bulb pos={[0, 2.72, 0]} cord={0.34} />
      </PopIn>
    </group>
  );
}

function Bedroom({ p, mats }: P & { mats: Mats }) {
  return (
    <group>
      <PopIn p={p} a={0.86} b={0.92} position={[4.3, 3.34, 0]}>
        <mesh material={mats.oak} receiveShadow>
          <boxGeometry args={[5.0, 0.06, 4.6]} />
        </mesh>
      </PopIn>
      <PopIn p={p} a={0.9} b={0.96} position={[4.3, 3.38, 0.3]}>
        <mesh material={mats.cream}>
          <boxGeometry args={[2.6, 0.02, 1.7]} />
        </mesh>
      </PopIn>
      <PopIn p={p} a={0.89} b={0.95} position={[4.3, 3.37, -1.0]}>
        {/* headboard + bed */}
        <mesh position={[0, 0.62, -0.72]} material={mats.walnut} castShadow>
          <boxGeometry args={[2.0, 0.78, 0.09]} />
        </mesh>
        <mesh position={[0, 0.28, 0]} material={mats.walnut}>
          <boxGeometry args={[1.9, 0.32, 1.55]} />
        </mesh>
        <mesh position={[0, 0.5, 0]} material={mats.linen}>
          <boxGeometry args={[1.8, 0.16, 1.45]} />
        </mesh>
        <mesh position={[-0.4, 0.63, -0.5]} rotation={[0.35, 0, 0]} material={mats.linen}>
          <boxGeometry args={[0.6, 0.12, 0.34]} />
        </mesh>
        <mesh position={[0.4, 0.63, -0.5]} rotation={[0.35, 0, 0]} material={mats.linen}>
          <boxGeometry args={[0.6, 0.12, 0.34]} />
        </mesh>
        <mesh position={[0, 0.6, 0.35]} material={mats.terraCloth}>
          <boxGeometry args={[1.8, 0.07, 0.5]} />
        </mesh>
      </PopIn>
      {/* bedside tables + lamps */}
      <PopIn p={p} a={0.92} b={0.97} position={[3.05, 3.37, -1.6]}>
        <mesh position={[0, 0.2, 0]} material={mats.walnut} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
        </mesh>
        <Bulb pos={[0, 0.5, 0]} r={0.06} />
      </PopIn>
      <PopIn p={p} a={0.93} b={0.98} position={[5.55, 3.37, -1.6]}>
        <mesh position={[0, 0.2, 0]} material={mats.walnut} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
        </mesh>
        <Bulb pos={[0, 0.5, 0]} r={0.06} />
      </PopIn>
    </group>
  );
}

function TowerStair({ p, mats }: P & { mats: Mats }) {
  const steps = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  return (
    <group>
      {steps.map((i) => (
        <PopIn key={i} p={p} a={0.85 + i * 0.008} b={0.9 + i * 0.008} position={[-1.65 + i * 0.27, 0.75 + i * 0.31, 0.2]}>
          <mesh material={mats.oak} castShadow>
            <boxGeometry args={[0.85, 0.06, 0.38]} />
          </mesh>
        </PopIn>
      ))}
      {/* chandelier drop in the double-height tower */}
      <PopIn p={p} a={0.9} b={0.96} position={[-0.75, 0, 0.4]}>
        <Bulb pos={[0, 5.3, 0]} cord={1.1} r={0.08} />
        <Bulb pos={[-0.25, 4.85, 0.1]} cord={1.55} r={0.06} />
        <Bulb pos={[0.25, 4.5, -0.1]} cord={1.9} r={0.07} />
      </PopIn>
    </group>
  );
}

/* Interior lamps that warm up at handover. */
function InteriorGlow({ p }: P) {
  const l1 = useRef<THREE.PointLight>(null);
  const l2 = useRef<THREE.PointLight>(null);
  const l3 = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const s = seg(p.current, 0.88, 1);
    if (l1.current) l1.current.intensity = s * 3.2;
    if (l2.current) l2.current.intensity = s * 2.2;
    if (l3.current) l3.current.intensity = s * 2.4;
  });
  return (
    <>
      <pointLight ref={l1} position={[4.3, 2.1, 0.2]} color="#ffc074" distance={7} decay={2} intensity={0} />
      <pointLight ref={l2} position={[4.3, 4.4, -0.4]} color="#ffc074" distance={6} decay={2} intensity={0} />
      <pointLight ref={l3} position={[-0.75, 4.6, 0.4]} color="#ffc074" distance={6} decay={2} intensity={0} />
    </>
  );
}

/* ---------- scaffolding, site & crane ---------- */

function Scaffold({ p, up, down, x, z, width, height, mats }: P & { up: number; down: number; x: number; z: number; width: number; height: number; mats: Mats }) {
  const bays = Math.max(1, Math.round(width / 1.9));
  const lifts = Math.max(2, Math.round(height / 1.9));
  const poles = useMemo(() => Array.from({ length: bays + 1 }, (_, i) => i), [bays]);
  const levels = useMemo(() => Array.from({ length: lifts }, (_, i) => i), [lifts]);
  return (
    <Temporary p={p} up={up} upEnd={up + 0.08} down={down} downEnd={down + 0.06} position={[x, 0, z]}>
      {poles.map((i) => (
        <group key={i} position={[-width / 2 + i * (width / bays), 0, 0]}>
          <mesh position={[0, height / 2, 0.35]} material={mats.steel} castShadow>
            <cylinderGeometry args={[0.035, 0.035, height, 6]} />
          </mesh>
          <mesh position={[0, height / 2, -0.35]} material={mats.steel} castShadow>
            <cylinderGeometry args={[0.035, 0.035, height, 6]} />
          </mesh>
        </group>
      ))}
      {levels.map((l) => (
        <group key={l} position={[0, (l + 1) * (height / lifts), 0]}>
          <mesh position={[0, 0, 0.35]} material={mats.steel} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, width, 6]} />
          </mesh>
          <mesh position={[0, 0, -0.35]} material={mats.steel} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, width, 6]} />
          </mesh>
          <mesh position={[0, 0.04, 0]} material={mats.plank} castShadow>
            <boxGeometry args={[width, 0.05, 0.62]} />
          </mesh>
        </group>
      ))}
    </Temporary>
  );
}

function Tree({ height = 3.4 }: { height?: number }) {
  return (
    <group>
      <mesh position={[0, height * 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, height * 0.64, 7]} />
        <meshStandardMaterial color="#5d4433" roughness={1} />
      </mesh>
      <mesh position={[0, height * 0.66, 0]} castShadow>
        <sphereGeometry args={[height * 0.26, 12, 10]} />
        <meshStandardMaterial color="#5f7247" roughness={1} />
      </mesh>
      <mesh position={[height * 0.06, height * 0.88, height * 0.03]} castShadow>
        <sphereGeometry args={[height * 0.19, 12, 10]} />
        <meshStandardMaterial color="#71855a" roughness={1} />
      </mesh>
      <mesh position={[-height * 0.08, height * 0.78, -height * 0.05]} castShadow>
        <sphereGeometry args={[height * 0.15, 10, 8]} />
        <meshStandardMaterial color="#54663f" roughness={1} />
      </mesh>
    </group>
  );
}

function Site({ p, mats }: P & { mats: Mats }) {
  const soil = useRef<THREE.Mesh>(null);
  const soilMat = useRef<THREE.MeshStandardMaterial>(null);
  const pallets = useRef<THREE.Group>(null);
  const grid = useRef<THREE.GridHelper>(null);
  const lawnMat = useRef<THREE.MeshStandardMaterial>(null);
  const driveMat = useRef<THREE.MeshStandardMaterial>(null);
  const fence = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

  useFrame(() => {
    const v = p.current;
    if (soil.current && soilMat.current) {
      const s = Math.min(seg(v, 0.0, 0.05), 1 - seg(v, 0.75, 0.9));
      soilMat.current.opacity = s * 0.9;
      soil.current.visible = s > 0.01;
    }
    if (pallets.current) {
      const s = Math.min(seg(v, 0.04, 0.1), 1 - seg(v, 0.72, 0.84));
      pallets.current.visible = s > 0.001;
      pallets.current.scale.setScalar(Math.max(s, 0.0001));
    }
    if (grid.current) {
      const m = grid.current.material as THREE.Material & { opacity: number };
      m.transparent = true;
      m.opacity = 0.8 - seg(v, 0.65, 0.9) * 0.7;
    }
    if (lawnMat.current) lawnMat.current.opacity = seg(v, 0.88, 0.98);
    if (driveMat.current) driveMat.current.opacity = seg(v, 0.86, 0.96);
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={mats.ground} receiveShadow>
        <planeGeometry args={[240, 240]} />
      </mesh>
      <gridHelper ref={grid} args={[46, 46, "#b7ae99", "#cdc6b2"]} />
      <mesh ref={soil} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 1.5]}>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial ref={soilMat} map={mats.soilMap} transparent opacity={0} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.4, 0.004, 5.4]}>
        <planeGeometry args={[9, 4.2]} />
        <meshStandardMaterial ref={lawnMat} color="#6c7f4e" transparent opacity={0} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.6, 0.006, 7]}>
        <planeGeometry args={[9.5, 7]} />
        <meshStandardMaterial ref={driveMat} color="#e6e0d1" transparent opacity={0} roughness={0.9} />
      </mesh>
      {fence.filter((i) => i !== 2 && i !== 3).map((i) => (
        <Temporary key={i} p={p} up={0.03 + i * 0.004} upEnd={0.07 + i * 0.004} down={0.8 + i * 0.004} downEnd={0.85 + i * 0.004} position={[-9.5 + i * 3.2, 0, 6.2]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[3, 1.1, 0.04]} />
            <meshStandardMaterial color="#c9662f" roughness={0.8} transparent opacity={0.92} />
          </mesh>
          <mesh position={[-1.45, 0.55, 0]} material={mats.steel}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
          </mesh>
          <mesh position={[1.45, 0.55, 0]} material={mats.steel}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
          </mesh>
        </Temporary>
      ))}
      <group ref={pallets}>
        <mesh position={[9.6, 0.35, 3.2]} material={mats.brick} castShadow>
          <boxGeometry args={[1.6, 0.7, 1.1]} />
        </mesh>
        <mesh position={[10.8, 0.25, 1]} material={mats.concrete} castShadow>
          <boxGeometry args={[1.1, 0.5, 1.1]} />
        </mesh>
        <mesh position={[8.8, 0.2, -0.9]} material={mats.plank} castShadow>
          <boxGeometry args={[1.8, 0.4, 0.9]} />
        </mesh>
        <mesh position={[9.9, 0.5, -0.9]} material={mats.steel} rotation={[0, 0.4, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
        </mesh>
      </group>
    </group>
  );
}

function Crane({ p, mats }: P & { mats: Mats }) {
  const group = useRef<THREE.Group>(null);
  const jib = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const v = p.current;
    const s = Math.min(seg(v, 0.03, 0.1), 1 - seg(v, 0.78, 0.9));
    if (!group.current) return;
    group.current.visible = s > 0.001;
    group.current.scale.setScalar(Math.max(s, 0.0001));
    if (jib.current) jib.current.rotation.y = Math.sin(clock.elapsedTime * 0.16) * 0.45 + v * 2;
  });
  const H = 11;
  const braces = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  return (
    <group ref={group} position={[-10.5, 0, -3.5]}>
      <mesh position={[0, H / 2, 0]} material={mats.crane} castShadow>
        <boxGeometry args={[0.5, H, 0.5]} />
      </mesh>
      {braces.map((i) => (
        <mesh key={i} position={[0, 0.8 + i * 1.35, 0]} rotation={[0, 0, Math.PI / 4]} material={mats.crane}>
          <boxGeometry args={[0.06, 0.95, 0.56]} />
        </mesh>
      ))}
      <group ref={jib} position={[0, H, 0]}>
        <mesh position={[3, 0.1, 0]} material={mats.crane} castShadow>
          <boxGeometry args={[7.4, 0.3, 0.3]} />
        </mesh>
        <mesh position={[1.4, 0.62, 0]} rotation={[0, 0, -0.32]} material={mats.steel}>
          <cylinderGeometry args={[0.02, 0.02, 3.1, 5]} />
        </mesh>
        <mesh position={[-1.1, 0.5, 0]} rotation={[0, 0, 0.5]} material={mats.steel}>
          <cylinderGeometry args={[0.02, 0.02, 2.4, 5]} />
        </mesh>
        <mesh position={[0, 1.05, 0]} material={mats.crane}>
          <boxGeometry args={[0.18, 1.9, 0.18]} />
        </mesh>
        <mesh position={[-1.9, -0.4, 0]} material={mats.concrete} castShadow>
          <boxGeometry args={[1.2, 0.8, 0.8]} />
        </mesh>
        <mesh position={[5.2, -1.7, 0]} material={mats.steel}>
          <cylinderGeometry args={[0.015, 0.015, 3.4, 4]} />
        </mesh>
        <mesh position={[5.2, -3.5, 0]} material={mats.concrete} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- the villa ---------- */

function Villa({ p, mats }: P & { mats: Mats }) {
  const louvres = useMemo(() => Array.from({ length: 13 }, (_, i) => i), []);
  const mullions = useMemo(() => Array.from({ length: 4 }, (_, i) => i), []);
  const rebar = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);

  return (
    <group>
      {/* — Stage 1 · rebar mat, then the plinth pours over it — */}
      {rebar.map((i) => (
        <GrowY key={`rx-${i}`} p={p} a={0.02} b={0.06} pos={[-7.5 + i * 1.9, 0.14, 0]} size={[0.05, 0.28, 8.2]} material={mats.steel} shadow={false} />
      ))}
      {rebar.slice(0, 5).map((i) => (
        <GrowY key={`rz-${i}`} p={p} a={0.03} b={0.07} pos={[0, 0.16, -3.6 + i * 1.8]} size={[15.8, 0.26, 0.05]} material={mats.steel} shadow={false} />
      ))}
      <GrowY p={p} a={0.07} b={0.17} pos={[0, 0.19, 0]} size={[16.5, 0.38, 9]} material={mats.concrete} />

      {/* — Stage 2 · concrete frame — */}
      <GrowY p={p} a={0.24} b={0.32} pos={[-6.6, 1.69, -2.2]} size={[0.3, 3, 0.3]} material={mats.concrete} />
      <GrowY p={p} a={0.24} b={0.32} pos={[-3.4, 1.69, -2.2]} size={[0.3, 3, 0.3]} material={mats.concrete} />
      <GrowY p={p} a={0.24} b={0.32} pos={[-6.6, 1.69, 2.2]} size={[0.3, 3, 0.3]} material={mats.concrete} />
      <GrowY p={p} a={0.24} b={0.32} pos={[-3.4, 1.69, 2.2]} size={[0.3, 3, 0.3]} material={mats.concrete} />
      <GrowY p={p} a={0.29} b={0.36} pos={[-5, 3.24, 0]} size={[5.4, 0.25, 5.6]} material={mats.concrete} />
      <GrowY p={p} a={0.3} b={0.4} pos={[-1.9, 3.39, -1.6]} size={[0.32, 6.4, 0.32]} material={mats.concrete} />
      <GrowY p={p} a={0.3} b={0.4} pos={[0.4, 3.39, -1.6]} size={[0.32, 6.4, 0.32]} material={mats.concrete} />
      <GrowY p={p} a={0.3} b={0.4} pos={[-1.9, 3.39, 1.6]} size={[0.32, 6.4, 0.32]} material={mats.concrete} />
      <GrowY p={p} a={0.3} b={0.4} pos={[0.4, 3.39, 1.6]} size={[0.32, 6.4, 0.32]} material={mats.concrete} />
      <GrowY p={p} a={0.35} b={0.42} pos={[-0.75, 3.49, 0]} size={[2.6, 0.25, 3.6]} material={mats.concrete} />
      <GrowY p={p} a={0.38} b={0.47} pos={[1.6, 2.99, -2.3]} size={[0.3, 5.6, 0.3]} material={mats.concrete} />
      <GrowY p={p} a={0.38} b={0.47} pos={[7, 2.99, -2.3]} size={[0.3, 5.6, 0.3]} material={mats.concrete} />
      <GrowY p={p} a={0.38} b={0.47} pos={[1.6, 2.99, 2.3]} size={[0.3, 5.6, 0.3]} material={mats.concrete} />
      <GrowY p={p} a={0.38} b={0.47} pos={[7, 2.99, 2.3]} size={[0.3, 5.6, 0.3]} material={mats.concrete} />
      <GrowY p={p} a={0.43} b={0.5} pos={[4.3, 3.04, 0]} size={[5.45, 0.25, 4.9]} material={mats.concrete} />

      {/* — Stage 3 · brickwork rises, then finishes go over it — */}
      <GrowY p={p} a={0.48} b={0.6} pos={[-5, 1.88, 0]} size={[4.9, 2.95, 5.3]} material={mats.brick} />
      <BrickCore p={p} a={0.52} b={0.66} fade={0.8} pos={[-0.75, 3.58, 0]} size={[2.95, 6.35, 3.55]} material={mats.brickFadeA} />
      <BrickCore p={p} a={0.56} b={0.7} fade={0.8} pos={[4.3, 3.18, 0]} size={[5.45, 5.5, 4.95]} material={mats.brickFadeB} />

      {/* left wing finishes (kept solid — service wing) */}
      <GrowY p={p} a={0.62} b={0.72} pos={[-5, 1.89, 0]} size={[5, 3, 5.4]} material={mats.stone} />
      <GrowY p={p} a={0.66} b={0.74} pos={[-5, 3.74, 0]} size={[4.6, 0.7, 5]} material={mats.stucco} />

      {/* tower — hollow timber shell so the stair reads through the glass strip */}
      <GrowY p={p} a={0.66} b={0.78} pos={[-0.75, 3.59, -1.7]} size={[3.1, 6.4, 0.3]} material={mats.wood} />
      <GrowY p={p} a={0.67} b={0.78} pos={[-2.15, 3.59, 0]} size={[0.3, 6.4, 3.7]} material={mats.wood} />
      <GrowY p={p} a={0.67} b={0.78} pos={[0.65, 3.59, 0]} size={[0.3, 6.4, 3.7]} material={mats.wood} />
      <GrowY p={p} a={0.68} b={0.79} pos={[-1.9, 3.59, 1.7]} size={[0.8, 6.4, 0.3]} material={mats.wood} />
      <GrowY p={p} a={0.68} b={0.79} pos={[0.4, 3.59, 1.7]} size={[0.8, 6.4, 0.3]} material={mats.wood} />

      {/* right wing — hollow render shell with real window openings */}
      <GrowY p={p} a={0.7} b={0.8} pos={[1.65, 3.19, 0]} size={[0.3, 5.6, 5.1]} material={mats.stucco} />
      <GrowY p={p} a={0.7} b={0.8} pos={[6.95, 3.19, 0]} size={[0.3, 5.6, 5.1]} material={mats.stucco} />
      <GrowY p={p} a={0.71} b={0.81} pos={[4.3, 3.19, -2.4]} size={[5.0, 5.6, 0.3]} material={mats.stucco} />
      <GrowY p={p} a={0.72} b={0.8} pos={[2.15, 3.19, 2.4]} size={[1.3, 5.6, 0.3]} material={mats.stucco} />
      <GrowY p={p} a={0.72} b={0.8} pos={[6.75, 3.19, 2.4]} size={[0.7, 5.6, 0.3]} material={mats.stucco} />
      <GrowY p={p} a={0.73} b={0.81} pos={[4.6, 0.57, 2.4]} size={[3.6, 0.36, 0.3]} material={mats.stucco} />
      <GrowY p={p} a={0.74} b={0.82} pos={[4.6, 3.4, 2.4]} size={[3.6, 0.7, 0.3]} material={mats.stucco} />
      <GrowY p={p} a={0.75} b={0.83} pos={[4.6, 5.77, 2.4]} size={[3.6, 0.44, 0.3]} material={mats.stucco} />
      {/* entry wall */}
      <GrowY p={p} a={0.72} b={0.8} pos={[1.35, 2.49, 1.1]} size={[1.3, 4.2, 2.6]} material={mats.stone} />

      {/* — Stage 4 · steel fascias, canopy, glazing, screens — */}
      <DropIn p={p} a={0.78} b={0.85} pos={[-5, 4.21, 0]} size={[5.5, 0.24, 5.9]} material={mats.fascia} />
      <DropIn p={p} a={0.8} b={0.87} pos={[-0.75, 6.92, 0]} size={[3.5, 0.26, 3.9]} material={mats.fascia} />
      <DropIn p={p} a={0.82} b={0.89} pos={[4.3, 6.12, 0]} size={[6.1, 0.26, 5.3]} material={mats.fascia} />
      <DropIn p={p} a={0.84} b={0.92} pos={[3.3, 4.01, 2.3]} size={[6.8, 0.28, 3.4]} material={mats.fascia} />

      {/* tower glazing strip + mullions */}
      <GlassWindow p={p} a={0.8} b={0.88} pos={[-0.75, 3.59, 1.78]} size={[1.5, 5.6]} />
      {mullions.map((i) => (
        <PopIn key={`mul-${i}`} p={p} a={0.85 + i * 0.008} b={0.9 + i * 0.008} position={[-0.75, 1.99 + i * 1.35, 1.86]}>
          <mesh material={mats.fascia}>
            <boxGeometry args={[1.52, 0.05, 0.03]} />
          </mesh>
        </PopIn>
      ))}

      {/* right wing glazing set into the real openings */}
      <GlassWindow p={p} a={0.82} b={0.9} pos={[4.6, 1.9, 2.4]} size={[3.6, 2.3]} glow={0.5} />
      <GlassWindow p={p} a={0.84} b={0.92} pos={[4.6, 4.65, 2.4]} size={[3.6, 1.8]} glow={0.35} />
      {/* entry door — timber slab + glass sidelight on the stone wall */}
      <PopIn p={p} a={0.86} b={0.93} position={[1.05, 1.64, 2.44]}>
        <mesh material={mats.wood} castShadow>
          <boxGeometry args={[0.95, 2.5, 0.08]} />
        </mesh>
        <mesh position={[0.36, 0, 0.05]} material={mats.steel}>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
        </mesh>
      </PopIn>
      {/* left wing window band */}
      <GlassWindow p={p} a={0.83} b={0.91} pos={[-5, 2.49, 2.75]} size={[3.6, 1.2]} glow={0.8} />

      {/* louvre screen over upper glazing */}
      {louvres.map((i) => (
        <PopIn key={`lou-${i}`} p={p} a={0.87 + i * 0.004} b={0.93 + i * 0.004} position={[2.95 + i * 0.28, 4.65, 2.6]}>
          <mesh material={mats.fascia} castShadow>
            <boxGeometry args={[0.045, 1.8, 0.12]} />
          </mesh>
        </PopIn>
      ))}

      {/* entry steps */}
      <PopIn p={p} a={0.88} b={0.94} position={[1.35, 0, 3.1]}>
        <mesh position={[0, 0.24, 0]} material={mats.concrete} castShadow>
          <boxGeometry args={[2.4, 0.16, 1.5]} />
        </mesh>
        <mesh position={[0, 0.08, 0.5]} material={mats.concrete} castShadow>
          <boxGeometry args={[2.4, 0.16, 1.1]} />
        </mesh>
      </PopIn>

      {/* — the interiors, revealed through the front glazing — */}
      <LivingRoom p={p} mats={mats} />
      <Bedroom p={p} mats={mats} />
      <TowerStair p={p} mats={mats} />

      {/* — landscaping — */}
      <PopIn p={p} a={0.9} b={0.97} position={[-2.9, 0, 3.6]}>
        <Tree height={4.6} />
      </PopIn>
      <PopIn p={p} a={0.92} b={0.985} position={[-0.2, 0, 3.4]}>
        <Tree height={3.1} />
      </PopIn>
      <PopIn p={p} a={0.91} b={0.975} position={[7.9, 0, 3.4]}>
        <Tree height={3.9} />
      </PopIn>
      <PopIn p={p} a={0.9} b={0.96} position={[-5, 0.3, 3.15]}>
        <mesh castShadow material={mats.greenDark}>
          <boxGeometry args={[4.4, 0.6, 0.7]} />
        </mesh>
      </PopIn>
      <PopIn p={p} a={0.92} b={0.97} position={[5.6, 0.26, 3.4]}>
        <mesh castShadow material={mats.greenDark}>
          <boxGeometry args={[3.2, 0.52, 0.65]} />
        </mesh>
      </PopIn>
    </group>
  );
}

/* ---------- people & vehicles staged through the build ---------- */

function Cast({ p, mats }: P & { mats: Mats }) {
  const kidBob = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (kidBob.current) kidBob.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 3)) * 0.12;
  });
  return (
    <group>
      {/* site crew during the works */}
      <Between p={p} from={0.06} to={0.5} position={[-3.4, 0, 3.4]} rotation={0.5}>
        <Human mats={mats} shirt={mats.hiVis} pants={mats.denim} hat darkSkin />
      </Between>
      <Between p={p} from={0.1} to={0.72} position={[8.6, 0, 1.8]} rotation={-0.7}>
        <Human mats={mats} shirt={mats.hiVis} pants={mats.charcoalCloth} hat />
      </Between>
      <WalkingWorker p={p} mats={mats} />
      {/* supervisor on the scaffold deck */}
      <Between p={p} from={0.58} to={0.77} position={[3.6, 2.07, 3.3]} rotation={Math.PI}>
        <Human mats={mats} h={1.7} shirt={mats.hiVis} pants={mats.denim} hat darkSkin />
      </Between>

      {/* the family arrives at handover */}
      <Between p={p} from={0.93} to={2} position={[2.6, 0, 4.9]} rotation={-2.6}>
        <Human mats={mats} shirt={mats.charcoalCloth} pants={mats.slate} />
      </Between>
      <Between p={p} from={0.94} to={2} position={[3.15, 0, 5.15]} rotation={2.9}>
        <Human mats={mats} h={1.64} female shirt={mats.terraCloth} pants={mats.terraCloth} />
      </Between>
      {/* kid holding dad's hand, bouncing */}
      <Between p={p} from={0.94} to={2} position={[2.05, 0, 5.2]} rotation={-2.4}>
        <group ref={kidBob}>
          <Human mats={mats} h={1.02} kid shirt={mats.kidBlue} pants={mats.denim} />
        </group>
      </Between>
      {/* kid running circles on the lawn */}
      <PlayingKid p={p} mats={mats} center={[-3.2, 0, 5.3]} r={0.85} speed={1.1} mat={mats.kidGreen} />

      {/* the car arrives on the finished driveway */}
      <PopIn p={p} a={0.91} b={0.97} position={[4.9, 0, 6.9]} rotation={-0.35}>
        <Suspense fallback={null}>
          <RealCar />
        </Suspense>
      </PopIn>
    </group>
  );
}

/* ---------- atmosphere & camera ---------- */

const FOG_START = new THREE.Color("#f1eee6");
const FOG_WARM = new THREE.Color("#f2e3cf");
function FogTint({ p }: P) {
  useFrame(({ scene }) => {
    if (scene.fog) scene.fog.color.lerpColors(FOG_START, FOG_WARM, seg(p.current, 0.45, 1) * 0.85);
  });
  return null;
}

function Rig({ p }: P) {
  const look = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const v = p.current;
    /* sweep from a low corner view to a frontal reveal of the lit interior */
    const angle = -0.62 + v * 0.66;
    const aspectBoost = Math.max(1, Math.min(2.2, 1.35 / (size.width / size.height)));
    const radius = (21 + v * 4.5) * aspectBoost;
    const height = 2.6 + v * 3.2;
    target.set(Math.sin(angle) * radius + 1.5, height, Math.cos(angle) * radius);
    camera.position.lerp(target, 0.075);
    look.lerp(new THREE.Vector3(0.3, 1.1 + v * 1.3, 0), 0.09);
    camera.lookAt(look);
  });
  return null;
}

function Smoother({ raw, smooth }: { raw: Ref; smooth: Ref }) {
  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 5.5);
    smooth.current += (raw.current - smooth.current) * k;
  });
  return null;
}

function Scene({ progress }: { progress: Ref }) {
  const smooth = useRef(0);
  const mats = useMaterials();
  return (
    <>
      <Smoother raw={progress} smooth={smooth} />
      <FogTint p={smooth} />
      <Site p={smooth} mats={mats} />
      <Villa p={smooth} mats={mats} />
      <Cast p={smooth} mats={mats} />
      <InteriorGlow p={smooth} />
      <Scaffold p={smooth} up={0.46} down={0.79} x={-5} z={3.35} width={5.8} height={4} mats={mats} />
      <Scaffold p={smooth} up={0.5} down={0.81} x={-0.75} z={2.6} width={3.9} height={7} mats={mats} />
      <Scaffold p={smooth} up={0.54} down={0.83} x={4.3} z={3.3} width={6.3} height={6.2} mats={mats} />
      <Crane p={smooth} mats={mats} />
      <Rig p={smooth} />
    </>
  );
}

export default function BuildingScene({ progress }: { progress: Ref }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [8, 2.6, 19], fov: 33 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          console.warn("WebGL context lost — hero scene paused");
        });
      }}
    >
      <fog attach="fog" args={["#f1eee6", 60, 130]} />
      <hemisphereLight args={["#f6f1e6", "#8d8474", 0.55]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[11, 16, 9]}
        intensity={1.6}
        color="#fff1da"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-10, 6, -6]} intensity={0.3} color="#dfe8ea" />
      <Scene progress={progress} />
    </Canvas>
  );
}
