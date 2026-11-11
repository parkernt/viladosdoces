// Gera os ícones raster a partir do SVG do selo (favicons e PWA).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'assets/img/brand/logo.svg';
const OUT = 'assets/img/brand';
await mkdir(OUT, { recursive: true });

const alvos = [
  { file: 'favicon-32.png', size: 32, bg: null },
  { file: 'icon-192.png', size: 192, bg: '#fffdf8' },
  { file: 'icon-512.png', size: 512, bg: '#fffdf8' },
  { file: 'apple-touch-icon.png', size: 180, bg: '#fffdf8' },
];

for (const { file, size, bg } of alvos) {
  const logo = await sharp(SRC, { density: 384 }).resize(size, size, { fit: 'contain' }).png().toBuffer();
  if (bg) {
    await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
      .composite([{ input: logo, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(`${OUT}/${file}`);
  } else {
    await sharp(logo).png({ compressionLevel: 9 }).toFile(`${OUT}/${file}`);
  }
  console.log(`gerado ${file} (${size}px)`);
}
