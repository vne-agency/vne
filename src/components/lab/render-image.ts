import {
  createAsciiGrid,
  createDitherPixels,
  type AsciiOptions,
  type DitherOptions,
  type RenderMode,
} from '@/lib/lab/image-processing'

export type BackgroundMode = 'paper' | 'dark' | 'transparent'

export type RenderSettings = {
  mode: RenderMode
  ascii: Omit<AsciiOptions, 'foreground' | 'background' | 'transparentBackground'>
  dither: Omit<DitherOptions, 'foreground' | 'background' | 'transparentBackground'>
  backgroundMode: BackgroundMode
}

export type RenderResult = {
  width: number
  height: number
  asciiText?: string
}

export type DrawableImage = {
  image: ImageBitmap | HTMLImageElement
  width: number
  height: number
}

function fitImage(width: number, height: number, maxSide: number, maxPixels: number, maxScale = 1) {
  const scale = Math.min(
    maxScale,
    maxSide / Math.max(width, height),
    Math.sqrt(maxPixels / (width * height)),
  )
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function getCanvasContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas 2D is unavailable')
  return context
}

function colors(mode: BackgroundMode) {
  return mode === 'dark'
    ? { foreground: '#f4f3ee', background: '#22231f', transparentBackground: false }
    : mode === 'transparent'
      ? { foreground: '#22231f', background: '#ffffff', transparentBackground: true }
      : { foreground: '#22231f', background: '#f4f3ee', transparentBackground: false }
}

export function renderImage(
  target: HTMLCanvasElement,
  source: DrawableImage,
  settings: RenderSettings,
  quality: 1 | 2 = 1,
): RenderResult {
  const sourceDimensions = fitImage(
    source.width,
    source.height,
    quality === 1 ? 1400 : 2800,
    quality === 1 ? 1_400_000 : 5_600_000,
    quality,
  )
  const input = document.createElement('canvas')
  input.width = sourceDimensions.width
  input.height = sourceDimensions.height
  const inputContext = getCanvasContext(input)
  inputContext.clearRect(0, 0, input.width, input.height)
  inputContext.drawImage(source.image, 0, 0, input.width, input.height)
  const pixels = inputContext.getImageData(0, 0, input.width, input.height)
  const palette = colors(settings.backgroundMode)

  if (settings.mode === 'dither') {
    const previewDimensions = fitImage(source.width, source.height, 1400, 1_400_000)
    const result = createDitherPixels(pixels, {
      ...settings.dither,
      pixelSize: Math.max(
        1,
        Math.round(settings.dither.pixelSize * (input.width / previewDimensions.width)),
      ),
      ...palette,
    })
    target.width = result.width
    target.height = result.height
    getCanvasContext(target).putImageData(result, 0, 0)
    return { width: target.width, height: target.height }
  }

  const grid = createAsciiGrid(pixels, { ...settings.ascii, ...palette })
  const maxCellHeight = Math.max(
    2,
    Math.floor(
      Math.min(4096 / Math.max(grid.rowsCount, 1), 4096 / Math.max(grid.columns * 0.6, 1)),
    ),
  )
  const cellHeight = Math.min(quality === 1 ? 18 : 36, maxCellHeight)
  const cellWidth = cellHeight * 0.6
  target.width = Math.max(1, Math.ceil(grid.columns * cellWidth))
  target.height = Math.max(1, grid.rowsCount * cellHeight)
  const context = getCanvasContext(target)
  if (!palette.transparentBackground) {
    context.fillStyle = palette.background
    context.fillRect(0, 0, target.width, target.height)
  }
  context.fillStyle = palette.foreground
  context.font = `${Math.max(2, Math.round(cellHeight * 0.96))}px 'Courier New', courier, monospace`
  context.textBaseline = 'top'
  grid.rows.forEach((row, index) => context.fillText(row, 0, index * cellHeight))
  return { width: target.width, height: target.height, asciiText: grid.rows.join('\n') }
}
