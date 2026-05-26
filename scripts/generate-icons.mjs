import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public', { recursive: true })

// M path centrada en 1024x1024, trazo bold
const mPath = 'M 170,820 L 170,200 L 290,200 L 512,510 L 734,200 L 854,200 L 854,820 L 734,820 L 734,400 L 512,680 L 290,400 L 290,820 Z'

function makeSVG(size, padding = 0) {
  const scale = (size - padding * 2) / 1024
  const tx = padding
  const ty = padding
  return Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#007AFF"/>
  <g transform="translate(${tx}, ${ty}) scale(${scale})">
    <path d="${mPath}" fill="white"/>
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
