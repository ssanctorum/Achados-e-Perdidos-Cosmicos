let ITEMS = [];
const $ = s => document.querySelector(s), ls = (k, v) => {
  try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
};
const BODIES = ["terra", "lua", "marte", "espaco"], rad = Math.PI / 180;
const T = {
  pt: {
    back: "Voltar", all: "Tudo", hint: "Toque num planeta para explorar. Arraste para girar. \nZoom com scroll e movimento de pinça.", hreset: "Restaurar vista",
    items: "itens", item: "item", list: "Itens deixados", close: "Fechar", listen: "Ouvir",
    ttl: "Achados e Perdidos Cósmicos",
    acc: "Acessibilidade", hc: "Alto contraste", calm: "Modo calmo (sem movimento nem brilho)",
    about: "Sobre os dados", pos: "Posição aproximada.",
    globe: "Globo estilizado, fora de escala. Posições aproximadas.",
    nsc: "Fora de escala", dist: "Distância", sig: "sinal leva cerca de", last: "Último sinal",
    seen: "Aparência", src: "Fonte", cons: "consultado em",
    note: "Coordenadas aproximadas: fontes e épocas diferentes podem variar em alguns quilômetros.",
    pend: "pendente", scr: "Tela atual", stop: "Parar", reset: "Zerar progresso", traj: "Trajetória",
    nogl: "Seu navegador não conseguiu iniciar os gráficos 3D. Os textos, as listas e o botão Ouvir continuam funcionando.",
    explored: "explorados", visited: "visitado",
    prog: (a, b) => `Você explorou ${a} de ${b} itens`,
    fs: "Tamanho do texto", fs0: "Normal", fs1: "Grande", fs2: "Muito grande",
    sp: "Mais espaço entre letras, palavras e linhas", why: "Por que ficou", rel: "Relacionados",
    err: "Não foi possível carregar os dados. Abra por um servidor (ex.: python3 -m http.server).",
    st: { ativo: "Ativo", silencioso: "Silencioso", "concluído": "Concluído" },
    nm: { terra: "Terra", lua: "Lua", marte: "Marte", espaco: "Rumo às estrelas" },  
    E: "L", W: "O"
  },
  en: {
    back: "Back", all: "All", hint: "Tap a planet to explore. Drag to rotate. \nPinch or mouse scroll to zoom.", hreset: "Reset view",
    items: "items", item: "item", list: "Items left behind", close: "Close", listen: "Listen",
    ttl: "Cosmic Lost & Found",
    acc: "Accessibility", hc: "High contrast", calm: "Calm mode (no motion or glow)",
    about: "About the data", pos: "Approximate position.",
    globe: "Stylized globe, not to scale. Approximate positions.",
    nsc: "Not to scale", dist: "Distance", sig: "signal takes about", last: "Last signal",
    seen: "Appearance", src: "Source", cons: "checked on",
    note: "Approximate coordinates: different sources and epochs can vary by a few kilometers.",
    pend: "pending", scr: "Current screen", stop: "Stop", reset: "Reset progress", traj: "Trajectory",
    nogl: "Your browser could not start the 3D graphics. Texts, lists and the Listen button still work.",
    explored: "explored", visited: "visited",
    prog: (a, b) => `You explored ${a} of ${b} items`,
    fs: "Text size", fs0: "Normal", fs1: "Large", fs2: "Extra large",
    sp: "More space between letters, words and lines", why: "Why it stayed", rel: "Related",
    err: "Could not load the data. Open through a server (e.g. python3 -m http.server).",
    st: { ativo: "Active", silencioso: "Silent", "concluído": "Completed" },
    nm: { terra: "Earth", lua: "Moon", marte: "Mars", espaco: "Toward the stars" },
    E: "E", W: "W"
  }
};

let lang = ls("lang") || ((navigator.language || "pt").startsWith("en") ? "en" : "pt");
const pref = (k, q) => { const v = ls(k); return v == null ? matchMedia(q).matches : v === "1"; };
let hc = pref("hc", "(prefers-contrast: more)");
let calm = pref("calm", "(prefers-reduced-motion: reduce)");
let fsz = Math.min(2, Math.max(0, parseInt(ls("fsz")) || 0));
let sp = ls("sp") === "1";
let seenIds = new Set((() => { try { return JSON.parse(ls("seen") || "[]"); } catch (e) { return []; } })());
let cur = { b: "", id: "" }, last = { b: "", id: "" };
let cam = { lat: 15, lng: 0, k: 1 }, tw = null, pins = [];
const nm = it => (lang === "en" && it.nome_en) || it.nome;
const t = () => T[lang], g = (it, k) => it[k + "_" + lang], nf = n => lang === "pt" ? String(n).replace(".", ",") : String(n);

const ATM = { terra: 0x6cc4ff, lua: 0xfff1c8, marte: 0xff8a5c };
const BUMP = { terra: 1.2, lua: 4, marte: 3 };
const sitesOf = it => it.locais || (it.lat != null ? [[it.lat, it.lng]] : []);
const DV = { terra: [15, -45], lua: [8, 0], marte: [5, -20] };
const TEX_URL = {
  terra: "textures/earth.jpg",
  lua: "textures/moon.jpg",
  marte: "textures/mars.jpg",
  sol: "textures/sun.jpg"
};
let texCache = {}, texLoader = null;
function getTexture(key) {
  if (!texLoader) texLoader = new THREE.TextureLoader();
  if (texCache[key]) return texCache[key];
  const url = TEX_URL[key];
  if (!url) return null;
  try {
    const t = texLoader.load(url, () => { needsRender = true; });
    t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
    t.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    texCache[key] = t;
    return t;
  } catch (e) { return null; }
}

let bodyGlobe = null, hubBodies = {}, hubMoonOrbit = null, animTime = 0;

const COL = {
  terra: { base: 0x2a7de1, land: 0x43b86b },
  lua: { base: 0xcdbf9d, land: 0xa89b7c },
  marte: { base: 0xe0693a, land: 0xa8431f, ice: 0xfff5ea }
};

/* Approximate ephemerides (JPL Keplerian elements, valid 1800–2050) */
const EL = {
  terra: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0],
  marte: [1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343]
};
const PER = { terra: 365.256, marte: 686.98 };
const norm = d => ((d % 360) + 360) % 360;
function helio(k, jd) {
  const e = EL[k], T = (jd - 2451545) / 36525;
  const a = e[0] + e[1] * T, ecc = e[2] + e[3] * T, i = (e[4] + e[5] * T) * rad;
  const L = norm(e[6] + e[7] * T), w = norm(e[8] + e[9] * T), O = norm(e[10] + e[11] * T) * rad;
  const M = (L - w) * rad, ww = w * rad;
  let E = M;
  for (let j = 0; j < 8; j++) E -= (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E));
  const x = a * (Math.cos(E) - ecc), y = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
  const cO = Math.cos(O), sO = Math.sin(O), ci = Math.cos(i), si = Math.sin(i), cw = Math.cos(ww), sw = Math.sin(ww);
  return [
    (cO * cw - sO * sw * ci) * x + (-cO * sw - sO * cw * ci) * y,
    (sO * cw + cO * sw * ci) * x + (-sO * sw + cO * cw * ci) * y
  ];
}
function elong(jd) {
  const T = (jd - 2451545) / 36525;
  return 218.316 + 481267.881 * T - (125.045 - 1934.136 * T);
}
const skyJD = () => {
  const q = new URLSearchParams(location.search).get("d"), t0 = q ? Date.parse(q + "T12:00:00Z") : NaN;
  return (isNaN(t0) ? Date.now() : t0) / 864e5 + 2440587.5;
};
const skyDate = () => new Date((skyJD() - 2440587.5) * 864e5).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "numeric", month: "long", year: "numeric" });
const distEM = () => {
  const j = skyJD(), a = helio("terra", j), b = helio("marte", j);
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
};

/* ---------- Three.js setup ---------- */
const cv = $("#cv");
let renderer, scene, camera, animId = null, currentMode = null;
let hubGroup = null, bodyGroup = null, deepGroup = null;
let markers = [], raycaster = null, mouse = null;
let targetCam = null, animStart = 0, animFrom = null;

let drag = {
  active: false,
  moved: false,
  x0: 0,
  y0: 0,
  lat0: 0,
  lng0: 0,
  deepAngle0: 0,
  deepAngle: 0.6,
  deepElev: 0.55,
  hubYaw: 0,
  hubTilt: 0,
  yaw0: 0,
  tilt0: 0,
  pointers: new Map(), // pointerId -> {x,y}
  pinchDist0: 0,
  pinchZoom0: 1
};
let hubZoom = 1;      // 1 = default top-down distance
let hubBaseY = 20;    // set on buildHub
let deepRadius = 18;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

const HUB_TILT_MAX = 1.2; // ~69° from vertical
const hubDirty = () => {
  const y = ((drag.hubYaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  return Math.abs(y) > 1e-3 || drag.hubTilt > 1e-3 || Math.abs(hubZoom - 1) > 1e-3;
};
function resetHubView() {
  drag.hubYaw = 0;
  drag.hubTilt = 0;
  hubZoom = 1;
  applyHubCam();
}

function moonAt(a) {
  const e = hubBodies.terra.position;
  hubBodies.lua.position.set(e.x + Math.cos(a) * hubMoonOrbit.dist, 0, e.z + Math.sin(a) * hubMoonOrbit.dist);
  hubGroup.children.forEach(ch => {
    const f = ch.userData && ch.userData.follow;
    if (f && hubBodies[f]) ch.position.copy(hubBodies[f].position);
  });
}

function parkMoon() {
  const w = cv.clientWidth, h = cv.clientHeight;
  camera.updateMatrixWorld(true);
  moonAt(-Math.PI / 2);
  const t0 = hubBodies.lua.position.clone().project(camera);
  if ((-t0.y * 0.5 + 0.5) * h > 24) return;
  let best = 0, bestScore = -1e9;
  for (let d = 0; d < 360; d += 10) {
    const a = d * rad;
    moonAt(a);
    const v = hubBodies.lua.position.clone().project(camera);
    const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
    const sc = Math.min(y - 150, h - 200 - y, x - 60, w - 60 - x);
    if (sc > bestScore) { bestScore = sc; best = a; }
  }
  moonAt(best);
}

function applyHubCam() {
  if (currentMode !== "hub" || !camera) return;
  const r = hubBaseY / hubZoom, yw = drag.hubYaw, tl = clamp(drag.hubTilt, 0, HUB_TILT_MAX);
  // tl = 0: straight top-down view. yw orbits around the Sun; tl tilts toward the horizon.
  camera.position.set(
    Math.sin(yw) * Math.sin(tl) * r + Math.sin(yw) * 0.01,
    Math.cos(tl) * r,
    Math.cos(yw) * Math.sin(tl) * r + Math.cos(yw) * 0.01
  );
  camera.up.set(-Math.sin(yw), 0, -Math.cos(yw));
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const hr = $("#hr");
  if (hr) hr.hidden = !hubDirty();
  if (calm && !hubDirty() && hubMoonOrbit && hubBodies.lua && hubBodies.terra) parkMoon();
  // re-place HTML buttons if planets exist
  if (hubBodies.terra && hubBodies.marte && hubBodies.lua) {
    const ed = (hubBodies.terra.userData.radius || 0.5) * 2;
    const md = (hubBodies.marte.userData.radius || 0.3) * 2;
    const od = (hubBodies.lua.userData.radius || 0.15) * 2;
    placeHubButtons(
      { terra: hubBodies.terra.position, lua: hubBodies.lua.position, marte: hubBodies.marte.position, espaco: hubBodies.espaco ? hubBodies.espaco.position : null },
      { terra: ed, lua: od, marte: md, espaco: 5.2 }
    );
  }
  needsRender = true;
}

function applyBodyCam() {
  if (currentMode !== "body" || !camera) return;
  cam.k = clamp(cam.k || 1, 0.7, 4.5);
  const dist = 2.6 / cam.k;
  const camPos = latLngToVec(cam.lat, cam.lng, dist);
  camera.position.copy(camPos);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 1, 0);
  updatePinsFromMarkers();
  needsRender = true;
}

function applyDeepCam() {
  if (currentMode !== "deep" || !camera) return;
  deepRadius = clamp(deepRadius, 6, 40);
  const r = deepRadius;
  const a = drag.deepAngle;
  const e = drag.deepElev;
  camera.position.set(
    Math.sin(a) * Math.cos(e) * r,
    Math.sin(e) * r,
    Math.cos(a) * Math.cos(e) * r
  );
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 1, 0);
  updatePinsFromMarkers();
  needsRender = true;
}

function applyZoom(factor) {
  // factor > 1 = zoom in
  if (currentMode === "hub") {
    hubZoom = clamp(hubZoom * factor, 0.55, 3.2);
    applyHubCam();
  } else if (currentMode === "body") {
    cam.k = clamp((cam.k || 1) * factor, 0.7, 4.5);
    applyBodyCam();
  } else if (currentMode === "deep") {
    deepRadius = clamp(deepRadius / factor, 6, 40);
    applyDeepCam();
  }
}

function initThree() {
  if (typeof THREE === "undefined") {
    console.error("Three.js failed to load — confira js/vendor/three.min.js");
    const err = $("#err");
    if (err) {
      err.hidden = false;
      err.textContent = "Não foi possível carregar o Three.js (js/vendor/three.min.js).";
    }
    return false;
  }
  mouse = new THREE.Vector2();
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !calm, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    console.error("WebGL indisponível:", e);
    renderer = null;
    return false;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
  raycaster = new THREE.Raycaster();
  raycaster.params.Points = { threshold: 0.15 };
  onResize();
  return true;
}

function onResize() {
  if (!renderer) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  if (w < 2 || h < 2) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  needsRender = true;
}

let needsRender = true;
function requestDraw() { needsRender = true; }

function disposeGroup(g) {
  if (!g) return;
  g.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.dispose && m.dispose());
      else if (o.material.dispose) o.material.dispose();
    }
  });
  scene.remove(g);
}

function clearScene() {
  disposeGroup(hubGroup); hubGroup = null;
  disposeGroup(bodyGroup); bodyGroup = null;
  disposeGroup(deepGroup); deepGroup = null;
  markers = [];
  bodyGlobe = null;
  hubBodies = {};
  hubMoonOrbit = null;
  while (scene.children.length) scene.remove(scene.children[0]);
}

/* ---------- Stars (shared) ---------- */
let glowTex = null;
function glow(color, size, opacity) {
  if (!glowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(c);
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  sp.scale.setScalar(size);
  return sp;
}

function makeStars(count = 1200) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 80 + Math.random() * 400;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: hc ? 0xffffff : 0xcfeaff,
    size: hc ? 1.6 : 1.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: calm ? 0.45 : 0.75,
    depthWrite: false
  });
  return new THREE.Points(geo, mat);
}

/* ---------- Hub scene ---------- */
function buildHub() {
  clearScene();
  currentMode = "hub";
  hubGroup = new THREE.Group();
  scene.add(hubGroup);

  const light = new THREE.AmbientLight(0xffffff, hc ? 1.2 : 0.55);
  scene.add(light);
  if (!hc) {
    const sunL = new THREE.PointLight(0xffd166, calm ? 1.2 : 2.2, 80);
    sunL.position.set(0, 0, 0);
    scene.add(sunL);
  }

  hubGroup.add(makeStars(900));

  const jd = skyJD();
  const U = 12; // scene units per AU
  const Ee = helio("terra", jd), Mm = helio("marte", jd);
  const ep = new THREE.Vector3(Ee[0] * U, 0, -Ee[1] * U);
  const mp = new THREE.Vector3(Mm[0] * U, 0, -Mm[1] * U);
  const ml = Math.atan2(-Ee[1], -Ee[0]) + elong(jd) * rad;
  const mdist = 5.4; // far enough apart that the enlarged Moon doesn't touch Earth
  const op = new THREE.Vector3(
    ep.x + Math.cos(ml) * mdist,
    0,
    ep.z - Math.sin(ml) * mdist
  );

  function orbitLine(key, color) {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const p = helio(key, jd + PER[key] * i / 128);
      pts.push(new THREE.Vector3(p[0] * U, 0, -p[1] * U));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: hc ? 0xffffff : color, transparent: true, opacity: hc ? 1 : 0.35 });
    return new THREE.Line(geo, mat);
  }
  hubGroup.add(orbitLine("terra", 0xffffff));
  hubGroup.add(orbitLine("marte", 0xffffff));

  {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(ep.x + Math.cos(a) * mdist, 0, ep.z + Math.sin(a) * mdist));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    hubGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: hc ? 0xffffff : 0xffffff30, transparent: true, opacity: 0.4 })));
  }

  {
    const geo = new THREE.BufferGeometry().setFromPoints([ep, mp]);
    const mat = new THREE.LineDashedMaterial({ color: hc ? 0xffffff : 0x5ce1e6, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.55 });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    hubGroup.add(line);
  }

  const sunGeo = new THREE.SphereGeometry(hc ? 1.4 : 2.4, 32, 24);
  const sunMap = getTexture("sol");
  const sunMat = hc
    ? new THREE.MeshBasicMaterial(sunMap ? { map: sunMap } : { color: 0xffb000 })
    : sunMap
      ? new THREE.MeshBasicMaterial({ map: sunMap })
      : new THREE.MeshBasicMaterial({ color: 0xffd166 });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.userData = { body: "sol" };
  hubGroup.add(sun);
  hubBodies.sol = sun;
  if (!hc && !calm) {
    hubGroup.add(glow(0xff9a3c, 16, 0.6));
  }

  hubBodies = {};
  function planet(pos, r, color, atm, name) {
    const geo = new THREE.SphereGeometry(r, 32, 24);
    const map = getTexture(name);
    let mat;
    if (hc) {
      mat = new THREE.MeshBasicMaterial(map ? { map } : { color });
    } else if (map) {
      mat = new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: BUMP[name] || 0.5, roughness: 0.85, metalness: 0.05 });
    } else {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.05, emissive: color, emissiveIntensity: 0.12 });
    }
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    m.userData = { body: name, basePos: pos.clone(), radius: r };
    hubGroup.add(m);
    hubBodies[name] = m;
    if (!hc && atm) {
      const at = glow(atm, r * 3.2, 0.55);
      at.position.copy(pos);
      at.userData = { follow: name };
      hubGroup.add(at);
    }
    return m;
  }
  const ed = 3.6, md = 1.94, od = 1.0;
  planet(ep, ed / 2, COL.terra.base, ATM.terra, "terra");
  planet(mp, md / 2, COL.marte.base, ATM.marte, "marte");
  planet(op, od / 2, COL.lua.base, ATM.lua, "lua");
  // store moon orbital params for translation animation
  hubMoonOrbit = { earth: "terra", dist: mdist, angle0: Math.atan2(op.z - ep.z, op.x - ep.x) };

  // Deep-space portal
  const free = [
    new THREE.Vector3(Math.max(ep.x, mp.x) + 13, 0, -8),
    new THREE.Vector3(Math.max(ep.x, mp.x) + 13, 0, 8)
  ];
  const pp = free.sort((a, b) => Math.min(a.distanceTo(mp), a.distanceTo(ep)) - Math.min(b.distanceTo(mp), b.distanceTo(ep)))[0];
  {
    const N = 320, P = new Float32Array(N * 3), C = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = Math.pow(Math.random(), 0.7), th = t * 4.6 + (i % 2) * Math.PI + (Math.random() - 0.5) * 0.5;
      const r = 0.12 + t * 1.5;
      P.set([Math.cos(th) * r, (Math.random() - 0.5) * 0.12, Math.sin(th) * r], i * 3);
      const c = new THREE.Color(hc ? 0xffffff : (i % 5 === 0 ? 0xffd9a0 : 0x8ff3f6));
      C.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(P, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(C, 3));
    const core = new THREE.Group();
    core.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })));
    core.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: hc ? 0xffffff : 0xfff1c8 })));
    if (!hc) core.add(glow(0x5ce1e6, 3.4, 0.7));
    core.position.copy(pp);
    core.scale.setScalar(2.3);
    core.userData = { body: "espaco", radius: 1.1 };
    hubGroup.add(core);
    hubBodies.espaco = core;
  }

  // Camera top-down (hubZoom scales distance)
  const span = Math.max(18, Math.hypot(ep.x, ep.z) + 6, Math.hypot(mp.x, mp.z) + 6);
  hubBaseY = span * 1.15;
  camera.fov = 42;
  camera.updateProjectionMatrix();
  // Framing: pull the camera back only as far as needed so Earth, Moon, Mars and the vortex fit
  // in the free area (below the title, above the controls), leaving room for labels.
  {
    const m = cv.clientWidth < 700, pad = m ? 0.05 : 0.04, top = m ? 0.16 : 0.15, bot = m ? 0.7 : 0.84;
    const pts = [[ep, ed / 2 + mdist * 0.45], [mp, md / 2], [pp, 3.6]];
    for (let i = 0; i < 60; i++) {
      camera.position.set(0, hubBaseY, 0.01);
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);
      const k = (hubBaseY * Math.tan(camera.fov * rad / 2));
      const ok = pts.every(([p, r]) => {
        const v = p.clone().project(camera), x = v.x * 0.5 + 0.5, y = -v.y * 0.5 + 0.5, rx = r / k / camera.aspect / 2, ry = r / k / 2;
        return x - rx > pad && x + rx < 1 - pad && y - ry > top && y + ry < bot;
      });
      if (ok) break;
      hubBaseY *= 1.05;
    }
  }
  applyHubCam();

  // Store screen positions for HTML buttons
  placeHubButtons({ terra: ep, lua: op, marte: mp, espaco: pp }, { terra: ed, lua: od, marte: md, espaco: 5.2 });
  needsRender = true;
}

function placeHubButtons(positions, sizes) {
  const w = cv.clientWidth, h = cv.clientHeight;
  const place = (k, pos, d) => {
    const b = $(`#hubb [data-b="${k}"]`);
    if (!b || !pos) return;
    const v = pos.clone().project(camera);
    const x = (v.x * 0.5 + 0.5) * w;
    const y = (-v.y * 0.5 + 0.5) * h;
    const z = Math.max(44, (d / (camera.position.length() || 20)) * h * 0.55 + 18);
    b.style.left = x + "px";
    b.style.top = y + "px";
    b.style.width = b.style.height = z + "px";
  };
  place("terra", positions.terra, sizes.terra);
  place("lua", positions.lua, sizes.lua);
  place("marte", positions.marte, sizes.marte);
  place("espaco", positions.espaco, sizes.espaco);

  followMoonButton(true);
}

function layoutLabels() {
  const w = cv.clientWidth, h = cv.clientHeight, top = h * 0.14, bot = h * 0.9;
  const btn = k => $(`#hubb [data-b="${k}"]`), H = [...document.querySelectorAll("#hubb .pl")];
  if (!H.length || !w) return;
  const inter = (a, b, g) => Math.max(0, Math.min(a.right + g, b.right) - Math.max(a.left - g, b.left)) * Math.max(0, Math.min(a.bottom + g, b.bottom) - Math.max(a.top - g, b.top));
  const sides = ["b", "t", "r", "l", "br", "bl", "tr", "tl"], done = [];
  ["terra", "marte", "espaco", "lua"].forEach(k => {
    const b = btn(k), l = b && b.firstElementChild;
    if (!l) return;
    const rings = H.filter(o => o !== b).map(o => o.getBoundingClientRect());
    const find = () => {
      let best = null;
      for (const sd of sides) {
        b.dataset.side = sd;
        l.style.setProperty("--sx", "0px");
        let r = l.getBoundingClientRect();
        const sx = sd === "t" || sd === "b" ? (r.left < 8 ? 8 - r.left : r.right > w - 8 ? w - 8 - r.right : 0) : 0;
        l.style.setProperty("--sx", sx + "px");
        r = l.getBoundingClientRect();
        const pen = done.reduce((t, d) => t + inter(r, d, 3), 0) + rings.reduce((t, o) => t + inter(r, o, 2), 0) + 40 * (Math.max(0, top - r.top) + Math.max(0, r.bottom - bot) + Math.max(0, 6 - r.left) + Math.max(0, r.right - (w - 6)));
        if (!best || pen < best[0]) best = [pen, sd, sx];
        if (!pen) break;
      }
      return best;
    };
    l.classList.remove("mini");
    let best = find();
    if (best[0]) {
      l.classList.add("mini");
      const b2 = find();
      if (b2[0] < best[0]) best = b2; else l.classList.remove("mini");
    }
    b.dataset.side = best[1];
    l.style.setProperty("--sx", best[2] + "px");
    done.push(l.getBoundingClientRect());
  });
}

// Keeps the Moon's HTML button (ring) on top of the orbiting Moon
let lastLabelLayout = 0;
function followMoonButton(force) {
  const b = $('#hubb [data-b="lua"]'), m = hubBodies.lua;
  if (!b || !m || !camera) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const v = m.position.clone().project(camera);
  b.style.left = ((v.x * 0.5 + 0.5) * w) + "px";
  b.style.top = ((-v.y * 0.5 + 0.5) * h) + "px";
  const now = performance.now();
  if (force || now - lastLabelLayout > 300) { lastLabelLayout = now; layoutLabels(); }
}

// Longitude offset of the globe's current spin (so the camera centers on the pin)
const globeOff = () => (currentMode === "body" && bodyGlobe ? bodyGlobe.rotation.y / rad : 0);

// Highlights the selected pin (size, color and ring) without rebuilding the scene
function recolorMarkers(id) {
  markers.forEach(m => {
    const on = m.userData.id === id;
    m.scale.setScalar(on ? 1.25 : 1);
    if (m.userData.ring) m.userData.ring.visible = on;
  });
  needsRender = true;
}

/* ---------- Body (globe) scene ---------- */
function latLngToVec(lat, lng, R = 1) {
  const phi = (90 - lat) * rad;
  const theta = (lng + 180) * rad;
  return new THREE.Vector3(
    -R * Math.sin(phi) * Math.cos(theta),
    R * Math.cos(phi),
    R * Math.sin(phi) * Math.sin(theta)
  );
}

function buildBody(body) {
  clearScene();
  currentMode = "body";
  bodyGroup = new THREE.Group();
  scene.add(bodyGroup);

  const amb = new THREE.AmbientLight(0xffffff, hc ? 1.1 : 0.45);
  scene.add(amb);
  if (!hc) {
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(5, 3, 4);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(ATM[body] || 0x6688ff, 0.35);
    fill.position.set(-3, -1, -2);
    scene.add(fill);
  }

  bodyGroup.add(makeStars(700));

  const R = 1;
  const col = COL[body] || COL.terra;
  const geo = new THREE.SphereGeometry(R, 64, 48);
  const map = getTexture(body);
  let mat;
  if (hc) {
    mat = new THREE.MeshBasicMaterial(map ? { map } : { color: col.base });
  } else if (map) {
    mat = new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: BUMP[body] || 0.5, roughness: 0.9, metalness: 0.02 });
  } else {
    mat = new THREE.MeshStandardMaterial({
      color: col.base,
      roughness: 0.7,
      metalness: 0.05,
      emissive: col.base,
      emissiveIntensity: 0.08
    });
  }
  const globe = new THREE.Mesh(geo, mat);
  bodyGroup.add(globe);
  bodyGlobe = globe;

  // Blobs only as fallback when texture missing
  if (!map) {
    if (body === "terra") {
      addBlobs(globe, [
        [48, -100, 0.28], [-14, -60, 0.2], [6, 20, 0.24], [52, 75, 0.34], [-25, 134, 0.12]
      ], col.land, R);
    } else if (body === "lua") {
      const craters = [];
      let s = 7;
      const rnd = () => (s = s * 16807 % 2147483647) / 2147483647;
      for (let i = 0; i < 22; i++) craters.push([rnd() * 140 - 70, rnd() * 360 - 180, 0.04 + rnd() * 0.07]);
      addBlobs(globe, craters, col.land, R);
    } else if (body === "marte") {
      addBlobs(globe, [[10, 60, 0.22], [-20, -100, 0.18], [20, -30, 0.12]], col.land, R);
      addBlobs(globe, [[90, 0, 0.14], [-90, 0, 0.12]], col.ice, R);
    }
  }

  if (!hc) {
    bodyGroup.add(glow(ATM[body], R * 3.1, calm ? 0.4 : 0.6));
  }

  markers = [];
  const its = ITEMS.filter(i => i.corpo === body).flatMap(i => sitesOf(i).map(([la, lo]) => ({ id: i.id, lat: la, lng: lo })));
  its.forEach(it => {
    const p = latLngToVec(it.lat, it.lng, R * 1.005);
    const m = new THREE.Group();
    const model = ItemModels.build(it.id, hc);
    model.scale.setScalar(0.15);
    m.add(model);
    m.position.copy(p);
    // Stands upright on the surface: the model's +Y axis points away from the globe
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().normalize());
    m.userData = { id: it.id, model };
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.006, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xff9a3c })
    );
    ring.rotation.x = Math.PI / 2;
    m.add(ring);
    m.userData.ring = ring;
    globe.add(m); // Child of the globe: spins with the planet
    markers.push(m);
  });
  recolorMarkers(cur.id);

  const [la, lo] = [cam.lat, cam.lng];
  const dist = 2.6 / (cam.k || 1);
  const camPos = latLngToVec(la, lo, dist);
  camera.position.copy(camPos);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 1, 0);
  camera.fov = 42;
  camera.updateProjectionMatrix();

  updatePinsFromMarkers();
  needsRender = true;
}

function addBlobs(parent, list, color, R) {
  list.forEach(([la, lo, r]) => {
    const p = latLngToVec(la, lo, R * 1.001);
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(r * R, 12, 10),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 })
    );
    m.position.copy(p);
    parent.add(m);
  });
}

function updatePinsFromMarkers() {
  pins = [];
  const w = cv.clientWidth, h = cv.clientHeight;
  camera.updateMatrixWorld();
  const wp = new THREE.Vector3();
  markers.forEach(m => {
    m.getWorldPosition(wp);
    if (currentMode === "body" && wp.dot(camera.position) < wp.lengthSq()) return; // far side of the globe
    const v = wp.clone().project(camera);
    if (v.z > 1) return; // outside the view
    const x = (v.x * 0.5 + 0.5) * w;
    const y = (-v.y * 0.5 + 0.5) * h;
    pins.push([x, y, m.userData.id]);
  });
}

/* ---------- Deep space ---------- */
function buildDeep() {
  clearScene();
  currentMode = "deep";
  deepGroup = new THREE.Group();
  scene.add(deepGroup);

  scene.add(new THREE.AmbientLight(0xffffff, hc ? 1 : 0.5));
  deepGroup.add(makeStars(1400));

  const sunMap = getTexture("sol");
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 24, 18),
    sunMap ? new THREE.MeshBasicMaterial({ map: sunMap }) : new THREE.MeshBasicMaterial({ color: hc ? 0xffb000 : 0xffd166 })
  );
  deepGroup.add(sun);
  if (!hc) {
    const dl = new THREE.DirectionalLight(0xffffff, 1.4);
    dl.position.set(4, 8, 6);
    scene.add(dl);
    if (!calm) deepGroup.add(glow(0xff9a3c, 2.6, 0.6));
  }

  [2.2, 3.6, 5.2, 7].forEach(r => {
    const geo = new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 65 }, (_, i) => {
        const a = (i / 64) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
      })
    );
    deepGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: hc ? 0xffffff : 0x3fd0ff,
      transparent: true,
      opacity: hc ? 0.7 : 0.25
    })));
  });

  const its = ITEMS.filter(i => i.corpo === "espaco");
  markers = [];
  const eps = 23.44 * rad;
  its.forEach(it => {
    // Approximate real direction (RA/Dec) converted to ecliptic coordinates
    const ra = (it.ra_h || 0) * 15 * rad, de = (it.dec_deg || 0) * rad;
    const xe = Math.cos(de) * Math.cos(ra), ye = Math.cos(de) * Math.sin(ra), ze = Math.sin(de);
    const xc = xe, yc = ye * Math.cos(eps) + ze * Math.sin(eps), zc = -ye * Math.sin(eps) + ze * Math.cos(eps);
    const r = Math.sqrt(Math.max(0.5, it.distancia_ua) / 180) * 9;
    const pos = new THREE.Vector3(xc * r, zc * r, -yc * r);
    const on = it.id === cur.id;

    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), pos]);
    deepGroup.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
      color: on ? 0xff9a3c : (hc ? 0xffffff : 0x3fd0ff),
      transparent: true,
      opacity: on ? 1 : 0.55
    })));

    const m = new THREE.Group();
    const model = ItemModels.build(it.id, hc);
    model.scale.setScalar(on ? 1.7 : 1.2);
    model.position.y = -0.4;
    m.add(model);
    if (on) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.025, 8, 32), new THREE.MeshBasicMaterial({ color: 0xff9a3c }));
      ring.rotation.x = Math.PI / 2;
      m.add(ring);
    }
    m.position.copy(pos);
    m.userData = { id: it.id };
    deepGroup.add(m);
    markers.push(m);
  });

  camera.fov = 42;
  camera.updateProjectionMatrix();
  applyDeepCam();
}

/* ---------- Camera fly (body) ---------- */
function fly(la, lo, k) {
  cancelAnimationFrame(tw);
  if (calm) {
    cam = { lat: la, lng: lo, k };
    if (currentMode === "body") buildBody(cur.b);
    return;
  }
  animFrom = { ...cam };
  targetCam = { lat: la, lng: lo, k };
  animStart = performance.now();
  const dl = ((lo - animFrom.lng + 540) % 360) - 180;

  (function step(now) {
    const u = Math.min(1, (now - animStart) / 900);
    const e = u * u * (3 - 2 * u);
    cam = {
      lat: animFrom.lat + (la - animFrom.lat) * e,
      lng: animFrom.lng + dl * e,
      k: animFrom.k + (k - animFrom.k) * e
    };
    if (currentMode === "body" && bodyGroup) applyBodyCam();
    if (u < 1) tw = requestAnimationFrame(step);
    else targetCam = null;
  })(animStart);
}

/* ---------- Main render loop ---------- */
function tickAnimation(dt) {
  if (calm) return false;
  let moved = false;
  if (currentMode === "body" && bodyGlobe && !cur.id) {
    bodyGlobe.rotation.y += 0.08 * dt;
    bodyGlobe.updateMatrixWorld(true);
    updatePinsFromMarkers();
    moved = true;
  }
  if (currentMode === "deep" && markers.length) {
    markers.forEach(m => { m.rotation.y += 0.5 * dt; });
    moved = true;
  }
  if (currentMode === "hub" && hubBodies.terra) {
    const spin = { terra: 0.25, lua: 0.05, marte: 0.2, sol: 0.04, espaco: 0.18 };
    Object.keys(hubBodies).forEach(k => {
      const m = hubBodies[k];
      if (!m) return;
      m.rotation.y += (spin[k] || 0.1) * dt;
    });
    if (hubMoonOrbit && hubBodies.lua && hubBodies.terra) {
      animTime += dt;
      const a = hubMoonOrbit.angle0 + animTime * 0.15;
      const e = hubBodies.terra.position;
      hubBodies.lua.position.set(
        e.x + Math.cos(a) * hubMoonOrbit.dist,
        0,
        e.z + Math.sin(a) * hubMoonOrbit.dist
      );
      // shells that follow the Moon
      hubGroup && hubGroup.children.forEach(ch => {
        if (ch.userData && ch.userData.follow === "lua") ch.position.copy(hubBodies.lua.position);
        if (ch.userData && ch.userData.follow === "terra") ch.position.copy(hubBodies.terra.position);
        if (ch.userData && ch.userData.follow === "marte" && hubBodies.marte) ch.position.copy(hubBodies.marte.position);
      });
      followMoonButton();
    }
    moved = true;
  }
  return moved;
}

let lastTs = 0, lastDraw = 0;
function loop(ts) {
  animId = requestAnimationFrame(loop);
  const t = ts || performance.now();
  const dt = lastTs ? Math.min(0.05, (t - lastTs) / 1000) : 0.016;
  lastTs = t;
  const animating = tickAnimation(dt);
  if (!needsRender && !targetCam && !animating) return;
  if (!needsRender && !targetCam && t - lastDraw < 33) return;
  lastDraw = t;
  needsRender = false;
  if (renderer && scene && camera) renderer.render(scene, camera);
}

/* ---------- App logic ---------- */
const fmtC = (la, lo) => `${nf(Math.abs(la).toFixed(1))}° ${la >= 0 ? "N" : "S"}, ${nf(Math.abs(lo).toFixed(1))}° ${lo >= 0 ? t().E : t().W}`;

function cardHtml(it) {
  const d = it.corpo === "espaco";
  const hs = g(it, "historia")
    .replace(/(O que é:|O que descobriu:|Onde está hoje:|What it is:|What it found:|Where it is today:)/g, "<br><b>$1</b>")
    .replace(/^<br>/, "");
  const img = `<div class="card-bg" aria-hidden="true" data-img="${it.imagem || ""}" data-id="${it.id}"></div>`;
  let x = `<button id="cl" class="card-x" aria-label="${t().close}">✕</button><button id="ls" class="card-x card-ls" aria-label="${t().listen}">🔊</button><div class="card-scroll">${img}<div class="card-body"><h2 id="ct">${nm(it)}</h2><small>${t().st[it.status] || it.status} · ${it.ano}</small><p>${hs}</p><p><b>${t().seen}:</b> ${g(it, "descricao_visual")}</p><p><b>${t().last}:</b> ${g(it, "ultimo_sinal")}</p>`;
  if (g(it, "por_que_ficou")) x += `<p><b>${t().why}:</b> ${g(it, "por_que_ficou")}</p>`;
  if (it.lat != null) x += `<p>${fmtC(it.lat, it.lng)}<small>${t().pos}</small></p>`;
  if (d && it.trajetoria) x += `<p><b>${t().traj}:</b> <span lang="${lang === "en" && it.trajetoria_en ? "en" : "pt-BR"}">${lang === "en" && it.trajetoria_en ? it.trajetoria_en : it.trajetoria}</span></p>`;
  if (d) x += `<p><b>${t().dist}:</b> ${nf(it.distancia_ua.toFixed(1))} UA (${it.data_distancia}) · ${t().sig} ${nf(Math.round(it.distancia_ua * 8.317 / 60))} h</p>`;
  const rl = (it.relacionados || []).map(r => ITEMS.find(i => i.id === r)).filter(Boolean);
  if (rl.length) x += `<p><b>${t().rel}:</b></p><div class="row">${rl.map(r => `<button data-go="${r.corpo}/${r.id}">${nm(r)}</button>`).join("")}</div>`;
  return x + `<div class="row"></div></div></div>`;
}

const up = () => { location.hash = cur.id ? "#" + cur.b : ""; };

// NASA photo as background; falls back to the item's 3D model if it fails to load or doesn't exist
function setCardBg(el) {
  if (!el) return;
  const fallback = () => {
    const u = ItemModels.thumb(el.dataset.id, hc);
    if (u) { el.style.backgroundImage = `url(${u})`; el.classList.add("is-model"); }
  };
  const url = el.dataset.img;
  if (!url) return fallback();
  const im = new Image();
  im.referrerPolicy = "no-referrer";
  im.onload = () => { el.style.backgroundImage = `url(${url})`; };
  im.onerror = fallback;
  im.src = url;
}

function draw() {
  // Route to the correct Three.js scene
  if (!cur.b) {
    buildHub();
    cv.style.cursor = "grab";
  } else if (cur.b === "espaco") {
    buildDeep();
    cv.style.cursor = "grab";
  } else {
    buildBody(cur.b);
    cv.style.cursor = "grab";
  }
}

function render(quiet) {
  const [b, id] = location.hash.slice(1).split("/");
  const it = ITEMS.find(i => i.id === id && i.corpo === b);
  const nb = BODIES.includes(b) ? b : "", ni = it ? id : "";
  const prev = { ...cur };
  cur = { b: nb, id: ni };

  if (ni !== prev.id && "speechSynthesis" in window) speechSynthesis.cancel();
  if (ni && !seenIds.has(ni)) {
    seenIds.add(ni);
    ls("seen", JSON.stringify([...seenIds]));
  }

  const tt = t(), A = $("#app");
  if (nb !== prev.b || ni !== prev.id) {
    A.classList.remove("scan");
    void A.offsetWidth;
    A.classList.add("scan");
  }

  document.querySelectorAll("[data-t]").forEach(e => {
    const k = e.dataset.t;
    if (typeof tt[k] === "string") e.textContent = tt[k];
  });
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  $("#lp").setAttribute("aria-pressed", lang === "pt");
  $("#le").setAttribute("aria-pressed", lang === "en");
  $("#hint").textContent = tt.hint;
  $("#h1").textContent = document.title = tt.ttl;

  $("#hubb").innerHTML = BODIES.map(k => {
    const n = ITEMS.filter(i => i.corpo === k).length;
    const dn = ITEMS.filter(i => i.corpo === k && seenIds.has(i.id)).length;
    return `<button class="pl" data-b="${k}"><span class="lbl"><b>${tt.nm[k]}</b><small>${n} ${n === 1 ? tt.item : tt.items} · ${dn}/${n} ${tt.explored}${n && dn === n ? " ✓" : ""}</small></span></button>`;
  }).join("");
  $("#tl").hidden = !nb;
  $("#seal").hidden = !nb;
  $("#prog").textContent = tt.prog(ITEMS.filter(i => seenIds.has(i.id)).length, ITEMS.length);
  $("#hub").hidden = !!nb;
  $("#list").hidden = !nb;
  A.classList.toggle("item", !!ni);
  $("#back").disabled = !nb;

  const gl = nb && nb !== "espaco", sealT = !nb ? "" : gl ? tt.globe : tt.nsc;
  $("#seal").textContent = sealT;
  $("#seal").lang = lang;
  $("#bc").innerHTML = `<li>${tt.all}</li>` + (nb ? `<li>${tt.nm[nb]}</li>` : "") + (it ? `<li>${nm(it)}</li>` : "");

  if (nb) {
    $("#lh").textContent = `${tt.list}: ${tt.nm[nb]}`;
    $("#ul").innerHTML = ITEMS.filter(i => i.corpo === nb).map(i =>
      `<li><button data-id="${i.id}"${i.id === ni ? ' aria-current="true"' : ""}>${nm(i)}<small>${tt.st[i.status] || i.status} · ${i.ano}${seenIds.has(i.id) ? " · ✓ " + tt.visited : ""}</small></button></li>`
    ).join("");
  }

  const K = $("#card");
  K.hidden = !it;
  if (it) {
    K.lang = lang;
    K.innerHTML = cardHtml(it);
    setCardBg(K.querySelector(".card-bg"));
    $("#cl").onclick = up;
    const L = $("#ls");
    if (!("speechSynthesis" in window)) L.hidden = true;
    L.onclick = () => {
      const S = speechSynthesis;
      if (S.speaking) { S.cancel(); return; }
      const u = new SpeechSynthesisUtterance([nm(it), g(it, "historia"), g(it, "descricao_visual"), t().last + ": " + g(it, "ultimo_sinal")].join(". "));
      u.lang = lang === "pt" ? "pt-BR" : "en-US";
      const done = () => { L.textContent = "🔊"; L.setAttribute("aria-label", t().listen); };
      u.onend = u.onerror = done;
      L.textContent = "⏹"; L.setAttribute("aria-label", t().stop);
      S.speak(u);
    };
    K.onclick = e => {
      const x = e.target.closest("[data-go]");
      if (x) location.hash = "#" + x.dataset.go;
    };
  }

  if (nb !== prev.b) {
    cv.classList.remove("in", "out");
    void cv.offsetWidth;
    cv.classList.add(nb ? "in" : "out");
    if (nb && nb !== "espaco") cam = { lat: DV[nb][0], lng: DV[nb][1], k: 1 };
    if (renderer) draw();
  }
  if (!renderer) {
    $("#err").textContent = tt.nogl;
    $("#err").hidden = false;
  } else if (it && sitesOf(it).length && (nb !== prev.b || ni !== prev.id)) fly(sitesOf(it)[0][0], sitesOf(it)[0][1] + globeOff(), 1.25);
  else if (renderer && nb && nb !== "espaco" && (prev.id || nb !== prev.b) && !it) fly(DV[nb][0], DV[nb][1], 1);
  else if (renderer) draw();
  if (currentMode === "body") recolorMarkers(ni);

  // Deep space: rotates the camera to frame the selected probe (to the right of the card)
  if (renderer && it && nb === "espaco" && ni !== prev.id) {
    const m = markers.find(q => q.userData.id === ni);
    if (m) { drag.deepAngle = Math.atan2(m.position.x, m.position.z) - 0.2; applyDeepCam(); }
  }

  libras();
  if (!quiet) {
    if (nb !== prev.b) $("#live").textContent = `${tt.scr}: ${nb ? tt.nm[nb] : "Hub"}. ${nb ? ITEMS.filter(i => i.corpo === nb).length + " " + tt.items + ". " : ""}${sealT}`;
    if (ni && ni !== prev.id) K.focus();
    else if (!ni && prev.id && nb === prev.b) $(`#ul [data-id="${prev.id}"]`)?.focus();
    else if (!nb && prev.b) $(`#hubb [data-b="${prev.b}"]`)?.focus();
  }
}

/* ---------- Event wiring ---------- */
$("#hubb").onclick = e => {
  const x = e.target.closest("[data-b]");
  if (x) location.hash = "#" + x.dataset.b;
};
$("#ul").onclick = e => {
  const x = e.target.closest("[data-id]");
  if (x) location.hash = `#${cur.b}/${x.dataset.id}`;
};
function pointerPos(e) {
  const r = cv.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - r.left, y: t.clientY - r.top, cx: t.clientX, cy: t.clientY };
}

function pinchDistance() {
  const pts = [...drag.pointers.values()];
  if (pts.length < 2) return 0;
  return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
}

function onPointerDown(e) {
  if (!currentMode) return;
  if (e.button != null && e.button !== 0) return;
  const p = pointerPos(e);
  drag.pointers.set(e.pointerId, { x: p.x, y: p.y });

  if (drag.pointers.size === 2) {
    drag.pinchDist0 = pinchDistance();
    drag.pinchZoom0 = currentMode === "hub" ? hubZoom : currentMode === "body" ? (cam.k || 1) : (1 / deepRadius);
    drag.active = false;
    e.preventDefault();
    return;
  }

  if (currentMode === "body" || currentMode === "deep" || currentMode === "hub") {
    drag.active = true;
    drag.moved = false;
    drag.x0 = p.x;
    drag.y0 = p.y;
    drag.lat0 = cam.lat;
    drag.lng0 = cam.lng;
    drag.deepAngle0 = drag.deepAngle;
    drag.yaw0 = drag.hubYaw;
    drag.tilt0 = drag.hubTilt;
    cancelAnimationFrame(tw);
    targetCam = null;
    cv.setPointerCapture?.(e.pointerId);
    cv.style.cursor = "grabbing";
  }
  e.preventDefault();
}

function onPointerMove(e) {
  if (!drag.pointers.has(e.pointerId) && !drag.active) return;
  const p = pointerPos(e);
  if (drag.pointers.has(e.pointerId)) drag.pointers.set(e.pointerId, { x: p.x, y: p.y });

  // Pinch zoom (2 fingers) — hub, body, deep
  if (drag.pointers.size >= 2) {
    const d = pinchDistance();
    if (drag.pinchDist0 > 0 && d > 0) {
      const ratio = d / drag.pinchDist0;
      if (currentMode === "hub") {
        hubZoom = clamp(drag.pinchZoom0 * ratio, 0.55, 3.2);
        applyHubCam();
      } else if (currentMode === "body") {
        cam.k = clamp(drag.pinchZoom0 * ratio, 0.7, 4.5);
        applyBodyCam();
      } else if (currentMode === "deep") {
        deepRadius = clamp(1 / Math.max(0.0001, drag.pinchZoom0 * ratio), 6, 40);
        applyDeepCam();
      }
    }
    e.preventDefault();
    return;
  }

  if (!drag.active) return;
  const dx = p.x - drag.x0;
  const dy = p.y - drag.y0;
  if (Math.hypot(dx, dy) > 6) drag.moved = true;

  if (currentMode === "body") {
    const sens = 0.28;
    cam.lng = drag.lng0 - dx * sens;
    cam.lat = clamp(drag.lat0 + dy * sens, -80, 80);
    applyBodyCam();
  } else if (currentMode === "deep") {
    drag.deepAngle = drag.deepAngle0 - dx * 0.008;
    applyDeepCam();
  } else if (currentMode === "hub") {
    drag.hubYaw = drag.yaw0 - dx * 0.006;
    drag.hubTilt = clamp(drag.tilt0 + dy * 0.005, 0, HUB_TILT_MAX);
    applyHubCam();
  }
  e.preventDefault();
}

function onPointerUp(e) {
  drag.pointers.delete(e.pointerId);
  if (drag.pointers.size < 2) drag.pinchDist0 = 0;

  if (!drag.active) {
    try { cv.releasePointerCapture?.(e.pointerId); } catch (_) {}
    return;
  }
  const moved = drag.moved;
  drag.active = false;
  cv.style.cursor = currentMode ? "grab" : "";
  try { cv.releasePointerCapture?.(e.pointerId); } catch (_) {}

  if (!moved && currentMode !== "hub" && pins.length) {
    const r = cv.getBoundingClientRect();
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - r.left;
    const y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - r.top;
    const hit = pins.find(q => Math.hypot(q[0] - x, q[1] - y) < 18);
    if (hit) location.hash = `#${cur.b}/${hit[2]}`;
  }
}

cv.addEventListener("pointerdown", onPointerDown);
cv.addEventListener("pointermove", onPointerMove);
cv.addEventListener("pointerup", onPointerUp);
cv.addEventListener("pointercancel", onPointerUp);
cv.addEventListener("lostpointercapture", () => { drag.active = false; });

cv.addEventListener("wheel", e => {
  if (!currentMode) return;
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
  applyZoom(factor);
}, { passive: false });

// Prevent page scroll while interacting on touch
cv.addEventListener("touchstart", e => {
  if (currentMode) e.preventDefault();
}, { passive: false });
$("#back").onclick = up;
$("#hr").onclick = resetHubView;
cv.addEventListener("dblclick", () => { if (currentMode === "hub") resetHubView(); });
document.addEventListener("keydown", e => {
  if (currentMode !== "hub" || $("#dlg").open || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest && e.target.closest("#ap, input, select, textarea")) return;
  const s = 0.12;
  if (e.key === "ArrowLeft") drag.hubYaw += s;
  else if (e.key === "ArrowRight") drag.hubYaw -= s;
  else if (e.key === "ArrowUp") drag.hubTilt = clamp(drag.hubTilt - s, 0, HUB_TILT_MAX);
  else if (e.key === "ArrowDown") drag.hubTilt = clamp(drag.hubTilt + s, 0, HUB_TILT_MAX);
  else if (e.key === "Home") { resetHubView(); e.preventDefault(); return; }
  else return;
  e.preventDefault();
  applyHubCam();
});
document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || $("#dlg").open) return;
  if (!$("#ap").hidden) {
    $("#ap").hidden = true;
    $("#ab").setAttribute("aria-expanded", "false");
    return;
  }
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  up();
});

let vlOn = 0;
// VLibras saves its "open" state in the browser and reopens on the next visit (bad on phones, where it covers the screen)
function vlNoAutoOpen() {
  try {
    const k = "@vlibras-widget", raw = localStorage.getItem(k);
    if (!raw || !raw.includes('"isOpen":true')) return;
    try {
      const o = JSON.parse(raw);
      if (!o || !o.state) throw 0;
      o.state.isOpen = false;
      localStorage.setItem(k, JSON.stringify(o));
    } catch (_) {
      localStorage.setItem(k, raw.replace('"isOpen":true', '"isOpen":false'));
    }
  } catch (e) {}
}
function libras() {
  const on = lang === "pt";
  document.querySelectorAll("#libras,#vlibras-access-wrapper,#vlibras-app-root").forEach(e => e.hidden = !on);
  if (!on) {
    try { window.VLibrasWidget?.toggle?.(false); } catch (e) {}
    return;
  }
  if (vlOn) return;
  vlOn = 1;
  vlNoAutoOpen();
  const sc = document.createElement("script");
  sc.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  sc.async = true;
  sc.onload = () => {
    try { new window.VLibras.Widget("https://vlibras.gov.br/app"); } catch (e) { return; }
    let n = 0, placed = false;
    const iv = setInterval(() => {
      const a = window.VLibrasWidget?.access;
      if (a && !placed) {
        placed = true;
        a.style.top = "auto";
        a.style.right = "16px";
        a.style.bottom = "calc(16px + env(safe-area-inset-bottom,0px))";
      }
      // if the widget opened by itself (auto), close it; a user tap on the button (auto=false) is respected
      const root = document.getElementById("vlibras-app-root");
      if (root && root.dataset.auto === "true" && root.dataset.active === "true") root.dataset.active = "false";
      if (++n > 50) clearInterval(iv);
    }, 100);
  };
  document.body.appendChild(sc);
}

const setLang = l => {
  lang = l;
  ls("lang", l);
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  render(true);
};
$("#lp").onclick = () => setLang("pt");
$("#le").onclick = () => setLang("en");
$("#ab").onclick = () => {
  const o = $("#ap").hidden;
  $("#ap").hidden = !o;
  $("#ab").setAttribute("aria-expanded", o);
};

document.addEventListener("pointerdown", e => {
  if ($("#ap").hidden || e.target.closest("#ap, #ab")) return;
  $("#ap").hidden = true;
  $("#ab").setAttribute("aria-expanded", "false");
});

const mode = () => {
  document.documentElement.classList.toggle("hc", hc);
  document.documentElement.classList.toggle("calm", calm);
  document.documentElement.classList.toggle("fs1", fsz === 1);
  document.documentElement.classList.toggle("fs2", fsz === 2);
  document.documentElement.classList.toggle("sp", sp);
  $("#fsz").value = fsz;
  $("#csp").checked = sp;
  $("#chc").checked = hc;
  $("#cca").checked = calm;
  // Rebuild scene with new palette / materials
  if (renderer) draw();
};
$("#chc").onchange = e => { hc = e.target.checked; ls("hc", hc ? "1" : "0"); mode(); };
$("#fsz").onchange = e => { fsz = parseInt(e.target.value) || 0; ls("fsz", fsz); mode(); };
$("#csp").onchange = e => { sp = e.target.checked; ls("sp", sp ? "1" : "0"); mode(); };
$("#cca").onchange = e => { calm = e.target.checked; ls("calm", calm ? "1" : "0"); mode(); };

function about() {
  const tt = t(), D = $("#dlg");
  $("#dt").textContent = tt.about;
  $("#dn").textContent = tt.note;
  $("#dx").setAttribute("aria-label", tt.close);
  D.lang = lang;
  $("#dl").innerHTML = ITEMS.map(i =>
    `<li><b>${nm(i)}</b><br>${tt.src}: ${i.fonte.startsWith("http") ? `<a href="${i.fonte}" target="_blank" rel="noopener">${i.fonte}</a>` : tt.pend}<br><small>${tt.cons}: ${i.data_consulta === "pendente" ? tt.pend : i.data_consulta}</small></li>`
  ).join("");
  D.showModal();
}
$("#rs").onclick = () => { seenIds.clear(); ls("seen", "[]"); render(true); };
$("#ad").onclick = about;
$("#dx").onclick = () => $("#dlg").close();
$("#fd").onclick = about;
$("#app").addEventListener("animationend", e => { if (e.animationName === "scan") e.currentTarget.classList.remove("scan"); });

addEventListener("resize", () => { onResize(); if (currentMode === "hub") buildHub(); else needsRender = true; });
addEventListener("hashchange", () => render());

/* ---------- Sparkles and loading screen ---------- */
{
  const sp = document.querySelector(".sparkles");
  for (let i = 0; i < 12; i++) {
    const e = document.createElement("i");
    e.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--d:${3 + Math.random() * 4}s;--w:${Math.random() * 5}s;scale:${0.6 + Math.random()}`;
    sp.appendChild(e);
  }
}
const bootDone = () => setTimeout(() => $("#boot").classList.add("done"), 500);

/* ---------- Boot ---------- */
if (!initThree()) {
  document.documentElement.classList.add("nogl");
  $("#err").textContent = t().nogl;
  $("#err").hidden = false;
  bootDone();
} else {
  loop();
}

fetch("data/items.json")
  .then(r => r.json())
  .then(d => {
    ITEMS = d;
    mode();
    render();
    bootDone();
  })
  .catch(() => {
    const m = t().err;
    $("#live").textContent = m;
    $("#err").textContent = m;
    $("#err").hidden = false;
    $("#hint").hidden = true;
    document.querySelectorAll("[data-t]").forEach(e => e.textContent = t()[e.dataset.t]);
  });