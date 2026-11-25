// Sinh ảnh SVG minh hoạ (offline, không phụ thuộc mạng) vào public/photos.
// Chạy: npm run gen:photos
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHOTOS } from '../src/data/photos.js';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'photos');
mkdirSync(outDir, { recursive: true });

const PALETTE = {
  evidence: ['#7c2d12', '#ea580c', '#fed7aa'],
  campus: ['#1e3a8a', '#3b82f6', '#dbeafe'],
  nature: ['#14532d', '#22c55e', '#dcfce7'],
  tech: ['#3b0764', '#a855f7', '#f3e8ff'],
};

// Pseudo-random có seed để ảnh sinh ra luôn giống nhau giữa các lần chạy.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

for (const [i, photo] of PHOTOS.entries()) {
  const [dark, mid, light] = PALETTE[photo.category];
  const rand = seeded(i + 7);
  const shapes = Array.from({ length: 9 }, () => {
    const cx = Math.round(rand() * photo.width);
    const cy = Math.round(rand() * photo.height);
    const r = Math.round(40 + rand() * 180);
    const o = (0.15 + rand() * 0.35).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${light}" fill-opacity="${o}"/>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${photo.width} ${photo.height}" width="${photo.width}" height="${photo.height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${mid}"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>${shapes}
<text x="60" y="${photo.height - 70}" font-family="system-ui,sans-serif" font-size="64" font-weight="700" fill="#ffffff">${photo.id.toUpperCase()}</text>
</svg>
`;
  writeFileSync(join(outDir, `${photo.id}.svg`), svg);
}

console.log(`Generated ${PHOTOS.length} photos in ${outDir}`);