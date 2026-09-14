export type CaseInterfaceCell = {
  x: number
  y: number
  character: string
  shade: 0 | 1 | 2
}

export type CaseInterfaceWord = {
  x: number
  y: number
  width: number
  height: number
  text: string
  weight?: number
}

export type CaseInterfaceSprite = {
  kind: 'dog' | 'figure'
  x: number
  y: number
  width: number
  height: number
}

export type CaseInterfaceModel = {
  columns: number
  rows: number
  dark: boolean
  cells: CaseInterfaceCell[]
  words: CaseInterfaceWord[]
  sprites: CaseInterfaceSprite[]
  overlays?: CaseInterfaceCell[]
}

const columns = 144
const rows = 60
type Shade = CaseInterfaceCell['shade']

function createGrid(dark = false) {
  const cells = new Map<number, CaseInterfaceCell>()
  const overlays = new Map<number, CaseInterfaceCell>()
  let target = cells
  const words: CaseInterfaceWord[] = []
  const sprites: CaseInterfaceSprite[] = []

  const put = (x: number, y: number, character: string, shade: Shade = 0) => {
    const column = Math.round(x)
    const row = Math.round(y)
    if (column < 0 || column >= columns || row < 0 || row >= rows || character === ' ') return
    target.set(row * columns + column, { x: column, y: row, character, shade })
  }
  const text = (x: number, y: number, value: string, shade: Shade = 0) => {
    Array.from(value).forEach((character, index) => put(x + index, y, character, shade))
  }
  const centered = (y: number, value: string, shade: Shade = 0) => {
    text(Math.floor((columns - Array.from(value).length) / 2), y, value, shade)
  }
  const line = (x: number, y: number, width: number, shade: Shade = 1) => {
    for (let offset = 0; offset < width; offset++) put(x + offset, y, '-', shade)
  }
  const box = (x: number, y: number, width: number, height: number, shade: Shade = 1) => {
    line(x, y, width, shade)
    line(x, y + height - 1, width, shade)
    for (let offset = 1; offset < height - 1; offset++) {
      put(x, y + offset, '|', shade)
      put(x + width - 1, y + offset, '|', shade)
    }
    for (const dx of [0, width - 1]) {
      for (const dy of [0, height - 1]) put(x + dx, y + dy, '+', shade)
    }
  }
  const ellipse = (x: number, y: number, radiusX: number, radiusY: number, shade: Shade = 2) => {
    for (let sample = 0; sample < 720; sample++) {
      const angle = (sample / 720) * Math.PI * 2
      put(x + Math.cos(angle) * radiusX, y + Math.sin(angle) * radiusY, '.', shade)
    }
  }
  const word = (x: number, y: number, width: number, height: number, value: string, weight = 500) =>
    words.push({ x, y, width, height, text: value, weight })
  const sprite = (entry: CaseInterfaceSprite) => sprites.push(entry)
  const overlay = (draw: () => void) => {
    target = overlays
    try {
      draw()
    } finally {
      target = cells
    }
  }
  const clear = (x: number, y: number, width: number, height: number) => {
    for (let row = y; row < Math.min(rows, y + height); row++) {
      for (let column = x; column < Math.min(columns, x + width); column++)
        target.set(row * columns + column, { x: column, y: row, character: ' ', shade: 0 })
    }
  }

  return {
    put,
    text,
    centered,
    line,
    box,
    ellipse,
    word,
    sprite,
    overlay,
    clear,
    finish: (): CaseInterfaceModel => ({
      columns,
      rows,
      dark,
      cells: [...cells.values()],
      words,
      sprites,
      ...(overlays.size ? { overlays: [...overlays.values()] } : {}),
    }),
  }
}

function createKotopes() {
  const grid = createGrid()

  grid.text(4, 2, '(+)')
  grid.text(48, 2, 'Преимущества   Услуги   Запись   FAQ', 1)
  grid.box(121, 0, 19, 5, 2)
  grid.text(124, 2, 'Связаться')
  grid.word(3, 6, 138, 14, 'КОТОПЁС', 300)
  grid.text(4, 23, 'Мы в ответе за тех, кого приручили', 1)

  // The restrained wave contours preserve the veterinary hero's broad color fields.
  grid.ellipse(17, 26, 40, 19)
  grid.ellipse(92, 43, 56, 24)
  grid.line(3, 27, 138, 2)
  grid.word(4, 31, 59, 5, 'Ветеринарная', 400)
  grid.word(4, 37, 40, 5, 'клиника', 400)
  grid.word(4, 43, 58, 5, '«Котопёс» в', 400)
  grid.word(4, 49, 34, 5, 'Казани', 400)
  grid.text(4, 55, 'Для кошек, собак, птиц и грызунов', 1)
  grid.box(4, 57, 23, 3, 1)
  grid.text(7, 58, 'Связаться  ->')
  grid.sprite({ kind: 'dog', x: 78, y: 20, width: 66, height: 40 })

  return grid.finish()
}

function createArcStore() {
  const grid = createGrid(true)

  // Sparse diagonal traces recall the colored arcs without obscuring the shop UI.
  for (let row = 5; row < rows; row++) {
    const x = 20 + row * 0.72 + row * row * 0.015
    for (let offset = 0; offset < 3; offset++) grid.put(x + offset * 3, row, ':', 2)
  }
  grid.text(4, 2, '[A] ARC store')
  grid.text(43, 2, 'Все товары   Чертежи   Оружие   Наборы   Предметы/Ресурсы', 1)
  grid.text(119, 2, '[+]  [Войти]')
  grid.line(0, 4, columns, 2)
  grid.word(42, 7, 26, 7, 'ARC', 750)
  grid.word(71, 7, 32, 7, 'store', 400)
  grid.centered(16, 'Сервис цифровых услуг для игроков ARC Raiders.', 1)
  grid.centered(18, 'Быстрая доставка, безопасные сделки, гарантия качества.', 1)

  const benefits = [
    ['Безопасные сделки', 'Гарантия защиты'],
    ['Быстрая доставка', 'От 15 минут'],
    ['Проверенный магазин', '1000+ клиентов'],
    ['Поддержка 24/7', 'Всегда на связи'],
  ]
  benefits.forEach(([heading, description], index) => {
    const x = 21 + index * 26
    grid.box(x, 21, 24, 6, 2)
    grid.text(x + 2, 23, heading)
    grid.text(x + 2, 25, description, 1)
  })

  grid.box(18, 30, 108, 9, 1)
  grid.text(21, 33, '[*] РОЗЫГРЫШ')
  grid.text(36, 33, 'Осенний розыгрыш среди покупателей магазина')
  grid.text(21, 36, 'Промокод на 5.000 ₽  /  3.000 ₽  /  1.000 ₽', 1)
  grid.box(103, 35, 18, 3, 2)
  grid.text(106, 36, 'Условия ->')
  grid.word(18, 41, 43, 3, 'Каталог товаров', 650)
  grid.text(18, 46, '[Все товары]  Чертежи  Оружие  Наборы  Предметы/Ресурсы  Валюта', 1)
  grid.box(18, 48, 108, 3, 2)
  grid.text(21, 49, 'o  Поиск...', 1)

  const products = ['ЧЕРТЕЖИ', 'ОРУЖИЕ', 'ПРОКАЧКА ВЕРСТАКОВ', 'ПРОКАЧКА ПЛЮШКИНА']
  products.forEach((title, index) => {
    const x = 18 + index * 28
    grid.box(x, 53, 25, 7, 2)
    grid.text(x + 2, 54, ['ВСЕ ЧЕРТЕЖИ', 'ПОПУЛЯРНОЕ', 'ВСЕ ВЕРСТАКИ', 'ПОСЛЕ ВАЙПА'][index], 1)
    grid.text(x + 6, 56, ['[##] [##]', '==[###]=>', '/[+]\\ [+]', '[+] /[+]\\'][index], 1)
    grid.text(x + 2, 58, title)
  })

  return grid.finish()
}

function createCodeam() {
  const grid = createGrid()

  // Back-fold stripes and elliptical tracks are deliberately lighter than the content.
  for (let x = 3; x < columns; x += 4) {
    for (let y = 4; y < rows; y++) {
      if (y % 3 === 0) grid.put(x, y, ':', 2)
    }
    grid.put(x + 1, 22, '\\', 2)
    grid.put(x + 2, 23, '\\', 2)
  }
  grid.ellipse(72, 0, 73, 27, 1)
  grid.ellipse(72, 19, 74, 26, 1)
  grid.ellipse(72, 61, 75, 27, 1)
  grid.text(38, 24, '<+>', 1)
  grid.text(113, 39, '<+>', 1)

  grid.text(3, 2, '// ENGINEERING GROUP')
  grid.word(3, 5, 107, 11, 'CODEAM', 900)
  grid.text(7, 18, '| Сайты, подача и ИИ-решения', 1)
  grid.text(9, 20, 'для роста заявок и продаж.', 1)
  grid.text(136, 3, '(o)', 1)
  grid.text(136, 6, '(o)', 1)
  grid.text(136, 9, '(o)', 1)

  grid.word(7, 32, 48, 4, 'Создаем не сайт.', 650)
  grid.word(7, 37, 62, 4, 'Создаем точки роста', 650)
  grid.word(7, 42, 38, 4, 'для бизнеса.', 650)
  grid.box(7, 48, 35, 4, 0)
  grid.text(11, 50, 'ПОДРОБНЕЕ        ->')
  grid.text(108, 27, 'WEB // BRAND // MOTION // DEV', 0)

  grid.sprite({ kind: 'figure', x: 82, y: 12, width: 62, height: 48 })
  grid.overlay(() => {
    grid.clear(47, 55, 45, 4)
    grid.box(47, 55, 45, 4, 1)
    grid.text(50, 57, '[Home]  Products  About  Contact')
    grid.clear(94, 55, 11, 4)
    grid.box(94, 55, 11, 4, 0)
    grid.text(97, 57, 'Start')
  })

  return grid.finish()
}

function createGeneric(title: string) {
  const grid = createGrid()
  grid.text(5, 3, 'О проекте   Направления   Контакты', 1)
  grid.text(123, 3, '[Связаться]')
  grid.line(4, 6, 136, 2)
  grid.word(5, 12, 134, 12, title.trim() || 'ПРОЕКТ', 650)
  grid.text(5, 29, 'ИДЕЯ / ФОРМА / ОПЫТ', 1)
  grid.box(5, 34, 31, 5, 1)
  grid.text(9, 36, 'Смотреть проект  ->')
  for (let index = 0; index < 3; index++) {
    const x = 5 + index * 46
    grid.box(x, 44, 42, 13, 2)
    grid.text(x + 3, 47, ['01 / Задача', '02 / Решение', '03 / Результат'][index])
    grid.line(x + 3, 51, 31, 2)
    grid.line(x + 3, 54, 24, 2)
  }
  return grid.finish()
}

export function createCaseInterface(slug: string, title: string): CaseInterfaceModel {
  if (slug === 'kotopes') return createKotopes()
  if (slug === 'arc-store') return createArcStore()
  if (slug === 'codeam') return createCodeam()
  return createGeneric(title)
}
