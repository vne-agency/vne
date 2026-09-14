import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

// Usage: node scripts/generate-case-ascii-sprites.mjs <kotopes screenshot> <codeam screenshot>
// Keep only the small character maps in the client bundle, never the source screenshots.
const [dogSource, figureSource] = process.argv.slice(2)
if (!dogSource || !figureSource) throw new Error('Pass the Kotopes and CODEAM reference images.')
const glyphs = ' .:+*ox%#@'

function closeSilhouette(mask, columns, rows) {
  const neighbors = (index) => {
    const x = index % columns
    const y = Math.floor(index / columns)
    const result = []
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (x + dx >= 0 && x + dx < columns && y + dy >= 0 && y + dy < rows)
          result.push((y + dy) * columns + x + dx)
      }
    }
    return result
  }
  // Close tiny gaps in the holographic rim while keeping the large background openings.
  const dilated = mask.map((_, index) => neighbors(index).some((next) => mask[next]))
  const closed = mask.map((_, index) => neighbors(index).every((next) => dilated[next]))
  const visited = new Set()
  let largest = []
  closed.forEach((inside, index) => {
    if (!inside || visited.has(index)) return
    const component = [index]
    visited.add(index)
    for (let cursor = 0; cursor < component.length; cursor++) {
      for (const next of neighbors(component[cursor])) {
        if (closed[next] && !visited.has(next)) {
          visited.add(next)
          component.push(next)
        }
      }
    }
    if (component.length > largest.length) largest = component
  })
  const silhouette = new Set(largest)
  const outside = new Set()
  const queue = []
  closed.forEach((_, index) => {
    const x = index % columns
    const y = Math.floor(index / columns)
    if ((x === 0 || x === columns - 1 || y === 0 || y === rows - 1) && !silhouette.has(index)) {
      outside.add(index)
      queue.push(index)
    }
  })
  for (let cursor = 0; cursor < queue.length; cursor++) {
    for (const next of neighbors(queue[cursor])) {
      if (!silhouette.has(next) && !outside.has(next)) {
        outside.add(next)
        queue.push(next)
      }
    }
  }
  return mask.map((_, index) => !outside.has(index))
}

async function sprite(source, crop, columns, rows, kind) {
  const metadata = await sharp(source).metadata()
  const left = Math.round(metadata.width * crop[0])
  const top = Math.round(metadata.height * crop[1])
  const { data, info } = await sharp(source)
    .extract({ left, top, width: metadata.width - left, height: metadata.height - top })
    .resize(columns, rows, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const pixels = Array.from({ length: columns * rows }, (_, index) => {
    const offset = index * info.channels
    const [r, g, b] = data.subarray(offset, offset + 3)
    const saturation = Math.max(r, g, b) - Math.min(r, g, b)
    return {
      value: r * 0.2126 + g * 0.7152 + b * 0.0722,
      inside: kind === 'dog' ? r > g + 8 && g > b + 6 : saturation > 26,
    }
  })
  const figureMask =
    kind === 'figure'
      ? closeSilhouette(
          pixels.map((pixel) => pixel.inside),
          columns,
          rows,
        )
      : null
  const lines = []
  for (let y = 0; y < rows; y++) {
    const row = pixels.slice(y * columns, (y + 1) * columns)
    const first = row.findIndex((pixel) => pixel.inside)
    const last = row.findLastIndex((pixel) => pixel.inside)
    lines.push(
      row
        .map((pixel, x) => {
          // The warm fur silhouette encloses the eyes and nose, including their neutral blacks.
          const inside =
            kind === 'dog' ? first >= 0 && x >= first && x <= last : figureMask[y * columns + x]
          if (!inside) return ' '
          const tone = Math.min(9, Math.max(2, Math.round(2 + (1 - pixel.value / 255) * 7)))
          return glyphs[tone]
        })
        .join(''),
    )
  }
  return lines
}

const sprites = {
  dog: await sprite(dogSource, [0.53, 0.2], 72, 43, 'dog'),
  figure: await sprite(figureSource, [0.53, 0.15], 66, 52, 'figure'),
}
await writeFile(
  new URL('../src/components/experiments/ascii-stars/ascii-case-sprites.json', import.meta.url),
  `${JSON.stringify(sprites)}\n`,
)
