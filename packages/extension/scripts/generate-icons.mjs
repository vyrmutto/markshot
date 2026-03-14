// packages/extension/scripts/generate-icons.mjs
// Requires: pnpm add -D sharp
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

const iconsDir = join(import.meta.dirname, '../icons')
const svg = readFileSync(join(iconsDir, 'icon.svg'))
const sizes = [16, 32, 48, 128]

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `icon${size}.png`))
  console.log(`✓ icon${size}.png`)
}
