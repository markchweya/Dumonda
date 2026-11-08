import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { registerRoot, Composition, useCurrentFrame, AbsoluteFill, Audio, staticFile, delayRender, continueRender } from 'remotion';
import '@fontsource/bricolage-grotesque/700.css'; import '@fontsource/bricolage-grotesque/800.css';
import '@fontsource/inter/500.css'; import '@fontsource/inter/600.css'; import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/500.css'; import '@fontsource/caveat/700.css';
import './ui.css';
import { createScene } from './world/scene.js';

const FPS = 30, clamp = (v, x, y) => Math.max(x, Math.min(y, v)), ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }, back = t => { t = clamp(t, 0, 1); const k = 1.7; return 1 + (k + 1) * (t - 1) ** 3 + k * (t - 1) ** 2; };
const FONTS = ['700 40px "Bricolage Grotesque"', '800 40px "Bricolage Grotesque"', '500 30px Inter', '700 30px Inter', '500 30px "JetBrains Mono"', '700 30px Caveat'];

const ICON = {
  git: <><circle cx='6' cy='5' r='2.3'/><circle cx='6' cy='19' r='2.3'/><circle cx='18' cy='7' r='2.3'/><path d='M6 7.3v9.4M18 9.3c0 4.5-6.5 4-11 7.6'/></>,
  chat: <path d='M4 5.5h16v10.5H10l-5.5 4v-4H4z' strokeLinejoin='round'/>,
  pen: <><path d='M4.5 19.5l1-4.5L16 4.5l3.5 3.5L9 18.5z' strokeLinejoin='round'/><path d='M13.5 7l3.5 3.5'/></>,
  book: <><path d='M3.5 5.5c3-1.2 6-1 8.5 1 2.5-2 5.5-2.2 8.5-1v13c-3-1.2-6-1-8.5 1-2.5-2-5.5-2.2-8.5-1z' strokeLinejoin='round'/><path d='M12 6.5v13'/></>,
};
// the whole headline is on screen at frame 0 (the cover and the first thing a scroller sees), no build-in
function Hook({ h, t, end }) {
  const words = h.title.split(' '), out = 1 - ease((t - end + .3) / .3);
  return <><div className='scrim' style={{ opacity: out }} /><div className={'hook' + (h.title.length > 46 ? ' long' : '')} style={{ opacity: out, transform: `translateY(${(1 - out) * -30}px)` }}>
    <h1>{(() => {
      const g = []; let open = false;   // *hot* marks a word or a phrase ("*9 p.m.*"); consecutive hot words share one highlight
      words.forEach((w, i) => {
        let s = w, hot = open; if (s.startsWith('*')) { s = s.slice(1); hot = open = true; } if (s.endsWith('*')) { s = s.slice(0, -1); open = false; }
        const last = g[g.length - 1]; if (hot && last && last.hot) last.w += ' ' + s; else g.push({ w: s, hot, i });
      });
      return g.map((x, k) => { const at = -1, q = back((t - at) / .22); return <span key={k} className={'hw' + (x.hot ? ' hot' : '')} style={{ opacity: ease((t - at) / .1), transform: `translateY(${(1 - q) * 40}px) scale(${.7 + .3 * q})` }}>{x.w}</span>; });
    })()}</h1>
  </div></>;
}
function Toast({ x, t, start, end, top }) {
  const q = back((t - start) / .34), o = ease((t - start) / .12) * (1 - ease((t - end + .3) / .3));
  return <div className={'toast ' + (x.tone || '')} style={{ top, opacity: o, transform: `translateY(${(1 - q) * -60}px) scale(${.92 + .08 * q})` }}>
    <div className='ic'><svg viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.2' strokeLinecap='round'>{ICON[x.icon]}</svg></div>
    <div className='tx'><small>{x.app}</small><b>{x.text}</b></div><em>now</em>
  </div>;
}

// lt = seconds since this element's cue (negative = not yet); each sets the element's look for that instant
const spring = lt => lt <= 0 ? 0 : 1 - Math.exp(-5.5 * lt) * Math.cos(9 * lt);
const KEY = {
  up: (n, lt) => { const q = back(lt / .5); n.style.opacity = ease(lt / .22); n.style.transform = `translateY(${(1 - q) * 80}px)`; },
  left: (n, lt) => { const q = spring(lt); n.style.opacity = ease(lt / .15); n.style.transform = `translateX(${(1 - q) * -420}px) rotate(${(1 - q) * -8}deg)`; },
  right: (n, lt) => { const q = spring(lt); n.style.opacity = ease(lt / .15); n.style.transform = `translateX(${(1 - q) * 420}px) rotate(${(1 - q) * 8}deg)`; },
  pop: (n, lt) => { const q = spring(lt); n.style.opacity = ease(lt / .12); n.style.transform = `scale(${.4 + .6 * q})`; },
  grow: (n, lt) => { n.style.transformOrigin = '0 50%'; n.style.transform = `scaleX(${ease(lt / 1.3)})`; },
  scroll: (n, lt, px) => { const k = clamp(lt / 2.2, 0, 1), e = k < .5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2; n.style.transform = `translateY(${-e * px}px)`; },
  move: (n, lt, px) => { n.style.transform = `translateY(${spring(lt) * px}px)`; },
  spin: (n, lt) => { n.style.transform = `rotate(${Math.max(0, lt) * 300}deg)`; },
  beat: (n, lt) => { n.style.transform = `scale(${1 + (lt > 0 ? .16 * Math.max(0, Math.sin(lt * 7)) ** 3 : 0)})`; },
  draw: (n, lt) => { n.style.strokeDasharray = 120; n.style.strokeDashoffset = 120 * (1 - ease(lt / .7)); },
  bob: (n, lt) => { n.style.transform = `translateY(${Math.sin(Math.max(0, lt) * 3.2) * -14}px)`; },
  sea: (n, lt) => { const a = Math.max(0, lt); n.style.transform = `rotate(${Math.sin(a * 2.4) * 7 * ease(a / .4)}deg) translateY(${Math.sin(a * 1.9) * 14}px)`; },
};
// how a panel arrives; cycled by panel number (or panel.enter) so no two in a row come in the same way
const ENTER = ['left', 'right', 'drop', 'flip', 'zoom', 'up'];
const ENTERS = {
  up: lt => { const q = back(lt / .42); return [ease(lt / .2), `translateY(${(1 - q) * 130}px) rotate(${(1 - q) * 2.5 - .55}deg)`]; },
  left: lt => { const q = spring(lt * 1.1); return [ease(lt / .1), `translateX(${(1 - q) * -1150}px) rotate(${(1 - q) * -7 - .55}deg)`]; },
  right: lt => { const q = spring(lt * 1.1); return [ease(lt / .1), `translateX(${(1 - q) * 1150}px) rotate(${(1 - q) * 7 - .55}deg)`]; },
  drop: lt => { const q = spring(lt * 1.05); return [ease(lt / .1), `translateY(${(1 - q) * -1400}px) rotate(${(1 - q) * -5 - .55}deg)`]; },
  flip: lt => { const q = back(lt / .5); return [ease(lt / .15), `perspective(1800px) rotateY(${(1 - q) * -95}deg) rotate(-.55deg)`]; },
  zoom: lt => { const q = spring(lt * 1.1); return [ease(lt / .14), `scale(${.25 + .75 * q}) rotate(${(1 - q) * -12 - .55}deg)`]; },
};
function Note({ tl, b, t, panelStart, rv, nextT }) {
  const p = b._p, rootRef = useRef(null);
  useLayoutEffect(() => {
    const el = rootRef.current; if (!el) return;
    el.querySelectorAll('[data-r]').forEach(n => { const r = +n.dataset.r, at = r === 0 ? panelStart + .25 : rv[r], q = at === undefined ? 0 : clamp((t - at) / .28, 0, 1); n.style.opacity = ease(q); n.style.transform = `translateY(${(1 - back(q)) * 22}px)`; });
    // keyframes for the mini websites: data-a names a motion, data-d delays it, all driven by the frame clock so renders are exact
    el.querySelectorAll('[data-a]').forEach(n => { const host = n.closest('[data-r]'), r = host ? +host.dataset.r : 0, base = r === 0 ? panelStart + .35 : rv[r], lt = base === undefined ? -1 : t - base - (+n.dataset.d || 0); (KEY[n.dataset.a] || KEY.up)(n, lt, +n.dataset.px || 0); });
    el.querySelectorAll('[data-type]').forEach(n => { if (n.dataset.full === undefined) n.dataset.full = n.textContent; const host = n.closest('[data-r]'), r = host ? +host.dataset.r : 0, at = r === 0 ? panelStart + .35 : rv[r], dur = +n.dataset.type || 1.2, q = at === undefined ? 0 : clamp((t - at) / dur, 0, 1), s = n.dataset.full, k = Math.round(s.length * q); n.textContent = s.slice(0, k) + (q > 0 && q < 1 ? '|' : ''); });
  });
  const lt = t - panelStart + .05, prog = clamp((t - panelStart) / (nextT - panelStart), 0, 1), mode = p.enter || ENTER[(p.move - 1) % ENTER.length];
  const [al, tf] = ENTERS[mode](lt), hd = d => clamp((lt - d) / .3, 0, 1);
  return <div className="note" style={{ opacity: al, transform: tf }}>
    <div className="tape" style={{ transform: `rotate(-1.6deg) scaleX(${ease(hd(.3))})` }} />
    <div className="nhead"><div className="num" style={{ transform: `rotate(${-6 - (1 - back(hd(.12))) * 200}deg) scale(${back(hd(.12))})` }}>{p.move}</div>
      <div className="ntitle"><h2 style={{ opacity: ease(hd(.2)), transform: `translateX(${(1 - back(hd(.2))) * 90}px)` }}>{p.title}</h2>
        <span className="scrawl" style={{ display: 'inline-block', opacity: ease(hd(.38)), transform: `translateX(${(1 - back(hd(.38))) * 90}px) rotate(${(1 - ease(hd(.38))) * -6}deg)` }}>{p.note}</span></div></div>
    <div className="ticks">{Array.from({ length: tl.moves }, (_, i) => <i key={i} className={i < p.move - 1 ? 'on' : ''}>{i === p.move - 1 ? <b style={{ width: `${prog * 100}%` }} /> : null}</i>)}</div>
    <div className="app" ref={rootRef}><div className="abar"><span className="cap">{p.cap}</span></div><div className="abody" key={b._k} dangerouslySetInnerHTML={{ __html: p.html }} /></div>
  </div>;
}

// end card: the 3D scene keeps playing (both wave, camera swings round); the question slides up under them
function Outro({ line, t }) {
  const q = spring(t - .15), f = spring(t - .75), w = Math.sin(Math.max(0, t - .75) * 8) * 10 * Math.exp(-Math.max(0, t - .75) * 1.6);
  return <><div className="ofade" style={{ opacity: ease(t / .4) }} />
    <div className="obub" style={{ opacity: ease((t - .15) / .1), transform: `translateY(${(1 - q) * 700}px) rotate(${(1 - q) * 6 - 1.2}deg)` }}><i />{line}</div>
    <div className="ofol" style={{ opacity: ease((t - .75) / .1), transform: `translateX(${(1 - f) * 900}px) rotate(${w}deg)` }}><b>+</b>Follow for more</div></>;
}
function Episode({ tl }) {
  const frame = useCurrentFrame(), t = frame / FPS, canvas = useRef(null), scene = useRef(null);
  const [handle] = useState(() => delayRender('scene'));
  const [ready, setReady] = useState(false);
  const timeline = useRef(null);
  if (!timeline.current) { let panel = null, k = 0, at = -1, rv = {}; const copy = JSON.parse(JSON.stringify(tl)); copy.beats.forEach(x => { if (x.panel !== undefined) { panel = x.panel; if (panel) { k++; at = x.start; rv = {}; } } if (x.reveal !== undefined) rv[x.reveal] = x.start; Object.assign(x, { _p: panel, _k: k, _at: at, _rv: { ...rv } }); }); timeline.current = copy; }
  const T0 = timeline.current;
  useEffect(() => { (async () => { await Promise.all(FONTS.map(f => document.fonts.load(f))); scene.current = await createScene(canvas.current, T0); setReady(true); continueRender(handle); })().catch(e => { console.error(e); throw e; }); }, []);
  useLayoutEffect(() => { if (ready && scene.current) scene.current.seek(Math.min(t, T0.endAt + .4)); }, [ready, t]);
  let cur = T0.beats[0]; for (const x of T0.beats) if (x.start <= t) cur = x; else break;
  const idx = T0.beats.indexOf(cur); let nextT = T0.endAt; for (let i = idx + 1; i < T0.beats.length; i++) if (T0.beats[i].panel !== undefined) { nextT = T0.beats[i].start; break; }
  const on = !!cur._p, chunk = (cur.chunks || []).find(c => t >= c.s && t < c.e);
  const firstPanel = (T0.beats.find(x => x._p) || T0.beats[Math.min(3, T0.beats.length - 1)]).start, hookEnd = Math.min(firstPanel - .05, (T0.beats[1] ? T0.beats[1].end : firstPanel) + .9), tb = T0.beats.find(x => x.toast);
  const out = t >= T0.endAt ? t - T0.endAt : null;
  return <AbsoluteFill style={{ background: '#000' }}>
    <Audio src={staticFile(tl.id + '.wav')} />
    <canvas ref={canvas} width={1080} height={1920} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920 }} />
    {on && out === null ? <Note tl={T0} b={cur} t={t} panelStart={cur._at} rv={cur._rv} nextT={nextT} /> : null}
    {T0.hook && t < hookEnd ? <Hook h={T0.hook} t={t} end={hookEnd} /> : null}
    {tb && t >= Math.max(tb.start, .9) && t < hookEnd ? <Toast x={tb.toast} t={t} start={Math.max(tb.start, .9)} end={hookEnd} top={1190} /> : null}
    {chunk && out === null ? <div className={`cap-line ${cur.who} ${on ? 'lo' : ''}`} style={{ transform: `scale(${.96 + .04 * back((t - chunk.s) / .12)})` }}><div className='box'>{chunk.words.map((w, i) => <React.Fragment key={i}><span className={'w' + (t >= w.s && t < w.e + .05 ? ' now' : '')}>{w.w}</span>{' '}</React.Fragment>)}</div></div> : null}
    {out !== null ? <Outro line={T0.outro.line} t={out} /> : null}
  </AbsoluteFill>;
}
// every timeline prep.js writes registers itself as a composition
const ctx = require.context('./timelines', false, /\.json$/), ALL = ctx.keys().map(k => ctx(k));
registerRoot(() => <>{ALL.map(tl => <Composition key={tl.id} id={tl.id} component={Episode} width={1080} height={1920} fps={FPS} durationInFrames={Math.ceil(tl.duration * FPS)} defaultProps={{ tl }} />)}</>);
