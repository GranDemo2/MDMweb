/* ============================================================
   Miguel De Mora · Filmmaker — app.js  (v02.3)
   · Brillo que sigue al cursor  (responde rápido, con ligero retardo)
   · Pulso que viaja por la página (se queda)
   · Polvo: cada mota se ENFOCA al cruzar una franja diagonal
     y reacciona al cursor (lo atrae y brilla cerca de él)
   · Destello azul al tocar el menú  (Proyectos | Contacto | Studio | Sobre mí)
     -> núcleo nítido y halo corto: brillo sí, desenfoque menos
   · Grano / ruido: ELIMINADO
   ============================================================ */
(function(){
"use strict";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const follow = document.querySelector(".bg__follow");
const pulse  = document.querySelector(".bg__pulse");
const dust   = document.getElementById("dust");
const dctx   = dust ? dust.getContext("2d") : null;
const burstCv = document.getElementById("bursts");
const bctx   = burstCv ? burstCv.getContext("2d") : null;
const tiles  = Array.prototype.slice.call(document.querySelectorAll(".tile"));

let W = innerWidth, H = innerHeight, DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ---------- puntero / energía ---------- */
let tx = W/2, ty = H/2, gx = W/2, gy = H/2;
let energy = 0, active = false;

// velocidad vertical del cursor (px/s, + hacia abajo / - hacia arriba)
let cursorVy = 0, lastY = null, lastYt = 0;

/* ---------- pulso que viaja ---------- */
const p = { x: W/2, y: H/2, tx: W/2, ty: H/2, env: 0, t: 0, T: 1 };
function newPulseCycle(){
  p.tx = W * (0.14 + Math.random()*0.72);
  p.ty = H * (0.14 + Math.random()*0.72);
  p.t  = 0;
  p.T  = 6500 + Math.random()*4000;
}
function stepPulse(dtMs){
  p.t += dtMs;
  let k = Math.min(p.t / p.T, 1);
  k = k < .5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2) / 2;   // smoothstep
  p.env = Math.sin(k * Math.PI);                          // 0 -> 1 -> 0
  const l = Math.min(1, dtMs * 0.0022);
  p.x += (p.tx - p.x) * l;
  p.y += (p.ty - p.y) * l;
  if (p.t >= p.T) newPulseCycle();
}

/* ---------- polvo (canvas) con banda diagonal enfocada ---------- */
function makeSprite(stops){
  const s = 64, c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  for (const st of stops) g.addColorStop(st[0], st[1]);
  x.fillStyle = g; x.fillRect(0, 0, s, s);
  return c;
}
// núcleo nítido  (mota enfocada: pequeña y brillante)
const spriteFoc = makeSprite([
  [0.00, "rgba(214,230,255,0.95)"],
  [0.35, "rgba(182,206,255,0.55)"],
  [0.70, "rgba(150,190,255,0.12)"],
  [1.00, "rgba(150,190,255,0)"]
]);
// halo difuso  (mota desenfocada: grande y tenue)
const spriteDef = makeSprite([
  [0.00, "rgba(150,190,255,0.30)"],
  [0.50, "rgba(140,180,255,0.15)"],
  [1.00, "rgba(140,180,255,0)"]
]);

// Franja diagonal: la distancia a su línea central da el foco (1 en la
// franja -> 0 lejos), con caída suave. Así cada mota se enfoca al
// cruzarla y vuelve a difuminarse, no hay "capas" enfocadas/difusas.
const band = { cx: 0, cy: 0, nx: 0, ny: 1, sigma: 1 };
function setBand(){
  band.cx = W / 2;
  band.cy = H / 2;
  const a = 0.60;                       // dirección de la franja (~34°)
  band.nx = -Math.sin(a);               // normal unitaria a la franja
  band.ny =  Math.cos(a);
  band.sigma = Math.max(120, Math.min(W, H) * 0.20);
}
function focusAt(x, y){
  const d = (x - band.cx) * band.nx + (y - band.cy) * band.ny;
  const g = d / band.sigma;
  return Math.exp(-0.5 * g * g);        // 1 en la franja -> 0 lejos
}

let motas = [];
function newMota(fresh){
  const m = {
    baseX: Math.random() * W,
    y: fresh ? (-20 - Math.random()*40) : Math.random()*H,
    r: 0.7 + Math.random()*1.9,         // tamaño (pequeño)
    baseFall: 4 + Math.random()*10,     // caída lenta (px/s)
    freq: 0.3 + Math.random()*0.6,      // Hz del vaivén
    sway: 4 + Math.random()*12,         // amplitud lateral (px)
    ph: Math.random() * Math.PI * 2,    // fase
    aFoc: 0.15 + Math.random()*0.30,    // brillo máx. del núcleo (subido ~50%)
    aDef: 0.06 + Math.random()*0.15     // brillo máx. del halo (subido ~50%)
  };
  return m;
}
function dustCount(){
  // menos motas que antes (más sutil, no "nieve")
  const base = Math.max(22, Math.min(70, W * H / 22000));
  return Math.round(base * 1.3);
}
function seedDust(){
  const n = dustCount();
  motas = [];
  for (let i = 0; i < n; i++) motas.push(newMota(false));
}

function sizeDust(){
  W = innerWidth; H = innerHeight;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  if (!dust) return;
  dust.width = W * DPR; dust.height = H * DPR;
  dust.style.width = W + "px"; dust.style.height = H + "px";
  dctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (burstCv){
    burstCv.width = W * DPR; burstCv.height = H * DPR;
    burstCv.style.width = W + "px"; burstCv.style.height = H + "px";
    if (bctx) bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  setBand();
}

let tSec = 0;
function drawDust(dtSec){
  if (!dctx) return;
  tSec += dtSec;

  // factor por velocidad del cursor:  sube -> flota | baja -> algo más rápido
  let factor = 1 + (cursorVy / 1000) * 1.2;
  factor = Math.max(0.15, Math.min(2.0, factor));

  dctx.clearRect(0, 0, W, H);
  dctx.globalCompositeOperation = "lighter";
  for (const m of motas){
    m.y += m.baseFall * factor * dtSec;
    if (m.y > H + 30){
      // reaparece por arriba con nueva aleatoriedad
      m.baseX = Math.random() * W;
      m.y = -20 - Math.random()*40;
      m.baseFall = 4 + Math.random()*10;
      continue;
    }
    const x = m.baseX + Math.sin(tSec * m.freq + m.ph) * m.sway;
    const flick = 0.5 - 0.5 * Math.cos(tSec * (0.4 + 0.6 * m.freq) + m.ph);
    const f = focusAt(x, m.y);

    // reactividad al cursor: las motas cercanas se acercan un poco y brillan más
    let prox = 0;
    if (active){
      const dx = tx - x, dy = ty - m.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 260){
        prox = 1 - dist / 260;
        m.baseX += (dx / dist) * prox * 60 * dtSec;
        m.y += (dy / dist) * prox * 60 * dtSec;
      }
    }

    // halo difuso: grande y tenue lejos de la franja, casi nada encima
    const Rd = m.r * (7 + 5 * (1 - f)) * (1 + 0.3 * flick);
    const aDef = m.aDef * (0.18 + 0.82 * (1 - f)) * (0.6 + 0.4 * flick) * (1 + prox * 1.1);
    if (aDef > 0.002){
      dctx.globalAlpha = aDef;
      dctx.drawImage(spriteDef, x - 2*Rd, m.y - 2*Rd, 4*Rd, 4*Rd);
    }

    // núcleo nítido: se ve al cruzar la franja y cerca del cursor
    const Rf = m.r * (1.0 + 0.5 * flick);
    const aFoc = m.aFoc * (f * f * (0.55 + 0.45 * flick) + prox * 0.4);
    if (aFoc > 0.002){
      dctx.globalAlpha = aFoc;
      dctx.drawImage(spriteFoc, x - 2*Rf, m.y - 2*Rf, 4*Rf, 4*Rf);
    }
  }
  dctx.globalAlpha = 1;
  dctx.globalCompositeOperation = "source-over";
}

/* ---------- destello azul al tocar el menú ---------- */
let bursts = [];
function spawnBurst(x, y){
  const n = 18;
  for (let i = 0; i < n; i++){
    const a = (i / n) * Math.PI * 2 + (Math.random()*0.6 - 0.3);
    const sp = 60 + Math.random()*170;
    bursts.push({
      x: x, y: y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 30,
      life: 0,
      ttl: 0.5 + Math.random()*0.25,
      r: 1.5 + Math.random()*2.6
    });
  }
}
function stepBursts(dtSec){
  if (!bursts.length) return;
  for (let i = bursts.length - 1; i >= 0; i--){
    const b = bursts[i];
    b.life += dtSec;
    if (b.life >= b.ttl){ bursts.splice(i, 1); continue; }
    b.x += b.vx * dtSec;
    b.y += b.vy * dtSec;
    const drag = 1 - 2.3 * dtSec;
    b.vx *= drag; b.vy *= drag;
    b.vy += 60 * dtSec;
  }
}
function drawBursts(){
  if (!bctx) return;
  bctx.clearRect(0, 0, W, H);
  if (!bursts.length) return;
  bctx.save();
  bctx.globalCompositeOperation = "lighter";
  for (const b of bursts){
    const k = 1 - b.life / b.ttl;
    const a = Math.max(0, k) * 0.9;
    // halo corto y centro nítido: se ve el destello sin "mancha" difusa
    const rad = b.r * (0.6 + k * 1.8) * 1.7;
    const g = bctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rad);
    g.addColorStop(0, "rgba(226,240,255," + Math.min(1, a * 0.9).toFixed(3) + ")");
    g.addColorStop(0.35, "rgba(22,139,255," + (a * 0.55).toFixed(3) + ")");
    g.addColorStop(1, "rgba(22,139,255,0)");
    bctx.fillStyle = g;
    bctx.beginPath();
    bctx.arc(b.x, b.y, rad, 0, Math.PI * 2);
    bctx.fill();
  }
  bctx.restore();
}

/* ---------- eventos ---------- */
function setPointer(e){
  tx = e.clientX; ty = e.clientY;
  active = true;
  const now = performance.now();
  if (lastY == null){ lastY = e.clientY; lastYt = now; return; }
  const dy = e.clientY - lastY;
  const dtt = Math.max((now - lastYt) / 1000, 0.001);
  const inst = dy / dtt;
  if (isFinite(inst)) cursorVy = cursorVy * 0.35 + inst * 0.65;
  lastY = e.clientY; lastYt = now;
}

addEventListener("pointermove", e => setPointer(e), { passive: true });
addEventListener("pointerdown", e => setPointer(e), { passive: true });
addEventListener("pointerup",   () => { active = false; lastY = null; });
addEventListener("pointerleave",() => { active = false; lastY = null; });

function onTouch(e){
  const t = e.touches && e.touches[0];
  if (t) setPointer(t);
  if (e.touches && e.touches.length >= 2) active = false; // pellizco -> pausa
}
addEventListener("touchstart", onTouch, { passive: true });
addEventListener("touchmove",  onTouch, { passive: true });
addEventListener("touchend",   () => { active = false; lastY = null; }, { passive: true });

addEventListener("resize", () => { sizeDust(); seedDust(); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop(); else start();
});

/* destello + navegación (barra superior; respeta reduced-motion) */
document.querySelectorAll(".topbar a, [data-burst]").forEach(a => {
  a.addEventListener("click", e => {
    if (reduce) return;              // sin destello: navega al instante
    e.preventDefault();
    const r = a.getBoundingClientRect();
    const x = (e.clientX != null && e.clientX !== 0) ? e.clientX : (r.left + r.width / 2);
    const y = (e.clientY != null && e.clientY !== 0) ? e.clientY : (r.top + r.height / 2);
    spawnBurst(x, y);
    const href = a.getAttribute("href");
    window.setTimeout(() => { window.location.href = href; }, 520);
  });
});

/* ---------- bucle ---------- */
let rafId = null, running = false, lastFrame = 0;
function frame(t){
  rafId = requestAnimationFrame(frame);
  if (!lastFrame) lastFrame = t;
  let dt = t - lastFrame; lastFrame = t;
  if (dt > 50) dt = 50;
  const dtSec = dt / 1000;

  cursorVy *= Math.exp(-dtSec * 3.5);
  stepPulse(dt);

  const k = Math.min(1, dt * 0.0026);   // responde rápido (antes 0.0009), sigue con ligero retardo
  gx += (tx - gx) * k;
  gy += (ty - gy) * k;
  energy += ((active ? 1 : 0) - energy) * (1 - Math.exp(-dtSec * 4));

  if (follow){
    follow.style.transform =
      "translate(" + (gx - follow.offsetWidth / 2) + "px," + (gy - follow.offsetHeight / 2) + "px)";
    follow.style.setProperty("--follow-op", (0.35 + energy * 0.25).toFixed(3));
  }
  if (pulse){
    pulse.style.transform =
      "translate(" + (p.x - pulse.offsetWidth / 2) + "px," + (p.y - pulse.offsetHeight / 2) + "px)";
    pulse.style.opacity = (0.10 + p.env * 0.5).toFixed(3);
  }

  drawDust(dtSec);
  stepBursts(dtSec);
  drawBursts();

  if (tiles.length){
    const reach = 300 + energy * 140;
    for (const tl of tiles){
      const r = tl.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.hypot(cx - gx, cy - gy);
      if (d < reach){
        const s = 0.03 * (1 - d / reach);
        tl.style.transform = "scale(" + (1 + s).toFixed(4) + ")";
      } else if (tl.style.transform) tl.style.transform = "";
    }
  }
}
function start(){
  if (running) return;
  running = true; lastFrame = 0;
  rafId = requestAnimationFrame(frame);
}
function stop(){
  if (!running) return;
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

/* ---------- arranque ---------- */
sizeDust();
seedDust();
if (pulse) pulse.style.animation = "none";

if (reduce){
  // pulso fijo en el centro + un fotograma estático de polvo
  // (se ve la franja diagonal enfocada, sin animación)
  if (pulse){
    pulse.style.transform =
      "translate(" + (W/2 - pulse.offsetWidth / 2) + "px," + (H/2 - pulse.offsetHeight / 2) + "px)";
    pulse.style.opacity = "0.32";
  }
  if (dctx){
    tSec = 1.3;
    dctx.clearRect(0, 0, W, H);
    dctx.globalCompositeOperation = "lighter";
    for (const m of motas){
      const x = m.baseX;
      const flick = 0.7;
      const f = focusAt(x, m.y);

      const Rd = m.r * (7 + 5 * (1 - f)) * (1 + 0.3 * flick);
      const aDef = m.aDef * (0.18 + 0.82 * (1 - f)) * (0.6 + 0.4 * flick);
      if (aDef > 0.002){
        dctx.globalAlpha = aDef;
        dctx.drawImage(spriteDef, x - 2*Rd, m.y - 2*Rd, 4*Rd, 4*Rd);
      }

      const Rf = m.r * (1.0 + 0.5 * flick);
      const aFoc = m.aFoc * f * f * (0.55 + 0.45 * flick);
      if (aFoc > 0.002){
        dctx.globalAlpha = aFoc;
        dctx.drawImage(spriteFoc, x - 2*Rf, m.y - 2*Rf, 4*Rf, 4*Rf);
      }
    }
    dctx.globalAlpha = 1;
    dctx.globalCompositeOperation = "source-over";
  }
  return; // sin bucle rAF
}

newPulseCycle();
start();

})();
