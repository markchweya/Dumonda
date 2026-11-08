import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clay, mesh, blob, limb, box, cyl, mouthKit, setMouth, lerp, ease, clamp, fr, h1 } from './kit.js';

// ------------------------------------------------------------------ Nia
export function buildNia() {
  const skin = clay(0x96603a, { r: .52, b: .5 }), skinD = clay(0x7a4a2b, { r: .6, b: .5 }), hoodie = clay(0xe9a825, { r: .8 }), hoodieD = clay(0xc4851a, { r: .85 });
  const hair = clay(0x1d1512, { r: .9, b: 3 }), jeans = clay(0x2d4369, { r: .85 }), gold = new T.MeshStandardMaterial({ color: 0xe7b84b, roughness: .25, metalness: .85 }), frame = new T.MeshStandardMaterial({ color: 0xd9472b, roughness: .3 });
  const root = new T.Group(); root.position.set(-.55, .52, .16); root.rotation.y = .5;
  const ch = clay(0x2c6e6a, { r: .6 }), metal = new T.MeshStandardMaterial({ color: 0x33353c, roughness: .35, metalness: .5 });
  const chair = new T.Group(); chair.position.set(-.55, 0, .16); chair.rotation.y = .5;
  chair.add(box(.52, .085, .48, ch, 0, .46, 0, .04), box(.48, .6, .085, ch, 0, .86, -.27, .04), cyl(.028, .028, .4, metal, 0, .25, -.02));
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283, l = box(.3, .03, .05, metal, Math.cos(a) * .15, .07, Math.sin(a) * .15, .012); l.rotation.y = -a; chair.add(l, mesh(new T.SphereGeometry(.033, 14, 10), metal, Math.cos(a) * .3, .033, Math.sin(a) * .3)); }
  for (const s of [-1, 1]) {
    const th = mesh(limb(.085, .07, .4), jeans, s * .09, 0, .02); th.rotation.x = -1.5; root.add(th);
    root.add(mesh(new T.SphereGeometry(.07, 16, 12), jeans, s * .09, -.01, .41));
    const sh = mesh(limb(.066, .054, .42), jeans, s * .09, -.01, .41); sh.rotation.x = .08; root.add(sh);
    root.add(mesh(blob(.058, .05, .115), clay(0xf2ecdf, { r: .55 }), s * .09, -.45, .46));
  }
  root.add(mesh(blob(.175, .1, .15), jeans, 0, .01, .03));
  const torso = new T.Group(); root.add(torso);
  const tg = blob(.19, .3, .135, (v, u) => { const k = u.y > .5 ? 1 - (u.y - .5) * .55 : 1 - Math.max(0, -u.y - .55) * .25; v.x *= k; v.z *= k; }, 16);
  torso.add(mesh(tg, hoodie, 0, .26, 0));
  const hood = mesh(new T.TorusGeometry(.09, .034, 14, 24), hoodieD, 0, .535, -.02); hood.rotation.x = 1.3; torso.add(hood);
  for (const s of [-1, 1]) { const st = cyl(.006, .006, .13, clay(0xf6f0e4, { nobump: true }), s * .03, .425, .126, 8); st.rotation.x = -.15; torso.add(st); }
  const arm = {};
  for (const s of [-1, 1]) {
    const sh = new T.Group(); sh.position.set(s * .185, .435, 0); torso.add(sh);
    sh.add(mesh(new T.SphereGeometry(.07, 18, 14), hoodie), mesh(limb(.065, .054, .25), hoodie));
    const el = new T.Group(); el.position.y = -.25; sh.add(el);
    el.add(mesh(new T.SphereGeometry(.054, 16, 12), hoodie), mesh(limb(.054, .042, .23), hoodie));
    const wr = new T.Group(); wr.position.y = -.24; el.add(wr);
    wr.add(mesh(blob(.047, .056, .027), skin, 0, -.043, 0));
    const th = mesh(blob(.015, .03, .015), skin, -s * .042, -.033, .012); th.rotation.z = -s * .7; wr.add(th);
    arm[s] = { sh, el, wr };
  }
  torso.add(mesh(limb(.056, .062, .09), skinD, 0, .62, 0));
  const headPivot = new T.Group(); headPivot.position.set(0, .585, .005); torso.add(headPivot);
  const head = new T.Group(); head.position.y = .19; headPivot.add(head);
  head.add(mesh(blob(.166, .2, .157, (v, u) => { if (u.y < 0) { const k = 1 - .36 * Math.pow(-u.y, 1.6); v.x *= k; v.z *= 1 - .1 * -u.y; } }), skin));
  for (const s of [-1, 1]) {
    head.add(mesh(blob(.02, .032, .02), skinD, s * .161, -.008, -.006));
    const hoop = mesh(new T.TorusGeometry(.022, .0035, 8, 22), gold, s * .165, -.058, -.004, true, false); hoop.rotation.y = 1.57; head.add(hoop);
    head.add(mesh(new T.CircleGeometry(.03, 22), new T.MeshBasicMaterial({ color: 0xd9674a, transparent: true, opacity: .2, depthWrite: false }), s * .098, -.058, .126, false, false)).children;
  }
  head.add(mesh(blob(.022, .022, .024), skinD, 0, -.036, .153));
  // twin hair puffs and a soft cap: nothing like the reference cast
  head.add(mesh(blob(.176, .14, .168, null, 10), hair, 0, .138, -.014));
  for (const s of [-1, 1]) {
    head.add(mesh(blob(.112, .108, .105, (v, u) => { v.multiplyScalar(1 + Math.sin(u.x * 11) * Math.sin(u.y * 9) * Math.sin(u.z * 12) * .07); }, 12), hair, s * .135, .25, -.015));
    const tie = mesh(new T.TorusGeometry(.05, .012, 10, 20), clay(0xd9472b, { nobump: true }), s * .092, .185, -.01); tie.rotation.set(1.2, s * .55, 0); head.add(tie);
  }
  const eyeW = new T.MeshStandardMaterial({ color: 0xf8f4ec, roughness: .25 }), pup = new T.MeshStandardMaterial({ color: 0x140d0a, roughness: .12 });
  const eyes = {};
  for (const s of [-1, 1]) {
    const e = new T.Group(); e.position.set(s * .067, .018, .13); head.add(e);
    const ball = mesh(new T.SphereGeometry(.037, 24, 18), eyeW, 0, 0, 0, false); ball.scale.set(1, .96, .55); e.add(ball);
    const p = mesh(new T.SphereGeometry(.02, 18, 14), pup, 0, 0, .015, false); p.scale.z = .48; e.add(p);
    p.add(mesh(new T.SphereGeometry(.0058, 8, 8), new T.MeshBasicMaterial({ color: 0xffffff }), .006, .007, .018, false));
    const brow = mesh(new T.CapsuleGeometry(.0072, .046, 4, 10), hair, s * .067, .082, .147, false); brow.rotation.z = 1.57; head.add(brow);
    const rim = mesh(new T.TorusGeometry(.052, .0062, 10, 32), frame, s * .067, .018, .158, true, false); head.add(rim);
    const tp = cyl(.0036, .0036, .155, frame, s * .142, .026, .08, 6); tp.rotation.x = 1.52; head.add(tp);
    eyes[s] = { e, p, brow };
  }
  const br = cyl(.0044, .0044, .034, frame, 0, .03, .158, 6); br.rotation.z = 1.57; head.add(br);
  const mouth = mouthKit(head, { lip: 0x6b2e26, inner: 0x2a0d0d, tongue: 0xb6524b });
  return { root, chair, torso, headPivot, head, arm, eyes, mouth };
}

// ------------------------------------------------------------------ Claude: a clay chat bubble that sits on a book stack
export function buildClaude() {
  const c = clay(0xc4542c, { r: .6, b: 1.6 }), d = clay(0x8f3d1f, { r: .6 });
  const root = new T.Group(); root.position.set(.47, 1.23, 0);
  const body = new T.Group(); root.add(body);
  const g = new RoundedBoxGeometry(.58, .46, .3, 12, .15); const p = g.attributes.position, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + .05 * (1 - (v.x / .29) ** 2) * (1 - (v.y / .23) ** 2); p.setZ(i, v.z * k); }
  g.computeVertexNormals(); body.add(mesh(g, c));
  // the speech-bubble tail, pointing at whoever it is talking to
  const tail = mesh(blob(.1, .15, .085, (vv, u) => { if (u.y < 0) { const q = 1 + u.y * .9; vv.x *= q; vv.z *= q; vv.x -= -u.y * 1.05; } }), c, -.2, -.22, 0); body.add(tail);
  const eyeM = new T.MeshStandardMaterial({ color: 0x17100d, roughness: .13 }), eyes = {};
  for (const s of [-1, 1]) {
    const e = new T.Group(); e.position.set(s * .096, .045, .158); body.add(e);
    const ball = mesh(new T.SphereGeometry(.05, 22, 18), eyeM, 0, 0, 0, false); ball.scale.set(1.0, 1.24, .34); e.add(ball);
    e.add(mesh(new T.SphereGeometry(.013, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff }), .016, .024, .017, false));
    e.add(mesh(new T.SphereGeometry(.0058, 8, 6), new T.MeshBasicMaterial({ color: 0xffffff }), -.014, -.018, .016, false));
    const brow = mesh(new T.CapsuleGeometry(.0085, .056, 4, 10), new T.MeshStandardMaterial({ color: 0x4a2114, roughness: .6 }), s * .096, .132, .153, false); brow.rotation.z = 1.57; body.add(brow);
    body.add(mesh(new T.CircleGeometry(.036, 22), new T.MeshBasicMaterial({ color: 0xf5a184, transparent: true, opacity: .55, depthWrite: false }), s * .172, -.022, .147, false, false));
    eyes[s] = { e, brow };
  }
  const mouth = mouthKit(body, { lip: 0x7a3219, inner: 0x24090a, tongue: 0xcf5c58 });
  const arm = {};
  for (const s of [-1, 1]) {
    const sh = new T.Group(); sh.position.set(s * .29, -.045, .01); body.add(sh);
    sh.add(mesh(limb(.032, .03, .13), c));
    const el = new T.Group(); el.position.y = -.13; sh.add(el); el.add(mesh(new T.SphereGeometry(.031, 14, 10), c), mesh(limb(.03, .028, .11), c));
    const hand = mesh(blob(.041, .043, .032), c, 0, -.125, 0); el.add(hand); arm[s] = { sh, el };
  }
  const leg = {};
  for (const s of [-1, 1]) { const l = new T.Group(); l.position.set(s * .1 + .06, -.2, .1); root.add(l); l.add(mesh(limb(.028, .026, .085), d)); const f = mesh(blob(.046, .03, .06), clay(0x3a2a22), 0, -.095, .025); l.add(f); leg[s] = l; }
  return { root, body, tail, eyes, mouth, arm, leg };
}

// ------------------------------------------------------------------ Lena: the Dumonda resident, new to Switzerland
// Nia's rig and proportions exactly (so every pose, wave and mouth position keeps working), with her own
// look: olive skin, chestnut bob under a cream beanie, denim jacket, loden-green scarf, no glasses.
export function buildResident() {
  const skin = clay(0xd49a6e, { r: .52, b: .5 }), skinD = clay(0xb07a4e, { r: .6, b: .5 }), jacket = clay(0x4a6fa5, { r: .8 }), jacketD = clay(0x3a5784, { r: .85 });
  const hair = clay(0x4a2f1d, { r: .9, b: 3 }), jeans = clay(0x3b3a45, { r: .85 }), gold = new T.MeshStandardMaterial({ color: 0xe7b84b, roughness: .25, metalness: .85 });
  const beanieM = clay(0xf0e8d6, { r: .95, b: 2 }), scarfM = clay(0x3f6e52, { r: .95, b: 2.4 });
  const root = new T.Group(); root.position.set(-.55, .52, .16); root.rotation.y = .5;
  const ch = clay(0x2c6e6a, { r: .6 }), metal = new T.MeshStandardMaterial({ color: 0x33353c, roughness: .35, metalness: .5 });
  const chair = new T.Group(); chair.position.set(-.55, 0, .16); chair.rotation.y = .5;
  chair.add(box(.52, .085, .48, ch, 0, .46, 0, .04), box(.48, .6, .085, ch, 0, .86, -.27, .04), cyl(.028, .028, .4, metal, 0, .25, -.02));
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283, l = box(.3, .03, .05, metal, Math.cos(a) * .15, .07, Math.sin(a) * .15, .012); l.rotation.y = -a; chair.add(l, mesh(new T.SphereGeometry(.033, 14, 10), metal, Math.cos(a) * .3, .033, Math.sin(a) * .3)); }
  for (const s of [-1, 1]) {
    const th = mesh(limb(.085, .07, .4), jeans, s * .09, 0, .02); th.rotation.x = -1.5; root.add(th);
    root.add(mesh(new T.SphereGeometry(.07, 16, 12), jeans, s * .09, -.01, .41));
    const sh = mesh(limb(.066, .054, .42), jeans, s * .09, -.01, .41); sh.rotation.x = .08; root.add(sh);
    root.add(mesh(blob(.058, .05, .115), clay(0xc8574a, { r: .55 }), s * .09, -.45, .46));
  }
  root.add(mesh(blob(.175, .1, .15), jeans, 0, .01, .03));
  const torso = new T.Group(); root.add(torso);
  const tg = blob(.19, .3, .135, (v, u) => { const k = u.y > .5 ? 1 - (u.y - .5) * .55 : 1 - Math.max(0, -u.y - .55) * .25; v.x *= k; v.z *= k; }, 16);
  torso.add(mesh(tg, jacket, 0, .26, 0));
  // loden scarf looped at the collar, one tail hanging down the front
  const sc = mesh(new T.TorusGeometry(.095, .038, 14, 24), scarfM, 0, .53, -.01); sc.rotation.x = 1.3; torso.add(sc);
  const tail2 = box(.085, .2, .035, scarfM, .055, .4, .128, .014); tail2.rotation.z = -.08; torso.add(tail2);
  for (const s of [-1, 1]) { const seam = cyl(.005, .005, .2, jacketD, s * .095, .33, .131, 8); seam.rotation.x = -.1; torso.add(seam); }
  const arm = {};
  for (const s of [-1, 1]) {
    const sh = new T.Group(); sh.position.set(s * .185, .435, 0); torso.add(sh);
    sh.add(mesh(new T.SphereGeometry(.07, 18, 14), jacket), mesh(limb(.065, .054, .25), jacket));
    const el = new T.Group(); el.position.y = -.25; sh.add(el);
    el.add(mesh(new T.SphereGeometry(.054, 16, 12), jacket), mesh(limb(.054, .042, .23), jacket));
    const wr = new T.Group(); wr.position.y = -.24; el.add(wr);
    wr.add(mesh(blob(.047, .056, .027), skin, 0, -.043, 0));
    const th = mesh(blob(.015, .03, .015), skin, -s * .042, -.033, .012); th.rotation.z = -s * .7; wr.add(th);
    arm[s] = { sh, el, wr };
  }
  torso.add(mesh(limb(.056, .062, .09), skinD, 0, .62, 0));
  const headPivot = new T.Group(); headPivot.position.set(0, .585, .005); torso.add(headPivot);
  const head = new T.Group(); head.position.y = .19; headPivot.add(head);
  head.add(mesh(blob(.166, .2, .157, (v, u) => { if (u.y < 0) { const k = 1 - .36 * Math.pow(-u.y, 1.6); v.x *= k; v.z *= 1 - .1 * -u.y; } }), skin));
  for (const s of [-1, 1]) {
    head.add(mesh(blob(.02, .032, .02), skinD, s * .161, -.008, -.006));
    head.add(mesh(new T.SphereGeometry(.009, 10, 8), gold, s * .168, -.028, -.004));
    head.add(mesh(new T.CircleGeometry(.03, 22), new T.MeshBasicMaterial({ color: 0xd9674a, transparent: true, opacity: .22, depthWrite: false }), s * .098, -.058, .126, false, false));
  }
  head.add(mesh(blob(.022, .022, .024), skinD, 0, -.036, .153));
  // chestnut bob: a wrap of hair under a slouchy cream beanie, fringe over the brow
  head.add(mesh(blob(.172, .15, .165, null, 10), hair, 0, .09, -.02));
  for (const s of [-1, 1]) head.add(mesh(blob(.055, .11, .05, null, 10), hair, s * .14, -.03, .02));
  head.add(mesh(blob(.15, .045, .1, null, 10), hair, 0, .145, .085));
  const brim = mesh(new T.TorusGeometry(.142, .035, 12, 26), beanieM, 0, .155, -.01); brim.rotation.x = 1.42; head.add(brim);
  head.add(mesh(blob(.158, .125, .15, (v, u) => { if (u.y > .6) { const k = 1 - (u.y - .6) * .35; v.x *= k; v.z *= k; } }, 10), beanieM, 0, .225, -.012));
  head.add(mesh(blob(.045, .045, .045, null, 8), beanieM, 0, .36, -.015));
  const eyeW = new T.MeshStandardMaterial({ color: 0xf8f4ec, roughness: .25 }), pup = new T.MeshStandardMaterial({ color: 0x140d0a, roughness: .12 });
  const eyes = {};
  for (const s of [-1, 1]) {
    const e = new T.Group(); e.position.set(s * .067, .018, .13); head.add(e);
    const ball = mesh(new T.SphereGeometry(.037, 24, 18), eyeW, 0, 0, 0, false); ball.scale.set(1, .96, .55); e.add(ball);
    const p = mesh(new T.SphereGeometry(.02, 18, 14), pup, 0, 0, .015, false); p.scale.z = .48; e.add(p);
    p.add(mesh(new T.SphereGeometry(.0058, 8, 8), new T.MeshBasicMaterial({ color: 0xffffff }), .006, .007, .018, false));
    const brow = mesh(new T.CapsuleGeometry(.0072, .046, 4, 10), hair, s * .067, .082, .147, false); brow.rotation.z = 1.57; head.add(brow);
    eyes[s] = { e, p, brow };
  }
  const mouth = mouthKit(head, { lip: 0x8a3c2e, inner: 0x2a0d0d, tongue: 0xb6524b });
  return { root, chair, torso, headPivot, head, arm, eyes, mouth };
}

// ------------------------------------------------------------------ Dumi: a clay St. Bernard pup, the Dumonda guide
// Swiss to the bone: the rescue dog that pulls you out of the bureaucracy avalanche. Paper-white and warm
// brown clay (the app's palette), Dumonda red only on the collar and the tiny barrel. Same interface and
// rig role as Claude (body squash, arms, legs, eyes, mouthKit) so every pose and shot keeps working.
export function buildDumi() {
  const fur = clay(0xf5f1e8, { r: .62, b: 1.2 }), patch = clay(0x8a5a35, { r: .66, b: 1.2 }), earM = clay(0x6f4526, { r: .7, b: 1.4 });
  const red = clay(0xb02e23, { r: .5, nobump: true }), barrelM = clay(0xc89a5b, { r: .55 }), nose = new T.MeshStandardMaterial({ color: 0x241a16, roughness: .25 });
  const root = new T.Group(); root.position.set(.47, 1.21, 0);
  const body = new T.Group(); root.add(body);
  // one chunky pup bust: head and body in a single blob, heavier at the cheeks
  body.add(mesh(blob(.27, .3, .25, (v, u) => { if (u.y < 0) { const k = 1 + .18 * -u.y; v.x *= k; v.z *= Math.min(k, 1.12); } if (u.y > .55) { const k = 1 - (u.y - .55) * .22; v.x *= k; v.z *= k; } }), fur, 0, .06, 0));
  // St. Bernard patch over the right eye, hugging the head
  const pt = mesh(blob(.118, .125, .09, null, 10), patch, .115, .155, .145); pt.scale.z = .52; pt.rotation.y = .38; body.add(pt);
  body.add(mesh(blob(.13, .11, .07, null, 10), patch, -.02, .32, -.1));   // soft brown cap on the crown
  // droopy ears, one on the patch side
  const ears = {};
  for (const s of [-1, 1]) {
    const piv = new T.Group(); piv.position.set(s * .245, .24, -.01); body.add(piv);
    const flap = mesh(blob(.075, .15, .045, (v, u) => { if (u.y < 0) v.x *= 1 + -u.y * .35; }), s === 1 ? patch : earM, 0, -.1, 0);
    flap.rotation.z = s * .3; piv.add(flap); ears[s] = piv;
  }
  // cream muzzle with a big soft nose; the mouth sits on it
  body.add(mesh(blob(.105, .085, .085, null, 12), clay(0xfaf7ef, { r: .58 }), 0, -.055, .2));
  const nz = mesh(blob(.042, .03, .03, null, 10), nose, 0, -.002, .276); body.add(nz);
  body.add(mesh(new T.SphereGeometry(.009, 8, 8), new T.MeshBasicMaterial({ color: 0xffffff }), -.012, .008, .301, false, false));
  const eyeM = new T.MeshStandardMaterial({ color: 0x17100d, roughness: .13 }), eyes = {};
  for (const s of [-1, 1]) {
    const e = new T.Group(); e.position.set(s * .105, .11, .215); body.add(e);
    const ball = mesh(new T.SphereGeometry(.05, 22, 18), eyeM, 0, 0, 0, false); ball.scale.set(1, 1.18, .34); e.add(ball);
    e.add(mesh(new T.SphereGeometry(.013, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff }), .016, .024, .017, false));
    e.add(mesh(new T.SphereGeometry(.0058, 8, 6), new T.MeshBasicMaterial({ color: 0xffffff }), -.014, -.018, .016, false));
    const brow = mesh(new T.CapsuleGeometry(.009, .05, 4, 10), s === 1 ? earM : clay(0x5a4632, { nobump: true }), s * .105, .195, .21, false); brow.rotation.z = 1.57; body.add(brow);
    body.add(mesh(new T.CircleGeometry(.034, 22), new T.MeshBasicMaterial({ color: 0xe8a98f, transparent: true, opacity: .5, depthWrite: false }), s * .185, -.015, .207, false, false));
    eyes[s] = { e, brow };
  }
  const mouth = mouthKit(body, { lip: 0x6e3a28, inner: 0x2a0d0d, tongue: 0xd96a60 });
  // red collar with the tiny rescue barrel, the one Dumonda touch of colour
  const collar = mesh(new T.TorusGeometry(.193, .027, 12, 30), red, 0, -.168, .01); collar.rotation.x = 1.53; body.add(collar);
  const bar = new T.Group(); bar.position.set(0, -.205, .185); bar.rotation.z = 1.5708; body.add(bar);
  bar.add(cyl(.044, .044, .078, barrelM, 0, 0, 0, 18), cyl(.0465, .0465, .018, red, 0, 0, 0, 18));
  const arm = {};
  for (const s of [-1, 1]) {
    const sh = new T.Group(); sh.position.set(s * .215, -.095, .05); body.add(sh);
    sh.add(mesh(new T.SphereGeometry(.048, 16, 12), fur), mesh(limb(.038, .034, .1), fur));
    const el = new T.Group(); el.position.y = -.1; sh.add(el); el.add(mesh(new T.SphereGeometry(.036, 14, 10), fur), mesh(limb(.034, .032, .09), fur));
    const hand = mesh(blob(.047, .047, .042), s === 1 ? fur : patch, 0, -.105, 0); el.add(hand); arm[s] = { sh, el };
  }
  const leg = {};
  for (const s of [-1, 1]) { const l = new T.Group(); l.position.set(s * .11 + .04, -.24, .09); root.add(l); l.add(mesh(limb(.032, .03, .09), fur)); const f = mesh(blob(.05, .034, .065), s === 1 ? patch : fur, 0, -.1, .025); l.add(f); leg[s] = l; }
  const tail = new T.Group(); tail.position.set(-.06, -.17, -.22); body.add(tail);
  const tg2 = mesh(blob(.035, .13, .035, (v, u) => { if (u.y > 0) { v.x *= 1 - u.y * .45; v.z *= 1 - u.y * .45; } }), patch, 0, .09, 0); tg2.rotation.x = -.7; tail.add(tg2);
  return { root, body, eyes, mouth, arm, leg, ears, tail };
}

// ------------------------------------------------------------------ performance tables
const EMO = {
  neutral: { lid: 1, ba: 0, by: 0, smile: .35, tilt: 0, lean: 0 }, excited: { lid: 1.12, ba: -.14, by: .014, smile: 1, tilt: -.05, lean: .05 },
  annoyed: { lid: .66, ba: .34, by: -.01, smile: -.65, tilt: .03, lean: .04 }, sad: { lid: .76, ba: -.34, by: .006, smile: -.85, tilt: .09, lean: -.04 },
  sheepish: { lid: .82, ba: -.28, by: .004, smile: .15, tilt: .13, lean: -.04 }, shocked: { lid: 1.25, ba: -.12, by: .024, smile: -.2, tilt: -.07, lean: -.09 },
  smug: { lid: .7, ba: .12, by: .01, smile: 1, tilt: -.09, lean: -.06 }, pleading: { lid: 1.1, ba: -.42, by: .014, smile: -.35, tilt: .09, lean: .07 }, stressed: { lid: 1.15, ba: -.36, by: .018, smile: -.8, tilt: .03, lean: .06 },
};
const CEMO = {
  neutral: { lid: 1, ba: 0, by: 0, smile: .5, tilt: 0, sq: 0 }, happy: { lid: .85, ba: -.2, by: .012, smile: 1.2, tilt: -.09, sq: 0 },
  deadpan: { lid: .42, ba: 0, by: -.018, smile: -.05, tilt: 0, sq: 0 }, squint: { lid: .46, ba: .3, by: -.012, smile: -.2, tilt: .08, sq: 0 },
  sideeye: { lid: .55, ba: .22, by: -.006, smile: .3, tilt: .15, sq: -.022 }, smug: { lid: .55, ba: .12, by: .01, smile: 1.1, tilt: -.14, sq: 0 }, surprised: { lid: 1.25, ba: -.2, by: .02, smile: -.2, tilt: 0, sq: 0 },
};
const REST = { sx: -.32, sz: .1, e: -1.18 };
const POSES = { rest: { L: REST, R: REST }, gesture: { L: REST, R: { sx: -.78, sz: .34, e: -1.35 } }, point: { L: REST, R: { sx: -1.25, sz: .62, e: -.3 } }, shrug: { L: { sx: -.3, sz: .78, e: -1.82 }, R: { sx: -.3, sz: .78, e: -1.82 } }, head: { L: { sx: -2.72, sz: .3, e: -2.05 }, R: { sx: -2.72, sz: .3, e: -2.05 } }, neck: { L: REST, R: { sx: -2.2, sz: .42, e: -2.35 } }, chin: { L: REST, R: { sx: -.92, sz: -.04, e: -2.3 } }, cheer: { L: { sx: -2.55, sz: .36, e: -.85 }, R: { sx: -2.55, sz: .36, e: -.85 } }, wave: { L: REST, R: { sx: -2.35, sz: .75, e: -.7 } } };
const CREST = { sx: -.35, sz: .16, e: -.65 };
const CPOSE = { rest: { L: CREST, R: CREST }, point: { L: { sx: -1.5, sz: .35, e: -.25 }, R: CREST }, palm: { L: { sx: -1.05, sz: .42, e: -1.0 }, R: CREST }, shrug: { L: { sx: -.5, sz: 1.05, e: -1.5 }, R: { sx: -.5, sz: 1.05, e: -1.5 } }, wave: { L: { sx: -1.75, sz: 1.3, e: -1.0 }, R: CREST } };

const VIS = { open: [.027, .033], mid: [.015, .03], wide: [.01, .04], round: [.019, .02], close: [.0012, .028], teeth: [.005, .031] };
function lipFrom(b, t) {
  let v = null; for (const x of b.vis) if (t >= x.s && t < x.e) { v = x.v; break; }
  const i = Math.floor((t - b.start) * 100), amp = b.env && b.env[i] != null ? Math.pow(b.env[i], .7) : .5, q = VIS[v || 'close'];
  return { open: q[0] * clamp(.35 + amp, 0, 1.15), width: q[1] };
}
const blinkAt = (t, per, seed) => { const ph = fr((t + h1(Math.floor(t / per) + seed) * 1.2) / per) * per; return ph < .13 ? Math.sin(ph / .13 * Math.PI) : 0; };

export function poseNia(n, b, p, t) {
  const q = ease((t - b.start) / .28), eA = EMO[p.nia] || EMO.neutral, eB = EMO[b.nia] || EMO.neutral, E = {};
  for (const k in eA) E[k] = lerp(eA[k], eB[k], ease((t - b.start) / .2));
  const talk = b.who === 'nia' && t >= b.start && t <= b.end;
  const pa = POSES[p.who === 'nia' ? (p.pose || 'rest') : 'rest'], pb = POSES[b.who === 'nia' || b.pose === 'wave' ? (b.pose || 'rest') : 'rest'];
  for (const [s, side] of [[-1, 'L'], [1, 'R']]) {
    const A = pa[side], B = pb[side], a = n.arm[s], wig = talk ? Math.sin(t * 5.3 + s) * .055 : 0;
    const wv = B === POSES.wave.R && side === 'R' ? Math.sin((t - b.start) * 9) * .38 * q : 0; a.sh.rotation.set(lerp(A.sx, B.sx, q) + Math.sin(t * .9 + s) * .012 + wig, 0, s * (lerp(A.sz, B.sz, q) + wv)); a.el.rotation.x = lerp(A.e, B.e, q) + wig * 1.4 + wv * .6;
  }
  n.torso.rotation.x = E.lean + Math.sin(t * 1.2) * .007; n.torso.position.y = Math.sin(t * 1.5) * .0025; n.torso.rotation.z = Math.sin(t * .6) * .007;
  const nod = talk ? Math.sin(t * 7.7) * .02 + Math.sin(t * 3.1) * .02 : 0;
  n.headPivot.rotation.set(-.02 + nod + E.lean * .2, .0 + Math.sin(t * .5) * .022, E.tilt + Math.sin(t * .8) * .012);
  const bl = blinkAt(t, 3.1, 0);
  for (const s of [-1, 1]) { const e = n.eyes[s]; e.e.scale.y = Math.max(.06, Math.min(1.22, E.lid) * (1 - bl)); e.p.position.x = .006; e.brow.position.y = .082 + E.by + (talk ? Math.sin(t * 4.3) * .0016 : 0); e.brow.rotation.z = 1.57 + s * -E.ba; }
  let open = 0, width = .03 + .007 * E.smile;
  if (talk) ({ open, width } = lipFrom(b, t)); else if (b.nia === 'shocked') { open = .017; width = .018; } else if (b.nia === 'excited') { open = .009; width = .041; }
  setMouth(n.mouth, { width, open, smile: E.smile, y0: -.098, z0: .1335, curve: 3.6 });
}
export function poseDumi(c, b, p, t) {
  const q = ease((t - b.start) / .26), eA = CEMO[p.claude] || CEMO.neutral, eB = CEMO[b.claude] || CEMO.neutral, E = {};
  for (const k in eA) E[k] = lerp(eA[k], eB[k], ease((t - b.start) / .2));
  const talk = b.who === 'claude' && t >= b.start && t <= b.end, el = t - b.start;
  const i = Math.floor(el * 100), amp = talk && b.env && b.env[i] != null ? b.env[i] : 0;
  const squash = Math.sin(t * 1.5) * .006 + amp * .012 + (talk && el < .22 ? Math.sin(el / .22 * Math.PI) * .025 : 0);
  c.body.scale.set(1 + squash, 1 - squash, 1 + squash); c.body.position.y = -squash * .1;
  c.body.rotation.set(.03 + (talk ? Math.sin(t * 5) * .012 : 0), (b.cpose === 'wave' ? -.05 : b.who === 'nia' ? -.46 : -.26) + Math.sin(t * .55) * .03, E.tilt + Math.sin(t * .7) * .016);
  const pa = CPOSE[p.who === 'claude' ? (p.cpose || 'rest') : 'rest'], pb = CPOSE[b.who === 'claude' ? (b.cpose || 'rest') : 'rest'];
  for (const [s, side] of [[-1, 'L'], [1, 'R']]) { const A = pa[side], B = pb[side], a = c.arm[s], w = talk ? Math.sin(t * 5.1 + s) * .06 : 0; const wv = B === CPOSE.wave.L && side === 'L' ? Math.sin((t - b.start) * 10) * .6 * q : 0; a.sh.rotation.set(lerp(A.sx, B.sx, q) + w, 0, s * (lerp(A.sz, B.sz, q) + wv)); a.el.rotation.x = lerp(A.e, B.e, q) + w + wv * .5; }
  for (const s of [-1, 1]) c.leg[s].rotation.x = -.5 + Math.sin(t * 1.15 + s * 1.2) * .17;
  // puppy life: ears swing with the body, the tail wags whenever Dumi is pleased or talking
  const happy = ['happy', 'smug', 'surprised'].includes(b.claude) || b.cpose === 'wave';
  for (const s of [-1, 1]) c.ears[s].rotation.x = Math.sin(t * 1.9 + s) * .06 + squash * 2.2;
  c.tail.rotation.z = Math.sin(t * ((talk || happy) ? 9 : 2.2)) * ((talk || happy) ? .5 : .14);
  const bl = blinkAt(t, 3.7, 9);
  for (const s of [-1, 1]) { const e = c.eyes[s]; e.e.scale.y = Math.max(.07, E.lid * (1 - bl)); e.e.position.x = s * .105 + E.sq; e.brow.position.y = .195 + E.by; e.brow.rotation.z = 1.57 + s * -E.ba; }
  let open = 0, width = .04 + .012 * Math.max(0, E.smile);
  if (talk) { const m = lipFrom(b, t); open = m.open * 1.25; width = m.width * 1.3; }
  setMouth(c.mouth, { width, open, smile: E.smile, y0: -.125, z0: .263, curve: 1.6, lip: .0038, smileK: .03 });
}
export function poseClaude(c, b, p, t) {
  const q = ease((t - b.start) / .26), eA = CEMO[p.claude] || CEMO.neutral, eB = CEMO[b.claude] || CEMO.neutral, E = {};
  for (const k in eA) E[k] = lerp(eA[k], eB[k], ease((t - b.start) / .2));
  const talk = b.who === 'claude' && t >= b.start && t <= b.end, el = t - b.start;
  const i = Math.floor(el * 100), amp = talk && b.env && b.env[i] != null ? b.env[i] : 0;
  const squash = Math.sin(t * 1.5) * .006 + amp * .012 + (talk && el < .22 ? Math.sin(el / .22 * Math.PI) * .025 : 0);
  c.body.scale.set(1 + squash, 1 - squash, 1 + squash); c.body.position.y = -squash * .1;
  c.body.rotation.set(.03 + (talk ? Math.sin(t * 5) * .012 : 0), (b.cpose === 'wave' ? -.05 : b.who === 'nia' ? -.46 : -.26) + Math.sin(t * .55) * .03, E.tilt + Math.sin(t * .7) * .016);
  const pa = CPOSE[p.who === 'claude' ? (p.cpose || 'rest') : 'rest'], pb = CPOSE[b.who === 'claude' ? (b.cpose || 'rest') : 'rest'];
  for (const [s, side] of [[-1, 'L'], [1, 'R']]) { const A = pa[side], B = pb[side], a = c.arm[s], w = talk ? Math.sin(t * 5.1 + s) * .06 : 0; const wv = B === CPOSE.wave.L && side === 'L' ? Math.sin((t - b.start) * 10) * .6 * q : 0; a.sh.rotation.set(lerp(A.sx, B.sx, q) + w, 0, s * (lerp(A.sz, B.sz, q) + wv)); a.el.rotation.x = lerp(A.e, B.e, q) + w + wv * .5; }
  for (const s of [-1, 1]) c.leg[s].rotation.x = -.5 + Math.sin(t * 1.15 + s * 1.2) * .17;
  const bl = blinkAt(t, 3.7, 9);
  for (const s of [-1, 1]) { const e = c.eyes[s]; e.e.scale.y = Math.max(.07, E.lid * (1 - bl)); e.e.position.x = s * .096 + E.sq; e.brow.position.y = .132 + E.by; e.brow.rotation.z = 1.57 + s * -E.ba; }
  let open = 0, width = .036 + .012 * Math.max(0, E.smile);
  if (talk) { const m = lipFrom(b, t); open = m.open * 1.25; width = m.width * 1.3; }
  setMouth(c.mouth, { width, open, smile: E.smile, y0: -.065, z0: .1645, curve: .25, lip: .0035, smileK: .024 });
}
