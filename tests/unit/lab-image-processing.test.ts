import { describe, expect, it, beforeAll } from 'vitest'

import {
  createAsciiGrid,
  createDitherPixels,
  type AsciiOptions,
  type DitherOptions,
} from '@/lib/lab/image-processing'

class TestImageData {
  data: Uint8ClampedArray
  width: number
  height: number

  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data
    this.width = width
    this.height = height
  }
}

beforeAll(() => {
  if (typeof ImageData === 'undefined') {
    Object.defineProperty(globalThis, 'ImageData', { configurable: true, value: TestImageData })
  }
})

function image(
  width: number,
  height: number,
  pixel: (x: number, y: number) => number[],
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) data.set(pixel(x, y), (y * width + x) * 4)
  }
  return new ImageData(data, width, height)
}

const asciiOptions: AsciiOptions = {
  columns: 2,
  contrast: 1,
  charset: 'classic',
  invert: false,
  foreground: '#000000',
  background: '#ffffff',
  transparentBackground: false,
}

const ditherOptions: DitherOptions = {
  pixelSize: 1,
  levels: 2,
  algorithm: 'bayer',
  contrast: 1,
  invert: false,
  foreground: '#000000',
  background: '#ffffff',
  transparentBackground: false,
}

function rgbaAt(data: ImageData, x: number, y: number): number[] {
  return Array.from(data.data.slice((y * data.width + x) * 4, (y * data.width + x) * 4 + 4))
}

describe('ASCII image processing', () => {
  it('maps dark pixels to dense characters and light pixels to spaces', () => {
    const source = image(20, 10, (x) => (x < 10 ? [0, 0, 0, 255] : [255, 255, 255, 255]))
    expect(createAsciiGrid(source, asciiOptions)).toEqual({
      rows: ['@ '],
      columns: 2,
      rowsCount: 1,
    })
    expect(createAsciiGrid(source, { ...asciiOptions, invert: true }).rows).toEqual([' @'])
  })

  it('respects alpha coverage and does not turn invisible black RGB into visible ink', () => {
    const source = image(20, 10, (x) => (x < 10 ? [0, 0, 0, 0] : [0, 0, 0, 255]))
    expect(createAsciiGrid(source, asciiOptions).rows).toEqual([' @'])
  })

  it('preserves a useful text aspect ratio and caps unusually tall outputs', () => {
    const square = image(20, 20, () => [0, 0, 0, 255])
    expect(createAsciiGrid(square, { ...asciiOptions, columns: 10 }).rowsCount).toBe(6)
    const tall = image(1, 1000, () => [0, 0, 0, 255])
    const grid = createAsciiGrid(tall, { ...asciiOptions, columns: 1000 })
    expect(grid.columns).toBe(240)
    expect(grid.rowsCount).toBe(400)
    expect(grid.rows).toHaveLength(400)
  })

  it('rejects oversized or malformed source arrays before processing', () => {
    expect(() =>
      createAsciiGrid(
        { width: 2, height: 2, data: new Uint8ClampedArray(4) } as ImageData,
        asciiOptions,
      ),
    ).toThrow(RangeError)
  })
})

describe('dither image processing', () => {
  it('keeps black and white end points, including custom palette colors', () => {
    const source = image(2, 1, (x) => (x === 0 ? [0, 0, 0, 255] : [255, 255, 255, 255]))
    const output = createDitherPixels(source, {
      ...ditherOptions,
      foreground: '#123456',
      background: '#fedcba',
    })
    expect(rgbaAt(output, 0, 0)).toEqual([0x12, 0x34, 0x56, 255])
    expect(rgbaAt(output, 1, 0)).toEqual([0xfe, 0xdc, 0xba, 255])
  })

  it('produces an ordered Bayer pattern from uniform middle gray', () => {
    const source = image(4, 4, () => [128, 128, 128, 255])
    const output = createDitherPixels(source, ditherOptions)
    const dark = Array.from({ length: 16 }, (_, index) => output.data[index * 4]).filter(
      (value) => value === 0,
    )
    expect(dark).toHaveLength(8)
    expect(rgbaAt(output, 0, 0)).toEqual([255, 255, 255, 255])
    expect(rgbaAt(output, 1, 0)).toEqual([0, 0, 0, 255])
  })

  it('diffuses tonal error into later cells with Floyd–Steinberg', () => {
    const source = image(8, 2, () => [128, 128, 128, 255])
    const output = createDitherPixels(source, { ...ditherOptions, algorithm: 'floyd-steinberg' })
    const dark = Array.from({ length: 16 }, (_, index) => output.data[index * 4]).filter(
      (value) => value === 0,
    )
    expect(dark.length).toBeGreaterThanOrEqual(6)
    expect(dark.length).toBeLessThanOrEqual(10)
    expect(rgbaAt(output, 0, 0)[0]).not.toBe(rgbaAt(output, 1, 0)[0])
  })

  it('fills pixel-size cells and returns the source dimensions', () => {
    const source = image(5, 3, (x) => (x < 2 ? [0, 0, 0, 255] : [255, 255, 255, 255]))
    const output = createDitherPixels(source, { ...ditherOptions, pixelSize: 2 })
    expect([output.width, output.height]).toEqual([5, 3])
    expect(rgbaAt(output, 0, 0)).toEqual(rgbaAt(output, 1, 1))
    expect(rgbaAt(output, 4, 2)).toEqual([255, 255, 255, 255])
  })

  it('uses intermediate tones for four levels and clears light areas on transparent export', () => {
    const source = image(4, 1, (x) => {
      if (x === 0) return [0, 0, 0, 255]
      if (x === 1) return [255, 255, 255, 255]
      if (x === 2) return [0, 0, 0, 0]
      return [128, 128, 128, 255]
    })
    const output = createDitherPixels(source, {
      ...ditherOptions,
      levels: 4,
      algorithm: 'floyd-steinberg',
      transparentBackground: true,
    })
    expect(rgbaAt(output, 0, 0)[3]).toBe(255)
    expect(rgbaAt(output, 1, 0)[3]).toBe(0)
    expect(rgbaAt(output, 2, 0)[3]).toBe(0)
    expect([0, 85, 170, 255]).toContain(rgbaAt(output, 3, 0)[3])
  })
})
