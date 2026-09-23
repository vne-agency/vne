import { afterEach, describe, expect, it, vi } from 'vitest'

import { LabImageError, MAX_IMAGE_FILE_BYTES, loadLocalImage } from '@/lib/lab/image-file'

function pngFile(width: number, height: number): File {
  const bytes = new Uint8Array(24)
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82])
  new DataView(bytes.buffer).setUint32(16, width)
  new DataView(bytes.buffer).setUint32(20, height)
  return new File([bytes], 'source.png', { type: 'image/png' })
}

function svgFile(markup: string): File {
  return new File([markup], 'source.svg', { type: 'image/svg+xml' })
}

function stubBitmap(width: number, height: number) {
  const close = vi.fn()
  const decode = vi.fn(async (blob: Blob) => ({ width, height, close, blob }))
  vi.stubGlobal('createImageBitmap', decode)
  return { close, decode }
}

async function readBlob(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('local image validation', () => {
  it('decodes a plausible PNG locally and disposes its bitmap', async () => {
    const { close, decode } = stubBitmap(24, 12)
    const result = await loadLocalImage(pngFile(24, 12))
    expect([result.width, result.height]).toEqual([24, 12])
    expect(decode).toHaveBeenCalledOnce()
    result.dispose()
    expect(close).toHaveBeenCalledOnce()
  })

  it('rejects a PNG with the wrong signature before invoking a decoder', async () => {
    const { decode } = stubBitmap(20, 20)
    const file = new File([new Uint8Array(24)], 'fake.png', { type: 'image/png' })
    await expect(loadLocalImage(file)).rejects.toMatchObject({ code: 'INVALID_PNG' })
    expect(decode).not.toHaveBeenCalled()
  })

  it('rejects oversized dimensions from the PNG header before decoding', async () => {
    const { decode } = stubBitmap(7000, 2)
    await expect(loadLocalImage(pngFile(7000, 2))).rejects.toMatchObject({
      code: 'IMAGE_TOO_LARGE',
    })
    expect(decode).not.toHaveBeenCalled()
    await expect(loadLocalImage(pngFile(4000, 4000))).rejects.toMatchObject({
      code: 'IMAGE_TOO_LARGE',
    })
  })

  it('rejects empty, oversized and unsupported files with stable error codes', async () => {
    await expect(
      loadLocalImage(new File([], 'empty.png', { type: 'image/png' })),
    ).rejects.toMatchObject({ code: 'EMPTY_FILE' })
    await expect(
      loadLocalImage(
        new File([new Uint8Array(MAX_IMAGE_FILE_BYTES + 1)], 'huge.png', { type: 'image/png' }),
      ),
    ).rejects.toMatchObject({ code: 'FILE_TOO_LARGE' })
    await expect(
      loadLocalImage(new File(['hello'], 'notes.txt', { type: 'text/plain' })),
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_TYPE' })
  })

  it('keeps drawing attributes but removes unknown metadata from safe SVG output', async () => {
    const { decode } = stubBitmap(120, 60)
    const file = svgFile(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" data-tracker="secret"><defs><linearGradient id="ink"><stop offset="0" stop-color="#000"/></linearGradient></defs><rect width="120" height="60" fill="url(#ink)" style="stroke:#fff;unknown:ignored"/></svg>',
    )
    const result = await loadLocalImage(file)
    expect([result.width, result.height]).toEqual([120, 60])
    const decodeCall = decode.mock.calls[0]
    if (!decodeCall) throw new Error('Expected the sanitized SVG to reach the decoder')
    const sanitized = await readBlob(decodeCall[0])
    expect(sanitized).toContain('viewBox="0 0 120 60"')
    expect(sanitized).toContain('fill="url(#ink)"')
    expect(sanitized).toContain('style="stroke:#fff"')
    expect(sanitized).not.toContain('data-tracker')
    expect(sanitized).not.toContain('unknown:ignored')
    result.dispose()
  })

  it.each([
    '<script>alert(1)</script>',
    '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">x</div></foreignObject>',
    '<image href="https://example.com/photo.png"/>',
    '<use href="https://example.com/shapes.svg#x"/>',
    '<rect width="10" height="10" onload="alert(1)"/>',
    '<rect width="10" height="10" style="fill:url(https://example.com/color.svg)"/>',
  ])('rejects active or external SVG content: %s', async (content) => {
    const { decode } = stubBitmap(10, 10)
    const file = svgFile(
      `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">${content}</svg>`,
    )
    await expect(loadLocalImage(file)).rejects.toMatchObject({ code: 'UNSAFE_SVG' })
    expect(decode).not.toHaveBeenCalled()
  })

  it('rejects document declarations, broken XML and excessive viewBox dimensions', async () => {
    stubBitmap(10, 10)
    await expect(
      loadLocalImage(
        svgFile('<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'),
      ),
    ).rejects.toMatchObject({ code: 'UNSAFE_SVG' })
    await expect(
      loadLocalImage(svgFile('<svg xmlns="http://www.w3.org/2000/svg"><path></svg>')),
    ).rejects.toMatchObject({ code: 'INVALID_SVG' })
    await expect(
      loadLocalImage(svgFile('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8000 100"/>')),
    ).rejects.toMatchObject({ code: 'IMAGE_TOO_LARGE' })
  })

  it('bounds SVG nesting before handing it to the image decoder', async () => {
    const { decode } = stubBitmap(10, 10)
    const nested = `${'<g>'.repeat(65)}<rect width="1" height="1"/>${'</g>'.repeat(65)}`
    await expect(
      loadLocalImage(
        svgFile(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">${nested}</svg>`),
      ),
    ).rejects.toMatchObject({ code: 'IMAGE_TOO_LARGE' })
    expect(decode).not.toHaveBeenCalled()
  })

  it('releases a bitmap when the decoder reveals excessive dimensions', async () => {
    const { close } = stubBitmap(7000, 20)
    await expect(loadLocalImage(pngFile(20, 20))).rejects.toMatchObject({ code: 'IMAGE_TOO_LARGE' })
    expect(close).toHaveBeenCalledOnce()
  })

  it('exposes typed errors for a user-facing error mapping', () => {
    expect(new LabImageError('INVALID_SVG', 'bad')).toMatchObject({
      name: 'LabImageError',
      code: 'INVALID_SVG',
    })
  })
})
