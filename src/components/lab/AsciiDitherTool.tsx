'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSiteLanguage } from '@/components/ui/SiteLanguage'
import { loadLocalImage } from '@/lib/lab/image-file'
import type { AsciiOptions, DitherOptions } from '@/lib/lab/image-processing'
import { LabHeader } from './LabHeader'
import { renderImage, type RenderResult, type RenderSettings } from './render-image'
import styles from './AsciiDitherTool.module.css'

type LoadedImage = Awaited<ReturnType<typeof loadLocalImage>>
type PreviewView = 'result' | 'original'

const storageKey = 'vne-lab-ascii-dither-settings-v1'
const defaultSettings: RenderSettings = {
  mode: 'ascii',
  ascii: { columns: 88, contrast: 1, charset: 'classic', invert: false },
  dither: { pixelSize: 6, levels: 2, algorithm: 'bayer', contrast: 1, invert: false },
  backgroundMode: 'paper',
}

const presets: {
  id: string
  name: { ru: string; en: string }
  description: { ru: string; en: string }
  settings: RenderSettings
}[] = [
  {
    id: 'ascii-classic',
    name: { ru: 'Классический ASCII', en: 'Classic ASCII' },
    description: {
      ru: 'Символы средней плотности на светлом фоне.',
      en: 'Medium-density characters on a light background.',
    },
    settings: defaultSettings,
  },
  {
    id: 'ascii-blocks',
    name: { ru: 'Крупные блоки', en: 'Bold blocks' },
    description: {
      ru: 'Большие знаки и высокий контраст на тёмном фоне.',
      en: 'Large glyphs and high contrast on a dark background.',
    },
    settings: {
      ...defaultSettings,
      ascii: { columns: 54, contrast: 1.35, charset: 'blocks', invert: false },
      backgroundMode: 'dark',
    },
  },
  {
    id: 'dither-grid',
    name: { ru: 'Точечная сетка', en: 'Dot grid' },
    description: {
      ru: 'Крупный двухтоновый растр Bayer.',
      en: 'Coarse two-tone Bayer pattern.',
    },
    settings: {
      ...defaultSettings,
      mode: 'dither',
      dither: { pixelSize: 8, levels: 2, algorithm: 'bayer', contrast: 1.15, invert: false },
    },
  },
  {
    id: 'dither-grain',
    name: { ru: 'Мягкое зерно', en: 'Fine grain' },
    description: {
      ru: 'Мелкий четырёхтоновый растр Floyd–Steinberg.',
      en: 'Fine four-tone Floyd–Steinberg diffusion.',
    },
    settings: {
      ...defaultSettings,
      mode: 'dither',
      dither: {
        pixelSize: 3,
        levels: 4,
        algorithm: 'floyd-steinberg',
        contrast: 0.9,
        invert: false,
      },
    },
  },
]

function matchesPreset(settings: RenderSettings, preset: RenderSettings) {
  return (
    settings.mode === preset.mode &&
    settings.backgroundMode === preset.backgroundMode &&
    settings.ascii.columns === preset.ascii.columns &&
    settings.ascii.contrast === preset.ascii.contrast &&
    settings.ascii.charset === preset.ascii.charset &&
    settings.ascii.invert === preset.ascii.invert &&
    settings.dither.pixelSize === preset.dither.pixelSize &&
    settings.dither.levels === preset.dither.levels &&
    settings.dither.algorithm === preset.dither.algorithm &&
    settings.dither.contrast === preset.dither.contrast &&
    settings.dither.invert === preset.dither.invert
  )
}

function restoreSettings(value: unknown): RenderSettings {
  if (!value || typeof value !== 'object') return defaultSettings
  const saved = value as Partial<RenderSettings>
  const ascii = saved.ascii as Partial<AsciiOptions> | undefined
  const dither = saved.dither as Partial<DitherOptions> | undefined
  return {
    mode: saved.mode === 'dither' ? 'dither' : 'ascii',
    backgroundMode: ['paper', 'dark', 'transparent'].includes(String(saved.backgroundMode))
      ? saved.backgroundMode!
      : 'paper',
    ascii: {
      columns:
        typeof ascii?.columns === 'number' && Number.isFinite(ascii.columns)
          ? Math.max(32, Math.min(180, Math.round(ascii.columns)))
          : 88,
      contrast:
        typeof ascii?.contrast === 'number' && Number.isFinite(ascii.contrast)
          ? Math.max(0.5, Math.min(2, ascii.contrast))
          : 1,
      charset:
        ascii?.charset === 'dense' || ascii?.charset === 'blocks' ? ascii.charset : 'classic',
      invert: ascii?.invert === true,
    },
    dither: {
      pixelSize:
        typeof dither?.pixelSize === 'number' && Number.isFinite(dither.pixelSize)
          ? Math.max(2, Math.min(20, Math.round(dither.pixelSize)))
          : 6,
      levels: dither?.levels === 4 ? 4 : 2,
      algorithm: dither?.algorithm === 'floyd-steinberg' ? 'floyd-steinberg' : 'bayer',
      contrast:
        typeof dither?.contrast === 'number' && Number.isFinite(dither.contrast)
          ? Math.max(0.5, Math.min(2, dither.contrast))
          : 1,
      invert: dither?.invert === true,
    },
  }
}

function safeFileStem(name: string) {
  return (
    name
      .replace(/\.[^.]+$/, '')
      .replace(/[^\p{L}\p{N}_-]+/gu, '-')
      .slice(0, 64) || 'image'
  )
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

function imageErrorMessage(code: string, language: 'ru' | 'en') {
  const messages: Record<string, { ru: string; en: string }> = {
    EMPTY_FILE: {
      ru: 'Файл пустой. Выберите другой PNG или SVG.',
      en: 'The file is empty. Choose another PNG or SVG.',
    },
    UNSUPPORTED_TYPE: {
      ru: 'Поддерживаются только PNG и SVG.',
      en: 'Only PNG and SVG files are supported.',
    },
    FILE_TOO_LARGE: {
      ru: 'Файл больше 12 МБ. Уменьшите его и попробуйте снова.',
      en: 'The file is over 12 MB. Reduce it and try again.',
    },
    INVALID_PNG: {
      ru: 'Не удалось прочитать PNG. Проверьте файл и попробуйте снова.',
      en: 'The PNG could not be read. Check the file and try again.',
    },
    INVALID_SVG: {
      ru: 'Не удалось прочитать SVG. Проверьте разметку файла.',
      en: 'The SVG could not be read. Check its markup.',
    },
    UNSAFE_SVG: {
      ru: 'SVG содержит скрипты, внешние ресурсы или неподдерживаемую разметку. Сохраните его как простой SVG или PNG.',
      en: 'The SVG contains scripts, external resources, or unsupported markup. Save it as a simple SVG or PNG.',
    },
    IMAGE_TOO_LARGE: {
      ru: 'Изображение превышает предел 6000 px по стороне или 12 Мп.',
      en: 'The image exceeds 6000 px on a side or 12 MP.',
    },
    DECODE_FAILED: {
      ru: 'Не удалось открыть изображение. Попробуйте сохранить файл заново.',
      en: 'The image could not be opened. Try saving the file again.',
    },
  }
  return (messages[code] ?? {
    ru: 'Не удалось открыть файл. Попробуйте другой PNG или SVG.',
    en: 'The file could not be opened. Try another PNG or SVG.',
  })[language]
}

export function AsciiDitherTool() {
  const { language } = useSiteLanguage()
  const copy = (ru: string, en: string) => (language === 'ru' ? ru : en)
  const [settings, setSettings] = useState<RenderSettings>(defaultSettings)
  const [settingsReady, setSettingsReady] = useState(false)
  const [fileInfo, setFileInfo] = useState<{ name: string; width: number; height: number } | null>(
    null,
  )
  const [fileError, setFileError] = useState('')
  const [renderError, setRenderError] = useState('')
  const [rendered, setRendered] = useState<RenderResult | null>(null)
  const [version, setVersion] = useState(0)
  const [view, setView] = useState<PreviewView>('result')
  const [zoomed, setZoomed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportScale, setExportScale] = useState<1 | 2>(1)
  const [exportMessage, setExportMessage] = useState('')
  const imageRef = useRef<LoadedImage | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLCanvasElement>(null)
  const originalRef = useRef<HTMLCanvasElement>(null)
  const loadIdRef = useRef(0)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(storageKey)
        if (saved) setSettings(restoreSettings(JSON.parse(saved)))
      } catch {
        // Storage is optional; file data is never persisted.
      }
      setSettingsReady(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!settingsReady) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings))
    } catch {
      // The tool still works with storage disabled.
    }
  }, [settings, settingsReady])

  useEffect(
    () => () => {
      loadIdRef.current += 1
      imageRef.current?.dispose()
    },
    [],
  )

  useEffect(() => {
    if (!fileInfo || !imageRef.current || !settingsReady) return
    setRendering(true)
    setRenderError('')
    setExportMessage('')
    const timer = window.setTimeout(() => {
      try {
        const image = imageRef.current
        const canvas = resultRef.current
        if (!image || !canvas) return
        setRendered(renderImage(canvas, image, settings))
      } catch {
        setRendered(null)
        setRenderError(
          copy(
            'Не удалось обработать изображение. Попробуйте другой файл или настройки.',
            'The image could not be processed. Try another file or different settings.',
          ),
        )
      } finally {
        setRendering(false)
      }
    }, 130)
    return () => window.clearTimeout(timer)
    // language only changes text; it should not trigger image processing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileInfo, settings, settingsReady, version])

  function drawOriginal(image: LoadedImage) {
    const canvas = originalRef.current
    if (!canvas) return
    const scale = Math.min(
      1,
      1400 / Math.max(image.width, image.height),
      Math.sqrt(1_400_000 / (image.width * image.height)),
    )
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    canvas.getContext('2d')?.drawImage(image.image, 0, 0, canvas.width, canvas.height)
  }

  async function acceptFile(file: File) {
    const id = ++loadIdRef.current
    setLoading(true)
    setFileError('')
    setExportMessage('')
    try {
      const loaded = await loadLocalImage(file)
      if (id !== loadIdRef.current) {
        loaded.dispose()
        return
      }
      imageRef.current?.dispose()
      imageRef.current = loaded
      setFileInfo({ name: file.name, width: loaded.width, height: loaded.height })
      setRendered(null)
      setView('result')
      setZoomed(false)
      setVersion((current) => current + 1)
      drawOriginal(loaded)
    } catch (error) {
      if (id !== loadIdRef.current) return
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
      setFileError(imageErrorMessage(code, language))
    } finally {
      if (id === loadIdRef.current) setLoading(false)
    }
  }

  function updateAscii(patch: Partial<RenderSettings['ascii']>) {
    setSettings((current) => ({ ...current, ascii: { ...current.ascii, ...patch } }))
  }

  function updateDither(patch: Partial<RenderSettings['dither']>) {
    setSettings((current) => ({ ...current, dither: { ...current.dither, ...patch } }))
  }

  async function downloadPng() {
    if (!fileInfo || !imageRef.current || rendering || exporting) return
    setExporting(true)
    setExportMessage('')
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    try {
      const canvas = document.createElement('canvas')
      const result = renderImage(canvas, imageRef.current, settings, exportScale)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new Error('PNG export failed'))),
          'image/png',
        )
      })
      saveBlob(blob, `${safeFileStem(fileInfo.name)}-${settings.mode}.png`)
      setExportMessage(
        copy(
          `PNG ${result.width} × ${result.height} готов. Скачивание началось.`,
          `PNG ${result.width} × ${result.height} is ready. Download started.`,
        ),
      )
    } catch {
      setExportMessage(
        copy(
          'Не удалось сохранить PNG. Попробуйте размер 1×.',
          'The PNG could not be saved. Try size 1×.',
        ),
      )
    } finally {
      setExporting(false)
    }
  }

  function downloadText() {
    if (!fileInfo || !rendered?.asciiText || rendering) return
    saveBlob(
      new Blob([rendered.asciiText + '\n'], { type: 'text/plain;charset=utf-8' }),
      `${safeFileStem(fileInfo.name)}-ascii.txt`,
    )
    setExportMessage(
      copy('Текст ASCII готов. Скачивание началось.', 'ASCII text is ready. Download started.'),
    )
  }

  const canExport = Boolean(
    fileInfo && rendered && !rendering && !loading && !exporting && !renderError,
  )
  const contrast = settings.mode === 'ascii' ? settings.ascii.contrast : settings.dither.contrast
  const inverted = settings.mode === 'ascii' ? settings.ascii.invert : settings.dither.invert
  const activePreset = presets.find((preset) => matchesPreset(settings, preset.settings))

  return (
    <div className={styles.tool}>
      <LabHeader section="tool" />
      <main className={styles.main} data-language-particle-text>
        <section className={styles.intro} aria-labelledby="tool-title">
          <div className={styles.introIndex}>VNE / LAB / 01</div>
          <div>
            <h1 id="tool-title">
              ASCII <span>/</span> Dither
            </h1>
            <p>
              {copy(
                'Загрузите изображение. Переведите его в символы или зернистую графику. Сохраните то, что получилось.',
                'Upload an image. Turn it into characters or a dithered graphic. Save the result.',
              )}
            </p>
          </div>
        </section>

        <section
          className={styles.uploadBar}
          aria-label={copy('Исходное изображение', 'Source image')}
        >
          <div className={styles.uploadLead}>
            <span className={styles.meta}>INPUT / PNG + SVG</span>
            <p>
              {fileInfo ? fileInfo.name : copy('Начните со своего файла', 'Start with your file')}
            </p>
            <small>
              {fileInfo
                ? `${fileInfo.width} × ${fileInfo.height} px`
                : copy(
                    'До 12 МБ · до 6000 px по стороне · до 12 Мп',
                    'Up to 12 MB · up to 6000 px per side · up to 12 MP',
                  )}
            </small>
          </div>
          <div
            className={styles.dropArea}
            data-dragging={dragging}
            onDragEnter={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'copy'
              setDragging(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              if (event.dataTransfer.files.length !== 1) {
                setFileError(copy('Выберите один файл PNG или SVG.', 'Choose one PNG or SVG file.'))
                return
              }
              void acceptFile(event.dataTransfer.files[0])
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".png,.svg,image/png,image/svg+xml"
              className={styles.fileInput}
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void acceptFile(file)
                event.target.value = ''
              }}
            />
            <span>{copy('Перетащите сюда', 'Drop it here')}</span>
            <button
              type="button"
              className={styles.pickButton}
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              {copy(
                fileInfo ? 'Заменить файл' : 'Выбрать файл',
                fileInfo ? 'Replace file' : 'Choose file',
              )}{' '}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          <p className={styles.uploadPrivacy}>
            {copy(
              'Файл остаётся в браузере. Настройки сохраняются на устройстве; изображение — нет. SVG: без встроенных изображений, фильтров, анимации и внешних ресурсов.',
              'The file stays in your browser. Settings are saved on this device; the image is not. SVG: no embedded images, filters, animation, or external resources.',
            )}
          </p>
          {fileError && (
            <p className={styles.error} role="alert">
              {fileError}
            </p>
          )}
        </section>

        <section className={styles.workspace} aria-label={copy('Рабочая область', 'Workspace')}>
          <div className={styles.previewPane}>
            <div className={styles.previewHeader}>
              <div>
                <span className={styles.meta}>OUTPUT / {settings.mode.toUpperCase()}</span>
                <h2>{copy('Результат', 'Result')}</h2>
              </div>
              {fileInfo && (
                <div className={styles.previewActions}>
                  <div
                    className={styles.viewSwitch}
                    role="group"
                    aria-label={copy('Показать изображение', 'Show image')}
                  >
                    <button
                      type="button"
                      aria-pressed={view === 'original'}
                      onClick={() => setView('original')}
                    >
                      {copy('Оригинал', 'Original')}
                    </button>
                    <button
                      type="button"
                      aria-pressed={view === 'result'}
                      onClick={() => setView('result')}
                    >
                      {copy('Результат', 'Result')}
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.zoomButton}
                    aria-pressed={zoomed}
                    aria-controls="lab-preview"
                    onClick={() => setZoomed((current) => !current)}
                  >
                    <span aria-hidden="true">{zoomed ? '−' : '+'}</span>{' '}
                    {copy(zoomed ? 'Уместить' : 'Увеличить', zoomed ? 'Fit' : 'Zoom in')}
                  </button>
                </div>
              )}
            </div>
            <figure
              id="lab-preview"
              className={styles.preview}
              data-background={settings.backgroundMode}
              data-zoomed={zoomed}
              tabIndex={zoomed ? 0 : undefined}
            >
              <figcaption className={styles.srOnly}>
                {copy(
                  'Предпросмотр исходного или обработанного изображения',
                  'Preview of the original or processed image',
                )}
              </figcaption>
              {!fileInfo && (
                <div className={styles.emptyPreview}>
                  <span aria-hidden="true">@</span>
                  <p>
                    {copy('Загрузите PNG или SVG, чтобы начать', 'Upload a PNG or SVG to begin')}
                  </p>
                </div>
              )}
              <canvas
                ref={originalRef}
                hidden={!fileInfo || view !== 'original'}
                aria-hidden="true"
              />
              <canvas ref={resultRef} hidden={!fileInfo || view !== 'result'} aria-hidden="true" />
              {loading && (
                <div className={styles.previewOverlay}>
                  {copy('Открываем файл…', 'Opening file…')}
                </div>
              )}
            </figure>
            <div className={styles.previewFooter}>
              <p role="status" aria-live="polite">
                {renderError ||
                  (rendering
                    ? copy('Обрабатываем изображение…', 'Processing image…')
                    : rendered && fileInfo
                      ? `${rendered.width} × ${rendered.height} px · ${settings.mode.toUpperCase()}${zoomed ? copy(' · прокручивайте внутри рамки', ' · scroll inside the frame') : ''}`
                      : copy('Предпросмотр появится здесь.', 'Your preview will appear here.'))}
              </p>
              <span>{copy('Предпросмотр', 'Preview')}</span>
            </div>
          </div>

          <div className={styles.controlPane}>
            <div className={styles.controlHeading}>
              <span className={styles.meta}>PROCESS / SETTINGS</span>
              <h2>{copy('Настроить', 'Adjust')}</h2>
            </div>
            <fieldset className={styles.presetGroup}>
              <legend className={styles.presetLegend}>
                {copy('Готовые настройки', 'Presets')}
              </legend>
              <div className={styles.presetGrid}>
                {presets.map((preset, index) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={styles.presetButton}
                    aria-pressed={activePreset?.id === preset.id}
                    onClick={() =>
                      setSettings({
                        ...preset.settings,
                        ascii: { ...preset.settings.ascii },
                        dither: { ...preset.settings.dither },
                      })
                    }
                  >
                    <span className={styles.meta}>
                      {String(index + 1).padStart(2, '0')} / {preset.settings.mode.toUpperCase()}
                    </span>
                    <strong>{preset.name[language]}</strong>
                    <span className={styles.presetDescription}>{preset.description[language]}</span>
                  </button>
                ))}
              </div>
              <p className={styles.presetStatus} role="status">
                {activePreset
                  ? language === 'ru'
                    ? `Выбрано: ${activePreset.name.ru}`
                    : `Selected: ${activePreset.name.en}`
                  : copy('Свои настройки', 'Custom settings')}
              </p>
            </fieldset>
            <fieldset className={styles.modeField}>
              <legend>{copy('Способ обработки', 'Processing mode')}</legend>
              <div className={styles.modeSwitch}>
                <button
                  type="button"
                  aria-pressed={settings.mode === 'ascii'}
                  onClick={() => setSettings((current) => ({ ...current, mode: 'ascii' }))}
                >
                  ASCII
                </button>
                <button
                  type="button"
                  aria-pressed={settings.mode === 'dither'}
                  onClick={() => setSettings((current) => ({ ...current, mode: 'dither' }))}
                >
                  Dither
                </button>
              </div>
              <p>
                {settings.mode === 'ascii'
                  ? copy(
                      'Изображение собирается из символов.',
                      'The image is built from characters.',
                    )
                  : copy(
                      'Тон складывается из упорядоченных или рассеянных точек.',
                      'Tone is built from ordered or diffused dots.',
                    )}
              </p>
            </fieldset>

            {settings.mode === 'ascii' ? (
              <>
                <div className={styles.field}>
                  <div className={styles.fieldTop}>
                    <label htmlFor="ascii-columns">
                      {copy('Ширина в символах', 'Width in characters')}
                    </label>
                    <output htmlFor="ascii-columns">{settings.ascii.columns}</output>
                  </div>
                  <input
                    id="ascii-columns"
                    type="range"
                    min="32"
                    max="180"
                    step="1"
                    value={settings.ascii.columns}
                    onChange={(event) => updateAscii({ columns: Number(event.target.value) })}
                  />
                  <p>
                    {copy(
                      'Больше символов — больше деталей.',
                      'More characters reveal more detail.',
                    )}
                  </p>
                </div>
                <div className={styles.field}>
                  <label htmlFor="ascii-charset">{copy('Набор символов', 'Character set')}</label>
                  <select
                    id="ascii-charset"
                    value={settings.ascii.charset}
                    onChange={(event) =>
                      updateAscii({ charset: event.target.value as AsciiOptions['charset'] })
                    }
                  >
                    <option value="classic">{copy('Классический', 'Classic')}</option>
                    <option value="dense">{copy('Плотный', 'Dense')}</option>
                    <option value="blocks">{copy('Блоки', 'Blocks')}</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className={styles.field}>
                  <label htmlFor="dither-algorithm">{copy('Алгоритм', 'Algorithm')}</label>
                  <select
                    id="dither-algorithm"
                    value={settings.dither.algorithm}
                    onChange={(event) =>
                      updateDither({ algorithm: event.target.value as DitherOptions['algorithm'] })
                    }
                  >
                    <option value="bayer">Bayer / {copy('упорядоченный', 'ordered')}</option>
                    <option value="floyd-steinberg">
                      Floyd–Steinberg / {copy('рассеяние', 'diffusion')}
                    </option>
                  </select>
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldTop}>
                    <label htmlFor="dither-pixel-size">{copy('Размер точки', 'Dot size')}</label>
                    <output htmlFor="dither-pixel-size">{settings.dither.pixelSize} px</output>
                  </div>
                  <input
                    id="dither-pixel-size"
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={settings.dither.pixelSize}
                    onChange={(event) => updateDither({ pixelSize: Number(event.target.value) })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="dither-levels">{copy('Число тонов', 'Tone levels')}</label>
                  <select
                    id="dither-levels"
                    value={settings.dither.levels}
                    onChange={(event) =>
                      updateDither({ levels: Number(event.target.value) as 2 | 4 })
                    }
                  >
                    <option value="2">{copy('2 тона', '2 tones')}</option>
                    <option value="4">{copy('4 тона', '4 tones')}</option>
                  </select>
                </div>
              </>
            )}

            <div className={styles.field}>
              <div className={styles.fieldTop}>
                <label htmlFor="image-contrast">{copy('Контраст', 'Contrast')}</label>
                <output htmlFor="image-contrast">{Math.round(contrast * 100)}%</output>
              </div>
              <input
                id="image-contrast"
                type="range"
                min="50"
                max="200"
                step="5"
                value={Math.round(contrast * 100)}
                onChange={(event) => {
                  const value = Number(event.target.value) / 100
                  if (settings.mode === 'ascii') updateAscii({ contrast: value })
                  else updateDither({ contrast: value })
                }}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="image-background">{copy('Фон', 'Background')}</label>
              <select
                id="image-background"
                value={settings.backgroundMode}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    backgroundMode: event.target.value as RenderSettings['backgroundMode'],
                  }))
                }
              >
                <option value="paper">{copy('Светлый', 'Light')}</option>
                <option value="dark">{copy('Тёмный', 'Dark')}</option>
                <option value="transparent">{copy('Прозрачный', 'Transparent')}</option>
              </select>
            </div>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={inverted}
                onChange={(event) =>
                  settings.mode === 'ascii'
                    ? updateAscii({ invert: event.target.checked })
                    : updateDither({ invert: event.target.checked })
                }
              />
              <span>{copy('Инвертировать тон', 'Invert tones')}</span>
            </label>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => setSettings(defaultSettings)}
            >
              {copy('Сбросить настройки', 'Reset settings')} <span aria-hidden="true">↶</span>
            </button>
          </div>
        </section>

        <section className={styles.exportSection} aria-labelledby="export-title">
          <div>
            <span className={styles.meta}>SAVE / LOCAL</span>
            <h2 id="export-title">{copy('Забрать результат', 'Take the result')}</h2>
            <p>
              {copy(
                'PNG повторяет выбранные настройки. Размер 2× даёт более крупный файл.',
                'The PNG uses your current settings. Size 2× produces a larger file.',
              )}
            </p>
          </div>
          <div className={styles.exportControls}>
            <label htmlFor="export-size">{copy('Размер PNG', 'PNG size')}</label>
            <select
              id="export-size"
              value={exportScale}
              onChange={(event) => setExportScale(Number(event.target.value) as 1 | 2)}
              disabled={exporting}
            >
              <option value="1">1×</option>
              <option value="2">2×</option>
            </select>
            <button
              type="button"
              className={styles.exportButton}
              onClick={() => void downloadPng()}
              disabled={!canExport}
              aria-busy={exporting}
              aria-describedby="export-status"
            >
              {copy(
                exporting ? 'Сохраняем…' : 'Скачать PNG',
                exporting ? 'Saving…' : 'Download PNG',
              )}{' '}
              <span aria-hidden="true">↓</span>
            </button>
            {settings.mode === 'ascii' && (
              <button
                type="button"
                className={styles.textButton}
                onClick={downloadText}
                disabled={!canExport}
              >
                {copy('Скачать текст .txt', 'Download text .txt')}
              </button>
            )}
            <p id="export-status" role="status">
              {exportMessage ||
                (canExport
                  ? copy('Готово к скачиванию.', 'Ready to download.')
                  : copy(
                      'Загрузите файл и дождитесь предпросмотра.',
                      'Upload a file and wait for the preview.',
                    ))}
            </p>
          </div>
          <aside className={styles.studioNote}>
            <span className={styles.meta}>FROM FILE TO SYSTEM</span>
            <p>
              {copy(
                'Если отдельная фактура должна стать частью визуального языка сайта или бренда, обсудим вашу задачу.',
                'If a single texture should become part of a visual language for a site or brand, let’s talk about your project.',
              )}
            </p>
            <Link href="/pricing#contact">
              <span className={styles.linkLabel}>
                {copy('Обсудить проект с ВНЕ', 'Discuss a project with VNE')}
              </span>
              <span className={styles.linkArrow} aria-hidden="true">
                ↗
              </span>
            </Link>
          </aside>
        </section>
      </main>
    </div>
  )
}
