// Hero "agent graph" — a living network of nodes and signal pulses.
// Pinned three.js build; bails out gracefully on reduced motion or no WebGL.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('agentGraph');
const fallback = document.querySelector('.hero-fallback');

function showFallback() {
  if (canvas) canvas.style.display = 'none';
  if (fallback) fallback.classList.add('show');
}

// Under reduced motion we still draw the graph — just as a static frame.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!canvas) {
  showFallback();
} else {
  init();
}

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    showFallback();
    return;
  }

  const DPR_CAP = 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 16);

  const CYAN = new THREE.Color('#00c3ff');
  const BLUE = new THREE.Color('#005eff');
  const AMBER = new THREE.Color('#ff9e2c');

  // --- Node cloud: flattened ellipsoid, denser toward center ---
  const NODE_COUNT = window.innerWidth < 760 ? 70 : 130;
  const positions = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    // Gaussian-ish distribution via averaging
    const r = () => (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    positions.push(new THREE.Vector3(r() * 26, r() * 13, r() * 9));
  }

  // --- Edges: connect each node to its 2 nearest neighbors (deduped) ---
  const edgeSet = new Set();
  const edges = [];
  positions.forEach((p, i) => {
    const dists = positions
      .map((q, j) => ({ j, d: i === j ? Infinity : p.distanceToSquared(q) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    dists.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([i, j]);
      }
    });
  });

  const group = new THREE.Group();
  scene.add(group);

  // Lines
  const linePositions = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], k) => {
    linePositions.set([...positions[a].toArray(), ...positions[b].toArray()], k * 6);
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: BLUE, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  group.add(new THREE.LineSegments(lineGeo, lineMat));

  // Glow dot sprite (canvas-generated — no asset download)
  function dotTexture(color) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, color);
    grad.addColorStop(0.35, color + 'cc');
    grad.addColorStop(1, 'transparent');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  // Nodes
  const nodeGeo = new THREE.BufferGeometry().setFromPoints(positions);
  const nodeMat = new THREE.PointsMaterial({
    size: 0.55, map: dotTexture('#5ce1ff'), transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  group.add(new THREE.Points(nodeGeo, nodeMat));

  // A few "agent" nodes in amber, slightly larger
  const agentIdx = [3, 19, 41, 57].filter(i => i < NODE_COUNT);
  const agentGeo = new THREE.BufferGeometry().setFromPoints(agentIdx.map(i => positions[i]));
  const agentMat = new THREE.PointsMaterial({
    size: 1.0, map: dotTexture('#ff9e2c'), transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  group.add(new THREE.Points(agentGeo, agentMat));

  // --- Pulses traveling along edges ---
  const PULSE_COUNT = window.innerWidth < 760 ? 6 : 12;
  const pulses = [];
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PULSE_COUNT * 3), 3));
  const pulseMat = new THREE.PointsMaterial({
    size: 0.8, map: dotTexture('#00c3ff'), transparent: true, opacity: 1,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
  group.add(pulsePoints);

  for (let i = 0; i < PULSE_COUNT; i++) {
    pulses.push({
      edge: edges[Math.floor(Math.random() * edges.length)],
      t: Math.random(),
      speed: 0.15 + Math.random() * 0.35,
    });
  }

  // --- Interaction state ---
  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reducedMotion) renderer.render(scene, camera);
  }
  resize();
  window.addEventListener('resize', resize);

  // Static mode: one composed frame, no animation loop, no listeners.
  if (reducedMotion) {
    group.rotation.set(-0.08, 0.35, 0);
    renderer.render(scene, camera);
    return;
  }

  // --- Render loop: paused when hero is off-screen or tab hidden ---
  let running = true;
  let rafId = null;
  const clock = new THREE.Clock();
  const posAttr = pulseGeo.getAttribute('position');
  const tmp = new THREE.Vector3();

  function frame() {
    rafId = null;
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    group.rotation.y += dt * 0.04;
    group.rotation.y += (pointer.x * 0.18 - group.rotation.y) * dt * 0.6;
    group.rotation.x += (pointer.y * 0.10 - group.rotation.x) * dt * 0.6;
    group.position.y = Math.sin(t * 0.3) * 0.35;

    pulses.forEach((p, i) => {
      p.t += dt * p.speed;
      if (p.t >= 1) {
        p.t = 0;
        p.edge = edges[Math.floor(Math.random() * edges.length)];
      }
      tmp.lerpVectors(positions[p.edge[0]], positions[p.edge[1]], p.t);
      posAttr.setXYZ(i, tmp.x, tmp.y, tmp.z);
    });
    posAttr.needsUpdate = true;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }

  function setRunning(v) {
    if (v === running) return;
    running = v;
    if (running && rafId === null) {
      clock.getDelta(); // discard pause time
      rafId = requestAnimationFrame(frame);
    }
  }

  new IntersectionObserver(
    ([entry]) => setRunning(entry.isIntersecting && !document.hidden),
    { threshold: 0.02 }
  ).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    setRunning(!document.hidden);
  });

  rafId = requestAnimationFrame(frame);
}
