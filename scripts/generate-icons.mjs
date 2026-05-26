import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public', { recursive: true })

// Tape measure icon en 1024x1024
function makeSVG(size, padding = 0) {
  const s = (size - padding * 2) / 1024
  const tx = padding
  const ty = padding
  return Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#007AFF"/>
  <g transform="translate(${tx},${ty}) scale(${s})">
    <!-- Tape strip -->
    <rect x="350" y="467" width="600" height="90" rx="45" fill="white"/>
    <!-- Roll outer circle -->
    <circle cx="350" cy="512" r="252" fill="white"/>
    <!-- Roll inner hole -->
    <circle cx="350" cy="512" r="112" fill="#007AFF"/>
    <!-- Center dot -->
    <circle cx="350" cy="512" r="34" fill="white"/>
    <!-- Tick marks on tape -->
    <rect x="628" y="467" width="16" height="90" rx="8" fill="#007AFF" opacity="0.5"/>
    <rect x="700" y="492" width="13" height="65" rx="6" fill="#007AFF" opacity="0.35"/>
    <rect x="772" y="492" width="13" height="65" rx="6" fill="#007AFF" opacity="0.35"/>
    <rect x="844" y="467" width="16" height="90" rx="8" fill="#007AFF" opacity="0.5"/>
    <rect x="916" y="492" width="13" height="65" rx="6" fill="#007AFF" opacity="0.35"/>
  </g>
</svg>`)
}

const icons = [
  { name: 'favicon-16.png',        size: 16,  padding: 0 },
  { name: 'favicon-32.png',        size: 32,  padding: 0 },
  { name: 'apple-touch-icon.png',  size: 180, padding: 0 },
  { name: 'icon-192.png',          size: 192, padding: 0 },
  { name: 'icon-512.png',          size: 512, padding: 0 },
  { name: 'icon-maskable-512.png', size: 512, padding: 90 }, // safe zone padding
]

for (const { name, size, padding } of icons) {
  await sharp(makeSVG(size, padding)).png().toFile(`public/${name}`)
  console.log(`✓ public/${name}`)
}

console.log('\nIconos generados correctamente.')
