import * as T from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const fr = x => x - Math.floor(x);
export const h1 = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453);

export function tex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
// fingerprint-y bump that gives every surface a handmade clay feel
let _bump;
function bump() {
  if (_bump) return _bump;
  const t = tex(512, 512, (c, w, h) => {
    c.fillStyle = '#808080'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { const v = 95 + h1(i) * 70; c.fillStyle = `rgba(${v},${v},${v},.22)`; c.beginPath(); c.ellipse(h1(i + 1) * w, h1(i + 2) * h, 6 + h1(i + 3) * 26, 4 + h1(i + 4) * 14, h1(i + 5) * 3, 0, 6.3); c.fill(); }
  }, [2, 2]); t.colorSpace = T.NoColorSpace; return (_bump = t);
}
export function clay(color, o = {}) {
  return new T.MeshStandardMaterial({ color, roughness: o.r ?? .66, metalness: o.m ?? 0, bumpMap: o.nobump ? null : bump(), bumpScale: o.b ?? 1.1, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, map: o.map ?? null });
}
export function mesh(geo, mat, x = 0, y = 0, z = 0, cast = true, recv = true) { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; return m; }
// smooth blob with optional deformation; uv from direction so bump maps apply
export function blob(sx, sy, sz, fn, detail = 14) {
  let g = new T.IcosahedronGeometry(1, detail); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g, 1e-4);
  const p = g.attributes.position, v = new T.Vector3(), uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const u = v.clone(); if (fn) fn(v, u);
    uv[i * 2] = Math.atan2(u.z, u.x) / 6.283 + .5; uv[i * 2 + 1] = u.y * .5 + .5;
    p.setXYZ(i, v.x * sx, v.y * sy, v.z * sz);
  }
  g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.computeVertexNormals(); return g;
}
export function limb(r1, r2, len) { const g = new T.CylinderGeometry(r1, r2, len, 18, 3); g.translate(0, -len / 2, 0); return g; }
export const rbox = (w, h, d, r = .012) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.05, h / 2.05, d / 2.05));
export const box = (w, h, d, mat, x, y, z, r, c = true, re = true) => mesh(rbox(w, h, d, r), mat, x, y, z, c, re);
export const cyl = (rt, rb, h, mat, x, y, z, seg = 20) => mesh(new T.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);

export function poster(w, h, draw, x, y, z, ry = 0, glow = false) {
  const t = tex(Math.round(w * 800), Math.round(h * 800), draw);
  const m = glow ? new T.MeshBasicMaterial({ map: t }) : new T.MeshStandardMaterial({ map: t, roughness: .86 });
  const p = mesh(new T.PlaneGeometry(w, h), m, x, y, z, false, !glow); p.rotation.y = ry; return p;
}
let _g; const glowT = () => _g || (_g = tex(128, 128, (c, w) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); }));
export function glow(s, x, y, z, size, col, op = .5) { const sp = new T.Sprite(new T.SpriteMaterial({ map: glowT(), color: col, transparent: true, opacity: op, depthWrite: false, blending: T.AdditiveBlending })); sp.position.set(x, y, z); sp.scale.setScalar(size); s.add(sp); return sp; }

export function mouthKit(parent, cols) {
  const mk = (color, n = 28) => {
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array((n + 1) * 3), 3));
    const idx = []; for (let i = 0; i < n; i++) idx.push(n, i, (i + 1) % n); g.setIndex(idx);
    const m = mesh(g, new T.MeshBasicMaterial({ color, side: T.DoubleSide }), 0, 0, 0, false, false); m.frustumCulled = false; parent.add(m); return m;
  };
  return { lip: mk(cols.lip), inner: mk(cols.inner), tongue: mk(cols.tongue), teeth: mk(0xf5f0e6) };
}
export function setMouth(m, o) {
  const { width, open, smile, y0, z0, curve, lip = .004, smileK = .018 } = o;
  const fill = (mm, w, op, sm, zo, yo = 0, flatBottom = false) => {
    const p = mm.geometry.attributes.position, n = 28;
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.2832, c = Math.cos(a), s = Math.sin(a), x = w * c;
      const y = (flatBottom ? Math.max(s, -.12) : s) * op + sm * (c * c - .35) * smileK + yo;
      p.setXYZ(i, x, y0 + y, z0 + zo - x * x * curve);
    }
    p.setXYZ(n, 0, y0 + yo + sm * -.35 * smileK, z0 + zo); p.needsUpdate = true;
  };
  fill(m.lip, width + lip, open + lip * 1.15, smile, 0);
  fill(m.inner, width, Math.max(open, .0009), smile, .0012);
  const big = open > .0065; m.teeth.visible = big; m.tongue.visible = open > .012;
  if (big) fill(m.teeth, width * .82, open * .26, smile * .8, .0024, open * .68, true);
  if (m.tongue.visible) fill(m.tongue, width * .62, open * .42, smile * .5, .002, -open * .56);
}
