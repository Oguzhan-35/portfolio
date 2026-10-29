/* ============================================================
   BOOK — the 3D portfolio. A hardcover on a black oak desk, lit by
   one lamp. Pages are real geometry that bends as it turns; their
   content is painted from js/data/*.js by pages.js.

   Controls: click the cover · click either half of a page ·
   ← / → keys · Esc closes · contents rows jump to a spread.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/jsm/GLTFLoader.js';
import { profile } from '../js/data/profile.js';
import { cases } from './pages.js';
import { buildPages, paintPage, coverFoil } from './pages.js';

const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- dimensions (scene units) ---------- */
const W = 1.0;             // page depth, measured away from the spine
const H = 1.6;             // page length along the spine (16:10 with W)
const COVER_W = W + 0.05;  // the cover overhangs the pages
const COVER_H = H + 0.08;
const SEG = 28;            // segments along a leaf — drives how smoothly it curls
const DESK_Y = 0;
const BOARD = 0.02;        // thickness of the static back board
const CURL = 0.85;         // how far the free edge lags while a page turns
const EXTRA = 0.06;        // thickness of the unseen bulk of pages, so the book has real heft
const extra = { r: EXTRA, l: 0 }; // how much of that bulk sits under each stack right now
const CORNER = 0.05;       // rounded outer corners of the hardcover
const TURN_MS = reduceMotion ? 1 : 1150;
const STAGGER_MS = reduceMotion ? 0 : 140;

const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const smooth = (t) => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- fallbacks ---------- */
function showFallback() {
  $('nogl').hidden = false;
  $('hero').hidden = true;
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $('stage'), antialias: true });
} catch (e) {
  showFallback();
  throw e;
}

/* ---------- renderer / scene / camera ---------- */
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0805);

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
const camTarget = new THREE.Vector3();

/* ---------- lamp ---------- */
const lamp = new THREE.SpotLight(0xffd9a8, 85, 0, 0.7, 1, 2);
lamp.position.set(-0.4, 3.6, -0.5);
lamp.target.position.set(0, 0, 0);
lamp.castShadow = true;
lamp.shadow.mapSize.set(2048, 2048);
lamp.shadow.camera.near = 1.5;
lamp.shadow.camera.far = 8;
lamp.shadow.bias = -0.0003;
lamp.shadow.normalBias = 0.012;
lamp.shadow.radius = 6;
scene.add(lamp, lamp.target);
scene.add(new THREE.HemisphereLight(0x8a735a, 0x1a1008, 0.18));
const fill = new THREE.DirectionalLight(0x9fb4d0, 0.18);
fill.position.set(-4, 3, 3);
scene.add(fill);

/* ---------- texture helpers ---------- */
const maxAniso = renderer.capabilities.getMaxAnisotropy();
function tex(canvas, srgb = true) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, maxAniso);
  return t;
}

function noiseCanvas(size, a = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const d = g.createImageData(size, size);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 255 * a;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}

/* Oak planks laid along x: seams, staggered end joints, long wavy grain. */
function woodCanvas() {
  const S = 2048;
  const rows = 6;
  const ph = S / rows;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const palette = ['#7a5836', '#6a4a2d', '#85623c', '#735233', '#7d5a38', '#664629'];
  for (let r = 0; r < rows; r++) {
    const y0 = r * ph;
    g.fillStyle = palette[r];
    g.fillRect(0, y0, S, ph);
    const tone = g.createLinearGradient(0, 0, S, 0);
    tone.addColorStop(0, 'rgba(0,0,0,0.10)');
    tone.addColorStop(0.5, 'rgba(255,200,140,0.07)');
    tone.addColorStop(1, 'rgba(0,0,0,0.10)');
    g.fillStyle = tone;
    g.fillRect(0, y0, S, ph);
    for (let i = 0; i < 520; i++) {
      const yy = y0 + Math.random() * ph;
      const amp = Math.random() * 3 + 0.4;
      const k = 1 + Math.floor(Math.random() * 6); // whole waves per tile, so the texture tiles cleanly
      const phase = Math.random() * 6.28;
      const light = Math.random() > 0.55;
      const a = Math.random() * 0.2 + 0.03;
      g.strokeStyle = light ? `rgba(205,155,100,${a})` : `rgba(35,20,10,${a * 1.2})`;
      g.lineWidth = Math.random() * 1.8 + 0.4;
      g.beginPath();
      for (let x = 0; x <= S; x += 32) g.lineTo(x, yy + Math.sin((x / S) * 6.283 * k + phase) * amp);
      g.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const by = y0 + Math.random() * ph;
      const band = g.createLinearGradient(0, by - 24, 0, by + 24);
      band.addColorStop(0, 'rgba(30,16,8,0)');
      band.addColorStop(0.5, 'rgba(30,16,8,0.09)');
      band.addColorStop(1, 'rgba(30,16,8,0)');
      g.fillStyle = band;
      g.fillRect(0, by - 24, S, 48);
    }
    /* end joint, staggered between planks */
    const jx = (r * 0.37 + 0.12) * S;
    g.fillStyle = 'rgba(12,6,2,0.8)';
    g.fillRect(jx, y0, 2.5, ph);
    g.fillStyle = 'rgba(255,220,170,0.10)';
    g.fillRect(jx + 2.5, y0, 1.5, ph);
    /* seam */
    g.fillStyle = 'rgba(10,5,2,0.9)';
    g.fillRect(0, y0, S, 3);
    g.fillStyle = 'rgba(255,220,170,0.10)';
    g.fillRect(0, y0 + 3, S, 1.5);
  }
  for (let i = 0; i < 26000; i++) {
    g.fillStyle = `rgba(20,10,4,${Math.random() * 0.07})`;
    g.fillRect(Math.random() * S, Math.random() * S, 1.6, 1.6);
  }
  return c;
}

function woodTexture() {
  const t = tex(woodCanvas());
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

/* ---------- environment: dim warm room with a cool window, for believable reflections ---------- */
(function buildEnvironment() {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(30, 14, 30),
    new THREE.MeshBasicMaterial({ color: 0x1b130d, side: THREE.BackSide }),
  );
  env.add(room);
  const window_ = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.65, 0.8).multiplyScalar(2.2) }));
  window_.position.set(-14, 4, -3);
  window_.rotation.y = Math.PI / 2;
  env.add(window_);
  const warm = new THREE.Mesh(new THREE.CircleGeometry(2, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.75, 0.45).multiplyScalar(6) }));
  warm.position.set(0, 6.8, 0);
  warm.rotation.x = Math.PI / 2;
  env.add(warm);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(env, 0.04).texture;
  pmrem.dispose();
})();

/* ---------- desk ---------- */
const deskWood = woodCanvas();
const deskBump = tex(deskWood, false);
deskBump.wrapS = deskBump.wrapT = THREE.RepeatWrapping;
deskBump.repeat.set(2, 2);
const desk = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 10),
  new THREE.MeshPhysicalMaterial({
    map: woodTexture(),
    bumpMap: deskBump,
    bumpScale: 0.25,
    color: 0x9a8268,
    roughness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.35,
  }),
);
desk.rotation.x = -Math.PI / 2;
desk.receiveShadow = true;
scene.add(desk);

/* ---------- props ---------- */
function addProps() {
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf2efe8, roughness: 0.25, clearcoat: 0.6 });
  const shadowed = (m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  /* Cappuccino */
  const cup = new THREE.Group();
  const saucer = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.22, 0.025, 40), ceramic));
  saucer.position.y = 0.0125;
  const pts = [[0, 0], [0.07, 0], [0.1, 0.025], [0.14, 0.09], [0.172, 0.15], [0.178, 0.16], [0.168, 0.16], [0.16, 0.15], [0.12, 0.05], [0, 0.03]].map(
    ([r, y]) => new THREE.Vector2(r, y),
  );
  const body = shadowed(new THREE.Mesh(new THREE.LatheGeometry(pts, 40), ceramic));
  body.position.y = 0.025;
  const handle = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.013, 10, 20, Math.PI), ceramic));
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.18, 0.1, 0);
  const art = document.createElement('canvas');
  art.width = art.height = 256;
  const ag = art.getContext('2d');
  ag.fillStyle = '#6b4226';
  ag.fillRect(0, 0, 256, 256);
  ag.fillStyle = '#e9d6b8';
  ag.beginPath();
  ag.moveTo(128, 200);
  ag.bezierCurveTo(40, 140, 70, 60, 128, 100);
  ag.bezierCurveTo(186, 60, 216, 140, 128, 200);
  ag.fill();
  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.155, 40),
    new THREE.MeshStandardMaterial({ map: tex(art), roughness: 0.4 }),
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.158;
  cup.add(saucer, body, handle, coffee);
  cup.position.set(-2.1, 0, -0.15);
  cup.rotation.y = 0.5;
  scene.add(cup);

  /* Pencil */
  const pencil = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0xc89b62, roughness: 0.7 });
  const lacquer = new THREE.MeshStandardMaterial({ color: 0x1c2a3a, roughness: 0.35 });
  const pBody = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.8, 6), lacquer));
  const pCone = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.08, 6), wood));
  const pLead = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.025, 6), new THREE.MeshStandardMaterial({ color: 0x222222 })));
  pCone.position.y = 0.44;
  pLead.position.y = 0.4825 + 0.0;
  pLead.position.y = 0.49;
  pencil.add(pBody, pCone, pLead);
  pencil.rotation.z = Math.PI / 2;
  pencil.rotation.y = 0.25;
  pencil.position.set(2.15, 0.014, 0.85);
  scene.add(pencil);

  /* Business cards */
  const card = document.createElement('canvas');
  card.width = 640;
  card.height = 372;
  const cg = card.getContext('2d');
  cg.fillStyle = '#f3f2ee';
  cg.fillRect(0, 0, 640, 372);
  cg.fillStyle = '#111';
  cg.font = '800 44px Manrope, sans-serif';
  cg.fillText(profile.name, 40, 150);
  cg.fillStyle = '#9A6A14';
  cg.font = '600 24px Manrope, sans-serif';
  cg.fillText(profile.title, 40, 192);
  cg.fillStyle = '#4a4843';
  cg.font = '500 20px Manrope, sans-serif';
  cg.fillText(profile.email, 40, 316);
  const cardTex = tex(card);
  const white = new THREE.MeshStandardMaterial({ color: 0xeeeae0, roughness: 0.8 });
  const top = new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.8 });
  for (let i = 0; i < 4; i++) {
    const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.003, 0.32), [white, white, i === 3 ? top : white, white, white, white]));
    m.position.set(2.0 + i * 0.012, 0.0015 + i * 0.003, 0.2 + i * 0.006);
    m.rotation.y = -0.35 + i * 0.06;
    scene.add(m);
  }

  /* Succulent */
  const plant = new THREE.Group();
  const clay = new THREE.MeshStandardMaterial({ color: 0x2b2420, roughness: 0.85 });
  const pot = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.11, 24), clay));
  pot.position.y = 0.055;
  plant.add(pot);
  const greens = [0x5f8b5a, 0x4f7a50, 0x6d9a63];
  for (let ring = 0; ring < 3; ring++) {
    const n = 6 + ring * 2;
    for (let i = 0; i < n; i++) {
      const pivot = new THREE.Object3D();
      pivot.rotation.y = (i / n) * Math.PI * 2 + ring * 0.4;
      const leaf = shadowed(
        new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: greens[ring], roughness: 0.6 })),
      );
      leaf.scale.set(0.055 - ring * 0.008, 0.012, 0.022);
      leaf.position.set(0.04 + ring * 0.0, 0.13 + ring * 0.03, 0);
      leaf.position.x = 0.05 - ring * 0.012;
      leaf.rotation.z = 0.5 + ring * 0.35;
      pivot.add(leaf);
      pivot.position.y = 0.0;
      plant.add(pivot);
    }
  }
  plant.position.set(2.3, 0, -0.7);
  scene.add(plant);
}
addProps();

/* ---------- the book ---------- */
const book = new THREE.Group();
/* Built hinged at local x = 0 with pages along +x; turn it so the hinge runs along the back edge
   and the pages extend toward the viewer (mirrored so they read left to right). */
book.rotation.y = Math.PI / 2;
book.scale.x = -1;
scene.add(book);

const state = {
  turned: 0, // how many leaves lie on the left
  leaves: [],
  pickables: [],
  names: [],
  total: 0,
  base: null,
};

/* Geometry for one skin of a leaf: SEG+1 columns (away from the hinge) × 2 rows (left and right ends).
   The book is top-bound: the hinge runs along the back edge, so a page's top is at the hinge. */
function skinGeometry(back) {
  const n = SEG;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((n + 1) * 2 * 3), 3));
  const uv = new Float32Array((n + 1) * 2 * 2);
  for (let i = 0; i <= n; i++) {
    const v = back ? i / n : 1 - i / n; // back faces read head-to-tail after the flip
    uv.set([0, v, 1, v], i * 4);
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const idx = [];
  for (let i = 0; i < n; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    if (back) idx.push(a, c, b, b, c, d);
    else idx.push(a, b, c, b, d, c);
  }
  g.setIndex(idx);
  return g;
}

function leafMaterial(painted, extra = {}) {
  return new THREE.MeshStandardMaterial({
    map: tex(painted.canvas),
    color: 0xc9c2b2,
    roughness: 0.85,
    envMapIntensity: 0.5,
    alphaTest: 0.5, // the painted pages carry rounded corners as transparency
    ...extra,
  });
}

function makeLeaf(k, def, env, isCover) {
  const w = isCover ? COVER_W : W;
  const h = isCover ? COVER_H : H;
  const thick = isCover ? 0.014 : 0.007;
  const front = paintPage(def.front, env);
  const back = paintPage(def.back, env);

  const leatherBump = tex(noiseCanvas(256, 0.9), false);
  leatherBump.wrapS = leatherBump.wrapT = THREE.RepeatWrapping;
  leatherBump.repeat.set(4, 3);
  const frontMat = isCover
    ? leafMaterial(front, { color: 0xffffff, roughness: 0.45, envMapIntensity: 1, bumpMap: leatherBump, bumpScale: 1.2 })
    : leafMaterial(front);
  const backMat = isCover ? leafMaterial(back, { color: 0xffffff, roughness: 0.7 }) : leafMaterial(back);

  const fg = skinGeometry(false);
  const bg = skinGeometry(true);
  const fm = new THREE.Mesh(fg, frontMat);
  const bm = new THREE.Mesh(bg, backMat);
  for (const m of [fm, bm]) {
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    book.add(m);
  }
  fm.userData = { rects: front.rects, w: front.w, h: front.h };
  bm.userData = { rects: back.rects, w: back.w, h: back.h };
  state.pickables.push(fm, bm);

  return { k, w, h, thick, fg, bg, fm, bm, value: 0, dir: 1, anim: null, yRight: 0, yLeft: 0 };
}

/* Place a leaf for progress v ∈ [0,1] (0 = flat right, 1 = flat left), curling its free edge. */
function poseLeaf(leaf, v) {
  const n = SEG;
  const seg = leaf.w / n;
  const theta = v * Math.PI;
  const s = Math.sin(theta);
  const yR = leaf.yRight + extra.r;
  const yL = leaf.yLeft + (leaf.k > 0 ? extra.l : 0);
  const y0 = yR + (yL - yR) * smooth(v);
  const off = leaf.thick * 0.42;
  const fp = leaf.fg.attributes.position;
  const bp = leaf.bg.attributes.position;

  let x = 0;
  let y = y0;
  const half = leaf.h / 2;
  const phis = [];
  for (let i = 0; i < n; i++) {
    phis.push(clamp(theta - leaf.dir * CURL * ((i + 0.5) / n) * s, 0, Math.PI));
  }
  for (let i = 0; i <= n; i++) {
    const phi = phis[Math.min(i, n - 1)];
    const nx = -Math.sin(phi);
    const ny = Math.cos(phi);
    for (let r = 0; r < 2; r++) {
      const z = r === 0 ? -half : half;
      const vi = i * 2 + r;
      fp.setXYZ(vi, x + nx * off, y + ny * off, z);
      bp.setXYZ(vi, x - nx * off, y - ny * off, z);
    }
    if (i < n) {
      x += Math.cos(phis[i]) * seg;
      y += Math.sin(phis[i]) * seg;
    }
  }
  fp.needsUpdate = bp.needsUpdate = true;
  leaf.fg.computeVertexNormals();
  leaf.bg.computeVertexNormals();
  leaf.fg.computeBoundingSphere();
  leaf.bg.computeBoundingSphere();
  leaf.fg.computeBoundingBox();
  leaf.bg.computeBoundingBox();
}

function layoutStacks() {
  const L = state.leaves;
  L.forEach((leaf, k) => {
    let above = 0;
    for (let j = k + 1; j < L.length; j++) above += L[j].thick;
    let below = 0;
    for (let j = 0; j < k; j++) below += L[j].thick;
    leaf.yRight = BOARD + above + leaf.thick / 2;
    leaf.yLeft = DESK_Y + below + leaf.thick / 2;
  });
}

function buildBook(env) {
  const pages = buildPages(env);
  state.names = pages.spreadNames;
  state.total = pages.leaves.length;

  /* Static back board with the closing page on top. */
  const black = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.55 });
  /* Board outline: square at the spine, rounded at the three free corners. */
  const x0 = -0.02;
  const x1 = COVER_W - 0.02;
  const hh = COVER_H / 2;
  const r = CORNER;
  const shape = new THREE.Shape();
  shape.moveTo(x0, -hh);
  shape.lineTo(x1 - r, -hh);
  shape.quadraticCurveTo(x1, -hh, x1, -hh + r);
  shape.lineTo(x1, hh - r);
  shape.quadraticCurveTo(x1, hh, x1 - r, hh);
  shape.lineTo(x0, hh);
  shape.closePath();
  const boardGeo = new THREE.ExtrudeGeometry(shape, { depth: BOARD, bevelEnabled: false, curveSegments: 8 });
  boardGeo.rotateX(-Math.PI / 2);
  const board = new THREE.Mesh(boardGeo, black);
  board.castShadow = board.receiveShadow = true;
  book.add(board);

  /* Spine: a half-round of leather that stands tall when closed and sinks flat when open. */
  const spineGeo = new THREE.CylinderGeometry(1, 1, COVER_H, 20, 1, false, Math.PI, Math.PI);
  spineGeo.rotateX(Math.PI / 2);
  const spine = new THREE.Mesh(spineGeo, black);
  spine.castShadow = true;
  book.add(spine);
  blocks.spine = spine;

  const basePage = paintPage(pages.base, env);
  const baseGeo = new THREE.BufferGeometry();
  baseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, -H / 2, 0, 0, H / 2, W, 0, -H / 2, W, 0, H / 2]), 3));
  baseGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2));
  baseGeo.setIndex([0, 1, 2, 1, 3, 2]);
  baseGeo.computeVertexNormals();
  const baseMesh = new THREE.Mesh(
    baseGeo,
    new THREE.MeshStandardMaterial({ map: tex(basePage.canvas), roughness: 0.85, alphaTest: 0.5 }),
  );
  baseMesh.position.set(0, BOARD + 0.0006, 0);
  baseMesh.receiveShadow = true;
  baseMesh.userData = { rects: basePage.rects, w: basePage.w, h: basePage.h };
  book.add(baseMesh);
  state.pickables.push(baseMesh);

  pages.leaves.forEach((def, k) => state.leaves.push(makeLeaf(k, def, env, k === 0)));
  layoutStacks();
  buildBlocks();
  poseAll();
}

/* The bulk of unseen pages migrates from the right stack to the left as leaves turn. */
function poseAll() {
  const L = state.leaves;
  let f = 0;
  for (let k = 1; k < L.length; k++) f += smooth(L[k].value);
  f /= Math.max(1, L.length - 1);
  extra.r = EXTRA * (1 - f);
  extra.l = EXTRA * f;
  L.forEach((l) => poseLeaf(l, l.value));
}

/* Solid page blocks under each stack so the edges read as paper, not loose sheets,
   plus a soft contact shadow so the book sits on the wood. */
const blocks = { right: null, left: null, shadow: null };

function pageEdgeMaterial() {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#eee8d8';
  g.fillRect(0, 0, 32, 64);
  for (let y = 0; y < 64; y += 4) {
    g.fillStyle = 'rgba(120,98,64,0.38)';
    g.fillRect(0, y, 32, 1);
    g.fillStyle = 'rgba(255,255,250,0.5)';
    g.fillRect(0, y + 2, 32, 1);
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const side = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, emissive: 0x3a3226 });
  const flat = new THREE.MeshStandardMaterial({ color: 0xe9e3d3, roughness: 0.9 });
  return { mats: [side, side, flat, flat, side, side], map: t };
}

function buildBlocks() {
  for (const key of ['right', 'left']) {
    const { mats, map } = pageEdgeMaterial();
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats);
    m.castShadow = m.receiveShadow = true;
    m.userData.map = map;
    book.add(m);
    blocks[key] = m;
  }
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 20, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const s = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false }),
  );
  s.rotation.x = -Math.PI / 2;
  s.position.y = 0.0015;
  s.renderOrder = 1;
  book.add(s);
  blocks.shadow = s;
}

function updateBlocks() {
  if (!blocks.right) return;
  const L = state.leaves;
  let hR = 0;
  let hL = 0;
  for (let k = 1; k < L.length; k++) {
    const s = smooth(L[k].value);
    hR += L[k].thick * (1 - s);
    hL += L[k].thick * s;
  }
  const lift = 0.0075; // keep the block just below the top sheet
  const coverT = L[0].thick;
  const set = (m, h, cx, baseY) => {
    const height = h - lift;
    m.visible = height > 0.002;
    if (!m.visible) return;
    m.scale.set(W - 0.008, height, H - 0.006);
    m.position.set(cx, baseY + height / 2, 0);
    m.userData.map.repeat.set(1, Math.max(1, height / 0.014));
  };
  set(blocks.right, hR + extra.r, W / 2, BOARD);
  set(blocks.left, hL + extra.l, -W / 2, coverT);

  const v = L[0].value;
  /* Spine: tall and round while closed, a low ridge once the book lies open. */
  const full = BOARD + extra.r + hR + coverT;
  const sy = full / 2 + (0.02 - full / 2) * v;
  blocks.spine.scale.set(0.05 + (0.025 - 0.05) * v, Math.max(0.02, sy), 1);
  blocks.spine.position.set(-0.02, Math.max(0.02, sy), 0);
  const sh = blocks.shadow;
  sh.scale.set((COVER_W + 0.5) * (1 + v) , COVER_H + 0.5, 1);
  sh.position.x = (COVER_W / 2) * (1 - v) - 0.02;
}

/* ---------- downloaded models (Poly Haven, CC0) ----------
   The table replaces the procedural desk. While the book is closed a photographed
   hardcover sits on it; opening swaps in the animated book that carries the content. */
const models = { closed: null, meshes: [] };

async function loadModels() {
  const loader = new GLTFLoader();
  const [tableGltf, booksGltf] = await Promise.all([
    loader.loadAsync('models/painted_wooden_table/painted_wooden_table_2k.gltf'),
    loader.loadAsync('models/book_encyclopedia_set_01/book_encyclopedia_set_01_2k.gltf'),
  ]);

  /* Table: 1 scene unit ≈ 18 cm, so the 2.4 m table becomes ~14 units wide. Its top is the desk plane (y = 0). */
  const TABLE_S = 6;
  const table = tableGltf.scene;
  table.scale.setScalar(TABLE_S);
  table.position.y = -0.958 * TABLE_S;
  table.traverse((o) => {
    if (!o.isMesh) return;
    o.receiveShadow = true;
    o.castShadow = false;
    o.material.envMapIntensity = 0.5;
  });
  scene.add(table);
  scene.remove(desk);

  /* One slim hardcover from the set, laid flat so its footprint matches the portfolio book. */
  const src = booksGltf.scene.getObjectByName('book_encyclopedia_set_01_book05');
  const pick_ = src.clone(true);
  pick_.position.set(0, 0, 0);
  const lay = new THREE.Group();
  lay.rotation.z = Math.PI / 2;
  lay.add(pick_);
  const holder = new THREE.Group();
  holder.add(lay);
  holder.scale.set(7.09, 7.0, 6.44);
  holder.rotation.y = Math.PI; // spine (it is printed "Encyclopedia") faces away from the viewer
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder);
  const centre = box.getCenter(new THREE.Vector3());
  holder.position.set(-centre.x, -box.min.y, -centre.z);
  holder.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = o.receiveShadow = true;
    o.userData = { rects: [], w: 1, h: 1 };
    o.material.envMapIntensity = 0.8;
    models.meshes.push(o);
  });
  /* Same gold-foil lettering as the animated cover, laid just above the leather. */
  const foilCanvas = document.createElement('canvas');
  foilCanvas.width = 1024;
  foilCanvas.height = 640;
  coverFoil(foilCanvas.getContext('2d'), 1024, 640);
  const foil = new THREE.Mesh(
    new THREE.PlaneGeometry(COVER_H, COVER_W),
    new THREE.MeshStandardMaterial({ map: tex(foilCanvas), transparent: true, roughness: 0.4, metalness: 0.4, depthWrite: false }),
  );
  foil.rotation.x = -Math.PI / 2;
  foil.position.set(0, box.max.y - box.min.y + 0.002, 0);
  foil.receiveShadow = true;
  const closedGroup = new THREE.Group();
  closedGroup.add(holder, foil);
  scene.add(closedGroup);
  models.closed = closedGroup;
}

function syncBookVisibility() {
  if (!models.closed) return;
  const resting = state.turned === 0 && state.leaves.every((l) => !l.anim && l.value < 0.001);
  models.closed.visible = resting;
  book.visible = !resting;
}

/* ---------- turning ---------- */
function setSpread(n) {
  n = clamp(n, 0, state.total);
  if (n === state.turned) return;
  const forward = n > state.turned;
  const flip = [];
  if (forward) for (let k = state.turned; k < n; k++) flip.push(k);
  else for (let k = state.turned - 1; k >= n; k--) flip.push(k);
  const now = performance.now();
  flip.forEach((k, i) => {
    const leaf = state.leaves[k];
    leaf.anim = { from: leaf.value, to: forward ? 1 : 0, t0: now + i * STAGGER_MS };
    leaf.dir = forward ? 1 : -1;
  });
  state.turned = n;
  syncUi();
}

function stepLeaves(now) {
  let moving = false;
  for (const leaf of state.leaves) {
    const a = leaf.anim;
    if (!a) continue;
    const p = clamp((now - a.t0) / TURN_MS, 0, 1);
    leaf.value = a.from + (a.to - a.from) * ease(p);
    moving = true;
    if (p >= 1) leaf.anim = null;
  }
  if (moving) poseAll();
}

/* ---------- UI ---------- */
function syncUi() {
  const open = state.turned > 0;
  $('hero').classList.toggle('gone', open);
  $('pager').hidden = !open;
  $('prev').disabled = state.turned === 0;
  $('next').disabled = state.turned >= state.total;
  $('count').textContent = open ? `${state.turned} / ${state.total}  ·  ${state.names[state.turned] || 'Contact'}` : '';
  $('sr').textContent = open ? `Spread ${state.turned} of ${state.total}: ${state.names[state.turned] || 'Contact'}` : 'Book closed';
  history.replaceState(null, '', open ? `#${state.turned}` : location.pathname);
}

function buildClassicList() {
  const ul = $('classic-list');
  cases.forEach((s) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = (s.primary && s.primary.href) || '#';
    a.textContent = `${s.name} — ${s.summary}`;
    li.appendChild(a);
    ul.appendChild(li);
  });
}

/* ---------- camera framing ---------- */
const CLOSED = { dir: new THREE.Vector3(0, 0.82, 0.57).normalize(), look: new THREE.Vector3(0, 0, -0.35) };
const OPEN = { dir: new THREE.Vector3(0, 0.96, 0.27).normalize(), look: new THREE.Vector3(0, 0, 0.12) };
const lean = { x: 0, y: 0, tx: 0, ty: 0 };
let camOpen = 0;

function frameCamera(dt) {
  const target = state.turned > 0 ? 1 : 0;
  camOpen += (target - camOpen) * (1 - Math.exp(-dt * (reduceMotion ? 60 : 2.6)));
  const e = smooth(camOpen);
  /* Distance that fits the whole spread (3.3 wide) at this aspect, or the cover when closed. */
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const openDist = Math.max(4.8, 1.2 / (tanH * camera.aspect) + 0.5);
  const closedDist = Math.max(3.7, 1.1 / (tanH * camera.aspect) + 1.3);
  const dist = closedDist + (openDist - closedDist) * e;
  camTarget.lerpVectors(CLOSED.look, OPEN.look, e);
  const dir = new THREE.Vector3().lerpVectors(CLOSED.dir, OPEN.dir, e).normalize();
  lean.x += (lean.tx - lean.x) * (1 - Math.exp(-dt * 3));
  lean.y += (lean.ty - lean.y) * (1 - Math.exp(-dt * 3));
  camera.position.copy(camTarget).addScaledVector(dir, dist);
  camera.position.x += lean.x * 0.35;
  camera.position.z += lean.y * 0.18;
  camera.lookAt(camTarget);

  /* The book is built hinged at x = 0; slide it so the closed cover sits centred. */
  const cover = state.leaves[0];
  book.position.z = -(W / 2) * (1 - (cover ? cover.value : 0));
}

function resize() {
  const w = innerWidth;
  const h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* ---------- picking ---------- */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function pick(ev) {
  const r = $('stage').getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const list = models.closed && models.closed.visible ? models.meshes : state.pickables;
  const hits = ray.intersectObjects(list, false);
  if (!hits.length) return null;
  const hit = hits[0];
  const d = hit.object.userData;
  const px = hit.uv.x * d.w;
  const py = (1 - hit.uv.y) * d.h;
  const rect = d.rects.find((q) => px >= q.x && px <= q.x + q.w && py >= q.y && py <= q.y + q.h);
  return { rect, localX: book.worldToLocal(hit.point.clone()).x };
}

let down = null;
const stage = $('stage');
stage.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY };
});
stage.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  down = null;
  if (moved > 8) return;
  const hit = pick(e);
  if (!hit) return;
  if (state.turned === 0) return setSpread(1);
  if (hit.rect && hit.rect.go != null) return setSpread(hit.rect.go);
  if (hit.rect && hit.rect.href) {
    if (hit.rect.href.startsWith('mailto:')) location.href = hit.rect.href;
    else window.open(hit.rect.href, '_blank', 'noopener');
    return;
  }
  setSpread(state.turned + (hit.localX > 0 ? 1 : -1));
});
let hoverPending = false;
stage.addEventListener('pointermove', (e) => {
  lean.tx = (e.clientX / innerWidth - 0.5) * 2;
  lean.ty = (e.clientY / innerHeight - 0.5) * 2;
  if (hoverPending) return;
  hoverPending = true;
  requestAnimationFrame(() => {
    hoverPending = false;
    stage.style.cursor = pick(e) ? 'pointer' : 'default';
  });
});
if (reduceMotion) {
  lean.tx = lean.ty = 0;
  stage.addEventListener('pointermove', () => {
    lean.tx = lean.ty = 0;
  });
}

addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') setSpread(state.turned + 1);
  else if (e.key === 'ArrowLeft') setSpread(state.turned - 1);
  else if (e.key === 'Escape') setSpread(0);
  else if (e.key === 'Enter' && state.turned === 0 && document.activeElement === document.body) setSpread(1);
});
$('openBtn').addEventListener('click', () => setSpread(1));
$('prev').addEventListener('click', () => setSpread(state.turned - 1));
$('next').addEventListener('click', () => setSpread(state.turned + 1));
$('close').addEventListener('click', () => setSpread(0));
addEventListener('resize', resize);

/* ---------- boot ---------- */
function loadImage(src) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

async function boot() {
  $('tag').textContent = profile.tagline.join(' ');
  if (profile.cvFile) {
    const cv = $('cv');
    cv.href = `../${profile.cvFile}`;
    cv.hidden = false;
  }
  buildClassicList();

  await Promise.all([
    document.fonts.load('800 40px Manrope', 'Oğuzhan İşığ'),
    document.fonts.load('400 20px Manrope', 'ğışöü'),
    document.fonts.load('600 20px Manrope', 'ğışöü'),
    document.fonts.load('700 20px Manrope', 'ğışöü'),
  ]).catch(() => {});

  const images = {};
  await Promise.all(
    cases.map(async (s) => {
      images[s.id] = s.image ? await loadImage(`../${s.image}`) : null;
    }),
  );

  buildBook({ images, base: '../' });
  resize();
  /* The scene works without the models (procedural desk and book), so a failed load is not fatal. */
  await loadModels().catch((err) => console.warn('3D models not loaded, using the built-in scene.', err));
  $('loading').hidden = true;

  const start = parseInt(location.hash.slice(1), 10);
  if (start > 0) {
    state.leaves.forEach((l, k) => {
      if (k < start) {
        l.value = 1;
        
      }
    });
    state.turned = clamp(start, 0, state.total);
    camOpen = 1;
    poseAll();
  }
  syncUi();

  let last = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    stepLeaves(now);
    updateBlocks();
    syncBookVisibility();
    frameCamera(dt);
    renderer.render(scene, camera);
  });
}

boot().catch((err) => {
  console.error(err);
  showFallback();
});
