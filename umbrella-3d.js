import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const CELLS = [
  { num: "01", name: "Early Intervention Cell", short: "Early Intervention", sub: "0–6 Years Care", desc: "Early identification, developmental screening, therapy guidance & parent orientation for 0–6 years.", group: "foundation", color: "#10a372" },
  { num: "02", name: "Education Cell", short: "Education Cell", sub: "Inclusive Schools", desc: "Inclusive pre-schooling, special teaching methodologies, accessible schools & academic bridges.", group: "foundation", color: "#1d6fe6" },
  { num: "03", name: "Social Welfare / Govt Cell", short: "Social Welfare", sub: "Govt & Schemes", desc: "Central & state welfare schemes, disability documentation, pensions, scholarships & institutional benefits.", group: "rights", color: "#163760" },
  { num: "04", name: "Health Care Cell", short: "Health Care Cell", sub: "Medical & Rehab", desc: "Medical specialists, rehabilitation therapies, mental well-being & lifelong health support networks.", group: "foundation", color: "#0c8b60" },
  { num: "05", name: "Assistive Solutions Cell", short: "Assistive Tech", sub: "Aids & Mobility", desc: "Hands-on exposure to mobility aids, sensory devices, adaptive tools & assistive technologies.", group: "rights", color: "#f58220" },
  { num: "06", name: "Legal & Rights Cell", short: "Legal & Rights", sub: "PwD Advocacy", desc: "Rights of Persons with Disabilities awareness, concessions, workplace protections & legal advocacy.", group: "rights", color: "#6d28d9" },
  { num: "07", name: "Self-Employment Cell", short: "Self-Employment", sub: "Rural Enterprise", desc: "Rural enterprise mentoring, micro-business training, SHG support & loan facilitation pathways.", group: "livelihood", color: "#2563eb" },
  { num: "08", name: "Wage Employment Cell", short: "Wage Employment", sub: "Jobs & Careers", desc: "Connecting skilled PwDs with inclusive employers, apprenticeships, career coaches & job opportunities.", group: "livelihood", color: "#0d8594" },
  { num: "09", name: "Marriage Bureau Cell", short: "Marriage Bureau", sub: "Family Inclusion", desc: "Respectful partnership facilitation, relationship rights & social acceptance for inclusive families.", group: "livelihood", color: "#d12f7a" },
  { num: "10", name: "Achievers / Role Model Cell", short: "Role Models", sub: "Pride & Heroes", desc: "Inspiring community role models proving what is possible across education, enterprise & leadership.", group: "livelihood", color: "#f59e0b" },
  { num: "11", name: "Garv Se Bazaar (Pride)", short: "Garv Se Bazaar", sub: "Pride Market", desc: "Celebratory marketplace showcasing products, crafts, and services created by Persons with Disabilities.", group: "livelihood", color: "#c81e3d" }
];

const GORE_COUNT = CELLS.length;
const U_SEGMENTS = 14;
const V_SEGMENTS = 8;
const APEX_Y = 1.65;
const UP_VEC = new THREE.Vector3(0, 1, 0);

function createSoftShadowTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
  grad.addColorStop(0, "rgba(14, 38, 68, 0.22)");
  grad.addColorStop(0.55, "rgba(14, 38, 68, 0.08)");
  grad.addColorStop(1, "rgba(14, 38, 68, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function drawRoundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCellGlyph(ctx, idx, cx, cy, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (idx) {
    case 0: // Heart + cross (Early Intervention)
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.bezierCurveTo(-18, 2, -18, -14, -6, -14);
      ctx.bezierCurveTo(-1, -14, 0, -9, 0, -9);
      ctx.bezierCurveTo(0, -9, 1, -14, 6, -14);
      ctx.bezierCurveTo(18, -14, 18, 2, 0, 14);
      ctx.stroke();
      break;
    case 1: // Graduation cap (Education)
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.lineTo(0, -10);
      ctx.lineTo(16, -2);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-9, 3);
      ctx.lineTo(-9, 11);
      ctx.quadraticCurveTo(0, 16, 9, 11);
      ctx.lineTo(9, 3);
      ctx.stroke();
      break;
    case 2: // Capitol building pillars (Govt / Welfare)
      ctx.beginPath();
      ctx.moveTo(-15, -4);
      ctx.lineTo(0, -13);
      ctx.lineTo(15, -4);
      ctx.closePath();
      ctx.stroke();
      for (const px of [-9, -3, 3, 9]) {
        ctx.beginPath();
        ctx.moveTo(px, -3);
        ctx.lineTo(px, 11);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-16, 12);
      ctx.lineTo(16, 12);
      ctx.stroke();
      break;
    case 3: // Medical box cross (Health Care)
      drawRoundedRectPath(ctx, -15, -11, 30, 22, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 6);
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
      break;
    case 4: // Sunburst gear (Assistive Solutions)
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.stroke();
      for (let a = 0; a < 8; a++) {
        const ang = (a * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 10, Math.sin(ang) * 10);
        ctx.lineTo(Math.cos(ang) * 14, Math.sin(ang) * 14);
        ctx.stroke();
      }
      break;
    case 5: // Balance Scales (Legal & Rights)
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(0, 13);
      ctx.moveTo(-12, -8);
      ctx.lineTo(12, -8);
      ctx.moveTo(-7, 13);
      ctx.lineTo(7, 13);
      ctx.stroke();
      break;
    case 6: // Storefront (Self-Employment)
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(-10, -12);
      ctx.lineTo(10, -12);
      ctx.lineTo(14, -4);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(-11, -3, 22, 15);
      break;
    case 7: // Briefcase (Wage Employment)
      drawRoundedRectPath(ctx, -14, -7, 28, 19, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-6, -7);
      ctx.lineTo(-6, -12);
      ctx.lineTo(6, -12);
      ctx.lineTo(6, -7);
      ctx.stroke();
      break;
    case 8: // Interlocked rings (Marriage Bureau)
      ctx.beginPath();
      ctx.arc(-5, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(5, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 9: // Star (Role Models)
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 === 0 ? 14 : 6;
        const ang = -Math.PI / 2 + (k * Math.PI) / 5;
        if (k === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    default: // Shopping bag (Garv Se Bazaar)
      ctx.strokeRect(-12, -5, 24, 18);
      ctx.beginPath();
      ctx.arc(0, -5, 6, Math.PI, 0);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function wrapTextLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function createCellPlaqueTexture(cell, idx, maxAnisotropy) {
  const w = 1024;
  const h = 500;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  // Crisp bright white card face (self-lit MeshBasicMaterial keeps it spotless white)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, "#ffffff");
  bgGrad.addColorStop(1, "#f3f8ff");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Crisp high-contrast border so cards stand out clearly at any viewport size
  ctx.strokeStyle = "rgba(9, 27, 51, 0.34)";
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, w - 12, h - 12);

  // Bold top color accent ribbon
  ctx.fillStyle = cell.color;
  ctx.fillRect(0, 0, w, 34);

  // Grommet hanging eyelet circle centered near top bar
  ctx.beginPath();
  ctx.arc(w / 2, 20, 13, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#0e2644";
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Top-left icon tile
  drawRoundedRectPath(ctx, 40, 58, 96, 96, 22);
  ctx.fillStyle = `${cell.color}24`;
  ctx.fill();
  ctx.save();
  ctx.translate(88, 106);
  ctx.scale(1.75, 1.75);
  drawCellGlyph(ctx, idx, 0, 0, cell.color);
  ctx.restore();

  // Top-right high-contrast solid number pill badge (01..11)
  drawRoundedRectPath(ctx, w - 168, 60, 128, 70, 20);
  ctx.fillStyle = cell.color;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 46px 'Barlow Condensed', 'Bahnschrift Condensed', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(cell.num, w - 104, 96);

  // High-contrast, large-scale wrapped Cell Title for instant mobile & desktop legibility
  ctx.fillStyle = "#091b33";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "800 66px 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";
  let titleLines = wrapTextLines(ctx, cell.name, w - 80);
  if (titleLines.length > 2) {
    ctx.font = "800 58px 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";
    titleLines = wrapTextLines(ctx, cell.name, w - 80);
  }

  if (titleLines.length === 1) {
    ctx.fillText(titleLines[0], 40, 266);
    ctx.fillStyle = "#314764";
    ctx.font = "700 44px 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(cell.sub, 40, 362);
  } else {
    ctx.font = "800 60px 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";
    titleLines = wrapTextLines(ctx, cell.name, w - 80);
    ctx.fillText(titleLines[0], 40, 246);
    ctx.fillText(titleLines.slice(1).join(" "), 40, 320);
    ctx.fillStyle = "#314764";
    ctx.font = "700 42px 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(cell.sub, 40, 412);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy || 4);
  return tex;
}

function createRibCurvePosition(u, phi, openProgress, lift, target) {
  const radiusScale = 0.16 + openProgress * 2.18 + lift * 0.14;
  const dropTotal = 1.92 - openProgress * 0.96 - lift * 0.08;
  const r = 0.055 + radiusScale * Math.sin(u * Math.PI * 0.51);
  const y = APEX_Y - dropTotal * Math.pow(u, 1.82 - openProgress * 0.14);
  target.set(Math.cos(phi) * r, y, Math.sin(phi) * r);
  return target;
}

function initUmbrella3D() {
  const stageWrap = document.getElementById("umbrellaStageWrap");
  const canvas = document.getElementById("umbrellaCanvas");
  if (!stageWrap || !canvas) return;

  const detailCard = document.getElementById("umbrellaDetailCard");
  const printSnapshotImg = document.getElementById("umbrellaPrintSnapshot");
  const toggleBtn = document.getElementById("toggleUmbrellaBtn");
  const rotateBtn = document.getElementById("toggleRotateBtn");
  const resetBtn = document.getElementById("resetUmbrellaBtn");

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsapRef = window.gsap || null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });
  } catch (err) {
    stageWrap.classList.add("webgl-unavailable");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();

  const width = stageWrap.clientWidth || 800;
  const height = stageWrap.clientHeight || 420;
  const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 80);

  function computeResponsiveCam(aspect) {
    // Frame entire wide 11-color umbrella + hanging cell cards closely on both desktop and mobile without edge clipping
    const isNarrow = aspect < 1.08;
    const clamped = Math.max(aspect, 0.76);
    const dist = isNarrow
      ? Math.max(9.2, 10.15 / clamped)
      : aspect < 1.35
        ? Math.max(8.1, 10.5 / clamped)
        : 7.55;
    return {
      x: 0,
      y: isNarrow ? 1.56 : 1.12,
      z: dist,
      targetY: isNarrow ? 0.02 : 0.08
    };
  }

  const initCam = computeResponsiveCam(width / height);
  camera.position.set(initCam.x, initCam.y, initCam.z);
  renderer.setSize(width, height, false);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, initCam.targetY, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = Math.PI * 0.72;
  controls.update();

  // Studio Lighting
  const hemi = new THREE.HemisphereLight(0xffffff, 0xc7daf3, 1.42);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xfff9f0, 1.5);
  keyLight.position.set(4.5, 6.8, 5.2);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.05);
  rimLight.position.set(-5.2, 2.2, -4.5);
  scene.add(rimLight);

  const underBounce = new THREE.PointLight(0xffedd5, 0.72, 10);
  underBounce.position.set(0, 0.2, 0.8);
  scene.add(underBounce);

  // Soft Ground Shadow Disc
  const shadowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6),
    new THREE.MeshBasicMaterial({
      map: createSoftShadowTexture(),
      transparent: true,
      depthWrite: false
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.set(0, -1.68, 0);
  scene.add(shadowDisc);

  // Main Umbrella Assembly Group (balanced between top finial headroom and bottom controls)
  const BASE_Y = 0.20;
  const umbrellaRoot = new THREE.Group();
  umbrellaRoot.position.y = BASE_Y;
  scene.add(umbrellaRoot);

  // Shared Metal & Timber Materials
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xdbe4ef,
    metalness: 0.78,
    roughness: 0.24
  });

  const darkRibMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.65,
    roughness: 0.35
  });

  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x6b3a1e,
    roughness: 0.36,
    metalness: 0.08
  });

  const saffronAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf58220,
    emissive: 0xf58220,
    emissiveIntensity: 0.22,
    roughness: 0.3,
    metalness: 0.12
  });

  // Central Shaft (apex down to collar)
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.036, 2.95, 20),
    chromeMat
  );
  shaft.position.y = 0.32;
  umbrellaRoot.add(shaft);

  // Crown Cap & Saffron Finial Tip
  const crownCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.11, 0.16, 22),
    chromeMat
  );
  crownCap.position.y = APEX_Y + 0.06;
  umbrellaRoot.add(crownCap);

  const finialCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.055, 0.22, 20),
    chromeMat
  );
  finialCone.position.y = APEX_Y + 0.24;
  umbrellaRoot.add(finialCone);

  const finialSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 20, 20),
    saffronAccentMat
  );
  finialSphere.position.y = APEX_Y + 0.37;
  umbrellaRoot.add(finialSphere);

  // Sliding Runner Collar along the shaft
  const runnerMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.072, 0.072, 0.14, 22),
    chromeMat
  );
  umbrellaRoot.add(runnerMesh);

  const runnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.076, 0.015, 10, 24),
    saffronAccentMat
  );
  runnerRing.rotation.x = Math.PI / 2;
  runnerMesh.add(runnerRing);

  // J-Shaped Ergonomic Timber Handle (proportioned to stay cleanly above toolbar)
  const handleCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.068, 0.08, 20),
    saffronAccentMat
  );
  handleCollar.position.y = -1.16;
  umbrellaRoot.add(handleCollar);

  const jCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.19, 0),
    new THREE.Vector3(0, -1.50, 0),
    new THREE.Vector3(0.04, -1.66, 0),
    new THREE.Vector3(0.17, -1.71, 0),
    new THREE.Vector3(0.27, -1.63, 0),
    new THREE.Vector3(0.28, -1.48, 0)
  ]);
  const jHandleMesh = new THREE.Mesh(
    new THREE.TubeGeometry(jCurve, 32, 0.058, 16, false),
    handleMat
  );
  umbrellaRoot.add(jHandleMesh);

  const jTipCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.059, 16, 16),
    handleMat
  );
  jTipCap.position.set(0.28, -1.48, 0);
  umbrellaRoot.add(jTipCap);

  // 11 Mechanical Canopy Gores, Ribs, Tip Beads, Struts + 11 Hanging 3D Cell Plaques!
  const gores = [];
  const ribs = [];
  const struts = [];
  const tipBeads = [];
  const hangingItems = [];
  const pickableMeshes = [];

  const tmpVecA = new THREE.Vector3();
  const tmpVecB = new THREE.Vector3();
  const tmpStrutStart = new THREE.Vector3();
  const tmpStrutDir = new THREE.Vector3();
  const tmpAnchorPos = new THREE.Vector3();

  const plaqueBoxGeom = new THREE.BoxGeometry(1.24, 0.60, 0.028);
  const CORD_TIERS = [0.08, 0.76, 0.08, 0.76, 0.08, 0.76, 0.08, 0.76, 0.08, 0.76, 0.42];

  for (let i = 0; i < GORE_COUNT; i++) {
    const cell = CELLS[i];

    // 1) Gore fabric mesh
    const vertexCount = (U_SEGMENTS + 1) * (V_SEGMENTS + 1);
    const positions = new Float32Array(vertexCount * 3);
    const indices = [];
    for (let iu = 0; iu < U_SEGMENTS; iu++) {
      for (let iv = 0; iv < V_SEGMENTS; iv++) {
        const a = iu * (V_SEGMENTS + 1) + iv;
        const b = a + 1;
        const c = (iu + 1) * (V_SEGMENTS + 1) + iv;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setIndex(indices);

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(cell.color),
      emissive: new THREE.Color(cell.color),
      emissiveIntensity: 0.04,
      roughness: 0.44,
      metalness: 0.04,
      sheen: 0.45,
      sheenRoughness: 0.55,
      clearcoat: 0.14,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide
    });

    const goreMesh = new THREE.Mesh(geom, mat);
    goreMesh.userData = { cellIndex: i, type: "gore" };
    umbrellaRoot.add(goreMesh);
    pickableMeshes.push(goreMesh);

    gores.push({
      index: i,
      cell,
      mesh: goreMesh,
      geom,
      mat,
      positions,
      lift: 0,
      targetOpacity: 0.98,
      targetEmissive: 0.04
    });

    // 2) Seam metallic rib underneath
    const ribVerts = new Float32Array((U_SEGMENTS + 1) * 3);
    const ribGeom = new THREE.BufferGeometry();
    ribGeom.setAttribute("position", new THREE.BufferAttribute(ribVerts, 3));
    const ribLine = new THREE.Line(
      ribGeom,
      new THREE.LineBasicMaterial({ color: 0x0f2744, transparent: true, opacity: 0.65 })
    );
    umbrellaRoot.add(ribLine);

    const strutMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 1, 8),
      darkRibMat
    );
    umbrellaRoot.add(strutMesh);

    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 12),
      chromeMat
    );
    umbrellaRoot.add(bead);

    ribs.push({ geom: ribGeom, verts: ribVerts });
    struts.push(strutMesh);
    tipBeads.push(bead);

    // 3) Hanging 3D Cell Plaque & Metallic Drop Cord suspended from panel outer hem!
    const cordPivot = new THREE.Group();
    cordPivot.rotation.order = "YXZ";
    umbrellaRoot.add(cordPivot);

    // Staggered drop tiers keep enlarged cards separated cleanly without colliding
    const cordLength = CORD_TIERS[i] || 0.22;

    const cordMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(cell.color),
      transparent: true,
      opacity: 0.82
    });
    const cordMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, cordLength, 8),
      cordMat
    );
    cordMesh.position.y = -cordLength * 0.5;
    cordPivot.add(cordMesh);

    // Metallic eyelet ring at hem anchor & card top
    const eyeletMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.009, 8, 16),
      chromeMat
    );
    eyeletMesh.position.y = -0.01;
    cordPivot.add(eyeletMesh);

    const plaqueTex = createCellPlaqueTexture(cell, i, maxAnisotropy);
    // Self-lit unshaded material keeps hanging white cards bright & crystal clear beneath the canopy
    const trimMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(cell.color),
      transparent: true,
      opacity: 0.99,
      toneMapped: false
    });
    const faceMat = new THREE.MeshBasicMaterial({
      map: plaqueTex,
      transparent: true,
      opacity: 0.99,
      toneMapped: false
    });

    const plaqueMesh = new THREE.Mesh(plaqueBoxGeom, [
      trimMat,
      trimMat,
      trimMat,
      trimMat,
      faceMat,
      faceMat
    ]);
    plaqueMesh.position.y = -cordLength - 0.295;
    plaqueMesh.userData = { cellIndex: i, type: "plaque" };
    cordPivot.add(plaqueMesh);
    pickableMeshes.push(plaqueMesh);

    hangingItems.push({
      index: i,
      cordPivot,
      cordMesh,
      cordMat,
      plaqueMesh,
      trimMat,
      faceMat,
      cordLength,
      swingPhase: i * 0.85
    });
  }

  // Subtle Floating Halo Motes
  const moteCount = 30;
  const motePositions = new Float32Array(moteCount * 3);
  const moteColors = new Float32Array(moteCount * 3);
  const cTmp = new THREE.Color();
  for (let m = 0; m < moteCount; m++) {
    const ang = (m / moteCount) * Math.PI * 2;
    const rad = 2.25 + (m % 4) * 0.35;
    motePositions[m * 3] = Math.cos(ang) * rad;
    motePositions[m * 3 + 1] = -0.25 + ((m * 0.73) % 2.3);
    motePositions[m * 3 + 2] = Math.sin(ang) * rad;

    cTmp.set(CELLS[m % GORE_COUNT].color);
    moteColors[m * 3] = cTmp.r;
    moteColors[m * 3 + 1] = cTmp.g;
    moteColors[m * 3 + 2] = cTmp.b;
  }
  const moteGeom = new THREE.BufferGeometry();
  moteGeom.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  moteGeom.setAttribute("color", new THREE.BufferAttribute(moteColors, 3));
  const motes = new THREE.Points(
    moteGeom,
    new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.45
    })
  );
  umbrellaRoot.add(motes);

  // Interactive Rig State
  const rigState = {
    openProgress: prefersReducedMotion ? 1.0 : 0.92,
    autoRotate: !prefersReducedMotion,
    hoveredIndex: -1,
    selectedIndex: -1,
    activeFilter: "all",
    rotSpeed: 0.0024,
    hasBloomedOnScroll: prefersReducedMotion
  };

  let elapsed = 0;

  function updateUmbrellaGeometry(snapOpacities = false) {
    const p = rigState.openProgress;
    const stepPhi = (Math.PI * 2) / GORE_COUNT;
    const runnerY = -0.44 + p * 1.08;
    runnerMesh.position.y = runnerY;
    shadowDisc.scale.setScalar(0.55 + p * 0.45);

    const ry = umbrellaRoot.rotation.y;
    const sinR = Math.sin(ry);
    const cosR = Math.cos(ry);
    const camHorizLen = Math.hypot(camera.position.x - controls.target.x, camera.position.z - controls.target.z) || 1;
    const camDirX = (camera.position.x - controls.target.x) / camHorizLen;
    const camDirZ = (camera.position.z - controls.target.z) / camHorizLen;
    const isNarrowView = camera.aspect < 1.08;

    for (let i = 0; i < GORE_COUNT; i++) {
      const g = gores[i];
      const h = hangingItems[i];
      const phi0 = i * stepPhi;
      const phi1 = (i + 1) * stepPhi;
      const phiMid = (phi0 + phi1) * 0.5;
      const posArr = g.positions;
      let ptr = 0;

      for (let iu = 0; iu <= U_SEGMENTS; iu++) {
        const u = iu / U_SEGMENTS;
        for (let iv = 0; iv <= V_SEGMENTS; iv++) {
          const v = iv / V_SEGMENTS;
          const phi = phi0 + (phi1 - phi0) * v;
          createRibCurvePosition(u, phi, p, g.lift, tmpVecA);

          const midWeight = Math.sin(Math.PI * v);
          const billow = 0.07 * u * midWeight * p;
          const pleatFold = -0.055 * (1 - p) * u * midWeight;
          const dr = billow + pleatFold;
          const nx = Math.cos(phi);
          const nz = Math.sin(phi);
          const scallop = Math.pow(u, 2.2) * 0.115 * midWeight * p;

          posArr[ptr++] = tmpVecA.x + nx * dr;
          posArr[ptr++] = tmpVecA.y + scallop;
          posArr[ptr++] = tmpVecA.z + nz * dr;
        }
      }

      g.geom.attributes.position.needsUpdate = true;
      g.geom.computeVertexNormals();
      g.geom.computeBoundingSphere();
      g.geom.computeBoundingBox();
      g.mat.emissiveIntensity += (g.targetEmissive - g.mat.emissiveIntensity) * 0.18;
      g.mat.opacity += (g.targetOpacity - g.mat.opacity) * 0.16;

      // Update Seam Rib, Tip Bead, and Runner Strut
      const seamLift = Math.max(g.lift, gores[(i - 1 + GORE_COUNT) % GORE_COUNT].lift);
      const rArr = ribs[i].verts;
      let rPtr = 0;
      for (let iu = 0; iu <= U_SEGMENTS; iu++) {
        const u = iu / U_SEGMENTS;
        createRibCurvePosition(u, phi0, p, seamLift, tmpVecB);
        rArr[rPtr++] = tmpVecB.x;
        rArr[rPtr++] = tmpVecB.y - 0.016;
        rArr[rPtr++] = tmpVecB.z;
      }
      ribs[i].geom.attributes.position.needsUpdate = true;

      createRibCurvePosition(1, phi0, p, seamLift, tmpVecB);
      tipBeads[i].position.set(
        tmpVecB.x + Math.cos(phi0) * 0.03,
        tmpVecB.y - 0.015,
        tmpVecB.z + Math.sin(phi0) * 0.03
      );

      createRibCurvePosition(0.46, phi0, p, seamLift, tmpVecB);
      tmpStrutStart.set(Math.cos(phi0) * 0.06, runnerY, Math.sin(phi0) * 0.06);
      tmpStrutDir.subVectors(tmpVecB, tmpStrutStart);
      const dist = tmpStrutDir.length();
      if (dist > 0.001) {
        tmpStrutDir.normalize();
        struts[i].position.copy(tmpStrutStart).addScaledVector(tmpStrutDir, dist * 0.5);
        struts[i].scale.set(1, dist, 1);
        struts[i].quaternion.setFromUnitVectors(UP_VEC, tmpStrutDir);
      }

      // Position & animate Hanging Service Cell Plaque directly on canopy panel rim
      createRibCurvePosition(0.98, phiMid, p, g.lift, tmpAnchorPos);
      const rimScallopY = Math.pow(0.98, 2.2) * 0.115 * p;
      const radialPush = 0.06 * p;
      h.cordPivot.position.set(
        tmpAnchorPos.x + Math.cos(phiMid) * radialPush,
        tmpAnchorPos.y + rimScallopY - 0.01,
        tmpAnchorPos.z + Math.sin(phiMid) * radialPush
      );

      // Keep every hanging card swiveled toward the viewer for instant legibility from any orbit angle
      const camYaw = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
      h.cordPivot.rotation.y = camYaw - umbrellaRoot.rotation.y;

      // Foreground vs back-hemisphere depth focus so front cards stay bold & rear cards never clutter mobile
      const ax = h.cordPivot.position.x;
      const az = h.cordPivot.position.z;
      const anchorRad = Math.hypot(ax, az) || 1;
      const wx = ax * cosR + az * sinR;
      const wz = -ax * sinR + az * cosR;
      const frontDot = (wx * camDirX + wz * camDirZ) / anchorRad;
      const frontFactor = THREE.MathUtils.clamp((frontDot + 0.15) / 1.15, 0, 1);
      const minRearOpacity = isNarrowView ? 0.22 : 0.46;
      const depthFade = minRearOpacity + (1 - minRearOpacity) * Math.pow(frontFactor, 0.85);
      const foregroundBoost = isNarrowView ? 0.92 + 0.34 * frontFactor : 0.94 + 0.12 * frontFactor;

      // Gentle real-world pendulum sway from umbrella movement & breeze
      const breeze = prefersReducedMotion ? 0 : Math.sin(elapsed * 1.85 + h.swingPhase) * 0.04;
      const highlightBoost = g.lift > 0.5 ? 1.15 : 1.0;
      const foldScale = (0.28 + 0.72 * p) * highlightBoost * foregroundBoost;
      h.cordPivot.scale.setScalar(foldScale);
      h.cordPivot.rotation.x = breeze * p + (1 - p) * 0.12;
      h.cordPivot.rotation.z = (prefersReducedMotion ? 0 : Math.cos(elapsed * 1.45 + h.swingPhase) * 0.032) * p;

      const openVis = Math.max(0, (p - 0.44) / 0.56);
      const plaqueOpacity = g.targetOpacity * openVis * (snapOpacities ? Math.max(depthFade, 0.72) : (rigState.selectedIndex === i || rigState.hoveredIndex === i ? 1.0 : depthFade));
      const lerpRate = snapOpacities ? 1.0 : (openVis === 0 ? 0.34 : 0.22);
      h.faceMat.opacity = lerpRate >= 1.0 ? plaqueOpacity : h.faceMat.opacity + (plaqueOpacity - h.faceMat.opacity) * lerpRate;
      if (openVis === 0 && h.faceMat.opacity < 0.04) h.faceMat.opacity = 0;
      h.trimMat.opacity = h.faceMat.opacity;
      h.cordMat.opacity = Math.min(0.85, h.faceMat.opacity * 0.85);
      h.cordPivot.visible = h.faceMat.opacity > 0.02;
    }
  }

  function syncHud() {
    const activeIdx = rigState.hoveredIndex !== -1 ? rigState.hoveredIndex : rigState.selectedIndex;
    if (!detailCard) return;

    if (activeIdx >= 0 && CELLS[activeIdx]) {
      const c = CELLS[activeIdx];
      detailCard.hidden = false;
      detailCard.style.borderLeftColor = c.color;

      const titleEl = document.createElement("strong");
      titleEl.className = "umbrella-detail-title";
      titleEl.textContent = `${c.num} • ${c.name}`;

      const descEl = document.createElement("span");
      descEl.textContent = c.desc;

      detailCard.replaceChildren(titleEl, descEl);
    } else {
      detailCard.hidden = true;
      detailCard.replaceChildren();
    }
  }

  function updateGoreTargets() {
    const activeIdx = rigState.hoveredIndex !== -1 ? rigState.hoveredIndex : rigState.selectedIndex;
    const filter = rigState.activeFilter;

    gores.forEach((g, idx) => {
      const matchesFilter = filter === "all" || g.cell.group === filter;
      const isHighlighted = idx === activeIdx;

      const nextLift = isHighlighted ? 1.0 : filter !== "all" && matchesFilter ? 0.32 : 0;
      const nextOpacity = matchesFilter ? (isHighlighted ? 1.0 : 0.96) : 0.2;
      const nextEmissive = isHighlighted ? 0.26 : matchesFilter && filter !== "all" ? 0.1 : 0.04;

      g.targetOpacity = nextOpacity;
      g.targetEmissive = nextEmissive;

      if (gsapRef && !prefersReducedMotion) {
        gsapRef.to(g, {
          lift: nextLift,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
      } else {
        g.lift = nextLift;
      }
    });

    syncHud();
  }

  function setUmbrellaOpen(open) {
    const target = open ? 1.0 : 0.0;
    if (toggleBtn) {
      toggleBtn.textContent = open ? "Fold Umbrella" : "Open Umbrella";
      toggleBtn.setAttribute("aria-pressed", String(open));
    }

    if (gsapRef && !prefersReducedMotion) {
      gsapRef.to(rigState, {
        openProgress: target,
        duration: open ? 1.05 : 0.72,
        ease: open ? "elastic.out(1, 0.72)" : "power3.inOut",
        overwrite: "auto",
        onComplete: syncHud
      });
    } else {
      rigState.openProgress = target;
      updateUmbrellaGeometry();
      syncHud();
    }
  }

  function rotateToGore(index) {
    if (index < 0 || index >= GORE_COUNT) return;
    const stepPhi = (Math.PI * 2) / GORE_COUNT;
    const midPhi = (index + 0.5) * stepPhi;
    const desiredY = midPhi - Math.PI * 0.5;
    const currentY = umbrellaRoot.rotation.y;
    const delta = Math.atan2(Math.sin(desiredY - currentY), Math.cos(desiredY - currentY));

    if (gsapRef && !prefersReducedMotion) {
      gsapRef.to(umbrellaRoot.rotation, {
        y: currentY + delta,
        duration: 0.75,
        ease: "power3.out",
        overwrite: "auto"
      });
    } else {
      umbrellaRoot.rotation.y = currentY + delta;
    }
  }

  function focusCameraForSelection(focused) {
    const baseCfg = computeResponsiveCam(camera.aspect);
    const isNarrow = camera.aspect < 1.08;
    const goal = focused && isNarrow
      ? { x: 0, y: 1.24, z: Math.max(7.6, baseCfg.z * 0.72), targetY: 0.14 }
      : baseCfg;

    if (gsapRef && !prefersReducedMotion) {
      gsapRef.to(camera.position, {
        x: goal.x,
        y: goal.y,
        z: goal.z,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto"
      });
      gsapRef.to(controls.target, {
        x: 0,
        y: goal.targetY,
        z: 0,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto"
      });
    } else {
      camera.position.set(goal.x, goal.y, goal.z);
      controls.target.set(0, goal.targetY, 0);
    }
  }

  // Raycasting on BOTH Canopy Panels AND Hanging 3D Plaques!
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downPos = { x: 0, y: 0 };

  function getHitIndex(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return -1;
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickableMeshes, false);
    return hits.length > 0 ? hits[0].object.userData.cellIndex : -1;
  }

  canvas.addEventListener("pointerdown", (e) => {
    downPos = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch" || e.buttons > 0) return;
    const idx = getHitIndex(e.clientX, e.clientY);
    if (idx !== rigState.hoveredIndex) {
      rigState.hoveredIndex = idx;
      canvas.style.cursor = idx !== -1 ? "pointer" : "grab";
      updateGoreTargets();
    }
  });

  canvas.addEventListener("pointerleave", () => {
    if (rigState.hoveredIndex !== -1) {
      rigState.hoveredIndex = -1;
      canvas.style.cursor = "grab";
      updateGoreTargets();
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    if (dist > 6) return;
    const idx = getHitIndex(e.clientX, e.clientY);
    if (idx !== -1) {
      rigState.selectedIndex = rigState.selectedIndex === idx ? -1 : idx;
      if (rigState.selectedIndex !== -1) {
        if (rigState.openProgress < 0.5) setUmbrellaOpen(true);
        rotateToGore(idx);
        focusCameraForSelection(true);
      } else {
        focusCameraForSelection(false);
      }
      updateGoreTargets();
    }
  });

  // Controls UI
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const shouldOpen = rigState.openProgress < 0.5;
      setUmbrellaOpen(shouldOpen);
    });
  }

  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      rigState.autoRotate = !rigState.autoRotate;
      if (rigState.autoRotate && rigState.selectedIndex !== -1) {
        rigState.selectedIndex = -1;
        focusCameraForSelection(false);
        updateGoreTargets();
      }
      rotateBtn.classList.toggle("is-active", rigState.autoRotate);
      rotateBtn.setAttribute("aria-pressed", String(rigState.autoRotate));
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      rigState.selectedIndex = -1;
      rigState.hoveredIndex = -1;
      rigState.autoRotate = !prefersReducedMotion;
      if (rotateBtn) {
        rotateBtn.classList.toggle("is-active", rigState.autoRotate);
        rotateBtn.setAttribute("aria-pressed", String(rigState.autoRotate));
      }
      setUmbrellaOpen(true);
      focusCameraForSelection(false);
      updateGoreTargets();
    });
  }

  // Listen to global category filters & scroll entrance events
  window.addEventListener("jm:cell-filter", (e) => {
    rigState.activeFilter = e.detail?.filter || "all";
    if (rigState.activeFilter !== "all") {
      rigState.selectedIndex = -1;
      focusCameraForSelection(false);
    }
    updateGoreTargets();
  });

  window.addEventListener("jm:umbrella-enter", () => {
    if (rigState.hasBloomedOnScroll) return;
    rigState.hasBloomedOnScroll = true;
    rigState.openProgress = 0.25;
    setUmbrellaOpen(true);
  });

  // Resize Handling
  function handleResize() {
    const w = stageWrap.clientWidth;
    const h = stageWrap.clientHeight;
    if (!w || !h) return;
    const aspect = w / h;
    camera.aspect = aspect;
    const camCfg = computeResponsiveCam(aspect);
    camera.position.y = camCfg.y;
    camera.position.z = camCfg.z;
    controls.target.y = camCfg.targetY;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(handleResize);
    ro.observe(stageWrap);
  } else {
    window.addEventListener("resize", handleResize);
  }

  function capturePrintSnapshot() {
    if (!printSnapshotImg) return null;
    const prevOpen = rigState.openProgress;
    const prevHover = rigState.hoveredIndex;
    const prevFilter = rigState.activeFilter;
    const prevFilterStates = gores.map((g) => ({ opacity: g.targetOpacity, emissive: g.targetEmissive, lift: g.lift }));

    rigState.openProgress = 1.0;
    rigState.hoveredIndex = -1;
    gores.forEach((g) => {
      g.targetOpacity = 0.98;
      g.targetEmissive = 0.08;
      g.lift = 0;
    });

    controls.update();
    updateUmbrellaGeometry(true);
    renderer.render(scene, camera);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      if (dataUrl && dataUrl.startsWith("data:image/png")) {
        printSnapshotImg.src = dataUrl;
        stageWrap.classList.add("has-print-snapshot");
      }
    } catch (_) {
      // Fallback safely if canvas export is unavailable
    }

    rigState.openProgress = prevOpen;
    rigState.hoveredIndex = prevHover;
    rigState.activeFilter = prevFilter;
    gores.forEach((g, idx) => {
      g.targetOpacity = prevFilterStates[idx].opacity;
      g.targetEmissive = prevFilterStates[idx].emissive;
      g.lift = prevFilterStates[idx].lift;
    });
    updateUmbrellaGeometry(true);
    renderer.render(scene, camera);
    return printSnapshotImg.src || null;
  }

  // Initial geometry + pre-seeded print snapshot + controller API
  updateUmbrellaGeometry(true);
  syncHud();
  capturePrintSnapshot();

  window.JagruthiUmbrella = {
    getState: () => ({
      openProgress: Number(rigState.openProgress.toFixed(2)),
      autoRotate: rigState.autoRotate,
      selectedIndex: rigState.selectedIndex,
      activeFilter: rigState.activeFilter,
      goreCount: GORE_COUNT,
      hangingCount: hangingItems.length,
      hasPrintSnapshot: stageWrap.classList.contains("has-print-snapshot")
    }),
    setOpen: setUmbrellaOpen,
    capturePrintSnapshot,
    selectCell: (idx) => {
      rigState.hoveredIndex = -1;
      rigState.selectedIndex = idx;
      rotateToGore(idx);
      focusCameraForSelection(idx >= 0);
      updateGoreTargets();
    }
  };

  // Render Loop
  function animate() {
    requestAnimationFrame(animate);
    elapsed += 0.016;

    if (rigState.autoRotate && rigState.hoveredIndex === -1 && rigState.selectedIndex === -1) {
      umbrellaRoot.rotation.y += rigState.rotSpeed;
    }

    if (!prefersReducedMotion) {
      umbrellaRoot.position.y = BASE_Y + Math.sin(elapsed * 1.4) * 0.03;
      motes.rotation.y -= 0.0011;
    }

    updateUmbrellaGeometry();
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUmbrella3D);
} else {
  initUmbrella3D();
}
