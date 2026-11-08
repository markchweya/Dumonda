import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { staticFile } from 'remotion';
import { buildNia, buildClaude, buildDumi, poseNia, poseClaude, poseDumi } from './cast.js';
import { THEMES } from './rooms.js';
import { lerp, ease } from './kit.js';

const W = 1080, H = 1920;
const SHOTS = {
  // sh = how many pixels below frame centre the target sits
  // az swings the camera round the target (radians, + = from the right), el lifts it (+ = looking down)
  full: { two: { tg: [-.05, 1.05, 0], d: 6.9, sh: 70 }, nia: { tg: [-.5, 1.33, .15], d: 3.25, sh: -70 }, claude: { tg: [.47, 1.2, 0], d: 3.2, sh: -70 },
    low: { tg: [.44, 1.24, 0], d: 2.9, sh: -40, az: -.22, el: -.17 }, side: { tg: [-.05, 1.1, 0], d: 5.6, sh: 60, az: .62, el: .06 }, high: { tg: [0, .95, 0], d: 6.2, sh: 40, az: -.3, el: .5 },
    over: { tg: [-.42, 1.28, .1], d: 4.3, sh: -40, az: .92, el: .07 }, dutch: { tg: [.45, 1.22, 0], d: 3.0, sh: -60, az: .2, roll: .13 }, top: { tg: [0, .9, .1], d: 5.2, sh: 0, az: .15, el: .95 },
    outro: { tg: [.14, 1.12, 0], d: 7.1, sh: -330, az: -.28, el: .1 } },
  // with a note on screen the cast sits in a strip across the top
  note: { two: { tg: [-.02, 1.28, 0], d: 7.5, sh: -575 }, nia: { tg: [-.42, 1.3, .1], d: 5.9, sh: -570 }, claude: { tg: [.38, 1.25, 0], d: 5.9, sh: -570 },
    low: { tg: [.38, 1.27, 0], d: 5.4, sh: -570, az: -.22, el: -.14 }, side: { tg: [0, 1.3, 0], d: 6.6, sh: -575, az: .6, el: .05 }, high: { tg: [0, 1.15, 0], d: 7, sh: -575, az: -.3, el: .45 },
    over: { tg: [-.38, 1.3, .1], d: 6.2, sh: -570, az: .88, el: .06 }, dutch: { tg: [.38, 1.25, 0], d: 5.6, sh: -570, az: .16, roll: .1 }, top: { tg: [0, 1.0, .1], d: 6.6, sh: -560, az: .12, el: .8 } },
};

export async function createScene(canvas, tl) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(26, W / H, .1, 40);
  const th = THEMES[tl.theme](scene); renderer.toneMappingExposure = th.exp;
  // reflections from a real photographed studio (Poly Haven, CC0); the procedural room is the fallback
  const pm = new T.PMREMGenerator(renderer);
  try { const hdr = await new RGBELoader().loadAsync(staticFile('hdri/studio_small_08_1k.hdr')); scene.environment = pm.fromEquirectangular(hdr).texture; hdr.dispose(); }
  catch (e) { scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; }
  scene.environmentIntensity = th.env;
  scene.add(new T.HemisphereLight(...th.hemi));
  const key = new T.DirectionalLight(th.key[0], th.key[1]); key.position.set(...th.key[2]); key.target.position.set(0, 1, 0); scene.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0005; key.shadow.normalBias = .014; key.shadow.radius = 6; Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3.5, bottom: -2, near: .5, far: 12 });
  const rim = new T.DirectionalLight(0xffe2c8, .7); rim.position.set(2.6, 2.6, -1.3); scene.add(rim);
  // cast: 'dumonda' swaps the mascot seat for Dumi (the internal beat keys stay nia/claude)
  const dumonda = tl.cast === 'dumonda';
  const nia = buildNia(), claude = dumonda ? buildDumi() : buildClaude(); scene.add(nia.chair, nia.root, claude.root);
  const composer = new EffectComposer(renderer, new T.WebGLRenderTarget(W, H, { type: T.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, cam));
  composer.addPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}', fragmentShader: 'varying vec2 vUv; uniform sampler2D tDiffuse; void main(){vec3 c=texture2D(tDiffuse,vUv).rgb; if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)) c=vec3(0.); gl_FragColor=vec4(min(c,vec3(30.)),1.);}' }));
  composer.addPass(new UnrealBloomPass(new T.Vector2(W / 2, H / 2), .2, .6, .92)); composer.addPass(new OutputPass());
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, seed: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `varying vec2 vUv; uniform sampler2D tDiffuse; uniform float seed;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+seed)*43758.5453);}
      void main(){vec2 d=vUv-.5;vec3 c=texture2D(tDiffuse,vUv).rgb;float v=smoothstep(1.,.36,length(d*vec2(1.,1.06)));c*=mix(.72,1.,v);
      float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.1);c+=(h(vUv*vec2(1080.,1920.))-.5)*.016;gl_FragColor=vec4(c,1.);}`,
  }); composer.addPass(grade);

  let panel = null; tl.beats.forEach(b => { if (b.panel !== undefined) panel = b.panel; b._on = !!panel; });
  const at = t => { let i = 0; tl.beats.forEach((b, k) => { if (b.start <= t) i = k; }); return i; };
  return {
    seek(t) {
      const end = t >= tl.endAt, i = at(t), last = tl.beats[i];
      // the end card: both turn to camera and wave while the camera swings slowly round them
      const b = end ? { ...last, who: 'claude', cpose: 'wave', pose: 'wave', claude: 'happy', nia: 'excited', start: tl.endAt, end: tl.endAt, shot: 'outro', _on: false } : last;
      const p = end ? last : tl.beats[Math.max(0, i - 1)], s = SHOTS[b._on ? 'note' : 'full'][b.shot]; let { tg, d, sh } = s, az = s.az || 0, el = s.el || 0, roll = s.roll || 0;
      if (i > 0 && b.shot === p.shot && b._on !== p._on) { const q = ease((t - b.start) / .42), o = SHOTS[p._on ? 'note' : 'full'][p.shot]; tg = tg.map((v, k) => lerp(o.tg[k], v, q)); d = lerp(o.d, d, q); sh = lerp(o.sh, sh, q); az = lerp(o.az || 0, az, q); el = lerp(o.el || 0, el, q); }
      let cut = b.start; for (let k = i; k > 0 && tl.beats[k].shot === tl.beats[k - 1].shot && tl.beats[k]._on === tl.beats[k - 1]._on; k--) cut = tl.beats[k - 1].start;
      if (end) cut = tl.endAt;
      d *= 1 - .055 * ease((t - cut) / 6); if (i === 0) d *= 1 + .1 * (1 - ease(t / .5));   // fast settle-in on the hook
      // every held shot drifts in a slow arc, alternating direction so consecutive shots don't feel the same
      if (end) { const o = ease((t - tl.endAt) / 2.4); az += .5 * o; d *= 1 - .08 * o; } else az += (s.arc ?? .07) * (i % 2 ? 1 : -1) * ease((t - cut) / 4);
      const hx = Math.sin(t * .37) * .012, hy = Math.sin(t * .29 + 1) * .008;
      cam.position.set(tg[0] * .9 + .05 + hx + d * Math.sin(az) * Math.cos(el), tg[1] + .12 + hy + d * Math.sin(el), tg[2] + d * Math.cos(az) * Math.cos(el)); cam.lookAt(tg[0] + hx * .4, tg[1], tg[2]); if (roll) cam.rotateZ(roll); cam.setViewOffset(W, H, 0, -sh, W, H);
      poseNia(nia, b, p, t); (dumonda ? poseDumi : poseClaude)(claude, b, p, t);
      grade.uniforms.seed.value = (Math.round(t * 30) % 97) * .37; composer.render();
    },
  };
}
