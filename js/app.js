let ITEMS = [];
const $ = s => document.querySelector(s), ls = (k, v) => {
    try {
        if (v === undefined) return localStorage.getItem(k);
        localStorage.setItem(k, v)
    } catch (e) {}
};
const BODIES = ["terra", "lua", "marte", "espaco"], rad = Math.PI / 180;
const T = {
    pt: {
        back: "Voltar",
        all: "Tudo",
        hint: "Toque num planeta para explorar",
        items: "itens",
        item: "item",
        list: "Itens deixados",
        close: "Fechar",
        listen: "Ouvir",
        acc: "Acessibilidade",
        hc: "Alto contraste",
        calm: "Modo calmo (sem movimento nem brilho)",
        about: "Sobre os dados",
        pos: "Posição aproximada.",
        globe: "Globo estilizado, fora de escala. Posições aproximadas.",
        nsc: "Fora de escala",
        dist: "Distância",
        sig: "sinal leva cerca de",
        last: "Último sinal",
        seen: "Aparência",
        src: "Fonte",
        cons: "consultado em",
        note: "Coordenadas aproximadas: fontes e épocas diferentes podem variar em alguns quilômetros.",
        pend: "pendente",
        scr: "Tela atual",
        stop: "Parar",
        reset: "Zerar progresso",
        explored: "explorados",
        visited: "visitado",
        prog: (a, b) => `Você explorou ${a} de ${b} itens`,
        fs: "Tamanho do texto",
        fs0: "Normal",
        fs1: "Grande",
        fs2: "Muito grande",
        sp: "Mais espaço entre letras, palavras e linhas",
        why: "Por que ficou",
        rel: "Relacionados",
        err: "Não foi possível carregar os dados. Abra por um servidor (ex.: python3 -m http.server).",
        st: { ativo: "Ativo", silencioso: "Silencioso", "concluído": "Concluído" },
        nm: { terra: "Terra", lua: "Lua", marte: "Marte", espaco: "Espaço profundo" },
        hcap: d => `Posições reais em ${d}, vistas de cima. Sol, planetas e a distância da Lua estão ampliados.`,
        hdist: (u, m) => `Terra–Marte hoje: ${u} UA (luz: ${m} min) · Terra–Lua: 384.400 km (luz: 1,3 s)`,
        E: "L",
        W: "O"
    },
    en: {
        back: "Back",
        all: "All",
        hint: "Tap a planet to explore",
        items: "items",
        item: "item",
        list: "Items left behind",
        close: "Close",
        listen: "Listen",
        acc: "Accessibility",
        hc: "High contrast",
        calm: "Calm mode (no motion or glow)",
        about: "About the data",
        pos: "Approximate position.",
        globe: "Stylized globe, not to scale. Approximate positions.",
        nsc: "Not to scale",
        dist: "Distance",
        sig: "signal takes about",
        last: "Last signal",
        seen: "Appearance",
        src: "Source",
        cons: "checked on",
        note: "Approximate coordinates: different sources and epochs may differ by a few kilometers.",
        pend: "pending",
        scr: "Current screen",
        stop: "Stop",
        reset: "Reset progress",
        explored: "explored",
        visited: "visited",
        prog: (a, b) => `You explored ${a} of ${b} items`,
        fs: "Text size",
        fs0: "Normal",
        fs1: "Large",
        fs2: "Extra large",
        sp: "More space between letters, words and lines",
        why: "Why it stayed",
        rel: "Related",
        err: "Could not load the data. Open through a server (e.g. python3 -m http.server).",
        st: { ativo: "Active", silencioso: "Silent", "concluído": "Completed" },
        nm: { terra: "Earth", lua: "Moon", marte: "Mars", espaco: "Deep space" },
        hcap: d => `Real positions on ${d}, seen from above. The Sun, planets and the Moon's distance are enlarged.`,
        hdist: (u, m) => `Earth–Mars today: ${u} AU (light: ${m} min) · Earth–Moon: 384,400 km (light: 1.3 s)`,
        E: "E",
        W: "W"
    }
};
let lang = ls("lang") || ((navigator.language || "pt").startsWith("en") ? "en" : "pt"), pref = (k, q) => { const v = ls(k); return v == null ? matchMedia(q).matches : v === "1" }, hc = pref("hc", "(prefers-contrast: more)"), calm = pref("calm", "(prefers-reduced-motion: reduce)"), fsz = Math.min(2, Math.max(0, parseInt(ls("fsz")) || 0)), sp = ls("sp") === "1";
let seenIds = new Set((() => { try { return JSON.parse(ls("seen") || "[]") } catch (e) { return [] } })());
let cur = { b: "", id: "" }, last = { b: "", id: "" }, cam = { lat: 15, lng: 0, k: 1 }, tw, pins = [];
const t = () => T[lang], g = (it, k) => it[k + "_" + lang], nf = n => lang === "pt" ? String(n).replace(".", ",") : String(n);
let s = 7;
const rnd = () => (s = s * 16807 % 2147483647) / 2147483647;
const ATM = { terra: "#6cc4ff", lua: "#fff1c8", marte: "#ff8a5c" };
const BL = {
    terra: [
        "#2a7de1",
        [["#43b86b", [[48, -100, 28], [-14, -60, 20], [6, 20, 24], [52, 75, 34], [-25, 134, 12]]]]
    ],
    lua: [
        "#cdbf9d",
        [
            [
                "#a89b7c",
                Array.from({ length: 30 }, () => [
                    rnd() * 140 - 70,
                    rnd() * 360 - 180,
                    3 + rnd() * 6
                ])
            ]
        ]
    ],
    marte: [
        "#e0693a",
        [
            ["#a8431f", [[10, 60, 22], [-20, -100, 18], [20, -30, 12]]],
            ["#fff5ea", [[90, 0, 14], [-90, 0, 12]]]
        ]
    ]
};
const DV = { terra: [15, -45], lua: [8, 0], marte: [5, -20] };
const PAL = () => hc
    ? { ring: "#fff", sun: "#ffb000", ln: "#fff", on: "#ffb000", off: "#fff", txt: "#fff", edge: "#000", grid: null, lw: 3, pr: 3 }
    : { ring: "#3fd0ff55", sun: "#ffd166", ln: "#3fd0ff88", on: "#ff9a3c", off: "#e8f4ff", txt: "#e8f4ff", edge: "#050b1f", grid: "#ffffff26", lw: 1, pr: 2 };
const cv = $("#cv"), ctx = cv.getContext("2d");
/* Efemérides aproximadas: elementos keplerianos da JPL (válidos de 1800 a 2050).
   Servem para posicionar Terra, Marte e Lua; não são para navegação. */
const EL = {
    terra: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0],
    marte: [1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343]
};
const PER = { terra: 365.256, marte: 686.98 };
const norm = d => ((d % 360) + 360) % 360;
function helio(k, jd) {
    const T = (jd - 2451545) / 36525, e = EL[k], a = e[0] + e[1] * T, ec = e[2] + e[3] * T, I = (e[4] + e[5] * T) * rad;
    const L = e[6] + e[7] * T, w = e[8] + e[9] * T, N = (e[10] + e[11] * T) * rad, M = norm(L - w) * rad, wp = w * rad - N;
    let E = M + ec * Math.sin(M);
    for (let i = 0; i < 8; i++) E -= (E - ec * Math.sin(E) - M) / (1 - ec * Math.cos(E));
    const xp = a * (Math.cos(E) - ec), yp = a * Math.sqrt(1 - ec * ec) * Math.sin(E), cw = Math.cos(wp), sw = Math.sin(wp), cN = Math.cos(N), sN = Math.sin(N), cI = Math.cos(I);
    return [(cw * cN - sw * sN * cI) * xp + (-sw * cN - cw * sN * cI) * yp, (cw * sN + sw * cN * cI) * xp + (-sw * sN + cw * cN * cI) * yp]
}
function elong(jd) {
    const T = (jd - 2451545) / 36525, D = norm(297.8501921 + 445267.1114034 * T), M = norm(357.5291092 + 35999.0502909 * T), Mp = norm(134.9633964 + 477198.8675055 * T);
    return norm(D + 6.289 * Math.sin(Mp * rad) - 0.186 * Math.sin(M * rad))
}
/* "?d=2026-02-19" mostra o céu de outra data (útil para demonstrar e testar) */
const skyJD = () => { const q = new URLSearchParams(location.search).get("d"), t0 = q ? Date.parse(q + "T12:00:00Z") : NaN; return (isNaN(t0) ? Date.now() : t0) / 864e5 + 2440587.5 };
const skyDate = () => new Date((skyJD() - 2440587.5) * 864e5).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "numeric", month: "long", year: "numeric" });
const distEM = () => { const j = skyJD(), a = helio("terra", j), b = helio("marte", j); return Math.hypot(a[0] - b[0], a[1] - b[1]) };
function orb(x, y, r, cols, sun, glow) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    if (hc) {
        ctx.fillStyle = cols[1];
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();
        return
    }
    const dx = sun[0] - x, dy = sun[1] - y, dl = Math.hypot(dx, dy) || 1, g = ctx.createRadialGradient(x + dx / dl * r * .45, y + dy / dl * r * .45, r * .1, x, y, r * 1.05);
    g.addColorStop(0, cols[0]);
    g.addColorStop(.55, cols[1]);
    g.addColorStop(1, cols[2]);
    if (glow && !calm) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = r * 1.1
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowBlur = 0
}
function hubScene() {
    const w = cv.clientWidth, h = cv.clientHeight, m = w < 700, P = PAL(), jd = skyJD();
    const top = 100, bot = m ? 230 : 134, cx = w / 2, cy = top + (h - top - bot) / 2, U = Math.max(40, Math.min((w - 24) / 2, (h - top - bot) / 2) / 1.72);
    const Ee = helio("terra", jd), Mm = helio("marte", jd), X = p => cx + p[0] * U, Y = p => cy - p[1] * U;
    const ed = Math.min(56, Math.max(30, U * .36)), md = ed * .53, od = ed * .27, ep = [X(Ee), Y(Ee)], mp = [X(Mm), Y(Mm)];
    const ml = Math.atan2(-Ee[1], -Ee[0]) + elong(jd) * rad, mdist = ed / 2 + 30, op = [ep[0] + Math.cos(ml) * mdist, ep[1] - Math.sin(ml) * mdist], sun = [cx, cy];
    const free = [[w - Math.max(80, w * .14), top + (h - top - bot) * .2], [w - Math.max(80, w * .14), top + (h - top - bot) * .82]];
    const pp = free.sort((a, b) => Math.min(Math.hypot(b[0] - mp[0], b[1] - mp[1]), Math.hypot(b[0] - ep[0], b[1] - ep[1])) - Math.min(Math.hypot(a[0] - mp[0], a[1] - mp[1]), Math.hypot(a[0] - ep[0], a[1] - ep[1])))[0];
    if (!hc) {
        let q = 11;
        const rn = () => (q = q * 16807 % 2147483647) / 2147483647;
        for (let i = 0; i < Math.round(w * h / 5200); i++) {
            ctx.fillStyle = `rgba(255,255,255,${.25 + rn() * .6})`;
            ctx.fillRect(rn() * w, rn() * h, rn() < .12 ? 2 : 1, rn() < .12 ? 2 : 1)
        }
    }
    ctx.lineWidth = hc ? 2 : 1;
    ctx.strokeStyle = hc ? "#fff" : "#ffffff30";
    ["terra", "marte"].forEach(k => {
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
            const p = helio(k, jd + PER[k] * i / 120);
            i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p))
        }
        ctx.stroke()
    });
    ctx.beginPath();
    ctx.arc(ep[0], ep[1], mdist, 0, 7);
    ctx.stroke();
    ctx.save();
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = hc ? "#fff" : "#5ce1e688";
    ctx.beginPath();
    ctx.moveTo(ep[0], ep[1]);
    ctx.lineTo(mp[0], mp[1]);
    ctx.stroke();
    const a = Math.atan2(pp[1] - cy, pp[0] - cx);
    [-.2, 0, .2].forEach(o => {
        const sx = cx + Math.cos(a + o) * U * 1.78, sy = cy + Math.sin(a + o) * U * 1.78, ang = Math.atan2(pp[1] - sy, pp[0] - sx), ex = pp[0] - Math.cos(ang) * 36, ey = pp[1] - Math.sin(ang) * 36;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke()
    });
    ctx.restore();
    if (hc) {
        ctx.fillStyle = P.sun;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, 7);
        ctx.fill();
        ctx.stroke()
    } else {
        const R = calm ? 30 : 64, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        g.addColorStop(0, "#fffbe0");
        g.addColorStop(.2, "#ffd166");
        g.addColorStop(.45, calm ? "#ffd16644" : "#ff9a3c66");
        g.addColorStop(1, "#ff9a3c00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 7);
        ctx.fill()
    }
    orb(ep[0], ep[1], ed / 2, ["#9be1ff", "#2f86e8", "#06163d"], sun, ATM.terra + "aa");
    orb(mp[0], mp[1], md / 2, ["#ffc08a", "#e0693a", "#2a0b08"], sun, ATM.marte + "88");
    orb(op[0], op[1], od / 2, ["#fffbea", "#cfc3a3", "#15141a"], sun, "#fff1c866");
    ctx.strokeStyle = hc ? "#fff" : "#5ce1e6";
    ctx.lineWidth = hc ? 3 : 1.5;
    [20, 29].forEach((r, i) => {
        ctx.globalAlpha = hc ? 1 : i ? .35 : .8;
        ctx.beginPath();
        ctx.arc(pp[0], pp[1], r, 0, 7);
        ctx.stroke()
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = hc ? "#fff" : "#5ce1e6";
    ctx.beginPath();
    ctx.arc(pp[0], pp[1], 4, 0, 7);
    ctx.fill();
    const H = document.querySelectorAll("#hubb .pl");
    if (!H.length) return;
    const place = (k, [x, y], d) => {
        const b = $(`#hubb [data-b="${k}"]`), z = Math.max(44, d + 14);
        b.style.left = x + "px";
        b.style.top = y + "px";
        b.style.width = b.style.height = z + "px"
    };
    place("terra", ep, ed);
    place("lua", op, od);
    place("marte", mp, md);
    place("espaco", pp, 58);
    /* Posição dos rótulos: tenta cada lado até achar um sem sobreposição e dentro da tela */
    const dy = op[1] - ep[1], inter = (a, b, g) => Math.max(0, Math.min(a.right + g, b.right) - Math.max(a.left - g, b.left)) * Math.max(0, Math.min(a.bottom + g, b.bottom) - Math.max(a.top - g, b.top));
    const cr = ["tr", "tl", "br", "bl"], pref = { terra: (dy < 0 ? ["b", "t", "r", "l"] : ["t", "b", "r", "l"]).concat(cr), lua: (dy < 0 ? ["t", "r", "l", "b"] : ["b", "r", "l", "t"]).concat(cr), marte: ["b", "t", "r", "l"].concat(cr), espaco: ["b", "t", "l", "r"].concat(cr) }, done = [];
    ["terra", "lua", "marte", "espaco"].forEach(k => {
        const b = $(`#hubb [data-b="${k}"]`), l = b.firstElementChild, others = [...H].filter(o => o !== b).map(o => o.getBoundingClientRect());
        const find = () => {
            let best = null;
            for (const sd of pref[k]) {
                b.dataset.side = sd;
                l.style.setProperty("--sx", "0px");
                let r = l.getBoundingClientRect();
                const sx = sd === "t" || sd === "b" ? (r.left < 8 ? 8 - r.left : r.right > w - 8 ? w - 8 - r.right : 0) : 0;
                l.style.setProperty("--sx", sx + "px");
                r = l.getBoundingClientRect();
                /* penalidade = área sobreposta a outros rótulos e corpos + o quanto sai da área útil */
                const pen = done.reduce((s, d) => s + inter(r, d, 3), 0) + others.reduce((s, o) => s + inter(r, o, 2), 0) + 40 * (Math.max(0, top - 14 - r.top) + Math.max(0, r.bottom - (h - bot + 30)) + Math.max(0, 6 - r.left) + Math.max(0, r.right - (w - 6)));
                if (!best || pen < best[0]) best = [pen, sd, sx];
                if (!pen) break
            }
            return best
        };
        l.classList.remove("mini");
        let best = find();
        /* ainda não coube: mostra só o nome (a contagem continua lida por leitores de tela) */
        if (best[0]) {
            l.classList.add("mini");
            const b2 = find();
            if (b2[0] < best[0]) best = b2; else l.classList.remove("mini")
        }
        b.dataset.side = best[1];
        l.style.setProperty("--sx", best[2] + "px");
        done.push(l.getBoundingClientRect())
    })
}
function proj(la, lo, c) {
    const p = la * rad, l = (lo - c.lng) * rad, p0 = c.lat * rad, v = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
    let x = Math.cos(p) * Math.sin(l), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
    if (v <= 0) {
        const h = Math.hypot(x, y) || 1;
        x /= h;
        y /= h
    }
    return [c.cx + x * c.R, c.cy - y * c.R, v > 0]
}
function blob(la, lo, r, c) {
    if (!proj(la, lo, c)[2]) return;
    const p = la * rad, d = r * rad;
    ctx.beginPath();
    for (let a = 0; a <= 360; a += 30) {
        const q = a * rad, p2 = Math.asin(Math.sin(p) * Math.cos(d) + Math.cos(p) * Math.sin(d) * Math.cos(q)), l2 = lo * rad + Math.atan2(Math.sin(q) * Math.sin(d) * Math.cos(p), Math.cos(d) - Math.sin(p) * Math.sin(p2)), [
            x,
            y
        ] = proj(p2 / rad, l2 / rad, c);
        a ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    }
    ctx.fill()
}
function line(pts, c) {
    ctx.beginPath();
    let on = 0;
    for (const [la, lo] of pts) {
        const [x, y, v] = proj(la, lo, c);
        v && on ? ctx.lineTo(x, y) : v ? ctx.moveTo(x, y) : 0;
        on = v
    }
    ctx.stroke()
}
function draw() {
    const w = cv.clientWidth, h = cv.clientHeight, dp = devicePixelRatio || 1;
    cv.width = w * dp;
    cv.height = h * dp;
    ctx.setTransform(dp, 0, 0, dp, 0, 0);
    ctx.clearRect(0, 0, w, h);
    pins = [];
    const b = cur.b, P = PAL();
    if (!b) return hubScene();
    const m = w < 700, its = ITEMS.filter(i => i.corpo === b);
    if (b === "espaco") {
        const sx = w * .16, sy = m ? h * .35 : h / 2, Rm = Math.min(w * .7, h * .7);
        ctx.strokeStyle = P.ring;
        ctx.lineWidth = P.lw;
        [.06, .1, .15, .2].forEach(r => {
            ctx.beginPath();
            ctx.arc(sx, sy, r * Rm, 0, 7);
            ctx.stroke()
        });
        ctx.fillStyle = P.sun;
        ctx.beginPath();
        ctx.arc(sx, sy, 11, 0, 7);
        ctx.fill();
        ctx.font = `${13 * parseFloat(getComputedStyle(document.documentElement).fontSize) / 16}px Lexend,system-ui`;
        its.forEach((it, i) => {
            const a = (-40 + i * (80 / Math.max(1, its.length - 1))) * rad, r = Math.sqrt(it.distancia_ua / 180) * Rm, x = sx + Math.cos(a) * r, y = sy + Math.sin(a) * r, on = it.id === cur.id;
            ctx.strokeStyle = on ? P.on : P.ln;
            ctx.lineWidth = on ? 3 + P.pr : P.lw;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.fillStyle = on ? P.on : P.off;
            ctx.beginPath();
            ctx.arc(x, y, on ? 8 : 5, 0, 7);
            ctx.fill();
            ctx.fillStyle = P.txt;
            ctx.fillText(it.nome, Math.min(x + 10, w - ctx.measureText(it.nome).width - 8), y - 8);
            pins.push([x, y, it.id])
        });
        return
    }
    const c = {
        lat: cam.lat,
        lng: cam.lng,
        cx: m ? w / 2 : w * .42,
        cy: m ? h * .28 : h / 2,
        R: Math.min(w, h) * (m ? .3 : .32) * cam.k
    }, [base, fs] = BL[b];
    ctx.fillStyle = base;
    if (!hc && !calm) {
        ctx.shadowColor = ATM[b] + "99";
        ctx.shadowBlur = c.R * .22
    }
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, c.R, 0, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.save();
    ctx.clip();
    fs.forEach(([col, l]) => {
        ctx.fillStyle = col;
        l.forEach(([la, lo, r]) => blob(la, lo, r, c))
    });
    if (P.grid) {
    ctx.strokeStyle = P.grid;
    ctx.lineWidth = 1;
    for (let la = -60; la <= 60; la += 30) line(Array.from({ length: 37 }, (_, i) => [
        la,
        -180 + i * 10
    ]), c);
    for (let lo = -180; lo < 150; lo += 30) line(Array.from({ length: 19 }, (_, i) => [
        -90 + i * 10,
        lo
    ]), c);
    }
    if (!hc) {
        const sh = ctx.createRadialGradient(c.cx - c.R * .4, c.cy - c.R * .4, c.R * .1, c.cx, c.cy, c.R * 1.05);
        sh.addColorStop(0, "#ffffff2e");
        sh.addColorStop(.55, "#00000000");
        sh.addColorStop(1, "#0a0830aa");
        ctx.fillStyle = sh;
        ctx.fillRect(c.cx - c.R, c.cy - c.R, c.R * 2, c.R * 2)
    }
    ctx.restore();
    ctx.strokeStyle = hc ? "#fff" : "#ffffff66";
    ctx.lineWidth = 2 + P.pr - 2;
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, c.R, 0, 7);
    ctx.stroke();
    its.forEach(it => {
        if (it.lat == null) return;
        const [x, y, v] = proj(it.lat, it.lng, c);
        if (!v) return;
        const on = it.id === cur.id;
        ctx.fillStyle = on ? P.on : "#fff";
        ctx.strokeStyle = on ? "#fff" : P.edge;
        ctx.lineWidth = 2 + P.pr - 2 + (hc ? 1 : 0);
        ctx.beginPath();
        ctx.arc(x, y, on ? 9 : 6, 0, 7);
        ctx.fill();
        ctx.stroke();
        if (on) {
            ctx.strokeStyle = P.on;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, 7);
            ctx.stroke()
        }
        pins.push([x, y, it.id])
    })
}
function fly(la, lo, k) {
    cancelAnimationFrame(tw);
    if (calm) {
        cam = { lat: la, lng: lo, k };
        return draw()
    }
    const a = { ...cam }, dl = ((lo - a.lng + 540) % 360) - 180, t0 = performance.now();
    (function f(n) {
        const u = Math.min(1, (n - t0) / 900), e = u * u * (3 - 2 * u);
        cam = { lat: a.lat + (la - a.lat) * e, lng: a.lng + dl * e, k: a.k + (k - a.k) * e };
        draw();
        if (u < 1) tw = requestAnimationFrame(f)
    })(t0)
}
const fmtC = (la, lo) => `${nf(Math.abs(la).toFixed(1))}° ${la>=0?"N":"S"}, ${nf(Math.abs(lo).toFixed(1))}° ${lo>=0?t().E:t().W}`;
function cardHtml(it) {
    const d = it.corpo === "espaco", hs = g(it, "historia").replace(/(O que é:|O que descobriu:|Onde está hoje:|What it is:|What it found:|Where it is today:)/g, "<br><b>$1</b>").replace(/^<br>/, "");
    let x = `<h2 id="ct">${it.nome}</h2><small>${t().st[it.status]||it.status} · ${it.ano}</small><p>${hs}</p><p><b>${t().seen}:</b> ${g(it,"descricao_visual")}</p><p><b>${t().last}:</b> ${g(it,"ultimo_sinal")}</p>`;
    if (g(it, "por_que_ficou")) x += `<p><b>${t().why}:</b> ${g(it,"por_que_ficou")}</p>`;
    if (it.lat != null) x += `<p>${fmtC(it.lat,it.lng)}<small>${t().pos}</small></p>`;
    if (d) x += `<p><b>${t().dist}:</b> ${nf(it.distancia_ua.toFixed(1))} UA (${it.data_distancia}) · ${t().sig} ${nf(Math.round(it.distancia_ua*8.317/60))} h</p>`;
    const rl = (it.relacionados || []).map(r => ITEMS.find(i => i.id === r)).filter(Boolean);
    if (rl.length) x += `<p><b>${t().rel}:</b></p><div class="row">${rl.map(r => `<button data-go="${r.corpo}/${r.id}">${r.nome}</button>`).join("")}</div>`;
    return x + `<div class="row"><button id="ls">${t().listen}</button><button id="cl">${t().close}</button></div>`
}
const up = () => { location.hash = cur.id ? "#" + cur.b : "" };
function render(quiet) {
    const [b, id] = location.hash.slice(1).split("/"), it = ITEMS.find(i => i.id === id && i.corpo === b);
    const nb = BODIES.includes(b) ? b : "", ni = it ? id : "";
    const prev = { ...cur };
    cur = { b: nb, id: ni };
    if (ni !== prev.id && "speechSynthesis" in window) speechSynthesis.cancel();
    if (ni && !seenIds.has(ni)) {
        seenIds.add(ni);
        ls("seen", JSON.stringify([...seenIds]))
    }
    const tt = t(), A = $("#app");
    if (nb !== prev.b || ni !== prev.id) {
        A.classList.remove("scan");
        void A.offsetWidth;
        A.classList.add("scan")
    }
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-t]").forEach(e => e.textContent = tt[e.dataset.t]);
    $("#h1").lang = "pt-BR";
    $("#lp").setAttribute("aria-pressed", lang === "pt");
    $("#le").setAttribute("aria-pressed", lang === "en");
    $("#hint").textContent = tt.hint;
    const dEM = distEM();
    $("#hubb").innerHTML = BODIES.map(k => {
        const n = ITEMS.filter(i => i.corpo === k).length, dn = ITEMS.filter(i => i.corpo === k && seenIds.has(i.id)).length;
        return `<button class="pl" data-b="${k}"><span class="lbl"><b>${tt.nm[k]}</b><small>${n} ${n===1?tt.item:tt.items} · ${dn}/${n} ${tt.explored}${n && dn === n ? " ✓" : ""}</small></span></button>`
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
        $("#ul").innerHTML = ITEMS.filter(i => i.corpo === nb).map(i => `<li><button data-id="${i.id}"${i.id===ni?' aria-current="true"':""}>${i.nome}<small>${tt.st[i.status]||i.status} · ${i.ano}${seenIds.has(i.id) ? " · ✓ " + tt.visited : ""}</small></button></li>`).join("")
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
            if (S.speaking) {
                S.cancel();
                return
            }
            const u = new SpeechSynthesisUtterance([it.nome, g(it, "historia"), g(it, "descricao_visual"), t().last + ": " + g(it, "ultimo_sinal")].join(". "));
            u.lang = lang === "pt" ? "pt-BR" : "en-US";
            const done = () => { L.textContent = t().listen };
            u.onend = u.onerror = done;
            L.textContent = t().stop;
            S.speak(u)
        }
        K.onclick = e => {
            const x = e.target.closest("[data-go]");
            if (x) location.hash = "#" + x.dataset.go
        }
    }
    if (nb !== prev.b) {
        if (nb && nb !== "espaco") {
            cam = { lat: DV[nb][0], lng: DV[nb][1], k: 1 }
        }
        draw()
    }
    if (it && it.lat != null && (nb !== prev.b || ni !== prev.id)) fly(it.lat, it.lng, 2.4);
    else if (nb && nb !== "espaco" && (prev.id || nb !== prev.b) && !it) fly(DV[nb][0], DV[nb][1], 1);
    else draw();
    libras();
    if (!quiet) {
        if (nb !== prev.b) $("#live").textContent = `${tt.scr}: ${nb?tt.nm[nb]:"Hub"}. ${nb?ITEMS.filter(i=>i.corpo===nb).length+" "+tt.items+". ":""}${sealT}`;
        if (ni && ni !== prev.id) K.focus();
        else if (!ni && prev.id && nb === prev.b) $(`#ul [data-id="${prev.id}"]`)?.focus();
        else if (!nb && prev.b) $(`#hubb [data-b="${prev.b}"]`)?.focus()
    }
}
$("#hubb").onclick = e => {
    const x = e.target.closest("[data-b]");
    if (x) location.hash = "#" + x.dataset.b
};
$("#ul").onclick = e => {
    const x = e.target.closest("[data-id]");
    if (x) location.hash = `#${cur.b}/${x.dataset.id}`
};
cv.onclick = e => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, p = pins.find(q => Math.hypot(q[
        0
    ] - x, q[1] - y) < 16);
    if (p) location.hash = `#${cur.b}/${p[2]}`
};
$("#back").onclick = up;
document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || $("#dlg").open) return;
    if (!$("#ap").hidden) {
        $("#ap").hidden = true;
        $("#ab").setAttribute("aria-expanded", "false");
        return
    }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    up()
});
let vlOn = 0;
function libras() {
    const on = lang === "pt";
    document.querySelectorAll("#libras,#vlibras-access-wrapper,#vlibras-app-root").forEach(e => e.hidden = !on);
    if (!on) {
        try { window.VLibrasWidget?.toggle?.(false) } catch (e) {}
        return
    }
    if (vlOn) return;
    vlOn = 1;
    const sc = document.createElement("script");
    sc.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    sc.async = true;
    sc.onload = () => {
        try { new window.VLibras.Widget("https://vlibras.gov.br/app") } catch (e) { return }
        let n = 0;
        const iv = setInterval(() => {
            const a = window.VLibrasWidget?.access;
            if (a) {
                a.style.top = "auto";
                a.style.right = "16px";
                a.style.bottom = "calc(16px + env(safe-area-inset-bottom,0px))";
                clearInterval(iv)
            } else if (++n > 50) clearInterval(iv)
        }, 100)
    };
    document.body.appendChild(sc)
}
const setLang = l => {
    lang = l;
    ls("lang", l);
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    render(true)
};
$("#lp").onclick = () => setLang("pt");
$("#le").onclick = () => setLang("en");
$("#ab").onclick = () => {
    const o = $("#ap").hidden;
    $("#ap").hidden = !o;
    $("#ab").setAttribute("aria-expanded", o)
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
    draw()
};
$("#chc").onchange = e => {
    hc = e.target.checked;
    ls("hc", hc ? "1" : "0");
    mode()
};
$("#fsz").onchange = e => {
    fsz = parseInt(e.target.value) || 0;
    ls("fsz", fsz);
    mode()
};
$("#csp").onchange = e => {
    sp = e.target.checked;
    ls("sp", sp ? "1" : "0");
    mode()
};
$("#cca").onchange = e => {
    calm = e.target.checked;
    ls("calm", calm ? "1" : "0");
    mode()
};
function about() {
    const tt = t(), D = $("#dlg");
    $("#dt").textContent = tt.about;
    $("#dn").textContent = tt.note;
    $("#dc").textContent = tt.close;
    D.lang = lang;
    $("#dl").innerHTML = ITEMS.map(i => `<li><b>${i.nome}</b><br>${tt.src}: ${i.fonte.startsWith("http")?`<a href="${i.fonte}" target="_blank" rel="noopener">${i.fonte}</a>`:tt.pend}<br><small>${tt.cons}: ${i.data_consulta==="pendente"?tt.pend:i.data_consulta}</small></li>`).join("");
    D.showModal()
}
$("#rs").onclick = () => {
    seenIds.clear();
    ls("seen", "[]");
    render(true)
};
$("#ad").onclick = about;
$("#fd").onclick = about;
$("#app").addEventListener("animationend", e => { if (e.animationName === "scan") e.currentTarget.classList.remove("scan") });
addEventListener("resize", draw);
addEventListener("hashchange", () => render());
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
