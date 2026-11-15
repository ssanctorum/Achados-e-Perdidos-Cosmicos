let ITEMS = [];
const $ = s => document.querySelector(s), ls = (k, v) => {
  try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
};
const BODIES = ["terra", "lua", "marte", "espaco"], rad = Math.PI / 180;
const T = {
  pt: {
    back: "Voltar", all: "Tudo", hint: "Toque num planeta para explorar",
    items: "itens", item: "item", list: "Itens deixados", close: "Fechar", listen: "Ouvir",
    acc: "Acessibilidade", hc: "Alto contraste", calm: "Modo calmo (sem movimento nem brilho)",
    about: "Sobre os dados", pos: "Posição aproximada.",
    globe: "Globo estilizado, fora de escala. Posições aproximadas.",
    nsc: "Fora de escala", dist: "Distância", sig: "sinal leva cerca de", last: "Último sinal",
    seen: "Aparência", src: "Fonte", cons: "consultado em",
    note: "Coordenadas aproximadas: fontes e épocas diferentes podem variar em alguns quilômetros.",
    pend: "pendente", scr: "Tela atual", stop: "Parar", reset: "Zerar progresso",
    explored: "explorados", visited: "visitado",
    prog: (a, b) => `Você explorou ${a} de ${b} itens`,
    fs: "Tamanho do texto", fs0: "Normal", fs1: "Grande", fs2: "Muito grande",
    sp: "Mais espaço entre letras, palavras e linhas", why: "Por que ficou", rel: "Relacionados",
    err: "Não foi possível carregar os dados. Abra por um servidor (ex.: python3 -m http.server).",
    st: { ativo: "Ativo", silencioso: "Silencioso", "concluído": "Concluído" },
    nm: { terra: "Terra", lua: "Lua", marte: "Marte", espaco: "Espaço profundo" },
    hcap: d => `Posições reais em ${d}, vistas de cima. Sol, planetas e a distância da Lua estão ampliados.`,
    hdist: (u, m) => `Terra–Marte hoje: ${u} UA (luz: ${m} min) · Terra–Lua: 384.400 km (luz: 1,3 s)`,
    E: "L", W: "O"
  },
  en: {
    back: "Back", all: "All", hint: "Tap a planet to explore",
    items: "items", item: "item", list: "Items left behind", close: "Close", listen: "Listen",
    acc: "Accessibility", hc: "High contrast", calm: "Calm mode (no motion or glow)",
    about: "About the data", pos: "Approximate position.",
    globe: "Stylized globe, not to scale. Approximate positions.",
    nsc: "Not to scale", dist: "Distance", sig: "signal takes about", last: "Last signal",
    seen: "Appearance", src: "Source", cons: "checked on",
    note: "Approximate coordinates: different sources and epochs can vary by a few kilometers.",
    pend: "pending", scr: "Current screen", stop: "Stop", reset: "Reset progress",
    explored: "explored", visited: "visited",
    prog: (a, b) => `You explored ${a} of ${b} items`,
    fs: "Text size", fs0: "Normal", fs1: "Large", fs2: "Extra large",
    sp: "More space between letters, words and lines", why: "Why it stayed", rel: "Related",
    err: "Could not load the data. Open through a server (e.g. python3 -m http.server).",
    st: { ativo: "Active", silencioso: "Silent", "concluído": "Completed" },
    nm: { terra: "Earth", lua: "Moon", marte: "Mars", espaco: "Deep space" },
    hcap: d => `Real positions on ${d}, seen from above. The Sun, planets and the Moon's distance are enlarged.`,
    hdist: (u, m) => `Earth–Mars today: ${u} AU (light: ${m} min) · Earth–Moon: 384,400 km (light: 1.3 s)`,
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
const t = () => T[lang], g = (it, k) => it[k + "_" + lang], nf = n => lang === "pt" ? String(n).replace(".", ",") : String(n);

const ATM = { terra: 0x6cc4ff, lua: 0xfff1c8, marte: 0xff8a5c };
const DV = { terra: [15, -45], lua: [8, 0], marte: [5, -20] };
const TEX_URL = {
  terra: "textures/earth.jpg",
  lua: "textures/moon.jpg",
  marte: "textures/mars.jpg"
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
    texCache[key] = t;
    return t;
  } catch (e) { return null; }
}

/* Animated meshes */
let bodyGlobe = null, hubBodies = {}, hubMoonOrbit = null, animTime = 0;

const COL = {
  terra: { base: 0x2a7de1, land: 0x43b86b },
  lua: { base: 0xcdbf9d, land: 0xa89b7c },
  marte: { base: 0xe0693a, land: 0xa8431f, ice: 0xfff5ea }
};

/* Efemérides aproximadas (elementos keplerianos JPL, 1800–2050) */
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

/* ========== Three.js setup ========== */
const cv = $("#cv");
let renderer, scene, camera, animId = null, currentMode = null;
let hubGroup = null, bodyGroup = null, deepGroup = null;
let markers = [], raycaster = null, mouse = null;
let targetCam = null, animStart = 0, animFrom = null;

/* Drag to rotate globe / deep space */
let drag = {
  active: false,
  moved: false,
  x0: 0,
  y0: 0,
  lat0: 0,
  lng0: 0,
  deepAngle0: 0,
  deepAngle: 0.6, // radians around Y for deep view
  deepElev: 0.55
};

function applyBodyCam() {
  if (currentMode !== "body" || !camera) return;
  const dist = 2.6 / (cam.k || 1);
  const camPos = latLngToVec(cam.lat, cam.lng, dist);
  camera.position.copy(camPos);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 1, 0);
  updatePinsFromMarkers();
  needsRender = true;
}

function applyDeepCam() {
  if (currentMode !== "deep" || !camera) return;
  const r = 18;
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
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !calm, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
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
  const U = 12; // scale units
  const Ee = helio("terra", jd), Mm = helio("marte", jd);
  const ep = new THREE.Vector3(Ee[0] * U, 0, -Ee[1] * U);
  const mp = new THREE.Vector3(Mm[0] * U, 0, -Mm[1] * U);
  const ml = Math.atan2(-Ee[1], -Ee[0]) + elong(jd) * rad;
  const mdist = 2.8;
  const op = new THREE.Vector3(
    ep.x + Math.cos(ml) * mdist,
    0,
    ep.z - Math.sin(ml) * mdist
  );

  // Orbits
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

  // Moon orbit around Earth (visual)
  {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(ep.x + Math.cos(a) * mdist, 0, ep.z + Math.sin(a) * mdist));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    hubGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: hc ? 0xffffff : 0xffffff30, transparent: true, opacity: 0.4 })));
  }

  // Earth–Mars dashed line
  {
    const geo = new THREE.BufferGeometry().setFromPoints([ep, mp]);
    const mat = new THREE.LineDashedMaterial({ color: hc ? 0xffffff : 0x5ce1e6, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.55 });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    hubGroup.add(line);
  }

  // Sun
  const sunGeo = new THREE.SphereGeometry(hc ? 0.55 : 0.7, 24, 16);
  const sunMat = new THREE.MeshBasicMaterial({ color: hc ? 0xffb000 : 0xffd166 });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  hubGroup.add(sun);
  if (!hc && !calm) {
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: 0.18, depthWrite: false })
    );
    hubGroup.add(glow);
  }

  // Planets (with optional real textures + animation handles)
  hubBodies = {};
  function planet(pos, r, color, atm, name) {
    const geo = new THREE.SphereGeometry(r, 32, 24);
    const map = (!hc && typeof THREE !== "undefined") ? getTexture(name) : null;
    let mat;
    if (hc) {
      mat = new THREE.MeshBasicMaterial({ color });
    } else if (map) {
      mat = new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0.05 });
    } else {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.05, emissive: color, emissiveIntensity: 0.12 });
    }
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    m.userData = { body: name, basePos: pos.clone(), radius: r };
    hubGroup.add(m);
    hubBodies[name] = m;
    if (!hc && atm) {
      const at = new THREE.Mesh(
        new THREE.SphereGeometry(r * 1.12, 20, 14),
        new THREE.MeshBasicMaterial({ color: atm, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.BackSide })
      );
      at.position.copy(pos);
      at.userData = { follow: name };
      hubGroup.add(at);
    }
    return m;
  }
  const ed = 1.15, md = 0.62, od = 0.32;
  planet(ep, ed / 2, COL.terra.base, ATM.terra, "terra");
  planet(mp, md / 2, COL.marte.base, ATM.marte, "marte");
  planet(op, od / 2, COL.lua.base, ATM.lua, "lua");
  // store moon orbital params for translation animation
  hubMoonOrbit = { earth: "terra", dist: mdist, angle0: Math.atan2(op.z - ep.z, op.x - ep.x) };

  // Deep-space portal (far right-ish)
  const free = [
    new THREE.Vector3(Math.max(ep.x, mp.x) + 9, 0, -6),
    new THREE.Vector3(Math.max(ep.x, mp.x) + 9, 0, 6)
  ];
  const pp = free.sort((a, b) => Math.min(a.distanceTo(mp), a.distanceTo(ep)) - Math.min(b.distanceTo(mp), b.distanceTo(ep)))[0];
  {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.08, 12, 48),
      new THREE.MeshBasicMaterial({ color: hc ? 0xffffff : 0x5ce1e6, transparent: true, opacity: 0.9 })
    );
    ring.position.copy(pp);
    ring.rotation.x = Math.PI / 2;
    hubGroup.add(ring);
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.05, 10, 40),
      new THREE.MeshBasicMaterial({ color: hc ? 0xffffff : 0x5ce1e6, transparent: true, opacity: 0.35 })
    );
    ring2.position.copy(pp);
    ring2.rotation.x = Math.PI / 2;
    hubGroup.add(ring2);
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 10),
      new THREE.MeshBasicMaterial({ color: hc ? 0xffffff : 0x5ce1e6 })
    );
    core.position.copy(pp);
    core.userData = { body: "espaco" };
    hubGroup.add(core);

    // Trajectory hints
    for (let o of [-0.25, 0, 0.25]) {
      const a = Math.atan2(pp.z, pp.x) + o;
      const start = new THREE.Vector3(Math.cos(a) * 18, 0, Math.sin(a) * 18);
      const geo = new THREE.BufferGeometry().setFromPoints([start, pp.clone().multiplyScalar(0.85)]);
      hubGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: hc ? 0xffffff : 0x5ce1e688, transparent: true, opacity: 0.5 })));
    }
  }

  // Camera top-down
  const span = Math.max(18, Math.hypot(ep.x, ep.z) + 6, Math.hypot(mp.x, mp.z) + 6);
  camera.position.set(0, span * 1.15, 0.01);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, -1);
  camera.fov = 42;
  camera.updateProjectionMatrix();

  // Store screen positions for HTML buttons
  placeHubButtons({ terra: ep, lua: op, marte: mp, espaco: pp }, { terra: ed, lua: od, marte: md, espaco: 2.2 });
  needsRender = true;
}

function placeHubButtons(positions, sizes) {
  const w = cv.clientWidth, h = cv.clientHeight;
  const place = (k, pos, d) => {
    const b = $(`#hubb [data-b="${k}"]`);
    if (!b) return;
    const v = pos.clone().project(camera);
    const x = (v.x * 0.5 + 0.5) * w;
    const y = (-v.y * 0.5 + 0.5) * h;
    const z = Math.max(44, (d / (camera.position.y || 20)) * h * 0.55 + 18);
    b.style.left = x + "px";
    b.style.top = y + "px";
    b.style.width = b.style.height = z + "px";
  };
  place("terra", positions.terra, sizes.terra);
  place("lua", positions.lua, sizes.lua);
  place("marte", positions.marte, sizes.marte);
  place("espaco", positions.espaco, sizes.espaco);

  // Simple label side preference (keep readable)
  const H = document.querySelectorAll("#hubb .pl");
  H.forEach(b => {
    const l = b.firstElementChild;
    if (!l) return;
    b.dataset.side = "b";
    l.style.setProperty("--sx", "0px");
  });
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
  const map = (!hc) ? getTexture(body) : null;
  let mat;
  if (hc) {
    mat = new THREE.MeshBasicMaterial({ color: col.base });
  } else if (map) {
    mat = new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0.02 });
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

  // Atmosphere shell
  if (!hc) {
    const at = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.035, 32, 24),
      new THREE.MeshBasicMaterial({
        color: ATM[body],
        transparent: true,
        opacity: calm ? 0.12 : 0.22,
        side: THREE.BackSide,
        depthWrite: false
      })
    );
    bodyGroup.add(at);
  }

  // Markers
  markers = [];
  const its = ITEMS.filter(i => i.corpo === body && i.lat != null);
  its.forEach(it => {
    const p = latLngToVec(it.lat, it.lng, R * 1.02);
    const isOn = it.id === cur.id;
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(isOn ? 0.045 : 0.028, 12, 10),
      new THREE.MeshBasicMaterial({ color: isOn ? 0xff9a3c : (hc ? 0xffffff : 0xe8f4ff) })
    );
    m.position.copy(p);
    m.userData = { id: it.id };
    bodyGroup.add(m);
    markers.push(m);
    if (isOn) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.008, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xff9a3c })
      );
      ring.position.copy(p);
      ring.lookAt(0, 0, 0);
      bodyGroup.add(ring);
    }
  });

  // Camera
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
  markers.forEach(m => {
    const v = m.position.clone().project(camera);
    if (v.z > 1) return; // behind
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

  // Sun-ish center
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 20, 16),
    new THREE.MeshBasicMaterial({ color: hc ? 0xffb000 : 0xffd166 })
  );
  deepGroup.add(sun);

  // Concentric rings
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
  its.forEach((it, i) => {
    const a = (-40 + i * (80 / Math.max(1, its.length - 1))) * rad;
    const r = Math.sqrt(Math.max(0.5, it.distancia_ua) / 180) * 9;
    const pos = new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
    const on = it.id === cur.id;

    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), pos]);
    deepGroup.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
      color: on ? 0xff9a3c : (hc ? 0xffffff : 0x3fd0ff),
      transparent: true,
      opacity: on ? 1 : 0.55
    })));

    const m = new THREE.Mesh(
      new THREE.SphereGeometry(on ? 0.18 : 0.11, 12, 10),
      new THREE.MeshBasicMaterial({ color: on ? 0xff9a3c : (hc ? 0xffffff : 0xe8f4ff) })
    );
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
  // Body globe spin
  if (currentMode === "body" && bodyGlobe) {
    bodyGlobe.rotation.y += 0.08 * dt;
    moved = true;
  }
  // Hub: spin + moon translation around Earth
  if (currentMode === "hub" && hubBodies.terra) {
    const spin = { terra: 0.25, lua: 0.05, marte: 0.2 };
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
      // atmosphere shells that follow
      hubGroup && hubGroup.children.forEach(ch => {
        if (ch.userData && ch.userData.follow === "lua") ch.position.copy(hubBodies.lua.position);
        if (ch.userData && ch.userData.follow === "terra") ch.position.copy(hubBodies.terra.position);
        if (ch.userData && ch.userData.follow === "marte" && hubBodies.marte) ch.position.copy(hubBodies.marte.position);
      });
    }
    moved = true;
  }
  return moved;
}

let lastTs = 0;
function loop(ts) {
  animId = requestAnimationFrame(loop);
  const t = ts || performance.now();
  const dt = lastTs ? Math.min(0.05, (t - lastTs) / 1000) : 0.016;
  lastTs = t;
  const animating = tickAnimation(dt);
  if (!needsRender && !targetCam && !animating) return;
  needsRender = false;
  if (renderer && scene && camera) renderer.render(scene, camera);
}

/* ---------- App logic (unchanged structure) ---------- */
const fmtC = (la, lo) => `${nf(Math.abs(la).toFixed(1))}° ${la >= 0 ? "N" : "S"}, ${nf(Math.abs(lo).toFixed(1))}° ${lo >= 0 ? t().E : t().W}`;

function cardHtml(it) {
  const d = it.corpo === "espaco";
  const hs = g(it, "historia")
    .replace(/(O que é:|O que descobriu:|Onde está hoje:|What it is:|What it found:|Where it is today:)/g, "<br><b>$1</b>")
    .replace(/^<br>/, "");
  const img = it.imagem
    ? `<figure class="card-img"><img src="${it.imagem}" alt="${it.nome}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><figcaption>NASA / domínio público</figcaption></figure>`
    : "";
  let x = `<h2 id="ct">${it.nome}</h2><small>${t().st[it.status] || it.status} · ${it.ano}</small>${img}<p>${hs}</p><p><b>${t().seen}:</b> ${g(it, "descricao_visual")}</p><p><b>${t().last}:</b> ${g(it, "ultimo_sinal")}</p>`;
  if (g(it, "por_que_ficou")) x += `<p><b>${t().why}:</b> ${g(it, "por_que_ficou")}</p>`;
  if (it.lat != null) x += `<p>${fmtC(it.lat, it.lng)}<small>${t().pos}</small></p>`;
  if (d) x += `<p><b>${t().dist}:</b> ${nf(it.distancia_ua.toFixed(1))} UA (${it.data_distancia}) · ${t().sig} ${nf(Math.round(it.distancia_ua * 8.317 / 60))} h</p>`;
  const rl = (it.relacionados || []).map(r => ITEMS.find(i => i.id === r)).filter(Boolean);
  if (rl.length) x += `<p><b>${t().rel}:</b></p><div class="row">${rl.map(r => `<button data-go="${r.corpo}/${r.id}">${r.nome}</button>`).join("")}</div>`;
  return x + `<div class="row"><button id="ls">${t().listen}</button><button id="cl">${t().close}</button></div>`;
}

const up = () => { location.hash = cur.id ? "#" + cur.b : ""; };

function draw() {
  // Route to the correct Three.js scene
  if (!cur.b) {
    buildHub();
    cv.style.cursor = "";
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

  const dEM = distEM();
  $("#hubb").innerHTML = BODIES.map(k => {
    const n = ITEMS.filter(i => i.corpo === k).length;
    const dn = ITEMS.filter(i => i.corpo === k && seenIds.has(i.id)).length;
    return `<button class="pl" data-b="${k}"><span class="lbl"><b>${tt.nm[k]}</b><small>${n} ${n === 1 ? tt.item : tt.items} · ${dn}/${n} ${tt.explored}${n && dn === n ? " ✓" : ""}</small></span></button>`;
  }).join("");
  $("#hcap").textContent = tt.hcap(skyDate());
  $("#hdist").textContent = tt.hdist(nf(dEM.toFixed(1)), nf(Math.round(dEM * 8.317)));
  $("#tl").hidden = !nb;
  $("#seal").hidden = !nb;
  $("#prog").textContent = tt.prog(ITEMS.filter(i => seenIds.has(i.id)).length, ITEMS.length);
  $("#hub").hidden = !!nb;
  $("#list").hidden = !nb;
  A.classList.toggle("item", !!ni);
  $("#back").disabled = !nb;

  const gl = nb && nb !== "espaco", sealT = !nb ? tt.hcap(skyDate()) : gl ? tt.globe : tt.nsc;
  $("#seal").textContent = sealT;
  $("#seal").lang = lang;
  $("#bc").innerHTML = `<li>${tt.all}</li>` + (nb ? `<li>${tt.nm[nb]}</li>` : "") + (it ? `<li>${it.nome}</li>` : "");

  if (nb) {
    $("#lh").textContent = `${tt.list}: ${tt.nm[nb]}`;
    $("#ul").innerHTML = ITEMS.filter(i => i.corpo === nb).map(i =>
      `<li><button data-id="${i.id}"${i.id === ni ? ' aria-current="true"' : ""}>${i.nome}<small>${tt.st[i.status] || i.status} · ${i.ano}${seenIds.has(i.id) ? " · ✓ " + tt.visited : ""}</small></button></li>`
    ).join("");
  }

  const K = $("#card");
  K.hidden = !it;
  if (it) {
    K.lang = lang;
    K.innerHTML = cardHtml(it);
    $("#cl").onclick = up;
    const L = $("#ls");
    if (!("speechSynthesis" in window)) L.hidden = true;
    L.onclick = () => {
      const S = speechSynthesis;
      if (S.speaking) { S.cancel(); return; }
      const u = new SpeechSynthesisUtterance([it.nome, g(it, "historia"), g(it, "descricao_visual"), t().last + ": " + g(it, "ultimo_sinal")].join(". "));
      u.lang = lang === "pt" ? "pt-BR" : "en-US";
      const done = () => { L.textContent = t().listen; };
      u.onend = u.onerror = done;
      L.textContent = t().stop;
      S.speak(u);
    };
    K.onclick = e => {
      const x = e.target.closest("[data-go]");
      if (x) location.hash = "#" + x.dataset.go;
    };
  }

  if (nb !== prev.b) {
    if (nb && nb !== "espaco") cam = { lat: DV[nb][0], lng: DV[nb][1], k: 1 };
    draw();
  }
  if (it && it.lat != null && (nb !== prev.b || ni !== prev.id)) fly(it.lat, it.lng, 2.4);
  else if (nb && nb !== "espaco" && (prev.id || nb !== prev.b) && !it) fly(DV[nb][0], DV[nb][1], 1);
  else draw();

  libras();
  if (!quiet) {
    if (nb !== prev.b) $("#live").textContent = `${tt.scr}: ${nb ? tt.nm[nb] : "Hub"}. ${nb ? ITEMS.filter(i => i.corpo === nb).length + " " + tt.items + ". " : ""}${sealT}`;
    if (ni && ni !== prev.id) K.focus();
    else if (!ni && prev.id && nb === prev.b) $(`#ul [data-id="${prev.id}"]`)?.focus();
    else if (!nb && prev.b) $(`#hubb [data-b="${prev.b}"]`)?.focus();
  }
}

/* Event wiring */
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

function onPointerDown(e) {
  if (currentMode !== "body" && currentMode !== "deep") return;
  if (e.button != null && e.button !== 0) return;
  const p = pointerPos(e);
  drag.active = true;
  drag.moved = false;
  drag.x0 = p.x;
  drag.y0 = p.y;
  drag.lat0 = cam.lat;
  drag.lng0 = cam.lng;
  drag.deepAngle0 = drag.deepAngle;
  cancelAnimationFrame(tw);
  targetCam = null;
  cv.setPointerCapture?.(e.pointerId);
  cv.style.cursor = "grabbing";
  e.preventDefault();
}

function onPointerMove(e) {
  if (!drag.active) return;
  const p = pointerPos(e);
  const dx = p.x - drag.x0;
  const dy = p.y - drag.y0;
  if (Math.hypot(dx, dy) > 6) drag.moved = true;

  if (currentMode === "body") {
    // Horizontal drag → longitude; vertical → latitude
    const sens = 0.28;
    cam.lng = drag.lng0 - dx * sens;
    cam.lat = Math.max(-80, Math.min(80, drag.lat0 + dy * sens));
    applyBodyCam();
  } else if (currentMode === "deep") {
    drag.deepAngle = drag.deepAngle0 - dx * 0.008;
    applyDeepCam();
  }
  e.preventDefault();
}

function onPointerUp(e) {
  if (!drag.active) return;
  const moved = drag.moved;
  drag.active = false;
  cv.style.cursor = (currentMode === "body" || currentMode === "deep") ? "grab" : "";
  try { cv.releasePointerCapture?.(e.pointerId); } catch (_) {}

  // Only treat as pin click if the user did not drag
  if (!moved && pins.length) {
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
// Prevent page scroll while dragging on touch
cv.addEventListener("touchstart", e => {
  if (currentMode === "body" || currentMode === "deep") e.preventDefault();
}, { passive: false });
$("#back").onclick = up;
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
function libras() {
  const on = lang === "pt";
  document.querySelectorAll("#libras,#vlibras-access-wrapper,#vlibras-app-root").forEach(e => e.hidden = !on);
  if (!on) {
    try { window.VLibrasWidget?.toggle?.(false); } catch (e) {}
    return;
  }
  if (vlOn) return;
  vlOn = 1;
  const sc = document.createElement("script");
  sc.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  sc.async = true;
  sc.onload = () => {
    try { new window.VLibras.Widget("https://vlibras.gov.br/app"); } catch (e) { return; }
    let n = 0;
    const iv = setInterval(() => {
      const a = window.VLibrasWidget?.access;
      if (a) {
        a.style.top = "auto";
        a.style.right = "16px";
        a.style.bottom = "calc(16px + env(safe-area-inset-bottom,0px))";
        clearInterval(iv);
      } else if (++n > 50) clearInterval(iv);
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
  $("#dc").textContent = tt.close;
  D.lang = lang;
  $("#dl").innerHTML = ITEMS.map(i =>
    `<li><b>${i.nome}</b><br>${tt.src}: ${i.fonte.startsWith("http") ? `<a href="${i.fonte}" target="_blank" rel="noopener">${i.fonte}</a>` : tt.pend}<br><small>${tt.cons}: ${i.data_consulta === "pendente" ? tt.pend : i.data_consulta}</small></li>`
  ).join("");
  D.showModal();
}
$("#rs").onclick = () => { seenIds.clear(); ls("seen", "[]"); render(true); };
$("#ad").onclick = about;
$("#fd").onclick = about;
$("#app").addEventListener("animationend", e => { if (e.animationName === "scan") e.currentTarget.classList.remove("scan"); });

addEventListener("resize", () => { onResize(); if (currentMode === "hub") buildHub(); else needsRender = true; });
addEventListener("hashchange", () => render());

/* Boot */
if (!initThree()) {
  $("#err").textContent = "WebGL / Three.js indisponível neste dispositivo.";
  $("#err").hidden = false;
} else {
  loop();
}

fetch("data/items.json")
  .then(r => r.json())
  .then(d => {
    ITEMS = d;
    mode();
    render();
  })
  .catch(() => {
    const m = t().err;
    $("#live").textContent = m;
    $("#err").textContent = m;
    $("#err").hidden = false;
    $("#hint").hidden = true;
    document.querySelectorAll("[data-t]").forEach(e => e.textContent = t()[e.dataset.t]);
  });
