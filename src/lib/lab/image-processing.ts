/** Pixel-only transforms for the local image tool. No browser I/O occurs here. */

export type RenderMode = 'ascii' | 'dither'

export type AsciiOptions = {
  columns: number
  contrast: number
  charset: 'classic' | 'dense' | 'blocks'
  invert: boolean
  foreground: string
  background: string
  transparentBackground: boolean
}

export type DitherOptions = {
  pixelSize: number
  levels: 2 | 4
  algorithm: 'bayer' | 'floyd-steinberg'
  contrast: number
  invert: boolean
  foreground: string
  background: string
  transparentBackground: boolean
}

const CHARSETS: Record<AsciiOptions['charset'], string> = {
  classic: ' .:-=+*#%@',
  dense: ' .,:;i1tfLCG08@',
  blocks: ' ░▒▓█',
}

// Text is intended to be rendered with a monospace face at roughly 0.6em width / 1em line height.
const CHARACTER_ASPECT = 0.6
const MAX_ASCII_COLUMNS = 240
const MAX_ASCII_ROWS = 400
const MAX_SOURCE_PIXELS = 12_000_000
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clampInteger(value: number, min: number, max: number, fallback: number): number {
  return Number.isFinite(value) ? clamp(Math.round(value), min, max) : fallback
}

function validateSource(source: ImageData): void {
  if (
    !Number.isSafeInteger(source.width) ||
    !Number.isSafeInteger(source.height) ||
    source.width < 1 ||
    source.height < 1 ||
    source.width * source.height > MAX_SOURCE_PIXELS ||
    source.data.length < source.width * source.height * 4
  ) {
    throw new RangeError('Invalid or oversized image data')
  }
}

function luminance(red: number, green: number, blue: number): number {
  // Perceptual sRGB luma keeps the controls predictable for photographs and logos.
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255
}

function cellInk(
  source: ImageData,
  left: number,
  top: number,
  right: number,
  bottom: number,
  contrast: number,
  invert: boolean,
): number {
  let alphaSum = 0
  let lumaAlphaSum = 0

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const index = (y * source.width + x) * 4
      const alpha = source.data[index + 3] / 255
      if (alpha === 0) continue
      alphaSum += alpha
      lumaAlphaSum +=
        luminance(source.data[index], source.data[index + 1], source.data[index + 2]) * alpha
    }
  }

  if (alphaSum === 0) return 0
  const pixelCount = (right - left) * (bottom - top)
  const coverage = alphaSum / pixelCount
  const averageLuminance = lumaAlphaSum / alphaSum
  const adjusted = clamp((averageLuminance - 0.5) * contrast + 0.5, 0, 1)
  return clamp((invert ? adjusted : 1 - adjusted) * coverage, 0, 1)
}

/**
 * Returns text ordered from the top row to the bottom row. A fully transparent
 * area is always blank. The row count follows a 0.6 width-to-height glyph ratio.
 */
export function createAsciiGrid(
  source: ImageData,
  options: AsciiOptions,
): { rows: string[]; columns: number; rowsCount: number } {
  validateSource(source)
  const columns = clampInteger(options.columns, 1, MAX_ASCII_COLUMNS, 96)
  const rowsCount = clampInteger(
    Math.round((columns * source.height * CHARACTER_ASPECT) / source.width),
    1,
    MAX_ASCII_ROWS,
    1,
  )
  const contrast = Number.isFinite(options.contrast) ? clamp(options.contrast, 0, 3) : 1
  const charset = CHARSETS[options.charset] ?? CHARSETS.classic
  const rows: string[] = []

  for (let row = 0; row < rowsCount; row += 1) {
    const top = Math.floor((row * source.height) / rowsCount)
    const bottom = Math.max(top + 1, Math.floor(((row + 1) * source.height) / rowsCount))
    let text = ''
    for (let column = 0; column < columns; column += 1) {
      const left = Math.floor((column * source.width) / columns)
      const right = Math.max(left + 1, Math.floor(((column + 1) * source.width) / columns))
      const ink = cellInk(source, left, top, right, bottom, contrast, options.invert)
      text += charset[Math.round(ink * (charset.length - 1))]
    }
    rows.push(text)
  }

  return { rows, columns, rowsCount }
}

function parseHexColor(
  value: string,
  fallback: [number, number, number],
): [number, number, number] {
  const short = /^#([\da-f]{3})$/i.exec(value)
  if (short) {
    return [...short[1]].map((digit) => Number.parseInt(digit + digit, 16)) as [
      number,
      number,
      number,
    ]
  }
  const long = /^#([\da-f]{6})$/i.exec(value)
  if (long) {
    return [0, 2, 4].map((index) => Number.parseInt(long[1].slice(index, index + 2), 16)) as [
      number,
      number,
      number,
    ]
  }
  return fallback
}

function paintCell(
  output: Uint8ClampedArray,
  width: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
  ink: number,
  foreground: [number, number, number],
  background: [number, number, number],
  transparentBackground: boolean,
): void {
  const red = transparentBackground
    ? foreground[0]
    : background[0] + (foreground[0] - background[0]) * ink
  const green = transparentBackground
    ? foreground[1]
    : background[1] + (foreground[1] - background[1]) * ink
  const blue = transparentBackground
    ? foreground[2]
    : background[2] + (foreground[2] - background[2]) * ink
  const alpha = transparentBackground ? ink * 255 : 255

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const index = (y * width + x) * 4
      output[index] = red
      output[index + 1] = green
      output[index + 2] = blue
      output[index + 3] = alpha
    }
  }
}

/**
 * Returns an ImageData of the same dimensions as the source. Dithering runs on
 * the pixel-size grid, then fills each cell. Error diffusion uses two short row
 * buffers to avoid another full-size image allocation.
 */
export function createDitherPixels(source: ImageData, options: DitherOptions): ImageData {
  validateSource(source)
  const pixelSize = clampInteger(options.pixelSize, 1, 64, 4)
  const levels = options.levels === 4 ? 4 : 2
  const contrast = Number.isFinite(options.contrast) ? clamp(options.contrast, 0, 3) : 1
  const foreground = parseHexColor(options.foreground, [0, 0, 0])
  const background = parseHexColor(options.background, [255, 255, 255])
  const output = new Uint8ClampedArray(source.width * source.height * 4)
  const gridWidth = Math.ceil(source.width / pixelSize)
  const gridHeight = Math.ceil(source.height / pixelSize)
  let currentErrors = new Float32Array(gridWidth)
  let nextErrors = new Float32Array(gridWidth)

  for (let row = 0; row < gridHeight; row += 1) {
    const top = row * pixelSize
    const bottom = Math.min(top + pixelSize, source.height)
    for (let column = 0; column < gridWidth; column += 1) {
      const left = column * pixelSize
      const right = Math.min(left + pixelSize, source.width)
      const originalInk = cellInk(source, left, top, right, bottom, contrast, options.invert)
      let level: number

      if (options.algorithm === 'floyd-steinberg') {
        const adjustedInk = clamp(originalInk + currentErrors[column], 0, 1)
        level = Math.round(adjustedInk * (levels - 1))
        const error = adjustedInk - level / (levels - 1)
        if (column + 1 < gridWidth) currentErrors[column + 1] += (error * 7) / 16
        if (row + 1 < gridHeight) {
          if (column > 0) nextErrors[column - 1] += (error * 3) / 16
          nextErrors[column] += (error * 5) / 16
          if (column + 1 < gridWidth) nextErrors[column + 1] += error / 16
        }
      } else {
        const threshold = (BAYER_4[(row % 4) * 4 + (column % 4)] + 0.5) / 16
        level = Math.floor(originalInk * (levels - 1) + threshold)
      }

      paintCell(
        output,
        source.width,
        left,
        top,
        right,
        bottom,
        clamp(level, 0, levels - 1) / (levels - 1),
        foreground,
        background,
        options.transparentBackground,
      )
    }
    if (options.algorithm === 'floyd-steinberg') {
      ;[currentErrors, nextErrors] = [nextErrors, currentErrors]
      nextErrors.fill(0)
    }
  }

  return new ImageData(output, source.width, source.height)
}
