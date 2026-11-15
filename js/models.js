(function () {
  const T = () => THREE;

  function build(id, hc) {
    const gold = hc ? 0xffffff : 0xd9a441, foil = hc ? 0xffffff : 0xc9b27a,
      white = hc ? 0xffffff : 0xeef3f8, grey = hc ? 0xffffff : 0x9aa3ad,
      dark = hc ? 0xffffff : 0x2b3038, panel = hc ? 0xffffff : 0x25407a,
      orange = hc ? 0xffffff : 0xe9742f;
    const g = new (T().Group)();
    const mat = (c, o = {}) => new (T().MeshStandardMaterial)({ color: c, roughness: 0.6, metalness: 0.2, flatShading: true, ...o });
    const add = (geo, c, pos = [0, 0, 0], rot = [0, 0, 0], o) => {
      const m = new (T().Mesh)(geo, mat(c, o));
      m.position.set(...pos); m.rotation.set(...rot); g.add(m); return m;
    };
    const Box = (x, y, z) => new (T().BoxGeometry)(x, y, z);
    const Cyl = (rt, rb, h, s = 12) => new (T().CylinderGeometry)(rt, rb, h, s);
    const Sph = (r, s = 12) => new (T().SphereGeometry)(r, s, 8);
    const PI = Math.PI;
    const wheel = (x, y, z, r = 0.09, w = 0.07) => add(Cyl(r, r, w, 10), dark, [x, y, z], [0, 0, PI / 2]);
    const leg = (x, z, h, spread) => {
      const L = add(Cyl(0.012, 0.012, h, 5), grey, [x * 0.5, h / 2 - 0.02, z * 0.5]);
      L.rotation.z = -Math.atan2(x, h) * 1; L.rotation.x = Math.atan2(z, h);
      add(Cyl(0.05, 0.05, 0.015, 8), foil, [x, 0, z]);
    };

    if (id === "apollo11_lm") {
      add(Cyl(0.24, 0.27, 0.22, 8), gold, [0, 0.2, 0]);
      add(Box(0.3, 0.26, 0.3), white, [0, 0.45, 0]);
      add(Cyl(0.08, 0.1, 0.12, 8), grey, [0, 0.66, 0], [0, 0, 0]);
      for (const [x, z] of [[0.45, 0.45], [-0.45, 0.45], [0.45, -0.45], [-0.45, -0.45]]) leg(x, z, 0.3);
      add(Cyl(0.015, 0.015, 0.3, 5), grey, [0.28, 0.75, 0], [0, 0, -0.5]);
    } else if (id === "apollo15_lm_lrv") {
      add(Box(0.5, 0.05, 0.3), grey, [0, 0.2, 0]);
      add(Box(0.12, 0.05, 0.1), white, [-0.12, 0.26, 0]); // seats
      add(Box(0.12, 0.05, 0.1), white, [0.04, 0.26, 0]);
      for (const x of [-0.24, 0.24]) for (const z of [-0.2, 0.2]) wheel(x, 0.1, z, 0.1, 0.06);
      add(Cyl(0.012, 0.012, 0.3, 5), grey, [0.2, 0.38, -0.06]);
      add(Cyl(0.13, 0.02, 0.05, 10), white, [0.2, 0.54, -0.06], [0.5, 0, 0]);
    } else if (id === "surveyor3") {
      for (const [x, z] of [[0.35, 0], [-0.18, 0.31], [-0.18, -0.31]]) leg(x, z, 0.34);
      add(Cyl(0.03, 0.03, 0.4, 6), grey, [0, 0.4, 0]);
      add(Box(0.26, 0.14, 0.26), foil, [0, 0.3, 0]);
      add(Box(0.06, 0.06, 0.06), dark, [0.1, 0.68, 0]);
      add(Box(0.34, 0.02, 0.2), panel, [0, 0.74, 0], [0, 0, 0.2]); // solar panel
    } else if (id === "alsep") {
      add(Box(0.36, 0.1, 0.26), foil, [0, 0.1, 0]);
      add(Box(0.14, 0.14, 0.14), grey, [-0.3, 0.07, 0.1]);
      add(Cyl(0.012, 0.012, 0.4, 5), grey, [0.14, 0.34, 0]);
      add(Sph(0.06), white, [0.14, 0.56, 0]);
    } else if (id === "lrrr") {
      add(Box(0.5, 0.04, 0.36), grey, [0, 0.06, 0]);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++)
        add(Cyl(0.04, 0.04, 0.05, 8), white, [-0.18 + i * 0.09, 0.1, -0.12 + j * 0.08]);
      add(Box(0.08, 0.14, 0.04), gold, [0, 0.14, 0.2], [0.5, 0, 0]);
    } else if (id === "sojourner") {
      add(Box(0.42, 0.14, 0.3), white, [0, 0.2, 0]);
      add(Box(0.42, 0.015, 0.3), panel, [0, 0.285, 0]);
      for (const z of [-0.18, 0.18]) for (const x of [-0.18, 0, 0.18]) wheel(x, 0.09, z, 0.07, 0.05);
      add(Cyl(0.01, 0.01, 0.22, 5), grey, [0.15, 0.4, 0]);
    } else if (id === "spirit" || id === "opportunity") {
      add(Box(0.5, 0.12, 0.36), id === "spirit" ? white : foil, [0, 0.3, 0]);
      add(Box(0.56, 0.02, 0.42), panel, [0, 0.38, 0]);
      for (const z of [-0.24, 0.24]) for (const x of [-0.2, 0, 0.2]) wheel(x, 0.1, z, 0.09, 0.06);
      add(Cyl(0.015, 0.015, 0.4, 5), grey, [-0.15, 0.6, 0]);
      add(Box(0.14, 0.07, 0.08), dark, [-0.15, 0.82, 0]);
    } else if (id === "viking1" || id === "viking2") {
      add(Cyl(0.3, 0.3, 0.12, 6), id === "viking1" ? grey : foil, [0, 0.38, 0]);
      for (let k = 0; k < 3; k++) {
        const a = (k * 2 * PI) / 3 + 0.5, x = Math.cos(a) * 0.5, z = Math.sin(a) * 0.5;
        leg(x, z, 0.4);
      }
      add(Cyl(0.015, 0.015, 0.4, 5), grey, [0.1, 0.62, 0.1]);
      add(Cyl(0.12, 0.02, 0.05, 10), white, [0.1, 0.84, 0.1], [0.6, 0, 0]);
      add(Box(0.3, 0.02, 0.06), dark, [-0.35, 0.34, 0], [0, 0.4, 0]); // arm
    } else if (id === "phoenix") {
      add(Box(0.34, 0.1, 0.34), grey, [0, 0.34, 0]);
      add(Cyl(0.3, 0.3, 0.015, 16), panel, [-0.34, 0.4, 0]);
      add(Cyl(0.3, 0.3, 0.015, 16), panel, [0.34, 0.4, 0]);
      for (const [x, z] of [[0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]]) leg(x, z, 0.3);
      add(Cyl(0.012, 0.012, 0.36, 5), grey, [0, 0.6, 0.08]);
      add(Box(0.1, 0.06, 0.06), dark, [0, 0.8, 0.08]);
    } else if (id === "genesis" || id === "stardust") {
      const c = id === "genesis" ? foil : grey;
      add(new (T().ConeGeometry)(0.34, 0.28, 12), c, [0, 0.14, 0], [PI, 0, 0]);
      add(Cyl(0.34, 0.34, 0.03, 12), dark, [0, 0.3, 0]);
      add(Cyl(0.14, 0.14, 0.12, 12), white, [0, 0.38, 0]);
      add(Sph(0.06), orange, [0, 0.47, 0]);
    } else if (id.startsWith("voyager")) {
      add(Cyl(0.2, 0.2, 0.12, 10), foil, [0, 0.4, 0]);
      add(new (T().SphereGeometry)(0.42, 18, 6, 0, PI * 2, 0, PI * 0.28), white, [0, 0.88, 0], [PI, 0, 0]).material.side = T().DoubleSide;
      add(Cyl(0.012, 0.012, 1.0, 5), grey, [0.55, 0.4, 0], [0, 0, PI / 2]);
      add(Cyl(0.04, 0.04, 0.16, 8), gold, [-0.4, 0.4, 0.3], [0, 0, PI / 2]);
      add(Cyl(0.012, 0.012, 0.6, 5), grey, [0, 0.4, -0.35], [PI / 2, 0, 0]);
      add(Box(0.1, 0.1, 0.1), dark, [0, 0.4, -0.7]);
      add(Cyl(0.1, 0.1, 0.012, 16), gold, [0, 0.56, 0.12], [0.4, 0, 0]); // gold disc
    } else if (id.startsWith("pioneer")) {
      add(Cyl(0.18, 0.18, 0.12, 6), foil, [0, 0.4, 0]);
      add(new (T().SphereGeometry)(0.5, 18, 6, 0, PI * 2, 0, PI * 0.25), white, [0, 0.96, 0], [PI, 0, 0]).material.side = T().DoubleSide;
      add(Cyl(0.012, 0.012, 0.7, 5), grey, [0.45, 0.35, 0], [0, 0, PI / 2]);
      add(Cyl(0.012, 0.012, 0.7, 5), grey, [-0.35, 0.35, 0.2], [0, 0, PI / 2]);
      add(Cyl(0.04, 0.04, 0.14, 8), gold, [0.82, 0.35, 0], [0, 0, PI / 2]);
      add(Cyl(0.04, 0.04, 0.14, 8), gold, [-0.72, 0.35, 0.2], [0, 0, PI / 2]);
      add(Box(0.12, 0.08, 0.02), gold, [0.18, 0.28, 0.2]); // plaque
    } else {
      add(Box(0.4, 0.4, 0.4), grey, [0, 0.2, 0]); // generic fallback
    }
    return g;
  }

  const cache = {};
  function thumb(id, hc) {
    const key = id + (hc ? "H" : "");
    if (cache[key]) return cache[key];
    try {
      const W = 640, H = 400, c = document.createElement("canvas");
      c.width = W; c.height = H;
      const r = new (T().WebGLRenderer)({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true });
      r.setSize(W, H, false);
      const sc = new (T().Scene)();
      sc.add(new (T().AmbientLight)(0xffffff, 0.8));
      const d = new (T().DirectionalLight)(0xffffff, 1.3); d.position.set(3, 4, 3); sc.add(d);
      const m = build(id, hc); m.rotation.y = -0.6; sc.add(m);
      const box = new (T().Box3)().setFromObject(m), ctr = box.getCenter(new (T().Vector3)()), sz = box.getSize(new (T().Vector3)());
      m.position.sub(ctr);
      const cam = new (T().PerspectiveCamera)(35, W / H, 0.1, 50);
      const dist = Math.max(sz.x, sz.y * 1.4, sz.z) * 1.35;
      cam.position.set(dist * 0.6, dist * 0.35, dist); cam.lookAt(0, 0, 0);
      r.render(sc, cam);
      cache[key] = c.toDataURL("image/png");
      r.dispose(); r.forceContextLoss && r.forceContextLoss();
    } catch (e) { cache[key] = ""; }
    return cache[key];
  }

  window.ItemModels = { build, thumb };
})();
