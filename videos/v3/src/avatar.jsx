// Channel profile picture: Nia and Claude, face-tight, on a flat backdrop that survives a circle crop.
import React, { useEffect, useRef, useState } from 'react';
import { registerRoot, Composition, AbsoluteFill, delayRender, continueRender } from 'remotion';
import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildNia, buildClaude, poseNia, poseClaude } from './world/cast.js';

const S = 1080;
const LOOKS = {
  teal: ['#2f8f88', '#123c3d'], navy: ['#2b4a78', '#0e1a30'], cream: ['#fff3dc', '#efd2a4'], plum: ['#6b3d7a', '#241231'],
};
function backdrop([inner, outer]) {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
  const r = g.createRadialGradient(512, 430, 40, 512, 512, 720); r.addColorStop(0, inner); r.addColorStop(1, outer); g.fillStyle = r; g.fillRect(0, 0, 1024, 1024);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}

function Avatar({ look, solo, t = 2.0 }) {
  const canvas = useRef(null), [handle] = useState(() => delayRender('avatar'));
  useEffect(() => {
    const renderer = new T.WebGLRenderer({ canvas: canvas.current, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(S, S, false); renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(); scene.background = backdrop(LOOKS[look]);
    const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .55;
    scene.add(new T.HemisphereLight(0xfff4e6, 0x3a3040, 1.1));
    const key = new T.DirectionalLight(0xfff0dc, 2.4); key.position.set(-1.6, 3, 3.2); key.target.position.set(0, 1.3, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.normalBias = .014; key.shadow.radius = 5; scene.add(key, key.target);
    const rim = new T.DirectionalLight(0xffd9b8, 1.3); rim.position.set(2.4, 2.4, -1.5); scene.add(rim);
    const fill = new T.DirectionalLight(0xcfe2ff, .5); fill.position.set(2.5, 1.2, 2); scene.add(fill);
    const nia = buildNia(), claude = buildClaude(); scene.add(nia.root, claude.root);
    // pull them together: Nia turned slightly toward Claude, Claude perched at her head height
    nia.root.position.set(-.29, .5, .1); nia.root.rotation.y = .3;
    claude.root.position.set(.27, 1.28, .02);
    const beat = { who: 'none', nia: 'excited', claude: 'happy', start: -9, end: -9 };
    poseNia(nia, beat, beat, t); poseClaude(claude, beat, beat, t);
    claude.body.rotation.y = -.28; nia.headPivot.rotation.y = -.22; nia.headPivot.rotation.z = -.07;
    for (const s of [-1, 1]) { claude.eyes[s].brow.rotation.z = 1.57 - s * .2; claude.eyes[s].brow.position.y = .14; nia.eyes[s].p.position.x = -.004; }   // friendly brows, both looking at the viewer
    const cam = new T.PerspectiveCamera(26, 1, .1, 40); cam.position.set(.0, 1.41, 3.15); cam.lookAt(.0, 1.355, 0);
    if (solo) {   // Claude alone, centred, arms open in a hello
      nia.root.visible = false; claude.root.position.set(0, 1.3, 0);
      const hi = { who: 'claude', claude: 'happy', cpose: 'shrug', start: -9, end: -8.9 };
      poseClaude(claude, hi, hi, t); claude.body.rotation.set(.04, -.14, -.05);
      for (const s of [-1, 1]) { claude.eyes[s].brow.rotation.z = 1.57 - s * .2; claude.eyes[s].brow.position.y = .14; }
      cam.position.set(-.03, 1.28, 2.42); cam.lookAt(-.03, 1.225, 0);
    }
    renderer.render(scene, cam); continueRender(handle);
  }, []);
  return <AbsoluteFill><canvas ref={canvas} width={S} height={S} style={{ width: S, height: S }} /></AbsoluteFill>;
}

registerRoot(() => <>{Object.keys(LOOKS).map(k => <Composition key={k} id={'avatar-' + k} component={Avatar} width={S} height={S} fps={30} durationInFrames={1} defaultProps={{ look: k }} />)}{Object.keys(LOOKS).map(k => <Composition key={'s' + k} id={'claude-' + k} component={Avatar} width={S} height={S} fps={30} durationInFrames={1} defaultProps={{ look: k, solo: true }} />)}</>);
