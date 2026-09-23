/** Validation and decoding for local PNG/SVG files. This module never uploads data. */

export const MAX_IMAGE_FILE_BYTES = 12 * 1024 * 1024
export const MAX_IMAGE_SIDE = 6_000
export const MAX_IMAGE_PIXELS = 12_000_000

export type LabImageErrorCode =
  | 'EMPTY_FILE'
  | 'UNSUPPORTED_TYPE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_PNG'
  | 'INVALID_SVG'
  | 'UNSAFE_SVG'
  | 'IMAGE_TOO_LARGE'
  | 'DECODE_FAILED'

export class LabImageError extends Error {
  constructor(
    public readonly code: LabImageErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'LabImageError'
  }
}

export type LoadedLocalImage = {
  image: ImageBitmap | HTMLImageElement
  width: number
  height: number
  /** Release the bitmap or object URL when replacing the file or unmounting. */
  dispose: () => void
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const
const LOCAL_REFERENCE = /^#[A-Za-z_][\w:.-]*$/
const LOCAL_PAINT_REFERENCE = /^url\(\s*['"]?#[A-Za-z_][\w:.-]*['"]?\s*\)$/i
const MAX_SVG_ELEMENTS = 20_000
const MAX_SVG_DEPTH = 64

// Intentional subset: vector drawing, gradients, clips and masks. Script, HTML,
// embedded images, CSS stylesheets, animation and filters are not imported.
const SAFE_ELEMENTS = new Set([
  'svg',
  'g',
  'defs',
  'symbol',
  'use',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
  'mask',
  'title',
  'desc',
])

const SAFE_ATTRIBUTES = new Set([
  'id',
  'x',
  'y',
  'x1',
  'x2',
  'y1',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'width',
  'height',
  'viewBox',
  'preserveAspectRatio',
  'd',
  'points',
  'transform',
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-dashoffset',
  'opacity',
  'color',
  'vector-effect',
  'paint-order',
  'clip-path',
  'mask',
  'gradientUnits',
  'gradientTransform',
  'spreadMethod',
  'offset',
  'stop-color',
  'stop-opacity',
  'font-family',
  'font-size',
  'font-weight',
  'text-anchor',
  'dominant-baseline',
  'letter-spacing',
  'word-spacing',
  'xml:space',
])

const SAFE_STYLE_PROPERTIES = new Set(
  [...SAFE_ATTRIBUTES].filter((name) =>
    /^(?:fill|stroke|opacity|color|vector-effect|paint-order|stop-|font-|text-anchor|dominant-baseline|letter-spacing|word-spacing)/.test(
      name,
    ),
  ),
)

function validateDimensions(width: number, height: number): void {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new LabImageError('INVALID_SVG', 'The image has no valid dimensions')
  }
  if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE || width * height > MAX_IMAGE_PIXELS) {
    throw new LabImageError(
      'IMAGE_TOO_LARGE',
      'The image dimensions exceed the local processing limit',
    )
  }
}

function readWithFileReader<T extends string | ArrayBuffer>(
  blob: Blob,
  method: 'readAsText' | 'readAsArrayBuffer',
): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the selected file'))
    reader.onload = () => resolve(reader.result as T)
    reader[method](blob)
  })
}

function readBytes(blob: Blob): Promise<ArrayBuffer> {
  return typeof blob.arrayBuffer === 'function'
    ? blob.arrayBuffer()
    : readWithFileReader<ArrayBuffer>(blob, 'readAsArrayBuffer')
}

function readText(blob: Blob): Promise<string> {
  return typeof blob.text === 'function'
    ? blob.text()
    : readWithFileReader<string>(blob, 'readAsText')
}

function fileKind(file: File): 'png' | 'svg' {
  const mime = file.type.toLowerCase().split(';')[0].trim()
  const extension = /\.([^.]+)$/.exec(file.name.toLowerCase())?.[1]
  if (mime === 'image/png' && extension !== 'svg') return 'png'
  if (mime === 'image/svg+xml' && extension !== 'png') return 'svg'
  if ((!mime || mime === 'application/octet-stream') && extension === 'png') return 'png'
  if (
    (!mime || ['application/octet-stream', 'application/xml', 'text/xml'].includes(mime)) &&
    extension === 'svg'
  ) {
    return 'svg'
  }
  throw new LabImageError('UNSUPPORTED_TYPE', 'Choose a PNG or SVG file')
}

async function inspectPng(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bytes = new Uint8Array(await readBytes(file.slice(0, 24)))
  const validSignature = PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)
  if (
    bytes.length < 24 ||
    !validSignature ||
    bytes[8] !== 0 ||
    bytes[9] !== 0 ||
    bytes[10] !== 0 ||
    bytes[11] !== 13 ||
    String.fromCharCode(...bytes.slice(12, 16)) !== 'IHDR'
  ) {
    throw new LabImageError('INVALID_PNG', 'The PNG header is invalid')
  }

  const header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const width = header.getUint32(16)
  const height = header.getUint32(20)
  if (width === 0 || height === 0) {
    throw new LabImageError('INVALID_PNG', 'The PNG has no valid dimensions')
  }
  validateDimensions(width, height)
  return { blob: file, width, height }
}

function parseSvgLength(value: string | null): number | undefined {
  if (!value) return undefined
  const match = /^\s*((?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(px|pt|pc|in|mm|cm)?\s*$/i.exec(value)
  if (!match) return undefined
  const units: Record<string, number> = {
    px: 1,
    pt: 4 / 3,
    pc: 16,
    in: 96,
    mm: 96 / 25.4,
    cm: 960 / 25.4,
  }
  return Number(match[1]) * units[(match[2] ?? 'px').toLowerCase()]
}

function svgDimensions(root: Element): { width: number; height: number } {
  const viewBox = root
    .getAttribute('viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number)
  const hasViewBox =
    viewBox?.length === 4 && viewBox.every(Number.isFinite) && viewBox[2] > 0 && viewBox[3] > 0
  const width = parseSvgLength(root.getAttribute('width')) ?? (hasViewBox ? viewBox[2] : 0)
  const height = parseSvgLength(root.getAttribute('height')) ?? (hasViewBox ? viewBox[3] : 0)
  validateDimensions(width, height)
  const roundedWidth = Math.ceil(width)
  const roundedHeight = Math.ceil(height)
  validateDimensions(roundedWidth, roundedHeight)
  return { width: roundedWidth, height: roundedHeight }
}

function sanitizeStyle(style: string): string {
  const safeDeclarations: string[] = []
  for (const declaration of style.split(';')) {
    const trimmed = declaration.trim()
    if (!trimmed) continue
    const separator = trimmed.indexOf(':')
    if (separator < 1) throw new LabImageError('UNSAFE_SVG', 'Unsupported SVG style')
    const property = trimmed.slice(0, separator).trim().toLowerCase()
    const value = trimmed.slice(separator + 1).trim()
    if (
      /[@\\]|expression\s*\(|javascript\s*:|data\s*:/i.test(value) ||
      (/url\s*\(/i.test(value) && !LOCAL_PAINT_REFERENCE.test(value))
    ) {
      throw new LabImageError('UNSAFE_SVG', 'SVG styles may not load external resources')
    }
    if (!SAFE_STYLE_PROPERTIES.has(property)) continue
    if (!/^[\w\s#(),.%+\-'"/]+$/.test(value)) {
      throw new LabImageError('UNSAFE_SVG', 'Unsupported SVG style value')
    }
    safeDeclarations.push(`${property}:${value}`)
  }
  return safeDeclarations.join(';')
}

function sanitizedSvgNode(
  source: Element,
  document: Document,
  budget: { count: number },
  depth: number,
): Element {
  budget.count += 1
  if (budget.count > MAX_SVG_ELEMENTS || depth > MAX_SVG_DEPTH) {
    throw new LabImageError('IMAGE_TOO_LARGE', 'The SVG has too many vector elements')
  }
  if (source.namespaceURI !== SVG_NAMESPACE || !SAFE_ELEMENTS.has(source.localName)) {
    throw new LabImageError('UNSAFE_SVG', `Unsupported SVG element: ${source.localName}`)
  }
  const target = document.createElementNS(SVG_NAMESPACE, source.localName)

  for (const attribute of Array.from(source.attributes)) {
    const name = attribute.name
    const value = attribute.value.trim()
    if (name === 'xmlns' || name.startsWith('xmlns:')) continue
    if (/^on/i.test(name) || /\\|javascript\s*:|data\s*:|@import|expression\s*\(/i.test(value)) {
      throw new LabImageError('UNSAFE_SVG', 'Active SVG content is not allowed')
    }
    if (name === 'href' || name === 'xlink:href') {
      if (
        !['use', 'linearGradient', 'radialGradient'].includes(source.localName) ||
        !LOCAL_REFERENCE.test(value)
      ) {
        throw new LabImageError('UNSAFE_SVG', 'SVG references must stay inside the file')
      }
      target.setAttribute('href', value)
      continue
    }
    if (name === 'style') {
      const safeStyle = sanitizeStyle(value)
      if (safeStyle) target.setAttribute('style', safeStyle)
      continue
    }
    if (/url\s*\(/i.test(value) && !LOCAL_PAINT_REFERENCE.test(value)) {
      throw new LabImageError('UNSAFE_SVG', 'External SVG resources are not allowed')
    }
    if (!SAFE_ATTRIBUTES.has(name)) continue
    if (['fill', 'stroke', 'clip-path', 'mask'].includes(name) && /url\s*\(/i.test(value)) {
      if (!LOCAL_PAINT_REFERENCE.test(value)) {
        throw new LabImageError('UNSAFE_SVG', 'Only local paint references are supported')
      }
    }
    if (name === 'xml:space') {
      target.setAttributeNS(XML_NAMESPACE, name, value)
    } else {
      target.setAttribute(name, value)
    }
  }

  for (const child of Array.from(source.childNodes)) {
    if (child.nodeType === 1) {
      target.appendChild(sanitizedSvgNode(child as Element, document, budget, depth + 1))
    } else if (child.nodeType === 3 || child.nodeType === 4) {
      target.appendChild(document.createTextNode(child.textContent ?? ''))
    } else if (child.nodeType === 7 || child.nodeType === 10) {
      throw new LabImageError('UNSAFE_SVG', 'Active SVG content is not allowed')
    }
  }
  return target
}

async function inspectSvg(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const text = await readText(file)
  if (/<!\s*(?:DOCTYPE|ENTITY)\b|<\?xml-stylesheet\b/i.test(text) || text.includes('\0')) {
    throw new LabImageError('UNSAFE_SVG', 'SVG document declarations are not supported')
  }

  const document = new DOMParser().parseFromString(text, 'image/svg+xml')
  if (document.getElementsByTagName('parsererror').length > 0) {
    throw new LabImageError('INVALID_SVG', 'The SVG is not valid XML')
  }
  for (const node of Array.from(document.childNodes)) {
    if (node.nodeType === 7 || node.nodeType === 10) {
      throw new LabImageError('UNSAFE_SVG', 'SVG processing instructions are not supported')
    }
  }
  const root = document.documentElement
  if (root.localName !== 'svg' || root.namespaceURI !== SVG_NAMESPACE) {
    throw new LabImageError('INVALID_SVG', 'The document is not an SVG')
  }
  const dimensions = svgDimensions(root)
  const safeDocument = new DOMParser().parseFromString(
    `<svg xmlns="${SVG_NAMESPACE}"/>`,
    'image/svg+xml',
  )
  const safeRoot = sanitizedSvgNode(root, safeDocument, { count: 0 }, 0)
  safeRoot.setAttribute('width', String(dimensions.width))
  safeRoot.setAttribute('height', String(dimensions.height))
  safeDocument.replaceChild(safeRoot, safeDocument.documentElement)
  const markup = new XMLSerializer().serializeToString(safeDocument)

  return {
    blob: new Blob([markup], { type: 'image/svg+xml' }),
    ...dimensions,
  }
}

async function decodeLocalBlob(
  blob: Blob,
): Promise<{ image: ImageBitmap | HTMLImageElement; dispose: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const image = await createImageBitmap(blob)
      return { image, dispose: () => image.close() }
    } catch {
      // Some browsers cannot decode SVG through createImageBitmap; use <img> below.
    }
  }

  const objectUrl = URL.createObjectURL(blob)
  const image = new Image()
  image.decoding = 'async'
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Image decoder rejected the file'))
      image.src = objectUrl
    })
    return { image, dispose: () => URL.revokeObjectURL(objectUrl) }
  } catch {
    URL.revokeObjectURL(objectUrl)
    throw new LabImageError('DECODE_FAILED', 'The image could not be decoded')
  }
}

/**
 * Validate and decode a local file for drawing into a canvas. Call dispose()
 * when replacing it. SVG is rebuilt from a strict vector allowlist before decode.
 */
export async function loadLocalImage(file: File): Promise<LoadedLocalImage> {
  if (file.size === 0) throw new LabImageError('EMPTY_FILE', 'The selected file is empty')
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    throw new LabImageError('FILE_TOO_LARGE', 'Choose a file smaller than 12 MiB')
  }

  const kind = fileKind(file)
  const inspected = kind === 'png' ? await inspectPng(file) : await inspectSvg(file)
  const decoded = await decodeLocalBlob(inspected.blob)
  const width =
    decoded.image instanceof HTMLImageElement ? decoded.image.naturalWidth : decoded.image.width
  const height =
    decoded.image instanceof HTMLImageElement ? decoded.image.naturalHeight : decoded.image.height
  try {
    if (!width || !height) throw new LabImageError('DECODE_FAILED', 'The image has no pixels')
    validateDimensions(width, height)
  } catch (error) {
    decoded.dispose()
    throw error
  }

  return { ...decoded, width, height }
}
