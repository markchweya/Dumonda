import * as T from 'three';
import { clay, mesh, box, cyl, blob, poster, glow, tex, lerp, h1 } from './kit.js';

const BOOKS = [0xc65a43, 0x2f6d8a, 0xe2ad45, 0x5c9463, 0x8656a0, 0xd1813d, 0x38807a, 0xeee5d0, 0x2c2933];
function shell(s, wall, floor, planks = true) {
  s.add(mesh(new T.PlaneGeometry(16, 9), clay(wall, { r: .96, b: .45 }), 0, 4.5, -1.6, false, true));
  const ft = planks ? tex(1024, 1024, (c, W, H) => { for (let i = 0; i < 9; i++) { const y = i * H / 9, v = 205 + h1(i) * 50; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(0, y, W, H / 9); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(0, y, W, 3); c.fillRect(h1(i + 5) * W, y, 3, H / 9); } }, [2, 3]) : null;
  const fm = new T.MeshStandardMaterial({ color: floor, roughness: .55, map: ft });
  const f = mesh(new T.PlaneGeometry(16, 10), fm, 0, 0, 3.4, false, true); f.rotation.x = -1.5708; s.add(f);
  s.add(box(16, .16, .04, clay(new T.Color(wall).multiplyScalar(.55).getHex()), 0, .08, -1.58, .01, false));
}
function rug(s, x, z, r, col) { const m = mesh(new T.CylinderGeometry(r, r, .02, 64), clay(col, { b: 4, r: 1 }), x, .012, z, false, true); s.add(m); }
function desk(s, top, leg) {
  const t = clay(top, { r: .55 }), l = clay(leg, { r: .5 });
  s.add(box(1.62, .06, .8, t, .5, .74, -.05, .025));
  for (const [x, z] of [[-.24, .28], [1.24, .28], [-.24, -.38], [1.24, -.38]]) s.add(cyl(.028, .02, .72, l, x, .36, z));
}
function bookStack(s, x = .47, z = 0) {
  const st = [[.62, .05, 0x2f6d8a], [.56, .06, 0xeee5d0], [.6, .045, 0xc65a43]]; let y = .77;
  st.forEach(([w, h, c], i) => { const b = box(w, h, .36, clay(c), x + (h1(i) - .5) * .04, y + h / 2, z, .012); b.rotation.y = (h1(i + 2) - .5) * .18; s.add(b); y += h; });
}
function laptop(s, x, z, ry, draw) {
  const g = new T.Group(); g.position.set(x, .775, z); g.rotation.y = ry; const b = clay(0x3a3a44, { r: .4, nobump: true });
  g.add(box(.38, .018, .25, b, 0, 0, 0, .008)); const sc = new T.Group(); sc.position.set(0, .008, -.12); sc.rotation.x = -.24; g.add(sc);
  sc.add(box(.38, .24, .014, b, 0, .12, 0, .01), poster(.35, .215, draw, 0, .12, .008, 0, true)); s.add(g);
}
function monitor(s, x, y, z, w, h, draw, ry = 0) {
  const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry; const b = clay(0x24242b, { r: .45, nobump: true });
  g.add(box(w + .04, h + .04, .03, b, 0, h / 2 + .14, 0, .02), box(.05, .14, .03, b, 0, .07, -.015, .01), box(.24, .014, .15, b, 0, .007, 0, .006), poster(w, h, draw, 0, h / 2 + .14, .0165, 0, true)); s.add(g);
}
function mug(s, x, z, color, label) {
  const g = new T.Group(); g.position.set(x, .77, z); const m = clay(color, { r: .4, nobump: true }); g.add(cyl(.05, .046, .11, m, 0, .055, 0), cyl(.044, .044, .004, clay(0x3a2015, { nobump: true }), 0, .105, 0));
  g.add(mesh(new T.TorusGeometry(.027, .0085, 10, 18), m, .056, .055, 0)); if (label) g.add(poster(.075, .05, label, 0, .056, .0505)); s.add(g);
}
function plant(s, x, y, z, sc = 1, pot = 0xc47552) {
  const g = new T.Group(); g.position.set(x, y, z); g.scale.setScalar(sc); g.add(cyl(.1, .072, .15, clay(pot), 0, .075, 0)); const a = clay(0x4a9259), b = clay(0x327047);
  for (let i = 0; i < 10; i++) { const r = i / 10 * 6.283, L = .17 + h1(i) * .17, l = mesh(blob(.05, L, .015), i % 2 ? a : b, Math.cos(r) * .05, .16 + L * .85, Math.sin(r) * .05); l.rotation.z = -Math.cos(r) * .55; l.rotation.x = Math.sin(r) * .55; g.add(l); }
  s.add(g);
}
function books(s, x, y, z, width, maxH = .26) { let cx = x, i = 0; while (cx < x + width) { const w = .028 + h1(i * 3.3 + x) * .03, h = maxH * (.68 + h1(i * 1.7 + x) * .32), bk = box(w, h, .13, clay(BOOKS[Math.floor(h1(i * 7.1 + y) * BOOKS.length)]), cx + w / 2, y + h / 2, z, .006); s.add(bk); cx += w + .004; i++; } }
function frameWin(s, x, y, z, w, h, col, sky, cols = 2, rows = 2) {
  s.add(poster(w, h, sky, x, y, z - .005, 0, true)); const f = clay(col, { r: .6, nobump: true }), t = .05;
  s.add(box(w + 2 * t, t, .08, f, x, y + h / 2 + t / 2, z, .012), box(w + 2 * t, t, .12, f, x, y - h / 2 - t / 2, z + .02, .012), box(t, h, .08, f, x - w / 2 - t / 2, y, z, .012), box(t, h, .08, f, x + w / 2 + t / 2, y, z, .012));
  for (let i = 1; i < cols; i++) s.add(box(.024, h, .04, f, x - w / 2 + i * w / cols, y, z, .006)); for (let i = 1; i < rows; i++) s.add(box(w, .024, .04, f, x, y - h / 2 + i * h / rows, z, .006));
}
function note(s, x, y, z, rot, text, color = '#ffe27a') { const p = poster(.22, .22, (c, w, h) => { c.fillStyle = color; c.fillRect(0, 0, w, h); c.fillStyle = '#3b3020'; c.textAlign = 'center'; c.font = '700 27px Caveat'; text.split('\n').forEach((l, i, a) => c.fillText(l, w / 2, h / 2 + (i - (a.length - 1) / 2) * 29 + 8)); }, x, y, z); p.rotation.z = rot; s.add(p); }
const term = lines => (c, w, h) => { c.fillStyle = '#100e12'; c.fillRect(0, 0, w, h); const fs = Math.round(h / 12); c.font = `500 ${fs}px "JetBrains Mono"`; lines.forEach(([t, col], i) => { c.fillStyle = col; c.fillText(t, fs * .7, fs * 1.45 + i * fs * 1.3); }); };
const chat = (title, sub) => (c, w, h) => { c.fillStyle = '#f7f2e8'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f1a17'; c.font = '700 22px "Bricolage Grotesque"'; c.fillText(title, 18, 42); c.fillStyle = '#7a6d62'; c.font = '500 16px Inter'; sub.forEach((t, i) => c.fillText(t, 18, 76 + i * 24)); };
function pendant(s, x, col = 0xffb36a, shade = 0x24463d) { s.add(cyl(.004, .004, 1.3, clay(0x151210, { nobump: true }), x, 2.75, -.25, 6)); s.add(cyl(.04, .16, .14, clay(shade, { r: .4 }), x, 2.05, -.25)); s.add(mesh(new T.SphereGeometry(.036, 12, 10), new T.MeshStandardMaterial({ color: 0xffe8b5, emissive: 0xffb55f, emissiveIntensity: 3 }), x, 1.98, -.25, false, false)); const l = new T.PointLight(col, 3.2, 4.5, 1.6); l.position.set(x, 1.9, .1); s.add(l); glow(s, x, 1.98, -.23, .55, col, .42); }

export const THEMES = {
  // deep teal study at night, coral lamp, cold monitor glow
  midnight(s) {
    shell(s, 0x1f5660, 0x5c3d2e); rug(s, -.1, .55, 1.6, 0xc9553a); desk(s, 0xd3a878, 0x1f2024); bookStack(s);
    frameWin(s, -1.1, 2.15, -1.56, 1.2, 1.35, 0x143a42, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#070b22'); g.addColorStop(1, '#223a70'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 100; i++) { c.fillStyle = `rgba(255,255,255,${h1(i) * .7})`; c.fillRect(h1(i + 2) * w, h1(i + 5) * h * .6, 2, 2); }
      for (let i = 0; i < 11; i++) { const bw = 60 + h1(i + 9) * 60, bh = h * (.25 + h1(i + 3) * .35), x = i * w / 10 - 25; c.fillStyle = '#0b1026'; c.fillRect(x, h - bh, bw, bh); for (let a = 0; a < 5; a++) for (let b = 0; b < 12; b++) if (h1(i * 17 + a * 5 + b) > .65) { c.fillStyle = '#f6c964'; c.fillRect(x + 7 + a * 19, h - bh + 9 + b * 26, 9, 13); } }
    });
    s.add(box(1.3, .045, .22, clay(0x4a2f22), .8, 2.32, -1.48, .01)); books(s, .22, 2.345, -1.47, .95);
    note(s, .38, 1.76, -1.58, -.07, 'I changed\nnothing'); note(s, .68, 1.82, -1.58, .05, 'it worked\nan hour ago', '#ff9fb0'); note(s, 1.0, 1.74, -1.58, -.03, 'do not\ntouch', '#a5e8d2');
    monitor(s, .86, .77, -.33, .68, .42, term([['$ npm run dev', '#8d8590'], ['BUILD FAILED', '#ff6b5b'], ['TypeError: undefined', '#ff6b5b'], ["reading 'map'", '#ff6b5b'], ['at BudgetList:14', '#8d8590'], ['$ git diff --stat', '#f4d06f'], ['11 files changed', '#f4d06f']]), -.14);
    laptop(s, -.03, .08, .72, term([['$ claude', '#7bd88f'], ['Reading 142 files', '#a79fa8'], ['> why is it broken', '#ffb077']]));
    const can = clay(0xe24e6b, { r: .3, m: .35, nobump: true }); for (const [r, n] of [[0, 3], [1, 2], [2, 1]]) for (let i = 0; i < n; i++) s.add(cyl(.028, .028, .115, can, 1.0 + i * .06 + r * .03, .83 + r * .115, .12));
    mug(s, -.2, .25, 0xf1ebdf); plant(s, -1.45, 0, -.9, 1.7);
    glow(s, .86, 1.05, -.2, 1.5, 0xff6b5b, .1); const a = new T.PointLight(0xffa878, 2.6, 5.5, 1.6); a.position.set(1.5, 1.7, .9); s.add(a); const b = new T.PointLight(0x79b8ff, 1.8, 3.2, 1.8); b.position.set(-.1, 1.2, .55); s.add(b);
    return { hemi: [0x9fd0d6, 0x1c2228, 1.15], key: [0xffd2a8, 2.1, [-2.2, 3.7, 3.2]], exp: 1.02, env: .32 };
  },
  // sage green sunlit office, sticky notes full of repeated context
  morning(s) {
    shell(s, 0x7fa282, 0xa8784e); rug(s, -.1, .55, 1.6, 0xd98a5f); desk(s, 0xecd0a2, 0x3b3b3d); bookStack(s);
    frameWin(s, -.92, 2.2, -1.56, 1.5, 1.55, 0xfbf6ea, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#73bdec'); g.addColorStop(1, '#e4f2f6'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.92)';
      for (const [x, y, r] of [[.2, .2, 60], [.28, .22, 75], [.37, .2, 50], [.68, .34, 55], [.75, .36, 70], [.83, .35, 45]]) { c.beginPath(); c.arc(x * w, y * h, r, 0, 6.3); c.fill(); }
      c.fillStyle = '#82b277'; c.beginPath(); c.moveTo(0, h * .82); c.quadraticCurveTo(w * .3, h * .66, w * .6, h * .8); c.quadraticCurveTo(w * .85, h * .9, w, h * .74); c.lineTo(w, h); c.lineTo(0, h); c.fill();
    });
    [['React', '#ffe27a'], ['Tailwind', '#a5e8d2'], ['Due Friday', '#ff9fb0'], ['so basically', '#ffe27a'], ['React', '#ffc690'], ['as I said', '#a5e8d2'], ['Tailwind', '#ffe27a'], ['React (again)', '#ff9fb0']].forEach(([t, c], i) => note(s, .32 + (i % 4) * .3 + h1(i) * .03, 2.42 - Math.floor(i / 4) * .3 + h1(i + 4) * .03, -1.58, (h1(i + 7) - .5) * .16, t, c));
    s.add(box(1.25, .045, .22, clay(0xc79a68), .78, 1.72, -1.48, .01)); books(s, .25, 1.745, -1.47, .55); plant(s, 1.15, 1.74, -1.47, .62);
    monitor(s, .86, .77, -.33, .68, .42, chat('New chat #47', ['so basically...', 'so basically...', 'so basically...']), -.14);
    laptop(s, -.03, .08, .72, chat('New chat', ['So basically I am', 'building a budgeting...']));
    mug(s, -.2, .25, 0xd9744f); plant(s, -1.45, 0, -.9, 1.7, 0xefe7d6);
    const sun = new T.PointLight(0xfff0cf, 5, 8, 1.4); sun.position.set(-1, 2.4, 1.2); s.add(sun);
    return { hemi: [0xfff6e6, 0xa08560, 1.25], key: [0xfff0d0, 2.2, [-2.6, 4, 3]], exp: .82, env: .3 };
  },
  // brick cafe at dusk with a chalkboard joke
  cafe(s) {
    const br = tex(1024, 1024, (c, w, h) => { c.fillStyle = '#6f3f30'; c.fillRect(0, 0, w, h); for (let r = 0; r < 18; r++) for (let k = 0; k < 8; k++) { const v = h1(r * 8 + k); c.fillStyle = `rgb(${150 + v * 45},${74 + v * 26},${52 + v * 16})`; c.fillRect(k * 128 + (r % 2) * 64 - 64, r * 57, 122, 51); } }, [4, 2.3]);
    s.add(mesh(new T.PlaneGeometry(16, 9), new T.MeshStandardMaterial({ map: br, roughness: .92 }), 0, 4.5, -1.6, false, true));
    const f = mesh(new T.PlaneGeometry(16, 10), new T.MeshStandardMaterial({ color: 0x4a3226, roughness: .5 }), 0, 0, 3.4, false, true); f.rotation.x = -1.5708; s.add(f);
    desk(s, 0xb07c50, 0x241a15); bookStack(s);
    frameWin(s, -.85, 2.15, -1.56, 1.45, 1.35, 0x241a15, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5d6aa3'); g.addColorStop(.5, '#e39b6d'); g.addColorStop(1, '#f7cf8e'); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 12; i++) { const bw = 70 + h1(i + 3) * 70, bh = h * (.2 + h1(i + 8) * .3), x = i * w / 10 - 25; c.fillStyle = '#3d2c38'; c.fillRect(x, h - bh, bw, bh); } }, 3, 2);
    s.add(poster(.78, .62, (c, w, h) => { c.fillStyle = '#1f2522'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7a5a3b'; c.lineWidth = 16; c.strokeRect(0, 0, w, h); c.fillStyle = '#f2eedf'; c.textAlign = 'center'; c.font = '700 66px Caveat'; c.fillText('Today', w / 2, 82); c.font = '700 44px Caveat'; ['Make it better  $4', 'Fix it  $4', 'Do the thing  $6', 'Context: sold out'].forEach((t, i) => c.fillText(t, w / 2, 146 + i * 72)); }, .85, 2.2, -1.58));
    pendant(s, -.2); pendant(s, 1.08);
    laptop(s, -.03, .08, .72, chat('> make it better', ['Make what better?']));
    mug(s, 1.02, .12, 0xf1ebdf, (c, w, h) => { c.fillStyle = '#f1ebdf'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2015'; c.textAlign = 'center'; c.font = '700 21px Caveat'; c.fillText('fix it', w / 2, 27); }); mug(s, -.2, .25, 0x24463d);
    plant(s, -1.45, 0, -.9, 1.7, 0x3a2a20);
    return { hemi: [0xffd3ac, 0x3f261b, 1.15], key: [0xffc097, 2.3, [-2.6, 3.4, 3]], exp: 1.02, env: .3 };
  },
  // indigo dorm bedroom: bed, laundry, a single desk lamp, the night before
  bedroom(s) {
    shell(s, 0x3b3f78, 0x8a6547); rug(s, -.1, .55, 1.6, 0xe8b64c); desk(s, 0xdab487, 0x2a2730); bookStack(s);
    frameWin(s, -1.1, 2.2, -1.56, 1.1, 1.25, 0x262a56, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a0f30'); g.addColorStop(1, '#3a4f8f'); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,255,255,${h1(i) * .8})`; c.fillRect(h1(i + 1) * w, h1(i + 4) * h, 2, 2); } c.fillStyle = '#f6efd4'; c.beginPath(); c.arc(w * .68, h * .24, 42, 0, 6.3); c.fill(); });
    s.add(box(1.3, .045, .22, clay(0x2f2b4f), .8, 2.3, -1.48, .01)); books(s, .22, 2.325, -1.47, .95);
    s.add(poster(.3, .36, (c, w, h) => { c.fillStyle = '#f5efe3'; c.fillRect(0, 0, w, h); c.fillStyle = '#c65a43'; c.fillRect(0, 0, w, h * .2); c.fillStyle = '#fff'; c.font = '700 30px "Bricolage Grotesque"'; c.textAlign = 'center'; c.fillText('NOV', w / 2, h * .14); c.fillStyle = '#6a5e55'; c.font = '500 16px Inter'; for (let i = 0; i < 30; i++) c.fillText(i + 1, w * (.1 + (i % 7) * .133), h * (.31 + Math.floor(i / 7) * .13)); c.strokeStyle = '#c23a2c'; c.lineWidth = 5; c.beginPath(); c.arc(w * .366, h * .31, 19, 0, 6.3); c.stroke(); c.fillStyle = '#c23a2c'; c.font = '700 30px Caveat'; c.fillText('EXAM (!!!)', w / 2, h * .95); }, .5, 1.7, -1.58));
    note(s, .95, 1.78, -1.58, .05, 'read the\nPDF', '#ffe27a'); note(s, 1.22, 1.68, -1.58, -.06, 'seriously\nread it', '#ff9fb0');
    // lamp
    const lg = new T.Group(); lg.position.set(1.08, .77, -.15); const brass = clay(0xd9472b, { nobump: true, r: .35 }); lg.add(cyl(.075, .085, .02, brass, 0, .01, 0), cyl(.008, .008, .3, brass, 0, .16, 0), cyl(.04, .11, .12, brass, 0, .35, 0)); s.add(lg);
    s.add(mesh(new T.SphereGeometry(.032, 10, 8), new T.MeshStandardMaterial({ emissive: 0xffd28a, emissiveIntensity: 3 }), 1.08, 1.08, -.15, false, false)); glow(s, 1.08, 1.08, -.13, .72, 0xffcb7e, .45);
    const l = new T.PointLight(0xffc27a, 5.5, 5, 1.55); l.position.set(1.08, 1.2, .3); s.add(l);
    laptop(s, -.03, .08, .72, (c, W, H) => { c.fillStyle = '#f7f2e8'; c.fillRect(0, 0, W, H); c.fillStyle = '#1f1a17'; c.font = '700 20px "Bricolage Grotesque"'; c.fillText('BIO201.pdf  p.1 of 40', 16, 34); c.fillStyle = '#ccc4b8'; for (let i = 0; i < 7; i++) c.fillRect(16, 54 + i * 15, W - 32 - h1(i) * 60, 7); });
    // paper piles and laundry
    for (let i = 0; i < 5; i++) { const p = box(.21, .004, .29, clay(0xf4efe4, { nobump: true }), .98 + h1(i) * .05, .775 + i * .006, .17 + h1(i + 3) * .04, .001, false); p.rotation.y = (h1(i + 8) - .5) * .5; s.add(p); }
    for (let i = 0; i < 5; i++) s.add(mesh(blob(.2 + h1(i) * .12, .1 + h1(i + 2) * .05, .16), clay(BOOKS[i % 5], { b: 3 }), 1.42 + h1(i + 9) * .35, .08 + i * .035, .55 + h1(i + 4) * .25));
    mug(s, -.2, .25, 0xf1ebdf); plant(s, -1.45, 0, -.9, 1.7, 0xc9553a);
    return { hemi: [0xb4b6f2, 0x25203a, 1.2], key: [0xffdcb8, 2.1, [-2.2, 3.5, 3.2]], exp: 1.05, env: .3 };
  },
};
