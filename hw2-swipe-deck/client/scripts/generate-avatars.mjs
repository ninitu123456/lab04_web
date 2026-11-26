/**
 * Sinh avatar SVG offline cho 12 nhân vật hư cấu (không gọi mạng ngoài).
 * Nguồn tên: ../server/scripts/profiles.data.js → ghi vào public/avatars/<slug>.svg
 * Chạy: npm run gen:avatars
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_PROFILES } from '../../server/scripts/profiles.data.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'public', 'avatars');

/** Hash chuỗi → số nguyên ổn định (màu không đổi giữa các lần sinh). */
function hash(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return h;
}

function initials(name) {
  const words = name.trim().split(/\s+/);
  return words.slice(-2).map((w) => w[0].toUpperCase()).join('');
}

function avatarSvg(name) {
  const h = hash(name);
  const hue = h % 360;
  const hue2 = (hue + 40) % 360;
  const skin = ['#f5d0b5', '#e8b796', '#c98e6b', '#a86f4c'][h % 4];
  const smile = 18 + (h % 14);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="Avatar minh hoạ ${name}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 70% 42%)"/>
      <stop offset="1" stop-color="hsl(${hue2} 65% 24%)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <circle cx="200" cy="420" r="150" fill="hsl(${hue2} 45% 16%)"/>
  <circle cx="200" cy="185" r="92" fill="${skin}"/>
  <circle cx="168" cy="175" r="10" fill="#1f2937"/>
  <circle cx="232" cy="175" r="10" fill="#1f2937"/>
  <path d="M ${200 - smile} 215 Q 200 ${225 + smile / 2} ${200 + smile} 215" stroke="#1f2937" stroke-width="7" fill="none" stroke-linecap="round"/>
  <text x="200" y="372" text-anchor="middle" font-family="system-ui, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${initials(name)}</text>
</svg>
`;
}

await mkdir(outDir, { recursive: true });
for (const profile of SEED_PROFILES) {
  const file = join(outDir, profile.avatar.replace('/avatars/', ''));
  await writeFile(file, avatarSvg(profile.name), 'utf8');
}
console.log(`[gen:avatars] wrote ${SEED_PROFILES.length} SVG files → public/avatars/`);
