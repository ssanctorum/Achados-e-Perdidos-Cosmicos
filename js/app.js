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
        st: { ativo: "Ativo", silencioso: "Silencioso", "concluído": "Concluído" },
        nm: { terra: "Terra", lua: "Lua", marte: "Marte", espaco: "Espaço profundo" },
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
        st: { ativo: "Active", silencioso: "Silent", "concluído": "Completed" },
        nm: { terra: "Earth", lua: "Moon", marte: "Mars", espaco: "Deep space" },
        E: "E",
        W: "W"
    }
};
let lang = ls("lang") || ((navigator.language || "pt").startsWith("en") ? "en" : "pt"), hc = ls("hc") === "1" || matchMedia("(prefers-contrast: more)").matches, calm = ls("calm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches;
let cur = { b: "", id: "" }, last = { b: "", id: "" }, cam = { lat: 15, lng: 0, k: 1 }, tw, pins = [];
const t = () => T[lang], g = (it, k) => it[k + "_" + lang], nf = n => lang === "pt" ? String(n).replace(".", ",") : String(n);
const ORB = {
    terra: "radial-gradient(circle at 35% 30%,#5bd37a 0 18%,#1f6fd1 20%)",
    lua: "radial-gradient(circle at 35% 30%,#d6dade,#8a9099)",
    marte: "radial-gradient(circle at 35% 30%,#f59a5c,#c4531e)",
    espaco: "radial-gradient(circle at 70% 35%,#fff 0 2px,transparent 3px),radial-gradient(circle,#1a1f55,#05081c)"
};
let s = 7;
const rnd = () => (s = s * 16807 % 2147483647) / 2147483647;
const BL = {
    terra: [
        "#1f6fd1",
        [["#3aa655", [[48, -100, 28], [-14, -60, 20], [6, 20, 24], [52, 75, 34], [-25, 134, 12]]]]
    ],
    lua: [
        "#9aa0a8",
        [
            [
                "#7d838b",
                Array.from({ length: 30 }, () => [
                    rnd() * 140 - 70,
                    rnd() * 360 - 180,
                    3 + rnd() * 6
                ])
            ]
        ]
    ],
    marte: [
        "#d9692f",
        [
            ["#b8501f", [[10, 60, 22], [-20, -100, 18], [20, -30, 12]]],
            ["#f3eadf", [[90, 0, 14], [-90, 0, 12]]]
        ]
    ]
};
const DV = { terra: [15, -45], lua: [8, 0], marte: [5, -20] };
const cv = $("#cv"), ctx = cv.getContext("2d");
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
    const b = cur.b;
    if (!b) return;
    const m = w < 700, its = ITEMS.filter(i => i.corpo === b);
    if (b === "espaco") {
        const sx = w * .16, sy = m ? h * .35 : h / 2, Rm = Math.min(w * .7, h * .7);
        ctx.strokeStyle = "#3fd0ff55";
        ctx.lineWidth = 1;
        [.06, .1, .15, .2].forEach(r => {
            ctx.beginPath();
            ctx.arc(sx, sy, r * Rm, 0, 7);
            ctx.stroke()
        });
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.arc(sx, sy, 11, 0, 7);
        ctx.fill();
        ctx.font = "13px system-ui";
        its.forEach((it, i) => {
            const a = (-40 + i * (80 / Math.max(1, its.length - 1))) * rad, r = Math.sqrt(it.distancia_ua / 180) * Rm, x = sx + Math.cos(a) * r, y = sy + Math.sin(a) * r, on = it.id === cur.id;
            ctx.strokeStyle = on ? "#ff9a3c" : "#3fd0ff88";
            ctx.lineWidth = on ? 3 : 1;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.fillStyle = on ? "#ff9a3c" : "#e8f4ff";
            ctx.beginPath();
            ctx.arc(x, y, on ? 8 : 5, 0, 7);
            ctx.fill();
            ctx.fillText(it.nome, x + 10, y - 8);
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
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, c.R, 0, 7);
    ctx.fill();
    ctx.save();
    ctx.clip();
    fs.forEach(([col, l]) => {
        ctx.fillStyle = col;
        l.forEach(([la, lo, r]) => blob(la, lo, r, c))
    });
    ctx.strokeStyle = "#ffffff26";
    ctx.lineWidth = 1;
    for (let la = -60; la <= 60; la += 30) line(Array.from({ length: 37 }, (_, i) => [
        la,
        -180 + i * 10
    ]), c);
    for (let lo = -180; lo < 150; lo += 30) line(Array.from({ length: 19 }, (_, i) => [
        -90 + i * 10,
        lo
    ]), c);
    ctx.restore();
    ctx.strokeStyle = "#3fd0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, c.R, 0, 7);
    ctx.stroke();
    its.forEach(it => {
        if (it.lat == null) return;
        const [x, y, v] = proj(it.lat, it.lng, c);
        if (!v) return;
        const on = it.id === cur.id;
        ctx.fillStyle = on ? "#ff9a3c" : "#fff";
        ctx.strokeStyle = on ? "#fff" : "#050b1f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, on ? 9 : 6, 0, 7);
        ctx.fill();
        ctx.stroke();
        if (on) {
            ctx.strokeStyle = "#ff9a3c";
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
    if (it.lat != null) x += `<p>${fmtC(it.lat,it.lng)}<small>${t().pos}</small></p>`;
    if (d) x += `<p><b>${t().dist}:</b> ${nf(it.distancia_ua.toFixed(1))} UA (${it.data_distancia}) · ${t().sig} ${nf(Math.round(it.distancia_ua*8.317/60))} h</p>`;
    return x + `<div class="row"><button id="ls">${t().listen}</button><button id="cl">${t().close}</button></div>`
}
const up = () => { location.hash = cur.id ? "#" + cur.b : "" };
function render(quiet) {
    const [b, id] = location.hash.slice(1).split("/"), it = ITEMS.find(i => i.id === id && i.corpo === b);
    const nb = BODIES.includes(b) ? b : "", ni = it ? id : "";
    const prev = { ...cur };
    cur = { b: nb, id: ni };
    const tt = t(), A = $("#app");
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-t]").forEach(e => e.textContent = tt[e.dataset.t]);
    $("#h1").lang = "pt-BR";
    $("#lp").setAttribute("aria-pressed", lang === "pt");
    $("#le").setAttribute("aria-pressed", lang === "en");
    $("#hint").textContent = tt.hint;
    $("#hubb").innerHTML = BODIES.map(k => {
        const n = ITEMS.filter(i => i.corpo === k).length;
        return `<button class="p pl" data-b="${k}"><span class="orb" style="background:${ORB[k]}"></span><b>${tt.nm[k]}</b><small>${n} ${n===1?tt.item:tt.items}</small></button>`
    }).join("");
    $("#hub").hidden = !!nb;
    $("#list").hidden = !nb;
    A.classList.toggle("item", !!ni);
    $("#back").disabled = !nb;
    const gl = nb && nb !== "espaco", sealT = gl ? tt.globe : tt.nsc;
    $("#seal").textContent = sealT;
    $("#seal").lang = lang;
    $("#bc").innerHTML = `<li>${tt.all}</li>` + (nb ? `<li>${tt.nm[nb]}</li>` : "") + (it ? `<li>${it.nome}</li>` : "");
    if (nb) {
        $("#lh").textContent = `${tt.list}: ${tt.nm[nb]}`;
        $("#ul").innerHTML = ITEMS.filter(i => i.corpo === nb).map(i => `<li><button data-id="${i.id}"${i.id===ni?' aria-current="true"':""}>${i.nome}<small>${tt.st[i.status]||i.status} · ${i.ano}</small></button></li>`).join("")
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
            const u = new SpeechSynthesisUtterance(it.nome + ". " + g(it, "historia") + " " + g(it, "descricao_visual"));
            u.lang = lang === "pt" ? "pt-BR" : "en-US";
            S.speak(u)
        }
    }
    if (nb !== prev.b) {
        if (nb && nb !== "espaco") {
            cam = { lat: DV[nb][0], lng: DV[nb][1], k: 1 }
        }
        draw()
    }
    if (it && it.lat != null) fly(it.lat, it.lng, 2.4);
    else if (nb && nb !== "espaco" && (prev.id || nb !== prev.b) && !it) fly(DV[nb][0], DV[nb][1], 1);
    else draw();
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
const setLang = l => {
    lang = l;
    ls("lang", l);
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
    $("#chc").checked = hc;
    $("#cca").checked = calm;
    draw()
};
$("#chc").onchange = e => {
    hc = e.target.checked;
    ls("hc", hc ? "1" : "0");
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
$("#ad").onclick = about;
$("#fd").onclick = about;
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
        $("#live").textContent = "Erro ao carregar data/items.json. Abra por um servidor (ex.: python3 -m http.server).";
    });
