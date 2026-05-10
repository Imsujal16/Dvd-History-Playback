/**
 * generate-clips.js
 * Generates synthetic security-camera-style MP4 video clips (clip-4 through clip-6)
 * by rendering canvas frames and encoding them with ffmpeg (via fluent-ffmpeg).
 *
 * Usage: node generate-clips.js
 * Requires: canvas, @ffmpeg-installer/ffmpeg, fluent-ffmpeg
 */

const { createCanvas } = require('canvas');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
const path = require('path');
const os = require('os');

ffmpeg.setFfmpegPath(ffmpegPath);

const OUT_DIR = path.join(__dirname, 'public', 'videos');
const FRAME_RATE = 25;
const WIDTH = 1280;
const HEIGHT = 720;

/* ─────────────────────────── helpers ─────────────────────────── */

function drawNoiseLayer(ctx, w, h, seed, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const id = ctx.getImageData(0, 0, w, h);
  let s = seed;
  for (let i = 0; i < id.data.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = (s & 0xff) < 60 ? (s & 0x1f) : 0;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
    id.data[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  ctx.restore();
}

function drawScanline(ctx, w, h, frame) {
  const y = (frame * 3) % h;
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, y, w, 2);
  ctx.restore();
}

function drawTimestamp(ctx, w, h, time, camId, loc) {
  ctx.save();
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const ts = new Date(Date.now() - (1000 - time * 1000) + time).toISOString().replace('T', '  ').slice(0, 22);
  ctx.fillText(`● REC   ${ts}`, 16, 32);
  ctx.fillText(`${camId}  |  ${loc}`, 16, h - 16);
  ctx.fillText('1280×720  25fps', w - 200, h - 16);
  ctx.restore();
}

function drawVignet(ctx, w, h) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/* ─────────────────── scene renderers ─────────────────── */

/** clip-4: Loading Dock — Delivery Arrival (dark exterior with truck silhouette) */
function renderLoadingDock(ctx, w, h, frame, totalFrames) {
  const t = frame / totalFrames;

  // Night sky + concrete background
  ctx.fillStyle = '#1a1a14';
  ctx.fillRect(0, 0, w, h);

  // Overhead dock light cone
  ctx.save();
  const lx = w * 0.45, ly = 0;
  const lg = ctx.createRadialGradient(lx, ly, 10, lx, ly, h * 0.85);
  lg.addColorStop(0, 'rgba(255,230,150,0.22)');
  lg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Ground / dock floor
  ctx.fillStyle = '#2a2a20';
  ctx.fillRect(0, h * 0.65, w, h * 0.35);

  // Dock bay markings
  ctx.save();
  ctx.strokeStyle = '#f5c842';
  ctx.lineWidth = 3;
  ctx.setLineDash([30, 20]);
  ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.65); ctx.lineTo(w * 0.3, h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.6, h * 0.65); ctx.lineTo(w * 0.6, h); ctx.stroke();
  ctx.restore();

  // Truck backing in (moves right to left over time)
  const truckX = w * 0.85 - t * w * 0.45;
  ctx.save();
  ctx.fillStyle = '#3a3a38';
  // Truck body
  ctx.fillRect(truckX, h * 0.32, w * 0.38, h * 0.33);
  // Cabin
  ctx.fillStyle = '#2e2e2c';
  ctx.fillRect(truckX + w * 0.3, h * 0.3, w * 0.08, h * 0.35);
  // Wheels
  ctx.fillStyle = '#111';
  [truckX + 0.04 * w, truckX + 0.18 * w, truckX + 0.3 * w].forEach(wx => {
    ctx.beginPath();
    ctx.arc(wx, h * 0.65 + 14, 18, 0, Math.PI * 2);
    ctx.fill();
  });
  // Tail lights
  ctx.fillStyle = `rgba(255,80,60,${0.4 + 0.3 * Math.sin(frame * 0.2)})`;
  ctx.fillRect(truckX + 2, h * 0.36, 8, 24);
  ctx.restore();

  // Person silhouette near dock edge
  if (t > 0.3) {
    ctx.save();
    ctx.fillStyle = '#222';
    const px = w * 0.25 + Math.sin(frame * 0.04) * 4;
    ctx.fillRect(px - 8, h * 0.48, 16, 48); // body
    ctx.beginPath(); ctx.arc(px, h * 0.44, 12, 0, Math.PI * 2); ctx.fill(); // head
    ctx.restore();
  }

  drawVignet(ctx, w, h);
  drawScanline(ctx, w, h, frame);
  drawNoiseLayer(ctx, w, h, frame * 7919, 0.04);
  drawTimestamp(ctx, w, h, t, 'CAM-09', 'LOADING DOCK WEST');
}

/** clip-5: Office Lobby — Unauthorized Access (bright interior, turnstiles) */
function renderOfficeLobby(ctx, w, h, frame, totalFrames) {
  const t = frame / totalFrames;

  // Lobby floor & walls
  ctx.fillStyle = '#c8c0b0';
  ctx.fillRect(0, 0, w, h);

  // Ceiling
  ctx.fillStyle = '#e0dbd2';
  ctx.fillRect(0, 0, w, h * 0.12);

  // Marble floor
  const fg = ctx.createLinearGradient(0, h * 0.55, 0, h);
  fg.addColorStop(0, '#b5b0a5');
  fg.addColorStop(1, '#9a9590');
  ctx.fillStyle = fg;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  // Reception desk
  ctx.fillStyle = '#8a7a60';
  ctx.fillRect(w * 0.55, h * 0.42, w * 0.35, h * 0.2);
  ctx.fillStyle = '#a09080';
  ctx.fillRect(w * 0.55, h * 0.38, w * 0.35, h * 0.06);

  // Turnstile gate
  ctx.fillStyle = '#404040';
  ctx.fillRect(w * 0.28, h * 0.3, 8, h * 0.32);
  ctx.fillRect(w * 0.38, h * 0.3, 8, h * 0.32);
  ctx.fillStyle = '#606060';
  ctx.fillRect(w * 0.285, h * 0.42, w * 0.095, 6); // horizontal arm

  // Person walking through (no badge swipe animation)
  const px = w * 0.05 + t * w * 0.55;
  const bounce = Math.abs(Math.sin(frame * 0.25)) * 4;
  ctx.save();
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(px - 10, h * 0.38 - bounce, 20, 52); // body
  ctx.beginPath(); ctx.arc(px, h * 0.34 - bounce, 14, 0, Math.PI * 2); ctx.fill(); // head
  // Arm swing
  ctx.strokeStyle = '#2a2a3a';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(px - 10, h * 0.42); ctx.lineTo(px - 22, h * 0.52 + bounce); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px + 10, h * 0.42); ctx.lineTo(px + 22, h * 0.54 - bounce); ctx.stroke();
  ctx.restore();

  // Security badge reader (flashes red)
  if (px > w * 0.25 && px < w * 0.42) {
    ctx.save();
    ctx.fillStyle = `rgba(255,50,50,${0.5 + 0.5 * Math.sin(frame * 0.5)})`;
    ctx.fillRect(w * 0.25, h * 0.38, 10, 18);
    ctx.restore();
  }

  // CCTV overlay lines
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, y, w, 2);
  }
  ctx.restore();

  drawScanline(ctx, w, h, frame);
  drawNoiseLayer(ctx, w, h, frame * 6271, 0.025);
  drawTimestamp(ctx, w, h, t, 'CAM-01', 'OFFICE LOBBY');
}

/** clip-6: Stairwell B2 — Motion Alert (dark, grainy, eerie) */
function renderStairwell(ctx, w, h, frame, totalFrames) {
  const t = frame / totalFrames;

  // Very dark stairwell
  ctx.fillStyle = '#080a10';
  ctx.fillRect(0, 0, w, h);

  // Emergency/IR light at top of stairs
  const gl = ctx.createRadialGradient(w * 0.5, h * 0.1, 10, w * 0.5, h * 0.1, h * 0.5);
  gl.addColorStop(0, 'rgba(180,200,255,0.18)');
  gl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, w, h);

  // Stair steps
  ctx.save();
  ctx.strokeStyle = '#1c2030';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const sx = w * 0.1 + i * (w * 0.08);
    const sy = h * 0.4 + i * (h * 0.055);
    ctx.strokeRect(sx, sy, w * 0.78 - i * (w * 0.06), h * 0.055);
  }
  ctx.restore();

  // Handrail
  ctx.save();
  ctx.strokeStyle = '#202535';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.38);
  ctx.lineTo(w * 0.82, h * 0.98);
  ctx.stroke();
  ctx.restore();

  // Shadow / unclear motion
  const shadowOpacity = 0.3 + 0.3 * Math.sin(frame * 0.08 + 1.5);
  const shadowX = w * 0.38 + Math.sin(frame * 0.05) * 30;
  const shadowY = h * 0.35 + Math.cos(frame * 0.04) * 15;
  ctx.save();
  ctx.globalAlpha = shadowOpacity;
  ctx.fillStyle = '#1e2535';
  ctx.beginPath();
  ctx.ellipse(shadowX, shadowY + 60, 28, 70, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(shadowX + 4, shadowY - 2, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Heavy noise / IR camera grain
  drawNoiseLayer(ctx, w, h, frame * 9733, 0.13);
  drawVignet(ctx, w, h);

  // Motion alert indicator
  if (frame % 30 < 15) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 120, 0, 0.9)';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('⚠ MOTION ALERT — ZONE B2', w / 2 - 160, 60);
    ctx.restore();
  }

  drawScanline(ctx, w, h, frame);
  drawTimestamp(ctx, w, h, t, 'CAM-15', 'STAIRWELL B2');
}

/* ──────────────── video encoder ──────────────── */

async function generateClip(clipNum, durationSec, renderFn, label) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `clip${clipNum}-`));
  const totalFrames = durationSec * FRAME_RATE;
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  console.log(`[${label}] Rendering ${totalFrames} frames...`);
  for (let f = 0; f < totalFrames; f++) {
    renderFn(ctx, WIDTH, HEIGHT, f, totalFrames);
    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(tmpDir, `frame${String(f).padStart(5, '0')}.png`), buf);
    if (f % 50 === 0) process.stdout.write(`\r  Frame ${f}/${totalFrames}`);
  }
  console.log('');

  const outFile = path.join(OUT_DIR, `clip-${clipNum}.mp4`);
  console.log(`[${label}] Encoding → ${outFile}`);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(tmpDir, 'frame%05d.png'))
      .inputFPS(FRAME_RATE)
      .videoCodec('libx264')
      .outputOptions(['-pix_fmt yuv420p', '-preset fast', '-crf 23'])
      .fps(FRAME_RATE)
      .output(outFile)
      .on('end', () => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        console.log(`[${label}] ✓ Done → ${outFile}`);
        resolve();
      })
      .on('error', (err) => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        reject(err);
      })
      .run();
  });
}

(async () => {
  console.log('=== DVR Clip Generator ===\n');

  await generateClip(4, 20, renderLoadingDock, 'clip-4 Loading Dock');
  await generateClip(5, 18, renderOfficeLobby, 'clip-5 Office Lobby');
  await generateClip(6, 8,  renderStairwell,   'clip-6 Stairwell B2');

  console.log('\n✅ All clips generated!');
})();
